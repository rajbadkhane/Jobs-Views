package company

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"time"

	"careeros/api/internal/auth"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, userID uuid.UUID, req RegisterRequest, slug string) (Company, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return Company{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var id uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO companies (name, slug, website, industry, size_range, headquarters, gst_number, cin_number, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
		RETURNING id
	`, req.Name, slug, req.Website, req.Industry, req.SizeRange, req.Headquarters, req.GSTNumber, req.CINNumber).Scan(&id)
	if err != nil {
		return Company{}, err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO company_users (company_id, user_id, role, permissions, accepted_at)
		VALUES ($1, $2, 'owner', '["*"]'::jsonb, NOW())
		ON CONFLICT (company_id, user_id) DO UPDATE SET role = 'owner', accepted_at = NOW()
	`, id, userID)
	if err != nil {
		return Company{}, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO company_settings (company_id) VALUES ($1) ON CONFLICT DO NOTHING`, id)
	if err != nil {
		return Company{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return Company{}, err
	}
	return r.ByID(ctx, id)
}

func (r *Repository) ByID(ctx context.Context, id uuid.UUID) (Company, error) {
	var item Company
	var socialLinks, benefits, gallery []byte
	err := r.db.QueryRow(ctx, companySelect()+` WHERE id = $1 AND deleted_at IS NULL`, id).Scan(companyScan(&item, &socialLinks, &benefits, &gallery)...)
	if errors.Is(err, pgx.ErrNoRows) {
		return Company{}, auth.ErrNotFound
	}
	if err != nil {
		return Company{}, err
	}
	decodeCompanyJSON(&item, socialLinks, benefits, gallery)
	return item, nil
}

func (r *Repository) BySlug(ctx context.Context, slug string) (Company, error) {
	var item Company
	var socialLinks, benefits, gallery []byte
	err := r.db.QueryRow(ctx, companySelect()+` WHERE slug = $1 AND deleted_at IS NULL`, slug).Scan(companyScan(&item, &socialLinks, &benefits, &gallery)...)
	if errors.Is(err, pgx.ErrNoRows) {
		return Company{}, auth.ErrNotFound
	}
	if err != nil {
		return Company{}, err
	}
	decodeCompanyJSON(&item, socialLinks, benefits, gallery)
	return item, nil
}

func (r *Repository) MyCompanies(ctx context.Context, userID uuid.UUID) ([]Company, error) {
	rows, err := r.db.Query(ctx, companySelect()+`
		JOIN company_users cu ON cu.company_id = companies.id
		WHERE cu.user_id = $1 AND companies.deleted_at IS NULL
		ORDER BY companies.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	return scanCompanies(rows)
}

func (r *Repository) Search(ctx context.Context, query, industry, location string, verified *bool, status, sort string, limit, offset int) ([]Company, error) {
	args := []any{}
	where := []string{"deleted_at IS NULL"}
	if query != "" {
		args = append(args, "%"+strings.ToLower(query)+"%")
		where = append(where, "(lower(name || ' ' || coalesce(industry, '') || ' ' || coalesce(about, '')) LIKE $"+strconv.Itoa(len(args))+")")
	}
	if industry != "" {
		args = append(args, "%"+strings.ToLower(industry)+"%")
		where = append(where, "lower(coalesce(industry, '')) LIKE $"+strconv.Itoa(len(args)))
	}
	if location != "" {
		args = append(args, "%"+strings.ToLower(location)+"%")
		where = append(where, "lower(coalesce(headquarters, '')) LIKE $"+strconv.Itoa(len(args)))
	}
	if verified != nil {
		args = append(args, *verified)
		where = append(where, "is_verified = $"+strconv.Itoa(len(args)))
	}
	if status != "" {
		args = append(args, status)
		where = append(where, "status = $"+strconv.Itoa(len(args)))
	}
	orderBy := "created_at DESC"
	if sort == "name" {
		orderBy = "name ASC"
	}
	args = append(args, limit, offset)
	sql := companySelect() + ` WHERE ` + strings.Join(where, " AND ") + ` ORDER BY ` + orderBy + ` LIMIT $` + strconv.Itoa(len(args)-1) + ` OFFSET $` + strconv.Itoa(len(args))
	rows, err := r.db.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	return scanCompanies(rows)
}

func (r *Repository) Update(ctx context.Context, id uuid.UUID, req UpdateRequest) (Company, error) {
	current, err := r.ByID(ctx, id)
	if err != nil {
		return Company{}, err
	}
	merged := mergeUpdate(current, req)
	social, _ := json.Marshal(merged.SocialLinks)
	benefits, _ := json.Marshal(merged.Benefits)
	gallery, _ := json.Marshal(merged.Gallery)
	_, err = r.db.Exec(ctx, `
		UPDATE companies SET
			name = $1, website = $2, logo_url = $3, banner_url = $4, description = $5, about = $6,
			mission = $7, vision = $8, culture = $9, size_range = $10, industry = $11,
			founded_year = NULLIF($12, 0), headquarters = $13, gst_number = $14, cin_number = $15,
			social_links = $16, benefits = $17, gallery = $18
		WHERE id = $19
	`, merged.Name, merged.Website, merged.LogoURL, merged.BannerURL, merged.Description, merged.About, merged.Mission, merged.Vision, merged.Culture, merged.SizeRange, merged.Industry, merged.FoundedYear, merged.Headquarters, merged.GSTNumber, merged.CINNumber, social, benefits, gallery, id)
	if err != nil {
		return Company{}, err
	}
	return r.ByID(ctx, id)
}

func (r *Repository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE companies SET deleted_at = NOW() WHERE id = $1`, id)
	return err
}

func (r *Repository) SetStatus(ctx context.Context, id, reviewer uuid.UUID, req StatusRequest) (Company, error) {
	_, err := r.db.Exec(ctx, `
		UPDATE companies SET
			status = $1,
			verification_notes = $2,
			is_verified = CASE WHEN $1 = 'approved' THEN TRUE ELSE is_verified END,
			verified_badge = CASE WHEN $1 = 'approved' THEN TRUE WHEN $1 IN ('rejected', 'suspended') THEN FALSE ELSE verified_badge END,
			approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE approved_at END,
			rejected_at = CASE WHEN $1 = 'rejected' THEN NOW() ELSE rejected_at END,
			suspended_at = CASE WHEN $1 = 'suspended' THEN NOW() ELSE suspended_at END
		WHERE id = $3
	`, req.Status, req.Notes, id)
	if err != nil {
		return Company{}, err
	}
	return r.ByID(ctx, id)
}

func (r *Repository) UpsertVerification(ctx context.Context, id, reviewer uuid.UUID, req VerificationRequest) (Company, error) {
	_, err := r.db.Exec(ctx, `
		INSERT INTO company_verifications (company_id, gst_status, cin_status, website_status, domain_email_status, manual_status, notes, reviewed_by, reviewed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		ON CONFLICT (company_id) DO UPDATE SET
			gst_status = EXCLUDED.gst_status,
			cin_status = EXCLUDED.cin_status,
			website_status = EXCLUDED.website_status,
			domain_email_status = EXCLUDED.domain_email_status,
			manual_status = EXCLUDED.manual_status,
			notes = EXCLUDED.notes,
			reviewed_by = EXCLUDED.reviewed_by,
			reviewed_at = NOW()
	`, id, req.GSTStatus, req.CINStatus, req.WebsiteStatus, req.DomainEmailStatus, req.ManualStatus, req.Notes, reviewer)
	if err != nil {
		return Company{}, err
	}
	status := "pending"
	if req.ManualStatus == "approved" {
		status = "approved"
	}
	if req.ManualStatus == "rejected" {
		status = "rejected"
	}
	return r.SetStatus(ctx, id, reviewer, StatusRequest{Status: status, Notes: req.Notes})
}

func (r *Repository) IsMember(ctx context.Context, companyID, userID uuid.UUID) (bool, string, error) {
	var role string
	err := r.db.QueryRow(ctx, `SELECT role FROM company_users WHERE company_id = $1 AND user_id = $2`, companyID, userID).Scan(&role)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, "", nil
	}
	return err == nil, role, err
}

func (r *Repository) Team(ctx context.Context, companyID uuid.UUID) ([]TeamMember, error) {
	rows, err := r.db.Query(ctx, `
		SELECT cu.company_id, cu.user_id, u.email, cu.role, cu.permissions, cu.accepted_at, cu.created_at
		FROM company_users cu
		JOIN users u ON u.id = cu.user_id
		WHERE cu.company_id = $1
		ORDER BY cu.created_at ASC
	`, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []TeamMember{}
	for rows.Next() {
		var item TeamMember
		var permissions []byte
		if err := rows.Scan(&item.CompanyID, &item.UserID, &item.Email, &item.Role, &permissions, &item.AcceptedAt, &item.CreatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(permissions, &item.Permissions)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) Invite(ctx context.Context, companyID, invitedBy uuid.UUID, req InviteRequest, token string, expiresAt time.Time) (InviteResult, error) {
	permissions, _ := json.Marshal(req.Permissions)
	var result InviteResult
	err := r.db.QueryRow(ctx, `
		INSERT INTO company_invites (company_id, email, role, permissions, token_hash, invited_by, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, email, role, expires_at
	`, companyID, strings.ToLower(req.Email), req.Role, permissions, hashToken(token), invitedBy, expiresAt).Scan(&result.ID, &result.Email, &result.Role, &result.ExpiresAt)
	result.Token = token
	return result, err
}

func (r *Repository) Branches(ctx context.Context, companyID uuid.UUID) ([]Branch, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, company_id, name, address, coalesce(location, ''), coalesce(city, ''), coalesce(state, ''), country, coalesce(google_maps_url, ''), is_headquarters, created_at, updated_at
		FROM company_branches WHERE company_id = $1 ORDER BY is_headquarters DESC, name
	`, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Branch{}
	for rows.Next() {
		var item Branch
		if err := rows.Scan(&item.ID, &item.CompanyID, &item.Name, &item.Address, &item.Location, &item.City, &item.State, &item.Country, &item.GoogleMapsURL, &item.IsHeadquarters, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) CreateBranch(ctx context.Context, companyID uuid.UUID, req BranchRequest) (Branch, error) {
	if req.Country == "" {
		req.Country = "India"
	}
	var item Branch
	err := r.db.QueryRow(ctx, `
		INSERT INTO company_branches (company_id, name, address, location, city, state, country, google_maps_url, is_headquarters)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, company_id, name, address, coalesce(location, ''), coalesce(city, ''), coalesce(state, ''), country, coalesce(google_maps_url, ''), is_headquarters, created_at, updated_at
	`, companyID, req.Name, req.Address, req.Location, req.City, req.State, req.Country, req.GoogleMapsURL, req.IsHeadquarters).Scan(&item.ID, &item.CompanyID, &item.Name, &item.Address, &item.Location, &item.City, &item.State, &item.Country, &item.GoogleMapsURL, &item.IsHeadquarters, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (r *Repository) DeleteBranch(ctx context.Context, companyID, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM company_branches WHERE company_id = $1 AND id = $2`, companyID, id)
	return err
}

func (r *Repository) Departments(ctx context.Context, companyID uuid.UUID) ([]Department, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, company_id, name, coalesce(description, ''), created_at, updated_at
		FROM company_departments WHERE company_id = $1 ORDER BY name
	`, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Department{}
	for rows.Next() {
		var item Department
		if err := rows.Scan(&item.ID, &item.CompanyID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) CreateDepartment(ctx context.Context, companyID uuid.UUID, req DepartmentRequest) (Department, error) {
	var item Department
	err := r.db.QueryRow(ctx, `
		INSERT INTO company_departments (company_id, name, description)
		VALUES ($1, $2, $3)
		ON CONFLICT (company_id, name) DO UPDATE SET description = EXCLUDED.description
		RETURNING id, company_id, name, coalesce(description, ''), created_at, updated_at
	`, companyID, req.Name, req.Description).Scan(&item.ID, &item.CompanyID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (r *Repository) DeleteDepartment(ctx context.Context, companyID, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM company_departments WHERE company_id = $1 AND id = $2`, companyID, id)
	return err
}

func (r *Repository) Settings(ctx context.Context, companyID uuid.UUID) (Settings, error) {
	var item Settings
	var brand, privacy, notifications, security, billing []byte
	err := r.db.QueryRow(ctx, `SELECT brand, privacy, notifications, security, billing FROM company_settings WHERE company_id = $1`, companyID).Scan(&brand, &privacy, &notifications, &security, &billing)
	if errors.Is(err, pgx.ErrNoRows) {
		return Settings{Brand: map[string]any{}, Privacy: map[string]any{"public_profile": true}, Notifications: map[string]any{}, Security: map[string]any{}, Billing: map[string]any{}}, nil
	}
	if err != nil {
		return Settings{}, err
	}
	_ = json.Unmarshal(brand, &item.Brand)
	_ = json.Unmarshal(privacy, &item.Privacy)
	_ = json.Unmarshal(notifications, &item.Notifications)
	_ = json.Unmarshal(security, &item.Security)
	_ = json.Unmarshal(billing, &item.Billing)
	return item, nil
}

func (r *Repository) UpsertSettings(ctx context.Context, companyID uuid.UUID, req Settings) (Settings, error) {
	brand, _ := json.Marshal(req.Brand)
	privacy, _ := json.Marshal(req.Privacy)
	notifications, _ := json.Marshal(req.Notifications)
	security, _ := json.Marshal(req.Security)
	billing, _ := json.Marshal(req.Billing)
	_, err := r.db.Exec(ctx, `
		INSERT INTO company_settings (company_id, brand, privacy, notifications, security, billing)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (company_id) DO UPDATE SET brand = EXCLUDED.brand, privacy = EXCLUDED.privacy, notifications = EXCLUDED.notifications, security = EXCLUDED.security, billing = EXCLUDED.billing
	`, companyID, brand, privacy, notifications, security, billing)
	if err != nil {
		return Settings{}, err
	}
	return r.Settings(ctx, companyID)
}

func (r *Repository) CreateMedia(ctx context.Context, companyID uuid.UUID, mediaType, name, url, mime string, size int64, metadata map[string]any) (MediaResult, error) {
	bytes, _ := json.Marshal(metadata)
	var item MediaResult
	var raw []byte
	err := r.db.QueryRow(ctx, `
		INSERT INTO company_media (company_id, media_type, file_name, file_url, mime_type, file_size, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, media_type, file_name, file_url, mime_type, file_size, metadata, created_at
	`, companyID, mediaType, name, url, mime, size, bytes).Scan(&item.ID, &item.MediaType, &item.FileName, &item.FileURL, &item.MimeType, &item.FileSize, &raw, &item.CreatedAt)
	_ = json.Unmarshal(raw, &item.Metadata)
	return item, err
}

func (r *Repository) ApplyMedia(ctx context.Context, companyID uuid.UUID, media MediaResult) error {
	switch media.MediaType {
	case "logo":
		_, err := r.db.Exec(ctx, `UPDATE companies SET logo_url = $1 WHERE id = $2`, media.FileURL, companyID)
		return err
	case "banner":
		_, err := r.db.Exec(ctx, `UPDATE companies SET banner_url = $1 WHERE id = $2`, media.FileURL, companyID)
		return err
	case "gallery":
		_, err := r.db.Exec(ctx, `UPDATE companies SET gallery = gallery || to_jsonb($1::text) WHERE id = $2`, media.FileURL, companyID)
		return err
	default:
		return nil
	}
}

func (r *Repository) Dashboard(ctx context.Context, companyID uuid.UUID) (DashboardStats, error) {
	var stats DashboardStats
	err := r.db.QueryRow(ctx, `
		SELECT
			count(*) FILTER (WHERE event_type = 'view'),
			count(*) FILTER (WHERE event_type = 'follow'),
			count(*) FILTER (WHERE event_type = 'job_view'),
			count(*) FILTER (WHERE event_type = 'application'),
			count(*) FILTER (WHERE event_type = 'candidate_view')
		FROM company_analytics
		WHERE company_id = $1
	`, companyID).Scan(&stats.Views, &stats.Followers, &stats.OpenJobs, &stats.Applications, &stats.CandidateViews)
	return stats, err
}

func (r *Repository) Track(ctx context.Context, companyID uuid.UUID, eventType string, actor *uuid.UUID, metadata map[string]any) error {
	bytes, _ := json.Marshal(metadata)
	_, err := r.db.Exec(ctx, `INSERT INTO company_analytics (company_id, event_type, actor_user_id, metadata) VALUES ($1, $2, $3, $4)`, companyID, eventType, actor, bytes)
	return err
}

func companySelect() string {
	return `SELECT companies.id, companies.name, companies.slug, coalesce(companies.website, ''), coalesce(companies.logo_url, ''), coalesce(companies.banner_url, ''), coalesce(companies.description, ''),
		coalesce(companies.about, ''), coalesce(companies.mission, ''), coalesce(companies.vision, ''), coalesce(companies.culture, ''), coalesce(companies.size_range, ''),
		coalesce(companies.industry, ''), coalesce(companies.founded_year, 0), coalesce(companies.headquarters, ''), coalesce(companies.gst_number, ''), coalesce(companies.cin_number, ''),
		companies.social_links, companies.benefits, companies.gallery, companies.status, companies.is_verified, companies.verified_badge, coalesce(companies.verification_notes, ''), companies.created_at, companies.updated_at
		FROM companies`
}

func companyScan(item *Company, socialLinks, benefits, gallery *[]byte) []any {
	return []any{&item.ID, &item.Name, &item.Slug, &item.Website, &item.LogoURL, &item.BannerURL, &item.Description, &item.About, &item.Mission, &item.Vision, &item.Culture, &item.SizeRange, &item.Industry, &item.FoundedYear, &item.Headquarters, &item.GSTNumber, &item.CINNumber, socialLinks, benefits, gallery, &item.Status, &item.IsVerified, &item.VerifiedBadge, &item.VerificationNotes, &item.CreatedAt, &item.UpdatedAt}
}

func scanCompanies(rows pgx.Rows) ([]Company, error) {
	defer rows.Close()
	items := []Company{}
	for rows.Next() {
		var item Company
		var socialLinks, benefits, gallery []byte
		if err := rows.Scan(companyScan(&item, &socialLinks, &benefits, &gallery)...); err != nil {
			return nil, err
		}
		decodeCompanyJSON(&item, socialLinks, benefits, gallery)
		items = append(items, item)
	}
	return items, rows.Err()
}

func decodeCompanyJSON(item *Company, socialLinks, benefits, gallery []byte) {
	_ = json.Unmarshal(socialLinks, &item.SocialLinks)
	_ = json.Unmarshal(benefits, &item.Benefits)
	_ = json.Unmarshal(gallery, &item.Gallery)
	if item.SocialLinks == nil {
		item.SocialLinks = map[string]any{}
	}
}

func mergeUpdate(current Company, req UpdateRequest) Company {
	if req.Name != "" {
		current.Name = req.Name
	}
	if req.Website != "" {
		current.Website = req.Website
	}
	if req.LogoURL != "" {
		current.LogoURL = req.LogoURL
	}
	if req.BannerURL != "" {
		current.BannerURL = req.BannerURL
	}
	if req.Description != "" {
		current.Description = req.Description
	}
	if req.About != "" {
		current.About = req.About
	}
	if req.Mission != "" {
		current.Mission = req.Mission
	}
	if req.Vision != "" {
		current.Vision = req.Vision
	}
	if req.Culture != "" {
		current.Culture = req.Culture
	}
	if req.SizeRange != "" {
		current.SizeRange = req.SizeRange
	}
	if req.Industry != "" {
		current.Industry = req.Industry
	}
	if req.FoundedYear != 0 {
		current.FoundedYear = req.FoundedYear
	}
	if req.Headquarters != "" {
		current.Headquarters = req.Headquarters
	}
	if req.GSTNumber != "" {
		current.GSTNumber = req.GSTNumber
	}
	if req.CINNumber != "" {
		current.CINNumber = req.CINNumber
	}
	if req.SocialLinks != nil {
		current.SocialLinks = req.SocialLinks
	}
	if req.Benefits != nil {
		current.Benefits = req.Benefits
	}
	if req.Gallery != nil {
		current.Gallery = req.Gallery
	}
	return current
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
