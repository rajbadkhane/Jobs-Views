package salary

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

func NewHandler(service *Service, validate *validator.Validator) *Handler {
	return &Handler{service: service, validator: validate}
}

func (h *Handler) RegisterPublicRoutes(router fiber.Router) {
	group := router.Group("/salary")
	group.Get("/options", h.Options)
	group.Post("/estimate", h.Estimate)
	group.Get("/benchmarks/:role/:city", h.Benchmark)
}

func (h *Handler) RegisterAdminRoutes(router fiber.Router) {
	group := router.Group("/admin/salary")
	group.Get("/sources", h.Sources)
	group.Post("/imports/preview", h.PreviewImport)
	group.Post("/imports/:id/commit", h.CommitImport)
}

func (h *Handler) Options(c *fiber.Ctx) error {
	item, err := h.service.Options(c.Context())
	if err != nil {
		return err
	}
	return response.OK(c, "Salary options loaded.", item)
}
func (h *Handler) Estimate(c *fiber.Ctx) error {
	var req EstimateRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}
	if details := h.validator.Struct(req); details != nil {
		return apperror.Validation(details)
	}
	item, err := h.service.Estimate(c.Context(), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Salary estimate loaded.", item)
}
func (h *Handler) Benchmark(c *fiber.Ctx) error {
	item, err := h.service.Benchmark(c.Context(), c.Params("role"), c.Params("city"))
	if err != nil {
		return err
	}
	return response.OK(c, "Salary benchmark loaded.", item)
}

func (h *Handler) Sources(c *fiber.Ctx) error {
	items, err := h.service.Sources(c.Context())
	if err != nil {
		return err
	}
	return response.OK(c, "Salary sources loaded.", fiber.Map{"items": items})
}
func (h *Handler) PreviewImport(c *fiber.Ctx) error {
	var req ImportPreviewRequest
	if err := c.BodyParser(&req); err != nil {
		return apperror.Validation(map[string]string{"body": "must be valid JSON"})
	}
	if details := h.validator.Struct(req); details != nil {
		return apperror.Validation(details)
	}
	item, err := h.service.PreviewImport(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Salary import preview created.", item)
}
func (h *Handler) CommitImport(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apperror.Validation(map[string]string{"id": "must be a valid UUID"})
	}
	item, err := h.service.CommitImport(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Salary import committed.", item)
}
func currentUserID(c *fiber.Ctx) uuid.UUID { id, _ := c.Locals("user_id").(uuid.UUID); return id }
