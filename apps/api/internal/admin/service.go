package admin

import (
	"context"
	"strings"

	"careeros/api/pkg/apperror"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Service struct {
	repo  *Repository
	db    *pgxpool.Pool
	redis *redis.Client
}

func NewService(repo *Repository, db *pgxpool.Pool, redis *redis.Client) *Service {
	return &Service{repo: repo, db: db, redis: redis}
}

func (s *Service) Dashboard(ctx context.Context) (Dashboard, error) {
	item, err := s.repo.Dashboard(ctx)
	return item, wrap(err)
}

func (s *Service) DashboardTrends(ctx context.Context, days int) (DashboardTrends, error) {
	if days != 7 && days != 30 && days != 90 {
		days = 30
	}
	item, err := s.repo.DashboardTrends(ctx, days)
	return item, wrap(err)
}

func (s *Service) Users(ctx context.Context, p ListParams) ([]AdminUser, error) {
	p.Limit, p.Page = normalizePage(p.Limit, p.Page)
	items, err := s.repo.Users(ctx, p)
	return items, wrap(err)
}

func (s *Service) Companies(ctx context.Context, p ListParams) (PagedResult[AdminCompany], error) {
	p.Limit, p.Page = normalizePage(p.Limit, p.Page)
	items, err := s.repo.Companies(ctx, p)
	return items, wrap(err)
}

func (s *Service) Jobs(ctx context.Context, p ListParams) (PagedResult[AdminJob], error) {
	p.Limit, p.Page = normalizePage(p.Limit, p.Page)
	items, err := s.repo.Jobs(ctx, p)
	return items, wrap(err)
}

func (s *Service) SetUserActive(ctx context.Context, actor, id uuid.UUID, active bool, ip, ua string) error {
	if err := s.repo.SetUserActive(ctx, id, active); err != nil {
		return wrap(err)
	}
	return s.audit(ctx, actor, "admin.user.active_changed", "user", &id, map[string]any{"active": active}, ip, ua)
}

func (s *Service) DeleteUser(ctx context.Context, actor, id uuid.UUID, ip, ua string) error {
	if err := s.repo.DeleteUser(ctx, id); err != nil {
		return wrap(err)
	}
	return s.audit(ctx, actor, "admin.user.deleted", "user", &id, nil, ip, ua)
}

func (s *Service) AssignRole(ctx context.Context, actor, id uuid.UUID, role, ip, ua string) error {
	if err := s.repo.AssignRole(ctx, id, role); err != nil {
		return wrap(err)
	}
	return s.audit(ctx, actor, "admin.user.role_assigned", "user", &id, map[string]any{"role": role}, ip, ua)
}

func (s *Service) ResetPassword(ctx context.Context, actor, id uuid.UUID, ip, ua string) (ResetPasswordResult, error) {
	token, err := s.repo.ResetPasswordToken(ctx, id)
	if err != nil {
		return ResetPasswordResult{}, wrap(err)
	}
	_ = s.audit(ctx, actor, "admin.user.password_reset", "user", &id, nil, ip, ua)
	return ResetPasswordResult{Token: token}, nil
}

func (s *Service) ModerateCompany(ctx context.Context, actor, id uuid.UUID, req ModerationRequest, ip, ua string) error {
	if err := s.repo.SetCompanyStatus(ctx, id, req.Status, req.Notes); err != nil {
		return wrap(err)
	}
	return s.audit(ctx, actor, "admin.company.moderated", "company", &id, map[string]any{"status": req.Status}, ip, ua)
}

func (s *Service) ModerateJob(ctx context.Context, actor, id uuid.UUID, req ModerationRequest, ip, ua string) error {
	if err := s.repo.SetJobStatus(ctx, id, req.Status); err != nil {
		return wrap(err)
	}
	return s.audit(ctx, actor, "admin.job.moderated", "job", &id, map[string]any{"status": req.Status}, ip, ua)
}

func (s *Service) SetJobFlags(ctx context.Context, actor, id uuid.UUID, req JobFlagRequest, ip, ua string) error {
	if err := s.repo.SetJobFlags(ctx, id, req); err != nil {
		return wrap(err)
	}
	return s.audit(ctx, actor, "admin.job.flags_updated", "job", &id, map[string]any{"featured": req.IsFeatured, "urgent": req.IsUrgent}, ip, ua)
}

func (s *Service) QuickPostJob(ctx context.Context, actor uuid.UUID, req QuickPostJobRequest, ip, ua string) (QuickPostJobResult, error) {
	req.Company.Name = strings.TrimSpace(req.Company.Name)
	req.Job.Title = strings.TrimSpace(req.Job.Title)
	req.Job.FullDescription = strings.TrimSpace(req.Job.FullDescription)
	req.Job.WorkMode = strings.TrimSpace(req.Job.WorkMode)
	req.Job.JobType = strings.ReplaceAll(strings.TrimSpace(req.Job.JobType), "_", "-")

	details := map[string]string{}
	if req.Company.Name == "" {
		details["company.name"] = "company name is required"
	}
	if req.Job.Title == "" {
		details["job.title"] = "job title is required"
	}
	if req.Job.FullDescription == "" {
		details["job.full_description"] = "full description is required"
	}
	if req.Job.WorkMode == "" {
		req.Job.WorkMode = "on_site"
	}
	if req.Job.WorkMode != "remote" && req.Job.WorkMode != "hybrid" && req.Job.WorkMode != "on_site" {
		details["job.work_mode"] = "must be remote, hybrid, or on_site"
	}
	if req.Job.JobType == "" {
		req.Job.JobType = "full-time"
	}
	if req.Job.Currency == "" {
		req.Job.Currency = "INR"
	}
	if req.Job.SalaryPeriod == "" {
		req.Job.SalaryPeriod = "annual"
	}
	if req.Job.SalaryPeriod != "hourly" && req.Job.SalaryPeriod != "daily" && req.Job.SalaryPeriod != "monthly" && req.Job.SalaryPeriod != "annual" {
		details["job.salary_period"] = "must be hourly, daily, monthly, or annual"
	}
	if req.Job.SalaryBasis == "" {
		req.Job.SalaryBasis = "ctc"
	}
	if req.Job.SalaryBasis != "gross" && req.Job.SalaryBasis != "take_home" && req.Job.SalaryBasis != "ctc" {
		details["job.salary_basis"] = "must be gross, take_home, or ctc"
	}
	if req.Job.SalaryMin < 0 || req.Job.SalaryMax < 0 || (req.Job.SalaryMin > 0 && req.Job.SalaryMax > 0 && req.Job.SalaryMin > req.Job.SalaryMax) {
		details["job.salary"] = "must be a valid non-negative range"
	}
	if req.Job.Country == "" {
		req.Job.Country = "India"
	}
	if req.Job.Openings <= 0 {
		req.Job.Openings = 1
	}
	if req.Job.ShortDescription == "" {
		req.Job.ShortDescription = truncateText(req.Job.FullDescription, 220)
	}
	for i := range req.Job.Skills {
		if req.Job.Skills[i].RequirementType == "" {
			req.Job.Skills[i].RequirementType = "required"
		}
		if req.Job.Skills[i].Level == "" {
			req.Job.Skills[i].Level = "intermediate"
		}
	}
	if len(details) > 0 {
		return QuickPostJobResult{}, apperror.Validation(details)
	}

	item, err := s.repo.QuickPostJob(ctx, req, actor)
	if err != nil {
		return QuickPostJobResult{}, wrap(err)
	}
	jobID, _ := item.Job["id"].(uuid.UUID)
	_ = s.audit(ctx, actor, "admin.job.quick_posted", "job", &jobID, map[string]any{"company": req.Company.Name, "published": req.Publish}, ip, ua)
	return item, nil
}

func (s *Service) Applications(ctx context.Context, p ListParams) ([]map[string]any, error) {
	p.Limit, p.Page = normalizePage(p.Limit, p.Page)
	items, err := s.repo.Applications(ctx, p)
	return items, wrap(err)
}

func (s *Service) Plans(ctx context.Context) ([]Plan, error) {
	items, err := s.repo.Plans(ctx)
	return items, wrap(err)
}

func (s *Service) UpsertPlan(ctx context.Context, actor uuid.UUID, req PlanRequest, ip, ua string) (Plan, error) {
	item, err := s.repo.UpsertPlan(ctx, req)
	if err != nil {
		return Plan{}, wrap(err)
	}
	_ = s.audit(ctx, actor, "admin.billing.plan_saved", "subscription_plan", nil, map[string]any{"slug": req.Slug}, ip, ua)
	return item, nil
}

func (s *Service) CMS(ctx context.Context, contentType string, limit, page int) ([]CMSEntry, error) {
	limit, page = normalizePage(limit, page)
	items, err := s.repo.CMS(ctx, contentType, limit, page)
	return items, wrap(err)
}

func (s *Service) PublishedCMS(ctx context.Context, contentType string, limit, page int) ([]CMSEntry, error) {
	limit, page = normalizePage(limit, page)
	items, err := s.repo.PublishedCMS(ctx, contentType, limit, page)
	return items, wrap(err)
}

func (s *Service) PublishedCMSBySlug(ctx context.Context, contentType, slug string) (CMSEntry, error) {
	item, err := s.repo.PublishedCMSBySlug(ctx, contentType, slug)
	return item, wrap(err)
}

func (s *Service) UpsertCMS(ctx context.Context, actor uuid.UUID, req CMSRequest, ip, ua string) (CMSEntry, error) {
	item, err := s.repo.UpsertCMS(ctx, req, actor)
	if err != nil {
		return CMSEntry{}, wrap(err)
	}
	_ = s.audit(ctx, actor, "admin.cms.saved", "cms_entry", &item.ID, map[string]any{"type": req.ContentType}, ip, ua)
	return item, nil
}

func (s *Service) Settings(ctx context.Context) ([]SettingRequest, error) {
	items, err := s.repo.Settings(ctx)
	return items, wrap(err)
}

func (s *Service) UpsertSetting(ctx context.Context, actor uuid.UUID, req SettingRequest, ip, ua string) error {
	if err := s.repo.UpsertSetting(ctx, req, actor); err != nil {
		return wrap(err)
	}
	return s.audit(ctx, actor, "admin.settings.saved", "platform_setting", nil, map[string]any{"key": req.Key}, ip, ua)
}

func (s *Service) CreateReport(ctx context.Context, actor uuid.UUID, req ReportRequest, ip, ua string) (Report, error) {
	item, err := s.repo.CreateReport(ctx, req, actor)
	if err != nil {
		return Report{}, wrap(err)
	}
	_ = s.audit(ctx, actor, "admin.report.created", "admin_report", &item.ID, map[string]any{"type": req.ReportType}, ip, ua)
	return item, nil
}

func (s *Service) Reports(ctx context.Context, limit, page int) ([]Report, error) {
	limit, page = normalizePage(limit, page)
	items, err := s.repo.Reports(ctx, limit, page)
	return items, wrap(err)
}

func (s *Service) CreateTicket(ctx context.Context, actor *uuid.UUID, req TicketRequest) (Ticket, error) {
	item, err := s.repo.CreateTicket(ctx, req, actor)
	return item, wrap(err)
}

func (s *Service) Tickets(ctx context.Context, p ListParams) ([]Ticket, error) {
	p.Limit, p.Page = normalizePage(p.Limit, p.Page)
	items, err := s.repo.Tickets(ctx, p)
	return items, wrap(err)
}

func (s *Service) SEOTemplates(ctx context.Context) ([]SEOTemplate, error) {
	items, err := s.repo.SEOTemplates(ctx)
	return items, wrap(err)
}

func (s *Service) Audit(ctx context.Context, limit, page int) ([]AuditLog, error) {
	limit, page = normalizePage(limit, page)
	items, err := s.repo.Audit(ctx, limit, page)
	return items, wrap(err)
}

func (s *Service) UpsertSEO(ctx context.Context, actor uuid.UUID, req SEORequest, ip, ua string) error {
	if err := s.repo.UpsertSEOTemplate(ctx, req, actor); err != nil {
		return wrap(err)
	}
	return s.audit(ctx, actor, "admin.seo.template_saved", "seo_template", nil, map[string]any{"key": req.Key}, ip, ua)
}

func (s *Service) BusinessDashboard(ctx context.Context) (BusinessDashboard, error) {
	item, err := s.repo.BusinessDashboard(ctx)
	return item, wrap(err)
}

func (s *Service) MarketplaceOverview(ctx context.Context) (MarketplaceOverview, error) {
	item, err := s.repo.MarketplaceOverview(ctx)
	return item, wrap(err)
}

func (s *Service) Health(ctx context.Context) map[string]string {
	result := map[string]string{"api": "ok", "storage": "not_configured", "queue": "not_configured"}
	if err := s.db.Ping(ctx); err != nil {
		result["database"] = err.Error()
	} else {
		result["database"] = "ok"
	}
	if s.redis != nil {
		if err := s.redis.Ping(ctx).Err(); err != nil {
			result["redis"] = err.Error()
		} else {
			result["redis"] = "ok"
		}
	}
	return result
}

func (s *Service) audit(ctx context.Context, actor uuid.UUID, action, resourceType string, resourceID *uuid.UUID, metadata map[string]any, ip, ua string) error {
	return wrap(s.repo.Log(ctx, actor, action, resourceType, resourceID, metadata, ip, ua))
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

func wrap(err error) error {
	if err == nil {
		return nil
	}
	return apperror.Database(err)
}

func truncateText(value string, limit int) string {
	value = strings.TrimSpace(value)
	if len(value) <= limit {
		return value
	}
	return strings.TrimSpace(value[:limit]) + "..."
}
