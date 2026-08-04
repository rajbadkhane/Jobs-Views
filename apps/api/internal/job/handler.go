package job

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

func (h *Handler) RegisterPublicRoutes(router fiber.Router) {
	jobs := router.Group("/jobs")
	jobs.Get("/", h.Search)
	jobs.Get("/taxonomies", h.Taxonomies)
	jobs.Get("/:slug", h.PublicBySlug)
	jobs.Get("/:slug/seo", h.SEO)
	jobs.Get("/:slug/structured-data", h.StructuredData)
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	jobs := router.Group("/jobs")
	jobs.Post("/", h.Create)
	jobs.Get("/company/:company_id", h.CompanyJobs)
	jobs.Patch("/:id", h.Update)
	jobs.Delete("/:id", h.Delete)
	jobs.Post("/:id/duplicate", h.Duplicate)
	jobs.Patch("/:id/status", h.SetStatus)
	jobs.Post("/bulk", h.Bulk)
	jobs.Post("/:id/save", h.Save)
	jobs.Post("/:id/share", h.Share)
	jobs.Get("/:id/analytics", h.Analytics)
}

func (h *Handler) RegisterAdminRoutes(router fiber.Router, manage fiber.Handler) {
	jobs := router.Group("/jobs")
	jobs.Post("/taxonomies", manage, h.CreateTaxonomy)
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var req UpsertRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.Create(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Job created.", item)
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	var req UpsertRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.Update(c.Context(), id, currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Job updated.", item)
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	if err := h.service.Delete(c.Context(), id, currentUserID(c)); err != nil {
		return err
	}
	return response.OK(c, "Job deleted.", nil)
}

func (h *Handler) Duplicate(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	item, err := h.service.Duplicate(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.Created(c, "Job duplicated.", item)
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
	item, err := h.service.SetStatus(c.Context(), id, currentUserID(c), req.Status)
	if err != nil {
		return err
	}
	return response.OK(c, "Job status updated.", item)
}

func (h *Handler) Bulk(c *fiber.Ctx) error {
	var req BulkActionRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	if err := h.service.Bulk(c.Context(), currentUserID(c), req); err != nil {
		return err
	}
	return response.OK(c, "Bulk action completed.", nil)
}

func (h *Handler) CompanyJobs(c *fiber.Ctx) error {
	companyID, err := parseID(c, "company_id")
	if err != nil {
		return err
	}
	items, err := h.service.CompanyJobs(c.Context(), companyID, currentUserID(c), c.QueryInt("limit", 20), c.QueryInt("page", 1))
	if err != nil {
		return err
	}
	return response.OK(c, "Jobs loaded.", fiber.Map{"items": items})
}

func (h *Handler) PublicBySlug(c *fiber.Ctx) error {
	var actor *uuid.UUID
	if id, ok := c.Locals("user_id").(uuid.UUID); ok && id != uuid.Nil {
		actor = &id
	}
	item, err := h.service.PublicBySlug(c.Context(), c.Params("slug"), c.IP(), actor)
	if err != nil {
		return err
	}
	return response.OK(c, "Job loaded.", item)
}

func (h *Handler) Search(c *fiber.Ctx) error {
	items, err := h.service.Search(c.Context(), SearchParams{
		Keyword:    c.Query("q"),
		Category:   c.Query("category"),
		Company:    c.Query("company"),
		Industry:   c.Query("industry"),
		City:       c.Query("city"),
		State:      c.Query("state"),
		Country:    c.Query("country"),
		SalaryMin:  c.QueryFloat("salary_min"),
		Experience: c.QueryFloat("experience"),
		JobType:    c.Query("job_type"),
		WorkMode:   c.Query("work_mode"),
		PostedDays: c.QueryInt("posted_days"),
		Sort:       c.Query("sort"),
		Limit:      c.QueryInt("limit", 20),
		Page:       c.QueryInt("page", 1),
	})
	if err != nil {
		return err
	}
	return response.OK(c, "Jobs loaded.", fiber.Map{"items": items})
}

func (h *Handler) Save(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	if err := h.service.Save(c.Context(), currentUserID(c), id); err != nil {
		return err
	}
	return response.OK(c, "Job saved.", nil)
}

func (h *Handler) Share(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	actor := currentUserID(c)
	if err := h.service.Share(c.Context(), id, &actor); err != nil {
		return err
	}
	return response.OK(c, "Job share tracked.", nil)
}

func (h *Handler) Analytics(c *fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return err
	}
	stats, err := h.service.Analytics(c.Context(), id, currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Job analytics loaded.", stats)
}

func (h *Handler) SEO(c *fiber.Ctx) error {
	seo, err := h.service.SEO(c.Context(), c.Params("slug"))
	if err != nil {
		return err
	}
	return response.OK(c, "SEO metadata loaded.", seo)
}

func (h *Handler) StructuredData(c *fiber.Ctx) error {
	seo, err := h.service.SEO(c.Context(), c.Params("slug"))
	if err != nil {
		return err
	}
	return response.OK(c, "Structured data loaded.", seo.JSONLD)
}

func (h *Handler) Taxonomies(c *fiber.Ctx) error {
	items, err := h.service.Taxonomies(c.Context(), c.Query("type"))
	if err != nil {
		return err
	}
	return response.OK(c, "Job taxonomies loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateTaxonomy(c *fiber.Ctx) error {
	var req TaxonomyRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateTaxonomy(c.Context(), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Job taxonomy created.", item)
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
