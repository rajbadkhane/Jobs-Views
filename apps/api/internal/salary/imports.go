package salary

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"careeros/api/pkg/apperror"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

func (r *Repository) Sources(ctx context.Context) ([]SourceRecord, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, name, publisher, source_url, source_type, published_on, is_active
		FROM salary_sources
		ORDER BY is_active DESC, name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []SourceRecord{}
	for rows.Next() {
		var item SourceRecord
		if err := rows.Scan(
			&item.ID,
			&item.Name,
			&item.Publisher,
			&item.URL,
			&item.SourceType,
			&item.PublishedOn,
			&item.IsActive,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) PreviewImport(ctx context.Context, actor uuid.UUID, req ImportPreviewRequest) (ImportPreview, error) {
	sourceID, err := uuid.Parse(req.SourceID)
	if err != nil {
		return ImportPreview{}, apperror.Validation(map[string]string{"source_id": "must be a valid UUID"})
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return ImportPreview{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var sourceActive bool
	if err = tx.QueryRow(ctx, `SELECT is_active FROM salary_sources WHERE id = $1`, sourceID).Scan(&sourceActive); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ImportPreview{}, apperror.NotFound("Salary source not found.")
		}
		return ImportPreview{}, err
	}
	if !sourceActive {
		return ImportPreview{}, apperror.Validation(map[string]string{"source_id": "source is inactive"})
	}

	var importID uuid.UUID
	if err = tx.QueryRow(ctx, `
		INSERT INTO salary_imports (source_id, status, file_name, row_count, imported_by)
		VALUES ($1, 'preview', $2, $3, $4)
		RETURNING id
	`, sourceID, req.FileName, len(req.Rows), actor).Scan(&importID); err != nil {
		return ImportPreview{}, err
	}

	result := ImportPreview{
		ID:       importID.String(),
		Status:   "preview",
		RowCount: len(req.Rows),
		Errors:   map[int][]string{},
	}
	for index, row := range req.Rows {
		problems := validateImportRow(ctx, tx, row)
		raw, err := json.Marshal(row)
		if err != nil {
			return ImportPreview{}, err
		}
		rawErrors, err := json.Marshal(problems)
		if err != nil {
			return ImportPreview{}, err
		}

		valid := len(problems) == 0
		if valid {
			result.AcceptedCount++
		} else {
			result.RejectedCount++
			result.Errors[index+1] = problems
		}
		if _, err = tx.Exec(ctx, `
			INSERT INTO salary_import_rows (import_id, row_number, payload, is_valid, validation_errors)
			VALUES ($1, $2, $3, $4, $5)
		`, importID, index+1, raw, valid, rawErrors); err != nil {
			return ImportPreview{}, err
		}
	}

	if _, err = tx.Exec(ctx, `
		UPDATE salary_imports
		SET accepted_count = $2, rejected_count = $3, validation_errors = $4
		WHERE id = $1
	`, importID, result.AcceptedCount, result.RejectedCount, mustJSON(result.Errors)); err != nil {
		return ImportPreview{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return ImportPreview{}, err
	}
	return result, nil
}

func (r *Repository) CommitImport(ctx context.Context, importID, actor uuid.UUID) (ImportPreview, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return ImportPreview{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var sourceID uuid.UUID
	var status string
	var rowCount, accepted, rejected int
	err = tx.QueryRow(ctx, `
		SELECT source_id, status, row_count, accepted_count, rejected_count
		FROM salary_imports
		WHERE id = $1
		FOR UPDATE
	`, importID).Scan(&sourceID, &status, &rowCount, &accepted, &rejected)
	if errors.Is(err, pgx.ErrNoRows) {
		return ImportPreview{}, apperror.NotFound("Salary import not found.")
	}
	if err != nil {
		return ImportPreview{}, err
	}
	if status != "preview" {
		return ImportPreview{}, apperror.Conflict("Only a preview import can be committed.")
	}
	if rejected > 0 {
		return ImportPreview{}, apperror.Validation(map[string]string{"rows": "resolve rejected rows before commit"})
	}

	rows, err := tx.Query(ctx, `
		SELECT payload
		FROM salary_import_rows
		WHERE import_id = $1 AND is_valid
		ORDER BY row_number
	`, importID)
	if err != nil {
		return ImportPreview{}, err
	}
	payloads := make([][]byte, 0, rowCount)
	for rows.Next() {
		var raw []byte
		if err = rows.Scan(&raw); err != nil {
			rows.Close()
			return ImportPreview{}, err
		}
		payloads = append(payloads, raw)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return ImportPreview{}, err
	}
	rows.Close()

	for _, raw := range payloads {
		var row ImportRow
		if err = json.Unmarshal(raw, &row); err != nil {
			return ImportPreview{}, err
		}

		var canonicalRole string
		if err = tx.QueryRow(ctx, `
			SELECT canonical_role
			FROM salary_role_aliases
			WHERE role_slug = $1 AND is_active
			LIMIT 1
		`, row.RoleSlug).Scan(&canonicalRole); err != nil {
			return ImportPreview{}, err
		}

		var locationID *uuid.UUID
		var matchedLocation uuid.UUID
		locationErr := tx.QueryRow(ctx, `
			SELECT id
			FROM salary_locations
			WHERE lower(name) = lower($1) OR slug = $2
			LIMIT 1
		`, row.Geography, slug(row.Geography)).Scan(&matchedLocation)
		if locationErr == nil {
			locationID = &matchedLocation
		} else if !errors.Is(locationErr, pgx.ErrNoRows) {
			return ImportPreview{}, locationErr
		}

		effective, err := time.Parse("2006-01-02", row.EffectiveDate)
		if err != nil {
			return ImportPreview{}, err
		}
		confidence := "low"
		if row.SampleSize != nil {
			confidence = confidenceForImport(*row.SampleSize)
		}
		if _, err = tx.Exec(ctx, `
			INSERT INTO salary_benchmarks (
				source_id, import_id, canonical_role, role_slug, location_id,
				geography_name, geography_level, experience_min, experience_max,
				work_mode, education, shift, salary_basis, p25_annual,
				median_annual, p75_annual, mean_annual, sample_size,
				effective_date, confidence, is_published
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9,
				NULLIF($10, ''), NULLIF($11, ''), NULLIF($12, ''),
				$13, $14, $15, $16, $17, $18, $19, $20, true
			)
		`, sourceID, importID, canonicalRole, row.RoleSlug, locationID,
			row.Geography, row.GeographyLevel, row.ExperienceMin, row.ExperienceMax,
			row.WorkMode, row.Education, row.Shift, row.SalaryBasis,
			row.P25Annual, row.MedianAnnual, row.P75Annual, row.MeanAnnual,
			row.SampleSize, effective, confidence); err != nil {
			return ImportPreview{}, err
		}
	}

	if _, err = tx.Exec(ctx, `
		UPDATE salary_imports
		SET status = 'committed', committed_at = NOW(), imported_by = $2
		WHERE id = $1
	`, importID, actor); err != nil {
		return ImportPreview{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return ImportPreview{}, err
	}
	return ImportPreview{
		ID:            importID.String(),
		Status:        "committed",
		RowCount:      rowCount,
		AcceptedCount: accepted,
		RejectedCount: rejected,
		Errors:        map[int][]string{},
	}, nil
}

func validateImportRow(ctx context.Context, tx pgx.Tx, row ImportRow) []string {
	issues := []string{}
	var exists bool
	_ = tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM salary_role_aliases WHERE role_slug = $1 AND is_active
		)
	`, row.RoleSlug).Scan(&exists)
	if !exists {
		issues = append(issues, "unknown role_slug")
	}
	if row.Geography == "" {
		issues = append(issues, "geography is required")
	}
	if row.GeographyLevel != "city" && row.GeographyLevel != "state" && row.GeographyLevel != "remote" && row.GeographyLevel != "national" {
		issues = append(issues, "unsupported geography_level")
	}
	if row.ExperienceMin < 0 || (row.ExperienceMax != nil && *row.ExperienceMax < row.ExperienceMin) {
		issues = append(issues, "invalid experience range")
	}
	if row.P25Annual == nil && row.MedianAnnual == nil && row.P75Annual == nil && row.MeanAnnual == nil {
		issues = append(issues, "at least one annual salary value is required")
	}
	for _, value := range []*float64{row.P25Annual, row.MedianAnnual, row.P75Annual, row.MeanAnnual} {
		if value != nil && (*value < 60000 || *value > 50000000) {
			issues = append(issues, "salary value is outside supported annual INR bounds")
			break
		}
	}
	if row.P25Annual != nil && row.MedianAnnual != nil && *row.P25Annual > *row.MedianAnnual {
		issues = append(issues, "p25 must not exceed median")
	}
	if row.MedianAnnual != nil && row.P75Annual != nil && *row.MedianAnnual > *row.P75Annual {
		issues = append(issues, "median must not exceed p75")
	}
	if _, err := time.Parse("2006-01-02", row.EffectiveDate); err != nil {
		issues = append(issues, "effective_date must be YYYY-MM-DD")
	}
	basis := strings.ToLower(row.SalaryBasis)
	if basis != "gross" && basis != "take_home" && basis != "ctc" {
		issues = append(issues, "unsupported salary_basis")
	}
	return issues
}

func mustJSON(value any) []byte {
	raw, _ := json.Marshal(value)
	return raw
}

func confidenceForImport(sample int) string {
	switch {
	case sample >= 100:
		return "high"
	case sample >= 30:
		return "medium"
	default:
		return "low"
	}
}

func (s *Service) Sources(ctx context.Context) ([]SourceRecord, error) {
	return s.repo.Sources(ctx)
}

func (s *Service) PreviewImport(ctx context.Context, actor uuid.UUID, req ImportPreviewRequest) (ImportPreview, error) {
	return s.repo.PreviewImport(ctx, actor, req)
}

func (s *Service) CommitImport(ctx context.Context, id, actor uuid.UUID) (ImportPreview, error) {
	return s.repo.CommitImport(ctx, id, actor)
}
