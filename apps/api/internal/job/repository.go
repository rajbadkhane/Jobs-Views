package job

import (
	"context"
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

func (r *Repository) Create(ctx context.Context, req UpsertRequest, slug string, seo SEO, userID uuid.UUID) (Job, error) {
	jobTypeID, err := r.jobTypeID(ctx, req.JobTypeSlug)
	if err != nil {
		return Job{}, err
	}
	id, err := r.insertOrUpdate(ctx, uuid.Nil, req, slug, seo, jobTypeID, userID)
	if err != nil {
		return Job{}, err
	}
	if err := r.replaceSkills(ctx, id, req.Skills); err != nil {
		return Job{}, err
	}
	return r.ByID(ctx, id)
}

func (r *Repository) Update(ctx context.Context, id uuid.UUID, req UpsertRequest, seo SEO, userID uuid.UUID) (Job, error) {
	current, err := r.ByID(ctx, id)
	if err != nil {
		return Job{}, err
	}
	jobTypeID, err := r.jobTypeID(ctx, req.JobTypeSlug)
	if err != nil {
		return Job{}, err
	}
	_, err = r.insertOrUpdate(ctx, id, req, current.Slug, seo, jobTypeID, userID)
	if err != nil {
		return Job{}, err
	}
	if err := r.replaceSkills(ctx, id, req.Skills); err != nil {
		return Job{}, err
	}
	return r.ByID(ctx, id)
}

func (r *Repository) Duplicate(ctx context.Context, id, userID uuid.UUID, slug string) (Job, error) {
	current, err := r.ByID(ctx, id)
	if err != nil {
		return Job{}, err
	}
	responsibilities, _ := json.Marshal(current.Responsibilities)
	requirements, _ := json.Marshal(current.Requirements)
	qualifications, _ := json.Marshal(current.Qualifications)
	benefits, _ := json.Marshal(current.Benefits)
	openGraph, _ := json.Marshal(current.OpenGraph)
	jsonLD, _ := json.Marshal(current.JSONLD)
	var newID uuid.UUID
	err = r.db.QueryRow(ctx, `
		INSERT INTO jobs (
			company_id, branch_id, category_id, subcategory_id, industry_id, function_id, department_id, job_type_id,
			title, slug, short_description, full_description, responsibilities, requirements, qualifications, benefits,
			salary_min, salary_max, currency, experience_min, experience_max, education, openings, expiry_date,
			work_mode, country, state, city, latitude, longitude, radius_km, status, visibility, is_featured,
			is_urgent, is_sponsored, canonical_url, meta_title, meta_description, open_graph, json_ld, created_by, updated_by
		)
		SELECT company_id, branch_id, category_id, subcategory_id, industry_id, function_id, department_id, job_type_id,
			$1, $2, short_description, full_description, $3, $4, $5, $6,
			salary_min, salary_max, currency, experience_min, experience_max, education, openings, expiry_date,
			work_mode, country, state, city, latitude, longitude, radius_km, 'draft', visibility, false,
			is_urgent, false, $7, $8, $9, $10, $11, $12, $12
		FROM jobs WHERE id = $13 AND deleted_at IS NULL
		RETURNING id
	`, current.Title+" Copy", slug, responsibilities, requirements, qualifications, benefits, current.CanonicalURL, current.MetaTitle, current.MetaDescription, openGraph, jsonLD, userID, id).Scan(&newID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Job{}, auth.ErrNotFound
	}
	if err != nil {
		return Job{}, err
	}
	if _, err = r.db.Exec(ctx, `UPDATE jobs SET salary_period=$1,salary_basis=$2 WHERE id=$3`, current.SalaryPeriod, current.SalaryBasis, newID); err != nil {
		return Job{}, err
	}
	for _, skill := range current.Skills {
		_, err = r.db.Exec(ctx, `
			INSERT INTO job_skills (job_id, name, requirement_type, level, years_experience)
			VALUES ($1, $2, $3, $4, $5)
		`, newID, skill.Name, skill.RequirementType, skill.Level, skill.YearsExperience)
		if err != nil {
			return Job{}, err
		}
	}
	return r.ByID(ctx, newID)
}

func (r *Repository) ByID(ctx context.Context, id uuid.UUID) (Job, error) {
	rows, err := r.db.Query(ctx, jobSelect()+` WHERE j.id = $1 AND j.deleted_at IS NULL`, id)
	if err != nil {
		return Job{}, err
	}
	items, err := scanJobs(rows)
	if err != nil {
		return Job{}, err
	}
	if len(items) == 0 {
		return Job{}, auth.ErrNotFound
	}
	item := items[0]
	item.Skills, err = r.skills(ctx, item.ID)
	return item, err
}

func (r *Repository) BySlug(ctx context.Context, slug string) (Job, error) {
	rows, err := r.db.Query(ctx, jobSelect()+` WHERE j.slug = $1 AND j.status = 'published' AND j.visibility = 'public' AND j.deleted_at IS NULL`, slug)
	if err != nil {
		return Job{}, err
	}
	items, err := scanJobs(rows)
	if err != nil {
		return Job{}, err
	}
	if len(items) == 0 {
		return Job{}, auth.ErrNotFound
	}
	item := items[0]
	item.Skills, err = r.skills(ctx, item.ID)
	return item, err
}

func (r *Repository) CompanyJobs(ctx context.Context, companyID uuid.UUID, limit, offset int) ([]Job, error) {
	rows, err := r.db.Query(ctx, jobSelect()+`
		WHERE j.company_id = $1 AND j.deleted_at IS NULL
		ORDER BY j.created_at DESC LIMIT $2 OFFSET $3
	`, companyID, limit, offset)
	if err != nil {
		return nil, err
	}
	return scanJobs(rows)
}

func (r *Repository) Search(ctx context.Context, params SearchParams) ([]Job, error) {
	args := []any{}
	where := []string{"j.status = 'published'", "j.visibility = 'public'", "j.deleted_at IS NULL"}
	if params.Keyword != "" {
		args = append(args, "%"+strings.ToLower(params.Keyword)+"%")
		where = append(where, "(lower(j.title || ' ' || coalesce(j.short_description, '') || ' ' || j.full_description) LIKE $"+strconv.Itoa(len(args))+" OR EXISTS (SELECT 1 FROM job_skills js WHERE js.job_id = j.id AND lower(js.name) LIKE $"+strconv.Itoa(len(args))+"))")
	}
	if params.Category != "" {
		args = append(args, params.Category)
		where = append(where, "j.category_id::text = $"+strconv.Itoa(len(args)))
	}
	if params.Company != "" {
		args = append(args, params.Company)
		where = append(where, "(c.id::text = $"+strconv.Itoa(len(args))+" OR c.slug = $"+strconv.Itoa(len(args))+")")
	}
	if params.Industry != "" {
		args = append(args, "%"+strings.ToLower(params.Industry)+"%")
		where = append(where, "lower(coalesce(c.industry, '')) LIKE $"+strconv.Itoa(len(args)))
	}
	if params.City != "" {
		args = append(args, "%"+strings.ToLower(params.City)+"%")
		where = append(where, "lower(coalesce(j.city, '')) LIKE $"+strconv.Itoa(len(args)))
	}
	if params.State != "" {
		args = append(args, "%"+strings.ToLower(params.State)+"%")
		where = append(where, "lower(coalesce(j.state, '')) LIKE $"+strconv.Itoa(len(args)))
	}
	if params.Country != "" {
		args = append(args, "%"+strings.ToLower(params.Country)+"%")
		where = append(where, "lower(j.country) LIKE $"+strconv.Itoa(len(args)))
	}
	if params.SalaryMin > 0 {
		args = append(args, params.SalaryMin)
		where = append(where, "coalesce(j.salary_max, j.salary_min, 0) >= $"+strconv.Itoa(len(args)))
	}
	if params.Experience > 0 {
		args = append(args, params.Experience)
		where = append(where, "$"+strconv.Itoa(len(args))+" BETWEEN j.experience_min AND coalesce(j.experience_max, 99)")
	}
	if params.JobType != "" {
		args = append(args, params.JobType)
		where = append(where, "jt.slug = $"+strconv.Itoa(len(args)))
	}
	if params.WorkMode != "" {
		args = append(args, params.WorkMode)
		where = append(where, "j.work_mode = $"+strconv.Itoa(len(args)))
	}
	if params.PostedDays > 0 {
		args = append(args, params.PostedDays)
		where = append(where, "j.created_at >= NOW() - ($"+strconv.Itoa(len(args))+"::int * INTERVAL '1 day')")
	}
	orderBy := "j.created_at DESC"
	switch params.Sort {
	case "salary":
		orderBy = "coalesce(j.salary_max, j.salary_min, 0) DESC"
	case "company":
		orderBy = "c.name ASC"
	case "relevance":
		orderBy = "j.is_featured DESC, j.is_urgent DESC, j.created_at DESC"
	}
	args = append(args, params.Limit, (params.Page-1)*params.Limit)
	sql := jobSelect() + ` WHERE ` + strings.Join(where, " AND ") + ` ORDER BY ` + orderBy + ` LIMIT $` + strconv.Itoa(len(args)-1) + ` OFFSET $` + strconv.Itoa(len(args))
	rows, err := r.db.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	return scanJobs(rows)
}

func (r *Repository) SetStatus(ctx context.Context, id uuid.UUID, status string, userID uuid.UUID) (Job, error) {
	_, err := r.db.Exec(ctx, `
		UPDATE jobs SET
			status = $1,
			updated_by = $2,
			published_at = CASE WHEN $1 = 'published' THEN NOW() ELSE published_at END,
			paused_at = CASE WHEN $1 = 'paused' THEN NOW() ELSE paused_at END,
			closed_at = CASE WHEN $1 = 'closed' THEN NOW() ELSE closed_at END,
			archived_at = CASE WHEN $1 = 'archived' THEN NOW() ELSE archived_at END,
			rejected_at = CASE WHEN $1 = 'rejected' THEN NOW() ELSE rejected_at END
		WHERE id = $3 AND deleted_at IS NULL
	`, status, userID, id)
	if err != nil {
		return Job{}, err
	}
	return r.ByID(ctx, id)
}

func (r *Repository) SoftDelete(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE jobs SET deleted_at = NOW(), updated_by = $1 WHERE id = $2`, userID, id)
	return err
}

func (r *Repository) Bulk(ctx context.Context, ids []uuid.UUID, action string, userID uuid.UUID) error {
	status := ""
	switch action {
	case "publish":
		status = "published"
	case "pause":
		status = "paused"
	case "delete":
		for _, id := range ids {
			if err := r.SoftDelete(ctx, id, userID); err != nil {
				return err
			}
		}
		return nil
	}
	for _, id := range ids {
		if _, err := r.SetStatus(ctx, id, status, userID); err != nil {
			return err
		}
	}
	return nil
}

func (r *Repository) Taxonomies(ctx context.Context, taxonomyType string) ([]Taxonomy, error) {
	args := []any{}
	where := ""
	if taxonomyType != "" {
		args = append(args, taxonomyType)
		where = "WHERE taxonomy_type = $1"
	}
	rows, err := r.db.Query(ctx, `
		SELECT id, parent_id, taxonomy_type, name, slug, coalesce(description, ''), created_at, updated_at
		FROM job_taxonomies `+where+` ORDER BY taxonomy_type, name
	`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Taxonomy{}
	for rows.Next() {
		var item Taxonomy
		if err := rows.Scan(&item.ID, &item.ParentID, &item.TaxonomyType, &item.Name, &item.Slug, &item.Description, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) CreateTaxonomy(ctx context.Context, req TaxonomyRequest, slug string) (Taxonomy, error) {
	var item Taxonomy
	err := r.db.QueryRow(ctx, `
		INSERT INTO job_taxonomies (parent_id, taxonomy_type, name, slug, description)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, parent_id, taxonomy_type, name, slug, coalesce(description, ''), created_at, updated_at
	`, req.ParentID, req.TaxonomyType, req.Name, slug, req.Description).Scan(&item.ID, &item.ParentID, &item.TaxonomyType, &item.Name, &item.Slug, &item.Description, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (r *Repository) Track(ctx context.Context, jobID uuid.UUID, eventType string, actor *uuid.UUID, visitorKey string, metadata map[string]any) error {
	bytes, _ := json.Marshal(metadata)
	_, err := r.db.Exec(ctx, `INSERT INTO job_analytics (job_id, event_type, actor_user_id, visitor_key, metadata) VALUES ($1, $2, $3, $4, $5)`, jobID, eventType, actor, visitorKey, bytes)
	return err
}

func (r *Repository) Save(ctx context.Context, userID, jobID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, userID, jobID)
	return err
}

func (r *Repository) Analytics(ctx context.Context, jobID uuid.UUID) (Analytics, error) {
	var item Analytics
	err := r.db.QueryRow(ctx, `
		SELECT
			count(*) FILTER (WHERE event_type = 'view'),
			count(DISTINCT visitor_key) FILTER (WHERE event_type = 'view' AND visitor_key IS NOT NULL),
			count(*) FILTER (WHERE event_type = 'save'),
			count(*) FILTER (WHERE event_type = 'share'),
			count(*) FILTER (WHERE event_type = 'application')
		FROM job_analytics WHERE job_id = $1
	`, jobID).Scan(&item.Views, &item.UniqueVisitors, &item.Saves, &item.Shares, &item.Applications)
	if item.Views > 0 {
		item.ConversionRate = float64(item.Applications) / float64(item.Views)
	}
	return item, err
}

func (r *Repository) IsCompanyMember(ctx context.Context, companyID, userID uuid.UUID) (bool, string, error) {
	var role string
	err := r.db.QueryRow(ctx, `SELECT role FROM company_users WHERE company_id = $1 AND user_id = $2`, companyID, userID).Scan(&role)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, "", nil
	}
	return err == nil, role, err
}

func (r *Repository) jobTypeID(ctx context.Context, slug string) (int, error) {
	var id int
	err := r.db.QueryRow(ctx, `SELECT id FROM job_types WHERE slug = $1`, slug).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, auth.ErrNotFound
	}
	return id, err
}

func (r *Repository) insertOrUpdate(ctx context.Context, id uuid.UUID, req UpsertRequest, slug string, seo SEO, jobTypeID int, userID uuid.UUID) (uuid.UUID, error) {
	responsibilities, _ := json.Marshal(req.Responsibilities)
	requirements, _ := json.Marshal(req.Requirements)
	qualifications, _ := json.Marshal(req.Qualifications)
	benefits, _ := json.Marshal(req.Benefits)
	openGraph, _ := json.Marshal(seo.OpenGraph)
	jsonLD, _ := json.Marshal(seo.JSONLD)
	expiry := parseDate(req.ExpiryDate)
	if req.Currency == "" {
		req.Currency = "INR"
	}
	if req.Country == "" {
		req.Country = "India"
	}
	if req.Openings == 0 {
		req.Openings = 1
	}
	if req.SalaryPeriod == "" {
		req.SalaryPeriod = "annual"
	}
	if req.SalaryBasis == "" {
		req.SalaryBasis = "ctc"
	}
	if id == uuid.Nil {
		err := r.db.QueryRow(ctx, `
			INSERT INTO jobs (
				company_id, branch_id, category_id, subcategory_id, industry_id, function_id, department_id, job_type_id,
				title, slug, short_description, full_description, responsibilities, requirements, qualifications, benefits,
				salary_min, salary_max, currency, experience_min, experience_max, education, openings, expiry_date,
				work_mode, country, state, city, latitude, longitude, radius_km, visibility, is_featured, is_urgent,
				canonical_url, meta_title, meta_description, open_graph, json_ld, created_by, updated_by
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
				NULLIF($17, 0), NULLIF($18, 0), $19, $20, NULLIF($21, 0), $22, $23, $24,
				$25, $26, $27, $28, NULLIF($29, 0), NULLIF($30, 0), NULLIF($31, 0), $32, $33, $34,
				$35, $36, $37, $38, $39, $40, $40)
			RETURNING id
		`, req.CompanyID, req.BranchID, req.CategoryID, req.SubcategoryID, req.IndustryID, req.FunctionID, req.DepartmentID, jobTypeID,
			req.Title, slug, req.ShortDescription, req.FullDescription, responsibilities, requirements, qualifications, benefits,
			req.SalaryMin, req.SalaryMax, req.Currency, req.ExperienceMin, req.ExperienceMax, req.Education, req.Openings, expiry,
			req.WorkMode, req.Country, req.State, req.City, req.Latitude, req.Longitude, req.RadiusKM, req.Visibility, req.IsFeatured, req.IsUrgent,
			seo.CanonicalURL, seo.MetaTitle, seo.MetaDescription, openGraph, jsonLD, userID).Scan(&id)
		if err == nil {
			_, err = r.db.Exec(ctx, `UPDATE jobs SET salary_period=$1,salary_basis=$2 WHERE id=$3`, req.SalaryPeriod, req.SalaryBasis, id)
		}
		return id, err
	}
	_, err := r.db.Exec(ctx, `
		UPDATE jobs SET
			branch_id = $1, category_id = $2, subcategory_id = $3, industry_id = $4, function_id = $5, department_id = $6, job_type_id = $7,
			title = $8, short_description = $9, full_description = $10, responsibilities = $11, requirements = $12, qualifications = $13, benefits = $14,
			salary_min = NULLIF($15, 0), salary_max = NULLIF($16, 0), currency = $17, experience_min = $18, experience_max = NULLIF($19, 0),
			education = $20, openings = $21, expiry_date = $22, work_mode = $23, country = $24, state = $25, city = $26,
			latitude = NULLIF($27, 0), longitude = NULLIF($28, 0), radius_km = NULLIF($29, 0), visibility = $30, is_featured = $31, is_urgent = $32,
			canonical_url = $33, meta_title = $34, meta_description = $35, open_graph = $36, json_ld = $37, updated_by = $38
		WHERE id = $39 AND deleted_at IS NULL
	`, req.BranchID, req.CategoryID, req.SubcategoryID, req.IndustryID, req.FunctionID, req.DepartmentID, jobTypeID,
		req.Title, req.ShortDescription, req.FullDescription, responsibilities, requirements, qualifications, benefits,
		req.SalaryMin, req.SalaryMax, req.Currency, req.ExperienceMin, req.ExperienceMax, req.Education, req.Openings, expiry,
		req.WorkMode, req.Country, req.State, req.City, req.Latitude, req.Longitude, req.RadiusKM, req.Visibility, req.IsFeatured, req.IsUrgent,
		seo.CanonicalURL, seo.MetaTitle, seo.MetaDescription, openGraph, jsonLD, userID, id)
	if err == nil {
		_, err = r.db.Exec(ctx, `UPDATE jobs SET salary_period=$1,salary_basis=$2 WHERE id=$3`, req.SalaryPeriod, req.SalaryBasis, id)
	}
	return id, err
}

func (r *Repository) replaceSkills(ctx context.Context, jobID uuid.UUID, skills []SkillRequest) error {
	_, err := r.db.Exec(ctx, `DELETE FROM job_skills WHERE job_id = $1`, jobID)
	if err != nil {
		return err
	}
	for _, skill := range skills {
		_, err = r.db.Exec(ctx, `
			INSERT INTO job_skills (job_id, name, requirement_type, level, years_experience)
			VALUES ($1, $2, $3, $4, $5)
		`, jobID, skill.Name, skill.RequirementType, skill.Level, skill.YearsExperience)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *Repository) skills(ctx context.Context, jobID uuid.UUID) ([]JobSkill, error) {
	rows, err := r.db.Query(ctx, `SELECT id, name, requirement_type, level, years_experience FROM job_skills WHERE job_id = $1 ORDER BY requirement_type, name`, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []JobSkill{}
	for rows.Next() {
		var item JobSkill
		if err := rows.Scan(&item.ID, &item.Name, &item.RequirementType, &item.Level, &item.YearsExperience); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func jobSelect() string {
	return `SELECT j.id, j.company_id, c.name, c.slug, coalesce(c.logo_url, ''), j.branch_id, j.category_id, j.subcategory_id,
		j.industry_id, j.function_id, j.department_id, coalesce(j.job_type_id, 0), coalesce(jt.name, ''), j.title, j.slug,
		coalesce(j.short_description, ''), j.full_description, j.responsibilities, j.requirements, j.qualifications, j.benefits,
		coalesce(j.salary_min, 0), coalesce(j.salary_max, 0), j.currency, j.salary_period, j.salary_basis, j.experience_min, coalesce(j.experience_max, 0),
		coalesce(j.education, ''), j.openings, j.expiry_date, j.work_mode, j.country, coalesce(j.state, ''), coalesce(j.city, ''),
		coalesce(j.latitude, 0), coalesce(j.longitude, 0), coalesce(j.radius_km, 0), j.status, j.visibility, j.is_featured,
		j.is_urgent, j.is_sponsored, coalesce(j.canonical_url, ''), coalesce(j.meta_title, ''), coalesce(j.meta_description, ''),
		j.open_graph, j.json_ld, j.published_at, j.created_at, j.updated_at
		FROM jobs j
		JOIN companies c ON c.id = j.company_id
		LEFT JOIN job_types jt ON jt.id = j.job_type_id`
}

func scanJobs(rows pgx.Rows) ([]Job, error) {
	defer rows.Close()
	items := []Job{}
	for rows.Next() {
		var item Job
		var responsibilities, requirements, qualifications, benefits, openGraph, jsonLD []byte
		if err := rows.Scan(&item.ID, &item.CompanyID, &item.CompanyName, &item.CompanySlug, &item.CompanyLogoURL, &item.BranchID, &item.CategoryID, &item.SubcategoryID,
			&item.IndustryID, &item.FunctionID, &item.DepartmentID, &item.JobTypeID, &item.JobType, &item.Title, &item.Slug,
			&item.ShortDescription, &item.FullDescription, &responsibilities, &requirements, &qualifications, &benefits,
			&item.SalaryMin, &item.SalaryMax, &item.Currency, &item.SalaryPeriod, &item.SalaryBasis, &item.ExperienceMin, &item.ExperienceMax, &item.Education, &item.Openings,
			&item.ExpiryDate, &item.WorkMode, &item.Country, &item.State, &item.City, &item.Latitude, &item.Longitude, &item.RadiusKM,
			&item.Status, &item.Visibility, &item.IsFeatured, &item.IsUrgent, &item.IsSponsored, &item.CanonicalURL, &item.MetaTitle,
			&item.MetaDescription, &openGraph, &jsonLD, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(responsibilities, &item.Responsibilities)
		_ = json.Unmarshal(requirements, &item.Requirements)
		_ = json.Unmarshal(qualifications, &item.Qualifications)
		_ = json.Unmarshal(benefits, &item.Benefits)
		_ = json.Unmarshal(openGraph, &item.OpenGraph)
		_ = json.Unmarshal(jsonLD, &item.JSONLD)
		items = append(items, item)
	}
	return items, rows.Err()
}

func parseDate(value string) *time.Time {
	if value == "" {
		return nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil
	}
	return &parsed
}
