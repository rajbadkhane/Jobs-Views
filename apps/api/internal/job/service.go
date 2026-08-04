package job

import (
	"context"
	"errors"
	"strings"

	"careeros/api/internal/auth"
	"careeros/api/internal/config"
	"careeros/api/pkg/apperror"
	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
	cfg  config.Config
}

func NewService(repo *Repository, cfg config.Config) *Service {
	return &Service{repo: repo, cfg: cfg}
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, req UpsertRequest) (Job, error) {
	if err := s.requireCompanyRole(ctx, req.CompanyID, userID, "owner", "hr", "recruiter", "manager"); err != nil {
		return Job{}, err
	}
	slug := slugify(req.Title)
	seo := s.buildSEO(req, slug, "")
	item, err := s.repo.Create(ctx, req, slug, seo, userID)
	return item, s.wrap(err)
}

func (s *Service) Update(ctx context.Context, id, userID uuid.UUID, req UpsertRequest) (Job, error) {
	current, err := s.repo.ByID(ctx, id)
	if err != nil {
		return Job{}, s.wrap(err)
	}
	if err := s.requireCompanyRole(ctx, current.CompanyID, userID, "owner", "hr", "recruiter", "manager"); err != nil {
		return Job{}, err
	}
	seo := s.buildSEO(req, current.Slug, current.CompanyName)
	item, err := s.repo.Update(ctx, id, req, seo, userID)
	return item, s.wrap(err)
}

func (s *Service) Duplicate(ctx context.Context, id, userID uuid.UUID) (Job, error) {
	current, err := s.repo.ByID(ctx, id)
	if err != nil {
		return Job{}, s.wrap(err)
	}
	if err := s.requireCompanyRole(ctx, current.CompanyID, userID, "owner", "hr", "recruiter", "manager"); err != nil {
		return Job{}, err
	}
	item, err := s.repo.Duplicate(ctx, id, userID, slugify(current.Title+" copy"))
	return item, s.wrap(err)
}

func (s *Service) SetStatus(ctx context.Context, id, userID uuid.UUID, status string) (Job, error) {
	current, err := s.repo.ByID(ctx, id)
	if err != nil {
		return Job{}, s.wrap(err)
	}
	if err := s.requireCompanyRole(ctx, current.CompanyID, userID, "owner", "hr", "recruiter", "manager"); err != nil {
		return Job{}, err
	}
	item, err := s.repo.SetStatus(ctx, id, status, userID)
	return item, s.wrap(err)
}

func (s *Service) Delete(ctx context.Context, id, userID uuid.UUID) error {
	current, err := s.repo.ByID(ctx, id)
	if err != nil {
		return s.wrap(err)
	}
	if err := s.requireCompanyRole(ctx, current.CompanyID, userID, "owner", "hr", "manager"); err != nil {
		return err
	}
	return s.wrap(s.repo.SoftDelete(ctx, id, userID))
}

func (s *Service) Bulk(ctx context.Context, userID uuid.UUID, req BulkActionRequest) error {
	for _, id := range req.JobIDs {
		current, err := s.repo.ByID(ctx, id)
		if err != nil {
			return s.wrap(err)
		}
		if err := s.requireCompanyRole(ctx, current.CompanyID, userID, "owner", "hr", "recruiter", "manager"); err != nil {
			return err
		}
	}
	return s.wrap(s.repo.Bulk(ctx, req.JobIDs, req.Action, userID))
}

func (s *Service) CompanyJobs(ctx context.Context, companyID, userID uuid.UUID, limit, page int) ([]Job, error) {
	if err := s.requireMember(ctx, companyID, userID); err != nil {
		return nil, err
	}
	limit, page = normalizePage(limit, page)
	items, err := s.repo.CompanyJobs(ctx, companyID, limit, (page-1)*limit)
	return items, s.wrap(err)
}

func (s *Service) PublicBySlug(ctx context.Context, slug, visitorKey string, actor *uuid.UUID) (Job, error) {
	item, err := s.repo.BySlug(ctx, slug)
	if err != nil {
		return Job{}, s.wrap(err)
	}
	_ = s.repo.Track(ctx, item.ID, "view", actor, visitorKey, map[string]any{"source": "public_job_page"})
	return item, nil
}

func (s *Service) Search(ctx context.Context, params SearchParams) ([]Job, error) {
	params.Limit, params.Page = normalizePage(params.Limit, params.Page)
	items, err := s.repo.Search(ctx, params)
	return items, s.wrap(err)
}

func (s *Service) Save(ctx context.Context, userID, jobID uuid.UUID) error {
	if err := s.repo.Save(ctx, userID, jobID); err != nil {
		return s.wrap(err)
	}
	return s.wrap(s.repo.Track(ctx, jobID, "save", &userID, "", nil))
}

func (s *Service) Share(ctx context.Context, jobID uuid.UUID, actor *uuid.UUID) error {
	return s.wrap(s.repo.Track(ctx, jobID, "share", actor, "", nil))
}

func (s *Service) Analytics(ctx context.Context, id, userID uuid.UUID) (Analytics, error) {
	current, err := s.repo.ByID(ctx, id)
	if err != nil {
		return Analytics{}, s.wrap(err)
	}
	if err := s.requireMember(ctx, current.CompanyID, userID); err != nil {
		return Analytics{}, err
	}
	stats, err := s.repo.Analytics(ctx, id)
	return stats, s.wrap(err)
}

func (s *Service) SEO(ctx context.Context, slug string) (SEO, error) {
	item, err := s.repo.BySlug(ctx, slug)
	if err != nil {
		return SEO{}, s.wrap(err)
	}
	return SEO{CanonicalURL: item.CanonicalURL, MetaTitle: item.MetaTitle, MetaDescription: item.MetaDescription, OpenGraph: item.OpenGraph, JSONLD: item.JSONLD}, nil
}

func (s *Service) Taxonomies(ctx context.Context, taxonomyType string) ([]Taxonomy, error) {
	items, err := s.repo.Taxonomies(ctx, taxonomyType)
	return items, s.wrap(err)
}

func (s *Service) CreateTaxonomy(ctx context.Context, req TaxonomyRequest) (Taxonomy, error) {
	item, err := s.repo.CreateTaxonomy(ctx, req, slugify(req.Name))
	return item, s.wrap(err)
}

func (s *Service) requireMember(ctx context.Context, companyID, userID uuid.UUID) error {
	ok, _, err := s.repo.IsCompanyMember(ctx, companyID, userID)
	if err != nil {
		return s.wrap(err)
	}
	if !ok {
		return apperror.Forbidden("You are not a member of this company.")
	}
	return nil
}

func (s *Service) requireCompanyRole(ctx context.Context, companyID, userID uuid.UUID, roles ...string) error {
	ok, role, err := s.repo.IsCompanyMember(ctx, companyID, userID)
	if err != nil {
		return s.wrap(err)
	}
	if !ok {
		return apperror.Forbidden("You are not a member of this company.")
	}
	for _, allowed := range roles {
		if role == allowed {
			return nil
		}
	}
	return apperror.Forbidden("Your company role cannot manage this job.")
}

func (s *Service) buildSEO(req UpsertRequest, slug, companyName string) SEO {
	base := strings.TrimRight(s.cfg.Storage.BaseURL, "/")
	if base == "" {
		base = "https://jobsview.local"
	}
	canonical := base + "/jobs/" + slug
	metaTitle := req.Title
	if companyName != "" {
		metaTitle += " at " + companyName
	}
	metaDescription := req.ShortDescription
	if metaDescription == "" {
		metaDescription = truncate(req.FullDescription, 155)
	}
	openGraph := map[string]any{
		"type":        "article",
		"title":       metaTitle,
		"description": metaDescription,
		"url":         canonical,
	}
	jsonLD := map[string]any{
		"@context":           "https://schema.org",
		"@type":              "JobPosting",
		"title":              req.Title,
		"description":        req.FullDescription,
		"datePosted":         "",
		"validThrough":       req.ExpiryDate,
		"employmentType":     strings.ToUpper(strings.ReplaceAll(req.JobTypeSlug, "-", "_")),
		"jobLocationType":    req.WorkMode,
		"hiringOrganization": map[string]any{"@type": "Organization", "name": companyName},
		"jobLocation": map[string]any{
			"@type":   "Place",
			"address": map[string]any{"@type": "PostalAddress", "addressLocality": req.City, "addressRegion": req.State, "addressCountry": req.Country},
		},
		"baseSalary": map[string]any{
			"@type":    "MonetaryAmount",
			"currency": req.Currency,
			"value":    map[string]any{"@type": "QuantitativeValue", "minValue": req.SalaryMin, "maxValue": req.SalaryMax, "unitText": "YEAR"},
		},
	}
	return SEO{CanonicalURL: canonical, MetaTitle: metaTitle, MetaDescription: metaDescription, OpenGraph: openGraph, JSONLD: jsonLD}
}

func (s *Service) wrap(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, auth.ErrNotFound) {
		return apperror.NotFound("Job resource not found.")
	}
	return apperror.Database(err)
}

func normalizePage(limit, page int) (int, int) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if page <= 0 {
		page = 1
	}
	return limit, page
}

func slugify(value string) string {
	slug := strings.ToLower(strings.TrimSpace(value))
	replacer := strings.NewReplacer(" ", "-", "_", "-", "/", "-", ".", "-", ",", "")
	return strings.Trim(replacer.Replace(slug), "-") + "-" + uuid.NewString()[:8]
}

func truncate(value string, max int) string {
	value = strings.TrimSpace(value)
	if len(value) <= max {
		return value
	}
	return strings.TrimSpace(value[:max])
}
