package admin

import (
	"context"

	"careeros/api/pkg/apperror"
	"careeros/api/pkg/response"
	"careeros/api/pkg/validator"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	service   *Service
	validator *validator.Validator
}

func NewHandler(service *Service, validator *validator.Validator) *Handler {
	return &Handler{service: service, validator: validator}
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	admin := router.Group("/admin")
	admin.Get("/dashboard", h.Dashboard)
	admin.Get("/dashboard/trends", h.DashboardTrends)
	admin.Get("/business-dashboard", h.BusinessDashboard)
	admin.Get("/marketplace", h.MarketplaceOverview)
	admin.Get("/users", h.Users)
	admin.Get("/companies", h.Companies)
	admin.Get("/jobs", h.Jobs)
	admin.Patch("/users/:id/suspend", h.SuspendUser)
	admin.Patch("/users/:id/activate", h.ActivateUser)
	admin.Delete("/users/:id", h.DeleteUser)
	admin.Post("/users/:id/reset-password", h.ResetPassword)
	admin.Patch("/users/:id/roles", h.AssignRole)
	admin.Patch("/companies/:id/status", h.ModerateCompany)
	admin.Post("/jobs/quick-post", h.QuickPostJob)
	admin.Patch("/jobs/:id/status", h.ModerateJob)
	admin.Patch("/jobs/:id/flags", h.SetJobFlags)
	admin.Get("/applications", h.Applications)
	admin.Get("/plans", h.Plans)
	admin.Post("/plans", h.UpsertPlan)
	admin.Get("/cms", h.CMS)
	admin.Post("/cms", h.UpsertCMS)
	admin.Get("/settings", h.Settings)
	admin.Put("/settings", h.UpsertSetting)
	admin.Get("/audit-logs", h.Audit)
	admin.Post("/reports", h.CreateReport)
	admin.Get("/reports", h.Reports)
	admin.Post("/support/tickets", h.CreateTicket)
	admin.Get("/support/tickets", h.Tickets)
	admin.Post("/seo/templates", h.UpsertSEO)
	admin.Get("/seo/templates", h.SEOTemplates)
	admin.Get("/system-health", h.Health)
}

func (h *Handler) RegisterPublicRoutes(router fiber.Router) {
	content := router.Group("/content")
	content.Get("/", h.PublishedCMS)
	content.Get("/:type/:slug", h.PublishedCMSBySlug)
}

func (h *Handler) Dashboard(c *fiber.Ctx) error {
	item, err := h.service.Dashboard(c.Context())
	if err != nil {
		return err
	}
	return response.OK(c, "Admin dashboard loaded.", item)
}

func (h *Handler) DashboardTrends(c *fiber.Ctx) error {
	item, err := h.service.DashboardTrends(c.Context(), c.QueryInt("days", 30))
	if err != nil {
		return err
	}
	return response.OK(c, "Admin dashboard trends loaded.", item)
}

func (h *Handler) BusinessDashboard(c *fiber.Ctx) error {
	item, err := h.service.BusinessDashboard(c.Context())
	if err != nil {
		return err
	}
	return response.OK(c, "Business dashboard loaded.", item)
}

func (h *Handler) MarketplaceOverview(c *fiber.Ctx) error {
	item, err := h.service.MarketplaceOverview(c.Context())
	if err != nil {
		return err
	}
	return response.OK(c, "Marketplace overview loaded.", item)
}

func (h *Handler) Users(c *fiber.Ctx) error {
	items, err := h.service.Users(c.Context(), listParams(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Users loaded.", fiber.Map{"items": items})
}

func (h *Handler) Companies(c *fiber.Ctx) error {
	items, err := h.service.Companies(c.Context(), listParams(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Companies loaded.", items)
}

func (h *Handler) Jobs(c *fiber.Ctx) error {
	items, err := h.service.Jobs(c.Context(), listParams(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Jobs loaded.", items)
}

func (h *Handler) SuspendUser(c *fiber.Ctx) error {
	return h.setUserActive(c, false)
}

func (h *Handler) ActivateUser(c *fiber.Ctx) error {
	return h.setUserActive(c, true)
}

func (h *Handler) DeleteUser(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	if err := h.service.DeleteUser(c.Context(), currentUserID(c), id, c.IP(), c.Get("User-Agent")); err != nil {
		return err
	}
	return response.OK(c, "User deleted.", nil)
}

func (h *Handler) AssignRole(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	var req AssignRoleRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	if err := h.service.AssignRole(c.Context(), currentUserID(c), id, req.Role, c.IP(), c.Get("User-Agent")); err != nil {
		return err
	}
	return response.OK(c, "Role assigned.", nil)
}

func (h *Handler) ResetPassword(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	item, err := h.service.ResetPassword(c.Context(), currentUserID(c), id, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return err
	}
	return response.OK(c, "Password reset token generated.", item)
}

func (h *Handler) ModerateCompany(c *fiber.Ctx) error {
	return h.moderate(c, h.service.ModerateCompany, "Company moderated.")
}

func (h *Handler) ModerateJob(c *fiber.Ctx) error {
	return h.moderate(c, h.service.ModerateJob, "Job moderated.")
}

func (h *Handler) SetJobFlags(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	var req JobFlagRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	if err := h.service.SetJobFlags(c.Context(), currentUserID(c), id, req, c.IP(), c.Get("User-Agent")); err != nil {
		return err
	}
	return response.OK(c, "Job flags updated.", nil)
}

func (h *Handler) QuickPostJob(c *fiber.Ctx) error {
	var req QuickPostJobRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.QuickPostJob(c.Context(), currentUserID(c), req, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return err
	}
	return response.Created(c, "Job published.", item)
}

func (h *Handler) Applications(c *fiber.Ctx) error {
	items, err := h.service.Applications(c.Context(), listParams(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Applications loaded.", fiber.Map{"items": items})
}

func (h *Handler) Plans(c *fiber.Ctx) error {
	items, err := h.service.Plans(c.Context())
	if err != nil {
		return err
	}
	return response.OK(c, "Plans loaded.", fiber.Map{"items": items})
}

func (h *Handler) UpsertPlan(c *fiber.Ctx) error {
	var req PlanRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpsertPlan(c.Context(), currentUserID(c), req, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return err
	}
	return response.OK(c, "Plan saved.", item)
}

func (h *Handler) CMS(c *fiber.Ctx) error {
	items, err := h.service.CMS(c.Context(), c.Query("type"), c.QueryInt("limit", 20), c.QueryInt("page", 1))
	if err != nil {
		return err
	}
	return response.OK(c, "CMS entries loaded.", fiber.Map{"items": items})
}

func (h *Handler) PublishedCMS(c *fiber.Ctx) error {
	items, err := h.service.PublishedCMS(c.Context(), c.Query("type"), c.QueryInt("limit", 20), c.QueryInt("page", 1))
	if err != nil {
		return err
	}
	return response.OK(c, "Published content loaded.", fiber.Map{"items": items})
}

func (h *Handler) PublishedCMSBySlug(c *fiber.Ctx) error {
	item, err := h.service.PublishedCMSBySlug(c.Context(), c.Params("type"), c.Params("slug"))
	if err != nil {
		return err
	}
	return response.OK(c, "Published content loaded.", item)
}

func (h *Handler) UpsertCMS(c *fiber.Ctx) error {
	var req CMSRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpsertCMS(c.Context(), currentUserID(c), req, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return err
	}
	return response.OK(c, "CMS entry saved.", item)
}

func (h *Handler) Settings(c *fiber.Ctx) error {
	items, err := h.service.Settings(c.Context())
	if err != nil {
		return err
	}
	return response.OK(c, "Platform settings loaded.", fiber.Map{"items": items})
}

func (h *Handler) UpsertSetting(c *fiber.Ctx) error {
	var req SettingRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	if err := h.service.UpsertSetting(c.Context(), currentUserID(c), req, c.IP(), c.Get("User-Agent")); err != nil {
		return err
	}
	return response.OK(c, "Platform setting saved.", nil)
}

func (h *Handler) Audit(c *fiber.Ctx) error {
	items, err := h.service.Audit(c.Context(), c.QueryInt("limit", 20), c.QueryInt("page", 1))
	if err != nil {
		return err
	}
	return response.OK(c, "Audit logs loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateReport(c *fiber.Ctx) error {
	var req ReportRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateReport(c.Context(), currentUserID(c), req, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return err
	}
	return response.Created(c, "Report generated.", item)
}

func (h *Handler) Reports(c *fiber.Ctx) error {
	items, err := h.service.Reports(c.Context(), c.QueryInt("limit", 20), c.QueryInt("page", 1))
	if err != nil {
		return err
	}
	return response.OK(c, "Reports loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateTicket(c *fiber.Ctx) error {
	var req TicketRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	actor := currentUserID(c)
	item, err := h.service.CreateTicket(c.Context(), &actor, req)
	if err != nil {
		return err
	}
	return response.Created(c, "Support ticket created.", item)
}

func (h *Handler) Tickets(c *fiber.Ctx) error {
	items, err := h.service.Tickets(c.Context(), listParams(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Support tickets loaded.", fiber.Map{"items": items})
}

func (h *Handler) SEOTemplates(c *fiber.Ctx) error {
	items, err := h.service.SEOTemplates(c.Context())
	if err != nil {
		return err
	}
	return response.OK(c, "SEO templates loaded.", fiber.Map{"items": items})
}

func (h *Handler) UpsertSEO(c *fiber.Ctx) error {
	var req SEORequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	if err := h.service.UpsertSEO(c.Context(), currentUserID(c), req, c.IP(), c.Get("User-Agent")); err != nil {
		return err
	}
	return response.OK(c, "SEO template saved.", nil)
}

func (h *Handler) Health(c *fiber.Ctx) error {
	return response.OK(c, "System health loaded.", h.service.Health(c.Context()))
}

func (h *Handler) setUserActive(c *fiber.Ctx, active bool) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	if err := h.service.SetUserActive(c.Context(), currentUserID(c), id, active, c.IP(), c.Get("User-Agent")); err != nil {
		return err
	}
	return response.OK(c, "User status updated.", nil)
}

func (h *Handler) moderate(c *fiber.Ctx, fn func(context.Context, uuid.UUID, uuid.UUID, ModerationRequest, string, string) error, message string) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	var req ModerationRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	if err := fn(c.Context(), currentUserID(c), id, req, c.IP(), c.Get("User-Agent")); err != nil {
		return err
	}
	return response.OK(c, message, nil)
}

func (h *Handler) bind(c *fiber.Ctx, req any) error {
	if err := c.BodyParser(req); err != nil {
		return apperror.Validation(map[string]string{"body": "must be valid JSON"})
	}
	if details := h.validator.Struct(req); details != nil {
		return apperror.Validation(details)
	}
	return nil
}

func listParams(c *fiber.Ctx) ListParams {
	return ListParams{Query: c.Query("q"), Status: c.Query("status"), Role: c.Query("role"), Company: c.Query("company"), Location: c.Query("location"), JobType: c.Query("job_type"), Limit: c.QueryInt("limit", 20), Page: c.QueryInt("page", 1)}
}

func parseID(c *fiber.Ctx) (uuid.UUID, error) {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return uuid.Nil, apperror.Validation(map[string]string{"id": "must be a valid UUID"})
	}
	return id, nil
}

func currentUserID(c *fiber.Ctx) uuid.UUID {
	id, _ := c.Locals("user_id").(uuid.UUID)
	return id
}
