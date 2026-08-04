package company

import (
	"strconv"

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

func (h *Handler) RegisterPublicRoutes(router fiber.Router) {
	companies := router.Group("/companies")
	companies.Get("/", h.Search)
	companies.Get("/:slug", h.PublicBySlug)
	companies.Get("/:id/branches", h.Branches)
	companies.Get("/:id/departments", h.Departments)
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	companies := router.Group("/companies")
	companies.Post("/", h.Register)
	companies.Get("/me", h.MyCompanies)
	companies.Patch("/:id", h.Update)
	companies.Delete("/:id", h.Delete)
	companies.Get("/:id/team", h.Team)
	companies.Post("/:id/team/invite", h.Invite)
	companies.Post("/:id/branches", h.CreateBranch)
	companies.Delete("/:id/branches/:child_id", h.DeleteBranch)
	companies.Post("/:id/departments", h.CreateDepartment)
	companies.Delete("/:id/departments/:child_id", h.DeleteDepartment)
	companies.Get("/:id/dashboard", h.Dashboard)
	companies.Get("/:id/settings", h.Settings)
	companies.Put("/:id/settings", h.UpsertSettings)
	companies.Patch("/:id/settings", h.UpsertSettings)
	companies.Post("/:id/media/:type", h.UploadMedia)
}

func (h *Handler) RegisterAdminRoutes(router fiber.Router, verify fiber.Handler) {
	companies := router.Group("/companies")
	companies.Patch("/:id/status", verify, h.SetStatus)
	companies.Post("/:id/verification", verify, h.Verify)
}

func (h *Handler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.Register(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Company registered.", item)
}

func (h *Handler) MyCompanies(c *fiber.Ctx) error {
	items, err := h.service.MyCompanies(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Companies loaded.", fiber.Map{"items": items})
}

func (h *Handler) PublicBySlug(c *fiber.Ctx) error {
	item, err := h.service.PublicBySlug(c.Context(), c.Params("slug"))
	if err != nil {
		return err
	}
	return response.OK(c, "Company loaded.", item)
}

func (h *Handler) Search(c *fiber.Ctx) error {
	var verified *bool
	if raw := c.Query("verified"); raw != "" {
		parsed, err := strconv.ParseBool(raw)
		if err != nil {
			return apperror.Validation(map[string]string{"verified": "must be true or false"})
		}
		verified = &parsed
	}
	items, err := h.service.Search(c.Context(), c.Query("q"), c.Query("industry"), c.Query("location"), "approved", c.Query("sort"), verified, c.QueryInt("limit", 20), c.QueryInt("page", 1))
	if err != nil {
		return err
	}
	return response.OK(c, "Companies loaded.", fiber.Map{"items": items})
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req UpdateRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.Update(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Company updated.", item)
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	if err := h.service.Delete(c.Context(), id, currentUserID(c)); err != nil {
		return err
	}
	return response.OK(c, "Company deleted.", nil)
}

func (h *Handler) SetStatus(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req StatusRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.SetStatus(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Company status updated.", item)
}

func (h *Handler) Verify(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req VerificationRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.Verify(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Company verification updated.", item)
}

func (h *Handler) Team(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	items, err := h.service.Team(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Team loaded.", fiber.Map{"items": items})
}

func (h *Handler) Invite(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req InviteRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.Invite(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Team invite created.", item)
}

func (h *Handler) Branches(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	items, err := h.service.Branches(c.Context(), id)
	if err != nil {
		return err
	}
	return response.OK(c, "Branches loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateBranch(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req BranchRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateBranch(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Branch saved.", item)
}

func (h *Handler) DeleteBranch(c *fiber.Ctx) error {
	companyID, childID, err := parsePair(c)
	if err != nil {
		return err
	}
	if err := h.service.DeleteBranch(c.Context(), companyID, childID, currentUserID(c)); err != nil {
		return err
	}
	return response.OK(c, "Branch deleted.", nil)
}

func (h *Handler) Departments(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	items, err := h.service.Departments(c.Context(), id)
	if err != nil {
		return err
	}
	return response.OK(c, "Departments loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateDepartment(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req DepartmentRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateDepartment(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Department saved.", item)
}

func (h *Handler) DeleteDepartment(c *fiber.Ctx) error {
	companyID, childID, err := parsePair(c)
	if err != nil {
		return err
	}
	if err := h.service.DeleteDepartment(c.Context(), companyID, childID, currentUserID(c)); err != nil {
		return err
	}
	return response.OK(c, "Department deleted.", nil)
}

func (h *Handler) Dashboard(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	stats, err := h.service.Dashboard(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Dashboard loaded.", stats)
}

func (h *Handler) Settings(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	settings, err := h.service.Settings(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Company settings loaded.", settings)
}

func (h *Handler) UpsertSettings(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req Settings
	if err := h.bind(c, &req); err != nil {
		return err
	}
	settings, err := h.service.UpsertSettings(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Company settings saved.", settings)
}

func (h *Handler) UploadMedia(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	mediaType := c.Params("type")
	if mediaType != "logo" && mediaType != "banner" && mediaType != "gallery" && mediaType != "document" {
		return apperror.Validation(map[string]string{"type": "must be logo, banner, gallery, or document"})
	}
	file, err := c.FormFile("file")
	if err != nil {
		return apperror.Validation(map[string]string{"file": "is required"})
	}
	item, err := h.service.UploadMedia(c.Context(), id, currentUserID(c), mediaType, file)
	if err != nil {
		return err
	}
	return response.Created(c, "Company media uploaded.", item)
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

func parsePair(c *fiber.Ctx) (uuid.UUID, uuid.UUID, error) {
	companyID, err := parseID(c, "id")
	if err != nil {
		return uuid.Nil, uuid.Nil, err
	}
	childID, err := parseID(c, "child_id")
	if err != nil {
		return uuid.Nil, uuid.Nil, err
	}
	return companyID, childID, nil
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
