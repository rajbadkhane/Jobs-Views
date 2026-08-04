package profile

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
	profiles := router.Group("/profiles")
	profiles.Get("/me", h.Me)
	profiles.Get("/completion", h.Completion)
	profiles.Put("/candidate", h.UpsertCandidate)
	profiles.Patch("/candidate", h.UpsertCandidate)
	profiles.Put("/employer", h.UpsertEmployer)
	profiles.Patch("/employer", h.UpsertEmployer)
	profiles.Put("/admin", h.UpsertAdmin)
	profiles.Patch("/admin", h.UpsertAdmin)
	profiles.Delete("/me", h.DeleteProfile)
	profiles.Post("/avatar", h.UploadAvatar)
	profiles.Post("/resume", h.UploadResume)
	profiles.Get("/resume-documents", h.ResumeDocuments)
	profiles.Post("/resume-documents", h.CreateResumeDocument)
	profiles.Get("/resume-documents/:id", h.ResumeDocument)
	profiles.Patch("/resume-documents/:id", h.UpdateResumeDocument)
	profiles.Delete("/resume-documents/:id", h.DeleteResumeDocument)
	profiles.Post("/resume-documents/:id/duplicate", h.DuplicateResumeDocument)
	profiles.Get("/resume-documents/:id/versions", h.ResumeVersions)
	profiles.Post("/resume-documents/:id/versions/:version/restore", h.RestoreResumeVersion)

	profiles.Get("/skills", h.Skills)
	profiles.Post("/skills", h.UpsertSkill)
	profiles.Put("/skills", h.UpsertSkill)
	profiles.Delete("/skills/:id", h.DeleteSkill)

	profiles.Get("/education", h.Education)
	profiles.Post("/education", h.CreateEducation)
	profiles.Delete("/education/:id", h.DeleteEducation)

	profiles.Get("/experience", h.Experiences)
	profiles.Post("/experience", h.CreateExperience)
	profiles.Delete("/experience/:id", h.DeleteExperience)

	profiles.Get("/social-links", h.SocialLinks)
	profiles.Put("/social-links", h.UpsertSocialLinks)
	profiles.Patch("/social-links", h.UpsertSocialLinks)

	profiles.Get("/notification-preferences", h.Preferences)
	profiles.Put("/notification-preferences", h.UpsertPreferences)
	profiles.Patch("/notification-preferences", h.UpsertPreferences)

	profiles.Get("/settings", h.Settings)
	profiles.Put("/settings", h.UpsertSettings)
	profiles.Patch("/settings", h.UpsertSettings)

}

func (h *Handler) RegisterPublicRoutes(router fiber.Router) {
	profiles := router.Group("/profiles")
	profiles.Get("/search", h.Search)
	profiles.Get("/public/:id", h.PublicCandidate)
}

func (h *Handler) Me(c *fiber.Ctx) error {
	item, err := h.service.Me(c.Context(), currentUserID(c), currentRole(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Profile loaded.", item)
}

func (h *Handler) Completion(c *fiber.Ctx) error {
	item, err := h.service.Completion(c.Context(), currentUserID(c), currentRole(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Profile completion calculated.", item)
}

func (h *Handler) UpsertCandidate(c *fiber.Ctx) error {
	var req CandidateProfileRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpsertCandidate(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Candidate profile saved.", item)
}

func (h *Handler) UpsertEmployer(c *fiber.Ctx) error {
	var req EmployerProfileRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpsertEmployer(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Employer profile saved.", item)
}

func (h *Handler) UpsertAdmin(c *fiber.Ctx) error {
	var req AdminProfileRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpsertAdmin(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Admin profile saved.", item)
}

func (h *Handler) DeleteProfile(c *fiber.Ctx) error {
	if err := h.service.DeleteProfile(c.Context(), currentUserID(c), currentRole(c)); err != nil {
		return err
	}
	return response.OK(c, "Profile deleted.", nil)
}

func (h *Handler) UploadAvatar(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return apperror.Validation(map[string]string{"file": "is required"})
	}
	item, err := h.service.UploadAvatar(c.Context(), currentUserID(c), currentRole(c), file)
	if err != nil {
		return err
	}
	return response.Created(c, "Avatar uploaded.", item)
}

func (h *Handler) UploadResume(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return apperror.Validation(map[string]string{"file": "is required"})
	}
	item, err := h.service.UploadResume(c.Context(), currentUserID(c), file)
	if err != nil {
		return err
	}
	return response.Created(c, "Resume uploaded.", item)
}

func (h *Handler) ResumeDocuments(c *fiber.Ctx) error {
	items, err := h.service.ResumeDocuments(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Resume documents loaded.", fiber.Map{"items": items})
}
func (h *Handler) ResumeDocument(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	item, err := h.service.ResumeDocument(c.Context(), currentUserID(c), id)
	if err != nil {
		return err
	}
	return response.OK(c, "Resume document loaded.", item)
}
func (h *Handler) CreateResumeDocument(c *fiber.Ctx) error {
	var req ResumeDocumentRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateResumeDocument(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Resume document created.", item)
}
func (h *Handler) UpdateResumeDocument(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	var req ResumeDocumentRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpdateResumeDocument(c.Context(), currentUserID(c), id, req)
	if err != nil {
		return err
	}
	return response.OK(c, "Resume document saved.", item)
}
func (h *Handler) DeleteResumeDocument(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	if err := h.service.DeleteResumeDocument(c.Context(), currentUserID(c), id); err != nil {
		return err
	}
	return response.OK(c, "Resume document deleted.", nil)
}
func (h *Handler) DuplicateResumeDocument(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	item, err := h.service.DuplicateResumeDocument(c.Context(), currentUserID(c), id)
	if err != nil {
		return err
	}
	return response.Created(c, "Resume document duplicated.", item)
}
func (h *Handler) ResumeVersions(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	items, err := h.service.ResumeVersions(c.Context(), currentUserID(c), id)
	if err != nil {
		return err
	}
	return response.OK(c, "Resume versions loaded.", fiber.Map{"items": items})
}
func (h *Handler) RestoreResumeVersion(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	version, err := c.ParamsInt("version")
	if err != nil || version < 1 {
		return apperror.Validation(map[string]string{"version": "must be a positive integer"})
	}
	item, err := h.service.RestoreResumeVersion(c.Context(), currentUserID(c), id, version)
	if err != nil {
		return err
	}
	return response.OK(c, "Resume version restored.", item)
}

func (h *Handler) Search(c *fiber.Ctx) error {
	items, err := h.service.Search(c.Context(), c.Query("q"), c.Query("location"), c.Query("skill"), c.QueryInt("limit", 20))
	if err != nil {
		return err
	}
	return response.OK(c, "Profiles loaded.", fiber.Map{"items": items})
}

func (h *Handler) PublicCandidate(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	item, err := h.service.PublicCandidate(c.Context(), id)
	if err != nil {
		return err
	}
	return response.OK(c, "Public profile loaded.", item)
}

func (h *Handler) Skills(c *fiber.Ctx) error {
	items, err := h.service.Skills(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Skills loaded.", fiber.Map{"items": items})
}

func (h *Handler) UpsertSkill(c *fiber.Ctx) error {
	var req SkillRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpsertSkill(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Skill saved.", item)
}

func (h *Handler) DeleteSkill(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	if err := h.service.DeleteSkill(c.Context(), currentUserID(c), id); err != nil {
		return err
	}
	return response.OK(c, "Skill deleted.", nil)
}

func (h *Handler) Education(c *fiber.Ctx) error {
	items, err := h.service.Education(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Education loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateEducation(c *fiber.Ctx) error {
	var req EducationRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateEducation(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Education saved.", item)
}

func (h *Handler) DeleteEducation(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	if err := h.service.DeleteEducation(c.Context(), currentUserID(c), id); err != nil {
		return err
	}
	return response.OK(c, "Education deleted.", nil)
}

func (h *Handler) Experiences(c *fiber.Ctx) error {
	items, err := h.service.Experiences(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Experience loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateExperience(c *fiber.Ctx) error {
	var req ExperienceRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateExperience(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Experience saved.", item)
}

func (h *Handler) DeleteExperience(c *fiber.Ctx) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	if err := h.service.DeleteExperience(c.Context(), currentUserID(c), id); err != nil {
		return err
	}
	return response.OK(c, "Experience deleted.", nil)
}

func (h *Handler) SocialLinks(c *fiber.Ctx) error {
	item, err := h.service.SocialLinks(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Social links loaded.", item)
}

func (h *Handler) UpsertSocialLinks(c *fiber.Ctx) error {
	var req SocialLinks
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpsertSocialLinks(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Social links saved.", item)
}

func (h *Handler) Preferences(c *fiber.Ctx) error {
	item, err := h.service.Preferences(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Notification preferences loaded.", item)
}

func (h *Handler) UpsertPreferences(c *fiber.Ctx) error {
	var req NotificationPreferences
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpsertPreferences(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Notification preferences saved.", item)
}

func (h *Handler) Settings(c *fiber.Ctx) error {
	item, err := h.service.Settings(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Settings loaded.", item)
}

func (h *Handler) UpsertSettings(c *fiber.Ctx) error {
	var req Settings
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.UpsertSettings(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Settings saved.", item)
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

func currentRole(c *fiber.Ctx) string {
	role, _ := c.Locals("user_role").(string)
	return role
}
