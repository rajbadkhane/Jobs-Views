package application

import (
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
	apps := router.Group("/applications")
	apps.Post("/", h.Apply)
	apps.Get("/me", h.CandidateDashboard)
	apps.Get("/inbox/:company_id", h.Inbox)
	apps.Patch("/:id/status", h.UpdateStatus)
	apps.Post("/bulk/status", h.BulkStatus)
	apps.Get("/:id/timeline", h.Timeline)
	apps.Get("/:id/notes", h.Notes)
	apps.Post("/:id/notes", h.AddNote)
	apps.Get("/:id/interviews", h.Interviews)
	apps.Post("/:id/interviews", h.CreateInterview)
	apps.Get("/:id/offers", h.Offers)
	apps.Post("/:id/offers", h.CreateOffer)
	apps.Get("/analytics/:company_id", h.Analytics)
	apps.Get("/notifications", h.Notifications)
	apps.Get("/notifications/summary", h.NotificationSummary)
	apps.Patch("/notifications/read-all", h.MarkAllNotificationsRead)
	apps.Patch("/notifications/:id/read", h.MarkNotificationRead)
	apps.Delete("/notifications/:id", h.DeleteNotification)

	saved := router.Group("/saved-jobs")
	saved.Get("/", h.SavedJobs)
	saved.Post("/", h.SaveJob)
	saved.Delete("/:job_id", h.RemoveSavedJob)
}

func (h *Handler) Apply(c *fiber.Ctx) error {
	var req ApplyRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.Apply(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Application submitted.", item)
}

func (h *Handler) CandidateDashboard(c *fiber.Ctx) error {
	items, err := h.service.CandidateDashboard(c.Context(), currentUserID(c), CandidateParams{
		Status: c.Query("status"),
		Limit:  c.QueryInt("limit", 20),
		Page:   c.QueryInt("page", 1),
	})
	if err != nil {
		return err
	}
	return response.OK(c, "Applications loaded.", fiber.Map{"items": items})
}

func (h *Handler) Inbox(c *fiber.Ctx) error {
	companyID, err := parseID(c, "company_id")
	if err != nil {
		return err
	}
	var jobID *uuid.UUID
	if raw := c.Query("job_id"); raw != "" {
		parsed, err := uuid.Parse(raw)
		if err != nil {
			return apperror.Validation(map[string]string{"job_id": "must be a valid UUID"})
		}
		jobID = &parsed
	}
	items, err := h.service.Inbox(c.Context(), currentUserID(c), InboxParams{
		CompanyID: companyID,
		JobID:     jobID,
		Status:    c.Query("status"),
		Keyword:   c.Query("q"),
		Sort:      c.Query("sort"),
		Limit:     c.QueryInt("limit", 20),
		Page:      c.QueryInt("page", 1),
	})
	if err != nil {
		return err
	}
	return response.OK(c, "Employer inbox loaded.", fiber.Map{"items": items})
}

func (h *Handler) UpdateStatus(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req StatusRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpdateStatus(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Application status updated.", item)
}

func (h *Handler) BulkStatus(c *fiber.Ctx) error {
	var req BulkStatusRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	if err := h.service.BulkStatus(c.Context(), currentUserID(c), req); err != nil {
		return err
	}
	return response.OK(c, "Bulk application update completed.", nil)
}

func (h *Handler) SaveJob(c *fiber.Ctx) error {
	var req SaveJobRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	if err := h.service.SaveJob(c.Context(), currentUserID(c), req); err != nil {
		return err
	}
	return response.OK(c, "Job saved.", nil)
}

func (h *Handler) RemoveSavedJob(c *fiber.Ctx) error {
	jobID, err := parseID(c, "job_id")
	if err != nil {
		return err
	}
	if err := h.service.RemoveSavedJob(c.Context(), currentUserID(c), jobID); err != nil {
		return err
	}
	return response.OK(c, "Saved job removed.", nil)
}

func (h *Handler) SavedJobs(c *fiber.Ctx) error {
	items, err := h.service.SavedJobs(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Saved jobs loaded.", fiber.Map{"items": items})
}

func (h *Handler) AddNote(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req NoteRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.AddNote(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Application note added.", item)
}

func (h *Handler) Notes(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	items, err := h.service.Notes(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Application notes loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateInterview(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req InterviewRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateInterview(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Interview scheduled.", item)
}

func (h *Handler) Interviews(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	items, err := h.service.Interviews(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Interviews loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateOffer(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req OfferRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateOffer(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Offer created.", item)
}

func (h *Handler) Offers(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	items, err := h.service.Offers(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Offers loaded.", fiber.Map{"items": items})
}

func (h *Handler) Timeline(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	items, err := h.service.Timeline(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Application timeline loaded.", fiber.Map{"items": items})
}

func (h *Handler) Notifications(c *fiber.Ctx) error {
	items, err := h.service.Notifications(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Notifications loaded.", fiber.Map{"items": items})
}

func (h *Handler) NotificationSummary(c *fiber.Ctx) error {
	item, err := h.service.NotificationSummary(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Notification summary loaded.", item)
}

func (h *Handler) MarkNotificationRead(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	if err := h.service.MarkNotificationRead(c.Context(), currentUserID(c), id); err != nil {
		return err
	}
	return response.OK(c, "Notification marked read.", nil)
}

func (h *Handler) MarkAllNotificationsRead(c *fiber.Ctx) error {
	if err := h.service.MarkAllNotificationsRead(c.Context(), currentUserID(c)); err != nil {
		return err
	}
	return response.OK(c, "Notifications marked read.", nil)
}

func (h *Handler) DeleteNotification(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	if err := h.service.DeleteNotification(c.Context(), currentUserID(c), id); err != nil {
		return err
	}
	return response.OK(c, "Notification deleted.", nil)
}

func (h *Handler) Analytics(c *fiber.Ctx) error {
	companyID, err := parseID(c, "company_id")
	if err != nil {
		return err
	}
	item, err := h.service.Analytics(c.Context(), companyID, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Recruitment analytics loaded.", item)
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

func parseID(c *fiber.Ctx, param string) (uuid.UUID, error) {
	id, err := uuid.Parse(c.Params(param))
	if err != nil {
		return uuid.Nil, apperror.Validation(map[string]string{param: "must be a valid UUID"})
	}
	return id, nil
}

func currentUserID(c *fiber.Ctx) uuid.UUID {
	id, _ := c.Locals("user_id").(uuid.UUID)
	return id
}
