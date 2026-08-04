package admin

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

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

func (r *Repository) Dashboard(ctx context.Context) (Dashboard, error) {
	var d Dashboard
	err := r.db.QueryRow(ctx, `
		SELECT
			(SELECT count(*) FROM users WHERE deleted_at IS NULL),
			(SELECT count(*) FROM users WHERE is_active = TRUE AND deleted_at IS NULL),
			(SELECT count(*) FROM companies WHERE deleted_at IS NULL),
			(SELECT count(*) FROM jobs WHERE status = 'published' AND deleted_at IS NULL),
			(SELECT count(*) FROM applications WHERE deleted_at IS NULL),
			(SELECT coalesce(sum(amount), 0) FROM billing_payments WHERE status = 'succeeded'),
			(SELECT count(*) FROM companies WHERE status = 'pending' AND deleted_at IS NULL),
			(SELECT count(*) FROM admin_reports)
	`).Scan(&d.TotalUsers, &d.ActiveUsers, &d.Companies, &d.ActiveJobs, &d.Applications, &d.Revenue, &d.PendingVerifications, &d.Reports)
	return d, err
}

func (r *Repository) DashboardTrends(ctx context.Context, days int) (DashboardTrends, error) {
	var result DashboardTrends
	var err error
	if result.Users, err = r.trend(ctx, `SELECT to_char(day, 'Mon DD'), count(u.id)::float8 FROM generate_series(CURRENT_DATE-$1::int+1, CURRENT_DATE, interval '1 day') day LEFT JOIN users u ON u.created_at::date=day::date AND u.deleted_at IS NULL GROUP BY day ORDER BY day`, days); err != nil {
		return result, err
	}
	if result.Jobs, err = r.trend(ctx, `SELECT to_char(day, 'Mon DD'), count(j.id)::float8 FROM generate_series(CURRENT_DATE-$1::int+1, CURRENT_DATE, interval '1 day') day LEFT JOIN jobs j ON j.created_at::date=day::date AND j.deleted_at IS NULL GROUP BY day ORDER BY day`, days); err != nil {
		return result, err
	}
	if result.Applications, err = r.trend(ctx, `SELECT to_char(day, 'Mon DD'), count(a.id)::float8 FROM generate_series(CURRENT_DATE-$1::int+1, CURRENT_DATE, interval '1 day') day LEFT JOIN applications a ON a.created_at::date=day::date AND a.deleted_at IS NULL GROUP BY day ORDER BY day`, days); err != nil {
		return result, err
	}
	if result.Revenue, err = r.trend(ctx, `SELECT to_char(day, 'Mon DD'), coalesce(sum(p.amount),0)::float8 FROM generate_series(CURRENT_DATE-$1::int+1, CURRENT_DATE, interval '1 day') day LEFT JOIN billing_payments p ON p.created_at::date=day::date AND p.status='succeeded' GROUP BY day ORDER BY day`, days); err != nil {
		return result, err
	}
	result.ApplicationFunnel, err = r.trend(ctx, `SELECT initcap(replace(status, '_', ' ')), count(*)::float8 FROM applications WHERE deleted_at IS NULL GROUP BY status ORDER BY count(*) DESC`, days)
	return result, err
}

func (r *Repository) trend(ctx context.Context, query string, days int) ([]TrendPoint, error) {
	var rows pgx.Rows
	var err error
	if strings.Contains(query, "$1") {
		rows, err = r.db.Query(ctx, query, days)
	} else {
		rows, err = r.db.Query(ctx, query)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []TrendPoint{}
	for rows.Next() {
		var item TrendPoint
		if err := rows.Scan(&item.Name, &item.Value); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) Users(ctx context.Context, p ListParams) ([]AdminUser, error) {
	args := []any{}
	where := []string{"u.deleted_at IS NULL"}
	if p.Query != "" {
		args = append(args, "%"+strings.ToLower(p.Query)+"%")
		where = append(where, "lower(u.email) LIKE $"+strconv.Itoa(len(args)))
	}
	if p.Status == "active" {
		where = append(where, "u.is_active = TRUE")
	}
	if p.Status == "suspended" {
		where = append(where, "u.is_active = FALSE")
	}
	if p.Role != "" {
		args = append(args, p.Role)
		where = append(where, "r.name = $"+strconv.Itoa(len(args)))
	}
	args = append(args, p.Limit, (p.Page-1)*p.Limit)
	rows, err := r.db.Query(ctx, `
		SELECT u.id, u.email, r.name, u.is_active, u.is_verified, u.created_at
		FROM users u
		JOIN user_roles ur ON ur.user_id = u.id
		JOIN roles r ON r.id = ur.role_id
		WHERE `+strings.Join(where, " AND ")+`
		ORDER BY u.created_at DESC
		LIMIT $`+strconv.Itoa(len(args)-1)+` OFFSET $`+strconv.Itoa(len(args)), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []AdminUser{}
	for rows.Next() {
		var item AdminUser
		if err := rows.Scan(&item.ID, &item.Email, &item.Role, &item.IsActive, &item.IsVerified, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) Companies(ctx context.Context, p ListParams) (PagedResult[AdminCompany], error) {
	args := []any{}
	where := []string{"c.deleted_at IS NULL"}
	if p.Query != "" {
		args = append(args, "%"+strings.ToLower(p.Query)+"%")
		where = append(where, "(lower(c.name) LIKE $"+strconv.Itoa(len(args))+" OR lower(coalesce(c.industry, '')) LIKE $"+strconv.Itoa(len(args))+" OR lower(coalesce(c.headquarters, '')) LIKE $"+strconv.Itoa(len(args))+")")
	}
	if p.Status != "" && p.Status != "all" {
		args = append(args, p.Status)
		where = append(where, "c.status = $"+strconv.Itoa(len(args)))
	}
	clause := strings.Join(where, " AND ")
	result := PagedResult[AdminCompany]{Items: []AdminCompany{}, Page: p.Page, Limit: p.Limit}
	if err := r.db.QueryRow(ctx, `SELECT count(*) FROM companies c WHERE `+clause, args...).Scan(&result.Total); err != nil {
		return result, err
	}
	queryArgs := append(append([]any{}, args...), p.Limit, (p.Page-1)*p.Limit)
	rows, err := r.db.Query(ctx, `
		SELECT c.id, c.name, c.slug, coalesce(c.website, ''), coalesce(c.industry, ''),
			coalesce(c.headquarters, ''), coalesce(c.size_range, ''), c.status, c.is_verified,
			c.verified_badge, coalesce(c.gst_number, ''), coalesce(c.cin_number, ''),
			coalesce(c.about, ''), coalesce(c.logo_url, ''),
			(SELECT count(*) FROM jobs j WHERE j.company_id=c.id AND j.deleted_at IS NULL),
			(SELECT count(*) FROM company_users cu WHERE cu.company_id=c.id), c.created_at, c.updated_at
		FROM companies c WHERE `+clause+`
		ORDER BY c.created_at DESC LIMIT $`+strconv.Itoa(len(queryArgs)-1)+` OFFSET $`+strconv.Itoa(len(queryArgs)), queryArgs...)
	if err != nil {
		return result, err
	}
	defer rows.Close()
	for rows.Next() {
		var item AdminCompany
		if err := rows.Scan(&item.ID, &item.Name, &item.Slug, &item.Website, &item.Industry, &item.Headquarters, &item.SizeRange, &item.Status, &item.IsVerified, &item.VerifiedBadge, &item.GSTNumber, &item.CINNumber, &item.About, &item.LogoURL, &item.Jobs, &item.TeamMembers, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return result, err
		}
		result.Items = append(result.Items, item)
	}
	return result, rows.Err()
}

func (r *Repository) Jobs(ctx context.Context, p ListParams) (PagedResult[AdminJob], error) {
	args := []any{}
	where := []string{"j.deleted_at IS NULL"}
	if p.Query != "" {
		args = append(args, "%"+strings.ToLower(p.Query)+"%")
		where = append(where, "(lower(j.title) LIKE $"+strconv.Itoa(len(args))+" OR lower(c.name) LIKE $"+strconv.Itoa(len(args))+" OR lower(coalesce(j.city, '')) LIKE $"+strconv.Itoa(len(args))+")")
	}
	if p.Status != "" && p.Status != "all" {
		args = append(args, p.Status)
		where = append(where, "j.status = $"+strconv.Itoa(len(args)))
	}
	if p.Company != "" && p.Company != "all" {
		args = append(args, p.Company)
		where = append(where, "c.name = $"+strconv.Itoa(len(args)))
	}
	if p.Location != "" {
		args = append(args, "%"+strings.ToLower(p.Location)+"%")
		where = append(where, "lower(concat_ws(' ', j.city, j.state, j.country)) LIKE $"+strconv.Itoa(len(args)))
	}
	if p.JobType != "" && p.JobType != "all" {
		args = append(args, p.JobType)
		where = append(where, "jt.slug = $"+strconv.Itoa(len(args)))
	}
	clause := strings.Join(where, " AND ")
	result := PagedResult[AdminJob]{Items: []AdminJob{}, Page: p.Page, Limit: p.Limit}
	if err := r.db.QueryRow(ctx, `SELECT count(*) FROM jobs j JOIN companies c ON c.id=j.company_id LEFT JOIN job_types jt ON jt.id=j.job_type_id WHERE `+clause, args...).Scan(&result.Total); err != nil {
		return result, err
	}
	queryArgs := append(append([]any{}, args...), p.Limit, (p.Page-1)*p.Limit)
	rows, err := r.db.Query(ctx, `
		SELECT j.id, j.company_id, c.name, j.title, j.slug, coalesce(j.short_description, ''),
			j.full_description, j.requirements, j.benefits, coalesce(j.salary_min, 0),
			coalesce(j.salary_max, 0), j.currency, j.experience_min, coalesce(j.experience_max, 0),
			j.openings, j.work_mode, coalesce(jt.slug, ''), j.country, coalesce(j.state, ''),
			coalesce(j.city, ''), j.status, j.visibility, j.is_featured, j.is_urgent,
			j.published_at, j.created_at, j.updated_at
		FROM jobs j JOIN companies c ON c.id=j.company_id LEFT JOIN job_types jt ON jt.id=j.job_type_id
		WHERE `+clause+` ORDER BY j.created_at DESC LIMIT $`+strconv.Itoa(len(queryArgs)-1)+` OFFSET $`+strconv.Itoa(len(queryArgs)), queryArgs...)
	if err != nil {
		return result, err
	}
	defer rows.Close()
	for rows.Next() {
		var item AdminJob
		var requirements, benefits []byte
		if err := rows.Scan(&item.ID, &item.CompanyID, &item.CompanyName, &item.Title, &item.Slug, &item.ShortDescription, &item.FullDescription, &requirements, &benefits, &item.SalaryMin, &item.SalaryMax, &item.Currency, &item.ExperienceMin, &item.ExperienceMax, &item.Openings, &item.WorkMode, &item.JobType, &item.Country, &item.State, &item.City, &item.Status, &item.Visibility, &item.IsFeatured, &item.IsUrgent, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return result, err
		}
		_ = json.Unmarshal(requirements, &item.Requirements)
		_ = json.Unmarshal(benefits, &item.Benefits)
		result.Items = append(result.Items, item)
	}
	return result, rows.Err()
}

func (r *Repository) SetUserActive(ctx context.Context, id uuid.UUID, active bool) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET is_active = $1 WHERE id = $2`, active, id)
	return err
}

func (r *Repository) DeleteUser(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET deleted_at = NOW(), is_active = FALSE WHERE id = $1`, id)
	return err
}

func (r *Repository) AssignRole(ctx context.Context, id uuid.UUID, role string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if _, err := tx.Exec(ctx, `DELETE FROM user_roles WHERE user_id = $1`, id); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name = $2`, id, role); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *Repository) ResetPasswordToken(ctx context.Context, id uuid.UUID) (string, error) {
	token, err := randomToken(32)
	if err != nil {
		return "", err
	}
	hash := sha256.Sum256([]byte(token))
	_, err = r.db.Exec(ctx, `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, id, hex.EncodeToString(hash[:]))
	return token, err
}

func (r *Repository) SetCompanyStatus(ctx context.Context, id uuid.UUID, status, notes string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE companies SET status = $1, verification_notes = $2,
			is_verified = CASE WHEN $1 = 'approved' THEN TRUE ELSE is_verified END,
			verified_badge = CASE WHEN $1 = 'approved' THEN TRUE WHEN $1 IN ('rejected', 'suspended') THEN FALSE ELSE verified_badge END
		WHERE id = $3
	`, status, notes, id)
	return err
}

func (r *Repository) SetJobStatus(ctx context.Context, id uuid.UUID, status string) error {
	_, err := r.db.Exec(ctx, `UPDATE jobs SET status = $1 WHERE id = $2`, status, id)
	return err
}

func (r *Repository) SetJobFlags(ctx context.Context, id uuid.UUID, req JobFlagRequest) error {
	_, err := r.db.Exec(ctx, `UPDATE jobs SET is_featured = $1, is_urgent = $2 WHERE id = $3`, req.IsFeatured, req.IsUrgent, id)
	return err
}

func (r *Repository) QuickPostJob(ctx context.Context, req QuickPostJobRequest, actor uuid.UUID) (QuickPostJobResult, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return QuickPostJobResult{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	companyID, companySlug, err := r.quickPostCompany(ctx, tx, req.Company)
	if err != nil {
		return QuickPostJobResult{}, err
	}
	jobTypeID, err := r.quickPostJobTypeID(ctx, tx, req.Job.JobType)
	if err != nil {
		return QuickPostJobResult{}, err
	}
	jobSlug, err := r.uniqueJobSlug(ctx, tx, slugify(req.Job.Title))
	if err != nil {
		return QuickPostJobResult{}, err
	}
	createdBy, err := r.existingUserID(ctx, tx, actor)
	if err != nil {
		return QuickPostJobResult{}, err
	}

	status := "draft"
	var publishedAt any
	if req.Publish {
		status = "published"
		publishedAt = time.Now()
	}
	responsibilities, _ := json.Marshal(req.Job.Responsibilities)
	requirements, _ := json.Marshal(req.Job.Requirements)
	benefits, _ := json.Marshal(req.Job.Benefits)
	qualifications, _ := json.Marshal([]string{})
	canonical := "/jobs/" + jobSlug
	metaTitle := req.Job.Title + " at " + req.Company.Name
	metaDescription := req.Job.ShortDescription
	openGraph, _ := json.Marshal(map[string]any{
		"type":        "article",
		"title":       metaTitle,
		"description": metaDescription,
		"url":         canonical,
	})
	jsonLD, _ := json.Marshal(map[string]any{
		"@context":        "https://schema.org",
		"@type":           "JobPosting",
		"title":           req.Job.Title,
		"description":     req.Job.FullDescription,
		"employmentType":  strings.ToUpper(strings.ReplaceAll(req.Job.JobType, "-", "_")),
		"jobLocationType": req.Job.WorkMode,
		"hiringOrganization": map[string]any{
			"@type": "Organization",
			"name":  req.Company.Name,
		},
		"jobLocation": map[string]any{
			"@type": "Place",
			"address": map[string]any{
				"@type":           "PostalAddress",
				"addressLocality": req.Job.City,
				"addressRegion":   req.Job.State,
				"addressCountry":  req.Job.Country,
			},
		},
	})

	var jobID uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO jobs (
			company_id, job_type_id, title, slug, short_description, full_description,
			responsibilities, requirements, qualifications, benefits,
			salary_min, salary_max, currency, experience_min, experience_max, education, openings,
			work_mode, country, state, city, status, visibility,
			canonical_url, meta_title, meta_description, open_graph, json_ld, published_at, created_by, updated_by
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
			NULLIF($11, 0), NULLIF($12, 0), $13, $14, NULLIF($15, 0), $16, $17,
			$18, $19, $20, $21, $22, 'public',
			$23, $24, $25, $26, $27, $28, $29, $29)
		RETURNING id
	`, companyID, jobTypeID, req.Job.Title, jobSlug, req.Job.ShortDescription, req.Job.FullDescription,
		string(responsibilities), string(requirements), string(qualifications), string(benefits),
		req.Job.SalaryMin, req.Job.SalaryMax, req.Job.Currency, req.Job.ExperienceMin, req.Job.ExperienceMax, req.Job.Education, req.Job.Openings,
		req.Job.WorkMode, req.Job.Country, req.Job.State, req.Job.City, status,
		canonical, metaTitle, metaDescription, string(openGraph), string(jsonLD), publishedAt, createdBy).Scan(&jobID)
	if err != nil {
		return QuickPostJobResult{}, err
	}
	salaryPeriod := req.Job.SalaryPeriod
	if salaryPeriod == "" {
		salaryPeriod = "annual"
	}
	salaryBasis := req.Job.SalaryBasis
	if salaryBasis == "" {
		salaryBasis = "ctc"
	}
	jobTypesList := req.Job.JobTypes
	if len(jobTypesList) == 0 && req.Job.JobType != "" {
		jobTypesList = []string{req.Job.JobType}
	}
	jobTypesJSON, _ := json.Marshal(jobTypesList)
	_, _ = tx.Exec(ctx, `UPDATE jobs SET salary_period=$1,salary_basis=$2,job_types_list=coalesce($3::jsonb, '[]'::jsonb) WHERE id=$4`, salaryPeriod, salaryBasis, string(jobTypesJSON), jobID)
	if _, err = tx.Exec(ctx, `UPDATE jobs SET salary_period=$1,salary_basis=$2 WHERE id=$3`, salaryPeriod, salaryBasis, jobID); err != nil {
		return QuickPostJobResult{}, err
	}

	for _, skill := range req.Job.Skills {
		name := strings.TrimSpace(skill.Name)
		if name == "" {
			continue
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO job_skills (job_id, name, requirement_type, level, years_experience)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (job_id, name, requirement_type) DO UPDATE SET level = EXCLUDED.level, years_experience = EXCLUDED.years_experience
		`, jobID, name, skill.RequirementType, skill.Level, skill.YearsExperience)
		if err != nil {
			return QuickPostJobResult{}, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return QuickPostJobResult{}, err
	}
	return QuickPostJobResult{
		Company:   map[string]any{"id": companyID, "name": req.Company.Name, "slug": companySlug},
		Job:       map[string]any{"id": jobID, "title": req.Job.Title, "slug": jobSlug, "status": status},
		PublicURL: canonical,
	}, nil
}

func (r *Repository) existingUserID(ctx context.Context, tx pgx.Tx, id uuid.UUID) (any, error) {
	var exists bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE id=$1 AND deleted_at IS NULL)`, id).Scan(&exists); err != nil {
		return nil, err
	}
	if !exists {
		return nil, nil
	}
	return id, nil
}

func (r *Repository) quickPostCompany(ctx context.Context, tx pgx.Tx, req QuickPostCompanyRequest) (uuid.UUID, string, error) {
	slug := slugify(req.Name)
	var id uuid.UUID
	var existingSlug string
	err := tx.QueryRow(ctx, `SELECT id, slug FROM companies WHERE slug = $1 AND deleted_at IS NULL`, slug).Scan(&id, &existingSlug)
	if err == nil {
		_, err = tx.Exec(ctx, `
			UPDATE companies SET
				website = coalesce(NULLIF($2, ''), website),
				industry = coalesce(NULLIF($3, ''), industry),
				headquarters = coalesce(NULLIF($4, ''), headquarters),
				size_range = coalesce(NULLIF($5, ''), size_range),
				status = 'approved',
				is_verified = TRUE,
				verified_badge = TRUE,
				approved_at = coalesce(approved_at, NOW()),
				verified_at = coalesce(verified_at, NOW()),
				verification_notes = 'Approved by Super Admin quick post'
			WHERE id = $1
		`, id, req.Website, req.Industry, req.Headquarters, req.SizeRange)
		return id, existingSlug, err
	}
	if err != pgx.ErrNoRows {
		return uuid.Nil, "", err
	}
	err = tx.QueryRow(ctx, `
		INSERT INTO companies (
			name, slug, website, industry, headquarters, size_range,
			status, is_verified, verified_badge, approved_at, verified_at, verification_notes
		)
		VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''), NULLIF($5, ''), NULLIF($6, ''),
			'approved', TRUE, TRUE, NOW(), NOW(), 'Created by Super Admin quick post')
		RETURNING id
	`, req.Name, slug, req.Website, req.Industry, req.Headquarters, req.SizeRange).Scan(&id)
	if err != nil {
		return uuid.Nil, "", err
	}
	_, err = tx.Exec(ctx, `INSERT INTO company_settings (company_id) VALUES ($1) ON CONFLICT (company_id) DO NOTHING`, id)
	return id, slug, err
}

func (r *Repository) quickPostJobTypeID(ctx context.Context, tx pgx.Tx, slug string) (int, error) {
	if slug == "" {
		slug = "full-time"
	}
	var id int
	err := tx.QueryRow(ctx, `SELECT id FROM job_types WHERE slug = $1`, slug).Scan(&id)
	if err != nil {
		name := strings.ReplaceAll(slug, "-", " ")
		_ = tx.QueryRow(ctx, `INSERT INTO job_types (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET slug=EXCLUDED.slug RETURNING id`, name, slug).Scan(&id)
	}
	if id == 0 {
		_ = tx.QueryRow(ctx, `SELECT id FROM job_types LIMIT 1`).Scan(&id)
	}
	return id, nil
}

func (r *Repository) uniqueJobSlug(ctx context.Context, tx pgx.Tx, base string) (string, error) {
	if base == "" {
		base = "job"
	}
	slug := base
	for i := 2; i <= 50; i++ {
		var exists bool
		if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM jobs WHERE slug = $1)`, slug).Scan(&exists); err != nil {
			return "", err
		}
		if !exists {
			return slug, nil
		}
		slug = fmt.Sprintf("%s-%d", base, i)
	}
	return fmt.Sprintf("%s-%d", base, time.Now().Unix()), nil
}

func (r *Repository) Applications(ctx context.Context, p ListParams) ([]map[string]any, error) {
	rows, err := r.db.Query(ctx, `
		SELECT a.id, a.status, u.email, j.title, c.name, a.created_at
		FROM applications a
		JOIN users u ON u.id = a.candidate_user_id
		JOIN jobs j ON j.id = a.job_id
		JOIN companies c ON c.id = a.company_id
		WHERE a.deleted_at IS NULL
		ORDER BY a.created_at DESC LIMIT $1 OFFSET $2
	`, p.Limit, (p.Page-1)*p.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id uuid.UUID
		var status, email, title, company string
		var createdAt time.Time
		if err := rows.Scan(&id, &status, &email, &title, &company, &createdAt); err != nil {
			return nil, err
		}
		items = append(items, map[string]any{"id": id, "status": status, "candidate_email": email, "job_title": title, "company": company, "created_at": createdAt})
	}
	return items, rows.Err()
}

func (r *Repository) UpsertPlan(ctx context.Context, req PlanRequest) (Plan, error) {
	if req.Currency == "" {
		req.Currency = "INR"
	}
	if req.BillingInterval == "" {
		req.BillingInterval = "month"
	}
	features, _ := json.Marshal(req.Features)
	var item Plan
	var raw []byte
	err := r.db.QueryRow(ctx, `
		INSERT INTO subscription_plans (name, slug, price, currency, billing_interval, features, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, currency = EXCLUDED.currency, billing_interval = EXCLUDED.billing_interval, features = EXCLUDED.features, is_active = EXCLUDED.is_active
		RETURNING id, name, slug, price, currency, billing_interval, features, is_active
	`, req.Name, req.Slug, req.Price, req.Currency, req.BillingInterval, features, req.IsActive).Scan(&item.ID, &item.Name, &item.Slug, &item.Price, &item.Currency, &item.BillingInterval, &raw, &item.IsActive)
	_ = json.Unmarshal(raw, &item.Features)
	return item, err
}

func (r *Repository) Plans(ctx context.Context) ([]Plan, error) {
	rows, err := r.db.Query(ctx, `SELECT id, name, slug, price, currency, billing_interval, features, is_active FROM subscription_plans ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Plan{}
	for rows.Next() {
		var item Plan
		var raw []byte
		if err := rows.Scan(&item.ID, &item.Name, &item.Slug, &item.Price, &item.Currency, &item.BillingInterval, &raw, &item.IsActive); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(raw, &item.Features)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) UpsertCMS(ctx context.Context, req CMSRequest, author uuid.UUID) (CMSEntry, error) {
	seo, _ := json.Marshal(req.SEO)
	schema, _ := json.Marshal(req.Schema)
	gallery, _ := json.Marshal(req.Gallery)
	tags, _ := json.Marshal(req.Tags)
	categories, _ := json.Marshal(req.Categories)
	blocks, _ := json.Marshal(req.Blocks)
	entities, _ := json.Marshal(req.Entities)
	related, _ := json.Marshal(req.Related)
	links, _ := json.Marshal(req.SuggestedInternalLinks)
	status := req.Status
	if status == "" {
		status = "draft"
	}
	if req.Language == "" {
		req.Language = "en-IN"
	}
	var item CMSEntry
	err := r.db.QueryRow(ctx, `
		INSERT INTO cms_entries (
			content_type, title, slug, summary, excerpt, body, featured_image, gallery, tags, categories,
			status, language, seo, schema, blocks, entities, related, ai_summary, short_summary,
			suggested_internal_links, author_user_id, scheduled_at, version, published_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 1, CASE WHEN $11 = 'published' THEN NOW() ELSE NULL END)
		ON CONFLICT (slug) DO UPDATE SET
			content_type = EXCLUDED.content_type,
			title = EXCLUDED.title,
			summary = EXCLUDED.summary,
			excerpt = EXCLUDED.excerpt,
			body = EXCLUDED.body,
			featured_image = EXCLUDED.featured_image,
			gallery = EXCLUDED.gallery,
			tags = EXCLUDED.tags,
			categories = EXCLUDED.categories,
			status = EXCLUDED.status,
			language = EXCLUDED.language,
			seo = EXCLUDED.seo,
			schema = EXCLUDED.schema,
			blocks = EXCLUDED.blocks,
			entities = EXCLUDED.entities,
			related = EXCLUDED.related,
			ai_summary = EXCLUDED.ai_summary,
			short_summary = EXCLUDED.short_summary,
			suggested_internal_links = EXCLUDED.suggested_internal_links,
			scheduled_at = EXCLUDED.scheduled_at,
			version = cms_entries.version + 1,
			published_at = CASE WHEN EXCLUDED.status = 'published' THEN coalesce(cms_entries.published_at, NOW()) ELSE cms_entries.published_at END
		RETURNING id, content_type, title, slug, coalesce(summary, ''), coalesce(excerpt, ''), body, coalesce(featured_image, ''),
			gallery, tags, categories, status, language, seo, schema, blocks, entities, related, coalesce(ai_summary, ''),
			coalesce(short_summary, ''), suggested_internal_links, version, published_at, created_at, updated_at
	`, req.ContentType, req.Title, req.Slug, req.Summary, req.Excerpt, req.Body, req.FeaturedImage, gallery, tags, categories, status, req.Language, seo, schema, blocks, entities, related, req.AISummary, req.ShortSummary, links, author, req.ScheduledAt).Scan(
		&item.ID, &item.ContentType, &item.Title, &item.Slug, &item.Summary, &item.Excerpt, &item.Body, &item.FeaturedImage,
		&gallery, &tags, &categories, &item.Status, &item.Language, &seo, &schema, &blocks, &entities, &related, &item.AISummary,
		&item.ShortSummary, &links, &item.Version, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt,
	)
	decodeCMSJSON(&item, seo, schema, gallery, tags, categories, blocks, entities, related, links)
	if err == nil {
		_ = r.indexContent(ctx, item)
		_ = r.createRevision(ctx, item, author)
	}
	return item, err
}

func (r *Repository) CMS(ctx context.Context, contentType string, limit, page int) ([]CMSEntry, error) {
	args := []any{}
	where := []string{"deleted_at IS NULL"}
	if contentType != "" {
		args = append(args, contentType)
		where = append(where, "content_type = $1")
	}
	args = append(args, limit, (page-1)*limit)
	rows, err := r.db.Query(ctx, `SELECT id, content_type, title, slug, coalesce(summary, ''), coalesce(excerpt, ''), body, coalesce(featured_image, ''),
		gallery, tags, categories, status, language, seo, schema, blocks, entities, related, coalesce(ai_summary, ''),
		coalesce(short_summary, ''), suggested_internal_links, version, published_at, created_at, updated_at
		FROM cms_entries WHERE `+strings.Join(where, " AND ")+` ORDER BY created_at DESC LIMIT $`+strconv.Itoa(len(args)-1)+` OFFSET $`+strconv.Itoa(len(args)), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []CMSEntry{}
	for rows.Next() {
		var item CMSEntry
		var seo, schema, gallery, tags, categories, blocks, entities, related, links []byte
		if err := rows.Scan(
			&item.ID, &item.ContentType, &item.Title, &item.Slug, &item.Summary, &item.Excerpt, &item.Body, &item.FeaturedImage,
			&gallery, &tags, &categories, &item.Status, &item.Language, &seo, &schema, &blocks, &entities, &related, &item.AISummary,
			&item.ShortSummary, &links, &item.Version, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		decodeCMSJSON(&item, seo, schema, gallery, tags, categories, blocks, entities, related, links)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) PublishedCMS(ctx context.Context, contentType string, limit, page int) ([]CMSEntry, error) {
	args := []any{}
	where := []string{"deleted_at IS NULL", "status = 'published'"}
	if contentType != "" {
		args = append(args, contentType)
		where = append(where, "content_type = $1")
	}
	args = append(args, limit, (page-1)*limit)
	rows, err := r.db.Query(ctx, `SELECT id, content_type, title, slug, coalesce(summary, ''), coalesce(excerpt, ''), body, coalesce(featured_image, ''),
		gallery, tags, categories, status, language, seo, schema, blocks, entities, related, coalesce(ai_summary, ''),
		coalesce(short_summary, ''), suggested_internal_links, version, published_at, created_at, updated_at
		FROM cms_entries WHERE `+strings.Join(where, " AND ")+` ORDER BY published_at DESC NULLS LAST LIMIT $`+strconv.Itoa(len(args)-1)+` OFFSET $`+strconv.Itoa(len(args)), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []CMSEntry{}
	for rows.Next() {
		var item CMSEntry
		var seo, schema, gallery, tags, categories, blocks, entities, related, links []byte
		if err := rows.Scan(
			&item.ID, &item.ContentType, &item.Title, &item.Slug, &item.Summary, &item.Excerpt, &item.Body, &item.FeaturedImage,
			&gallery, &tags, &categories, &item.Status, &item.Language, &seo, &schema, &blocks, &entities, &related, &item.AISummary,
			&item.ShortSummary, &links, &item.Version, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		decodeCMSJSON(&item, seo, schema, gallery, tags, categories, blocks, entities, related, links)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) PublishedCMSBySlug(ctx context.Context, contentType, slug string) (CMSEntry, error) {
	items, err := r.PublishedCMS(ctx, contentType, 1, 1)
	if err != nil {
		return CMSEntry{}, err
	}
	for _, item := range items {
		if item.Slug == slug {
			return item, nil
		}
	}
	var item CMSEntry
	var seo, schema, gallery, tags, categories, blocks, entities, related, links []byte
	err = r.db.QueryRow(ctx, `SELECT id, content_type, title, slug, coalesce(summary, ''), coalesce(excerpt, ''), body, coalesce(featured_image, ''),
		gallery, tags, categories, status, language, seo, schema, blocks, entities, related, coalesce(ai_summary, ''),
		coalesce(short_summary, ''), suggested_internal_links, version, published_at, created_at, updated_at
		FROM cms_entries WHERE deleted_at IS NULL AND status = 'published' AND content_type = $1 AND slug = $2`, contentType, slug).Scan(
		&item.ID, &item.ContentType, &item.Title, &item.Slug, &item.Summary, &item.Excerpt, &item.Body, &item.FeaturedImage,
		&gallery, &tags, &categories, &item.Status, &item.Language, &seo, &schema, &blocks, &entities, &related, &item.AISummary,
		&item.ShortSummary, &links, &item.Version, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt,
	)
	decodeCMSJSON(&item, seo, schema, gallery, tags, categories, blocks, entities, related, links)
	return item, err
}

func (r *Repository) UpsertSetting(ctx context.Context, req SettingRequest, actor uuid.UUID) error {
	value, _ := json.Marshal(req.Value)
	_, err := r.db.Exec(ctx, `INSERT INTO platform_settings (key, category, value, is_public, updated_by) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (key) DO UPDATE SET category = EXCLUDED.category, value = EXCLUDED.value, is_public = EXCLUDED.is_public, updated_by = EXCLUDED.updated_by`, req.Key, req.Category, value, req.IsPublic, actor)
	return err
}

func (r *Repository) Settings(ctx context.Context) ([]SettingRequest, error) {
	rows, err := r.db.Query(ctx, `SELECT key, category, value, is_public FROM platform_settings ORDER BY category, key`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []SettingRequest{}
	for rows.Next() {
		var item SettingRequest
		var raw []byte
		if err := rows.Scan(&item.Key, &item.Category, &raw, &item.IsPublic); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(raw, &item.Value)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) CreateReport(ctx context.Context, req ReportRequest, actor uuid.UUID) (Report, error) {
	filters, _ := json.Marshal(req.Filters)
	var item Report
	var raw []byte
	err := r.db.QueryRow(ctx, `INSERT INTO admin_reports (report_type, format, filters, status, requested_by) VALUES ($1, $2, $3, 'queued', $4) RETURNING id, report_type, format, filters, status, coalesce(file_url, ''), created_at`, req.ReportType, req.Format, filters, actor).Scan(&item.ID, &item.ReportType, &item.Format, &raw, &item.Status, &item.FileURL, &item.CreatedAt)
	_ = json.Unmarshal(raw, &item.Filters)
	return item, err
}

func (r *Repository) Reports(ctx context.Context, limit, page int) ([]Report, error) {
	rows, err := r.db.Query(ctx, `SELECT id, report_type, format, filters, status, coalesce(file_url, ''), created_at FROM admin_reports ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, (page-1)*limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Report{}
	for rows.Next() {
		var item Report
		var raw []byte
		if err := rows.Scan(&item.ID, &item.ReportType, &item.Format, &raw, &item.Status, &item.FileURL, &item.CreatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(raw, &item.Filters)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) CreateTicket(ctx context.Context, req TicketRequest, requester *uuid.UUID) (Ticket, error) {
	metadata, _ := json.Marshal(req.Metadata)
	if req.Priority == "" {
		req.Priority = "normal"
	}
	var item Ticket
	var raw []byte
	err := r.db.QueryRow(ctx, `INSERT INTO support_tickets (requester_user_id, email, ticket_type, subject, message, priority, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, coalesce(email, ''), ticket_type, subject, message, status, priority, metadata, created_at`, requester, req.Email, req.TicketType, req.Subject, req.Message, req.Priority, metadata).Scan(&item.ID, &item.Email, &item.TicketType, &item.Subject, &item.Message, &item.Status, &item.Priority, &raw, &item.CreatedAt)
	_ = json.Unmarshal(raw, &item.Metadata)
	return item, err
}

func (r *Repository) Tickets(ctx context.Context, p ListParams) ([]Ticket, error) {
	args := []any{}
	where := []string{"TRUE"}
	if p.Query != "" {
		args = append(args, "%"+strings.ToLower(p.Query)+"%")
		where = append(where, "(lower(subject) LIKE $"+strconv.Itoa(len(args))+" OR lower(coalesce(email, '')) LIKE $"+strconv.Itoa(len(args))+")")
	}
	if p.Status != "" && p.Status != "all" {
		args = append(args, p.Status)
		where = append(where, "status = $"+strconv.Itoa(len(args)))
	}
	args = append(args, p.Limit, (p.Page-1)*p.Limit)
	rows, err := r.db.Query(ctx, `SELECT id, coalesce(email, ''), ticket_type, subject, message, status, priority, metadata, created_at FROM support_tickets WHERE `+strings.Join(where, " AND ")+` ORDER BY created_at DESC LIMIT $`+strconv.Itoa(len(args)-1)+` OFFSET $`+strconv.Itoa(len(args)), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Ticket{}
	for rows.Next() {
		var item Ticket
		var raw []byte
		if err := rows.Scan(&item.ID, &item.Email, &item.TicketType, &item.Subject, &item.Message, &item.Status, &item.Priority, &raw, &item.CreatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(raw, &item.Metadata)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) SEOTemplates(ctx context.Context) ([]SEOTemplate, error) {
	rows, err := r.db.Query(ctx, `SELECT key, title_template, description_template, schema_defaults, created_at, updated_at FROM seo_templates ORDER BY key`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []SEOTemplate{}
	for rows.Next() {
		var item SEOTemplate
		var raw []byte
		if err := rows.Scan(&item.Key, &item.TitleTemplate, &item.DescriptionTemplate, &raw, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(raw, &item.SchemaDefaults)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) Audit(ctx context.Context, limit, page int) ([]AuditLog, error) {
	rows, err := r.db.Query(ctx, `SELECT id, actor_user_id, action, coalesce(resource_type, ''), resource_id, metadata, coalesce(ip_address::text, ''), coalesce(user_agent, ''), created_at FROM admin_audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, (page-1)*limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []AuditLog{}
	for rows.Next() {
		var item AuditLog
		var raw []byte
		if err := rows.Scan(&item.ID, &item.ActorUserID, &item.Action, &item.ResourceType, &item.ResourceID, &raw, &item.IPAddress, &item.UserAgent, &item.CreatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(raw, &item.Metadata)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) Log(ctx context.Context, actor uuid.UUID, action, resourceType string, resourceID *uuid.UUID, metadata map[string]any, ip, userAgent string) error {
	raw, _ := json.Marshal(metadata)
	_, err := r.db.Exec(ctx, `INSERT INTO admin_audit_logs (actor_user_id, action, resource_type, resource_id, metadata, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::inet, $7)`, actor, action, resourceType, resourceID, raw, ip, userAgent)
	return err
}

func (r *Repository) UpsertSEOTemplate(ctx context.Context, req SEORequest, actor uuid.UUID) error {
	raw, _ := json.Marshal(req.SchemaDefaults)
	_, err := r.db.Exec(ctx, `INSERT INTO seo_templates (key, title_template, description_template, schema_defaults, updated_by) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (key) DO UPDATE SET title_template = EXCLUDED.title_template, description_template = EXCLUDED.description_template, schema_defaults = EXCLUDED.schema_defaults, updated_by = EXCLUDED.updated_by`, req.Key, req.TitleTemplate, req.DescriptionTemplate, raw, actor)
	return err
}

func (r *Repository) BusinessDashboard(ctx context.Context) (BusinessDashboard, error) {
	var item BusinessDashboard
	err := r.db.QueryRow(ctx, `
		SELECT
			coalesce((SELECT sum(sp.price) FROM company_subscriptions cs JOIN subscription_plans sp ON sp.id = cs.plan_id WHERE cs.status IN ('trialing', 'active')), 0),
			coalesce((SELECT sum(sp.price) * 12 FROM company_subscriptions cs JOIN subscription_plans sp ON sp.id = cs.plan_id WHERE cs.status IN ('trialing', 'active')), 0),
			coalesce((SELECT sum(amount) FROM billing_payments WHERE status = 'succeeded'), 0),
			coalesce((SELECT sum(amount) FROM billing_payments WHERE status = 'succeeded'), 0) - coalesce((SELECT sum(amount) FROM billing_payments WHERE status = 'refunded'), 0),
			coalesce((SELECT sum(amount) FROM billing_payments WHERE status = 'refunded'), 0),
			(SELECT count(*) FROM billing_invoices),
			(SELECT count(*) FROM companies WHERE deleted_at IS NULL),
			(SELECT count(*) FROM company_subscriptions WHERE status IN ('trialing', 'active')),
			(SELECT count(*) FROM marketplace_purchases WHERE status IN ('paid', 'pending')),
			(SELECT count(*) FROM job_boosts WHERE status IN ('scheduled', 'active')),
			(SELECT count(*) FROM resume_database_unlocks),
			(SELECT count(*) FROM employer_leads),
			(SELECT count(*) FROM operations_queue WHERE status IN ('open', 'reviewing'))
	`).Scan(
		&item.MRR, &item.ARR, &item.Revenue, &item.Collections, &item.Refunds, &item.Invoices, &item.Employers,
		&item.ActiveSubscriptions, &item.MarketplacePurchases, &item.JobBoosts, &item.ResumeUnlocks, &item.Leads, &item.OpenOperations,
	)
	return item, err
}

func (r *Repository) MarketplaceOverview(ctx context.Context) (MarketplaceOverview, error) {
	products, err := r.mapRows(ctx, `SELECT code, name, category, price, currency, coalesce(duration_days, 0), is_active FROM marketplace_products ORDER BY category, price`)
	if err != nil {
		return MarketplaceOverview{}, err
	}
	coupons, err := r.mapRows(ctx, `SELECT code, discount_type, discount_value, is_active, redeemed_count FROM coupons ORDER BY created_at DESC LIMIT 20`)
	if err != nil {
		return MarketplaceOverview{}, err
	}
	boosts, err := r.mapRows(ctx, `SELECT product_code, status, count(*) FROM job_boosts GROUP BY product_code, status ORDER BY product_code`)
	if err != nil {
		return MarketplaceOverview{}, err
	}
	operations, err := r.mapRows(ctx, `SELECT queue_type, severity, status, count(*) FROM operations_queue GROUP BY queue_type, severity, status ORDER BY queue_type`)
	if err != nil {
		return MarketplaceOverview{}, err
	}
	automation, err := r.mapRows(ctx, `SELECT rule_key, action, schedule, is_active FROM automation_rules ORDER BY rule_key LIMIT 20`)
	if err != nil {
		return MarketplaceOverview{}, err
	}
	notifications, err := r.mapRows(ctx, `SELECT key, channel, is_active FROM notification_templates ORDER BY channel, key LIMIT 20`)
	if err != nil {
		return MarketplaceOverview{}, err
	}
	return MarketplaceOverview{Products: products, Coupons: coupons, Boosts: boosts, Operations: operations, Automation: automation, Notifications: notifications}, nil
}

func (r *Repository) mapRows(ctx context.Context, query string, args ...any) ([]map[string]any, error) {
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	fields := rows.FieldDescriptions()
	items := []map[string]any{}
	for rows.Next() {
		values := make([]any, len(fields))
		pointers := make([]any, len(fields))
		for i := range values {
			pointers[i] = &values[i]
		}
		if err := rows.Scan(pointers...); err != nil {
			return nil, err
		}
		item := map[string]any{}
		for i, field := range fields {
			item[string(field.Name)] = values[i]
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func decodeCMSJSON(item *CMSEntry, seo, schema, gallery, tags, categories, blocks, entities, related, links []byte) {
	_ = json.Unmarshal(seo, &item.SEO)
	_ = json.Unmarshal(schema, &item.Schema)
	_ = json.Unmarshal(gallery, &item.Gallery)
	_ = json.Unmarshal(tags, &item.Tags)
	_ = json.Unmarshal(categories, &item.Categories)
	_ = json.Unmarshal(blocks, &item.Blocks)
	_ = json.Unmarshal(entities, &item.Entities)
	_ = json.Unmarshal(related, &item.Related)
	_ = json.Unmarshal(links, &item.SuggestedInternalLinks)
}

func (r *Repository) indexContent(ctx context.Context, item CMSEntry) error {
	keywords, _ := json.Marshal(append(item.Tags, item.Categories...))
	urlPath := contentURL(item.ContentType, item.Slug)
	_, err := r.db.Exec(ctx, `
		INSERT INTO content_search_index (entry_id, content_type, slug, title, summary, keywords, url_path, status, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		ON CONFLICT (entry_id) DO UPDATE SET content_type = EXCLUDED.content_type, slug = EXCLUDED.slug, title = EXCLUDED.title,
			summary = EXCLUDED.summary, keywords = EXCLUDED.keywords, url_path = EXCLUDED.url_path, status = EXCLUDED.status, updated_at = NOW()
	`, item.ID, item.ContentType, item.Slug, item.Title, item.Summary, keywords, urlPath, item.Status)
	return err
}

func (r *Repository) createRevision(ctx context.Context, item CMSEntry, actor uuid.UUID) error {
	snapshot, _ := json.Marshal(item)
	_, err := r.db.Exec(ctx, `
		INSERT INTO cms_revisions (entry_id, version, snapshot, edited_by, change_note)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (entry_id, version) DO NOTHING
	`, item.ID, item.Version, snapshot, actor, "CMS entry saved")
	return err
}

func contentURL(contentType, slug string) string {
	switch contentType {
	case "career":
		return "/career/" + slug
	case "guidance":
		return "/guidance/" + slug
	case "salary":
		return "/salary/" + slug
	case "interview":
		return "/interview/" + slug
	case "skill":
		return "/skills/" + slug
	case "landing_page":
		return "/" + slug
	default:
		return "/" + contentType + "/" + slug
	}
}

func randomToken(bytes int) (string, error) {
	buffer := make([]byte, bytes)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return hex.EncodeToString(buffer), nil
}

func slugify(value string) string {
	slug := strings.ToLower(strings.TrimSpace(value))
	slug = regexp.MustCompile(`[^a-z0-9]+`).ReplaceAllString(slug, "-")
	slug = regexp.MustCompile(`-+`).ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}
