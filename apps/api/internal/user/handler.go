package user

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
	users := router.Group("/users")
	users.Get("/me", h.Me)
	users.Patch("/me", h.UpdateMe)
	users.Get("/me/sessions", h.Sessions)
	users.Get("/me/devices", h.Devices)
	users.Get("/me/login-history", h.LoginHistory)
	users.Get("/me/audit-trail", h.AuditTrail)
}

func (h *Handler) RegisterAdminRoutes(router fiber.Router, view, update, delete fiber.Handler) {
	users := router.Group("/users")
	users.Get("/", view, h.List)
	users.Get("/:id", view, h.Get)
	users.Patch("/:id", update, h.Update)
	users.Delete("/:id", delete, h.Delete)
}

func (h *Handler) Me(c *fiber.Ctx) error {
	account, err := h.service.Me(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "User loaded.", account)
}

func (h *Handler) List(c *fiber.Ctx) error {
	items, err := h.service.List(c.Context(), c.QueryInt("limit", 20), c.QueryInt("page", 1))
	if err != nil {
		return err
	}
	return response.OK(c, "Users loaded.", fiber.Map{"items": items})
}

func (h *Handler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apperror.Validation(map[string]string{"id": "must be a valid UUID"})
	}
	account, err := h.service.Me(c.Context(), id)
	if err != nil {
		return err
	}
	return response.OK(c, "User loaded.", account)
}

func (h *Handler) UpdateMe(c *fiber.Ctx) error {
	return h.update(c, currentUserID(c))
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apperror.Validation(map[string]string{"id": "must be a valid UUID"})
	}
	return h.update(c, id)
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apperror.Validation(map[string]string{"id": "must be a valid UUID"})
	}
	if err := h.service.Delete(c.Context(), id, currentUserID(c), c.IP(), c.Get("User-Agent")); err != nil {
		return err
	}
	return response.OK(c, "User deleted.", nil)
}

func (h *Handler) Sessions(c *fiber.Ctx) error {
	items, err := h.service.Sessions(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Sessions loaded.", fiber.Map{"items": items})
}

func (h *Handler) Devices(c *fiber.Ctx) error {
	items, err := h.service.Devices(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Devices loaded.", fiber.Map{"items": items})
}

func (h *Handler) LoginHistory(c *fiber.Ctx) error {
	items, err := h.service.LoginHistory(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Login history loaded.", fiber.Map{"items": items})
}

func (h *Handler) AuditTrail(c *fiber.Ctx) error {
	items, err := h.service.AuditTrail(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Audit trail loaded.", fiber.Map{"items": items})
}

func (h *Handler) update(c *fiber.Ctx, id uuid.UUID) error {
	var req UpdateAccountRequest
	if err := c.BodyParser(&req); err != nil {
		return apperror.Validation(map[string]string{"body": "must be valid JSON"})
	}
	if details := h.validator.Struct(req); details != nil {
		return apperror.Validation(details)
	}
	account, err := h.service.Update(c.Context(), id, req, currentUserID(c), c.IP(), c.Get("User-Agent"))
	if err != nil {
		return err
	}
	return response.OK(c, "User updated.", account)
}

func currentUserID(c *fiber.Ctx) uuid.UUID {
	id, _ := c.Locals("user_id").(uuid.UUID)
	return id
}
