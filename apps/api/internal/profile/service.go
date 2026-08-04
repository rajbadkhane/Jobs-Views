package profile

import (
	"context"
	"errors"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
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

func (s *Service) Me(ctx context.Context, userID uuid.UUID, role string) (any, error) {
	switch role {
	case "EMPLOYER":
		return s.employer(ctx, userID)
	case "SUPER_ADMIN", "ADMIN":
		return s.admin(ctx, userID)
	default:
		return s.candidate(ctx, userID)
	}
}

func (s *Service) UpsertCandidate(ctx context.Context, userID uuid.UUID, req CandidateProfileRequest) (CandidateProfile, error) {
	completion := candidateCompletion(req, nil, nil, nil, "")
	profile, err := s.repo.UpsertCandidate(ctx, userID, req, completion)
	return profile, s.wrap(err)
}

func (s *Service) UpsertEmployer(ctx context.Context, userID uuid.UUID, req EmployerProfileRequest) (EmployerProfile, error) {
	completion := namedCompletion(map[string]string{"first_name": req.FirstName, "last_name": req.LastName, "title": req.Title, "phone": req.Phone})
	profile, err := s.repo.UpsertEmployer(ctx, userID, req, completion)
	return profile, s.wrap(err)
}

func (s *Service) UpsertAdmin(ctx context.Context, userID uuid.UUID, req AdminProfileRequest) (AdminProfile, error) {
	completion := namedCompletion(map[string]string{"first_name": req.FirstName, "last_name": req.LastName, "title": req.Title})
	profile, err := s.repo.UpsertAdmin(ctx, userID, req, completion)
	return profile, s.wrap(err)
}

func (s *Service) Completion(ctx context.Context, userID uuid.UUID, role string) (Completion, error) {
	if role == "EMPLOYER" {
		profile, err := s.repo.EmployerByUserID(ctx, userID)
		if err != nil {
			return Completion{}, s.wrap(err)
		}
		return namedCompletion(map[string]string{"first_name": profile.FirstName, "last_name": profile.LastName, "title": profile.Title, "phone": profile.Phone, "avatar": profile.AvatarURL}), nil
	}
	if role == "SUPER_ADMIN" || role == "ADMIN" {
		profile, err := s.repo.AdminByUserID(ctx, userID)
		if err != nil {
			return Completion{}, s.wrap(err)
		}
		return namedCompletion(map[string]string{"first_name": profile.FirstName, "last_name": profile.LastName, "title": profile.Title, "avatar": profile.AvatarURL}), nil
	}
	profile, err := s.repo.CandidateByUserID(ctx, userID)
	if err != nil {
		return Completion{}, s.wrap(err)
	}
	skills, _ := s.repo.Skills(ctx, userID)
	education, _ := s.repo.Education(ctx, userID)
	experience, _ := s.repo.Experiences(ctx, userID)
	req := CandidateProfileRequest{
		FirstName: profile.FirstName, LastName: profile.LastName, Title: profile.Title, Headline: profile.Headline,
		Bio: profile.Bio, Phone: profile.Phone, Location: profile.Location, Availability: profile.Availability, Visibility: profile.Visibility,
	}
	return candidateCompletion(req, skills, education, experience, profile.ResumeURL), nil
}

func (s *Service) PublicCandidate(ctx context.Context, id uuid.UUID) (CandidateProfile, error) {
	item, err := s.repo.PublicCandidate(ctx, id)
	return item, s.wrap(err)
}

func (s *Service) Search(ctx context.Context, query, location, skill string, limit int) ([]CandidateProfile, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	items, err := s.repo.SearchCandidates(ctx, query, location, skill, limit)
	return items, s.wrap(err)
}

func (s *Service) DeleteProfile(ctx context.Context, userID uuid.UUID, role string) error {
	return s.wrap(s.repo.SoftDeleteProfile(ctx, userID, role))
}

func (s *Service) UploadAvatar(ctx context.Context, userID uuid.UUID, role string, file *multipart.FileHeader) (UploadResult, error) {
	if err := validateUpload(file, 5<<20, map[string]bool{"image/jpeg": true, "image/png": true, "image/webp": true}); err != nil {
		return UploadResult{}, err
	}
	result, err := s.createUpload(ctx, userID, profileType(role), "avatar", file)
	if err != nil {
		return UploadResult{}, err
	}
	if err := s.repo.UpdateAvatar(ctx, userID, role, result.FileURL); err != nil {
		return UploadResult{}, s.wrap(err)
	}
	return result, nil
}

func (s *Service) UploadResume(ctx context.Context, userID uuid.UUID, file *multipart.FileHeader) (UploadResult, error) {
	if err := validateUpload(file, 10<<20, map[string]bool{
		"application/pdf": true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
	}); err != nil {
		return UploadResult{}, err
	}
	result, err := s.createUpload(ctx, userID, "candidate", "resume", file)
	if err != nil {
		return UploadResult{}, err
	}
	return result, s.wrap(s.repo.CreateResume(ctx, userID, result))
}

func (s *Service) Skills(ctx context.Context, userID uuid.UUID) ([]Skill, error) {
	items, err := s.repo.Skills(ctx, userID)
	return items, s.wrap(err)
}

func (s *Service) UpsertSkill(ctx context.Context, userID uuid.UUID, req SkillRequest) (Skill, error) {
	item, err := s.repo.UpsertSkill(ctx, userID, req)
	return item, s.wrap(err)
}

func (s *Service) DeleteSkill(ctx context.Context, userID, id uuid.UUID) error {
	return s.wrap(s.repo.DeleteSkill(ctx, userID, id))
}

func (s *Service) Education(ctx context.Context, userID uuid.UUID) ([]Education, error) {
	items, err := s.repo.Education(ctx, userID)
	return items, s.wrap(err)
}

func (s *Service) CreateEducation(ctx context.Context, userID uuid.UUID, req EducationRequest) (Education, error) {
	item, err := s.repo.CreateEducation(ctx, userID, req)
	return item, s.wrap(err)
}

func (s *Service) DeleteEducation(ctx context.Context, userID, id uuid.UUID) error {
	return s.wrap(s.repo.DeleteEducation(ctx, userID, id))
}

func (s *Service) Experiences(ctx context.Context, userID uuid.UUID) ([]Experience, error) {
	items, err := s.repo.Experiences(ctx, userID)
	return items, s.wrap(err)
}

func (s *Service) CreateExperience(ctx context.Context, userID uuid.UUID, req ExperienceRequest) (Experience, error) {
	item, err := s.repo.CreateExperience(ctx, userID, req)
	return item, s.wrap(err)
}

func (s *Service) DeleteExperience(ctx context.Context, userID, id uuid.UUID) error {
	return s.wrap(s.repo.DeleteExperience(ctx, userID, id))
}

func (s *Service) SocialLinks(ctx context.Context, userID uuid.UUID) (SocialLinks, error) {
	item, err := s.repo.SocialLinks(ctx, userID)
	return item, s.wrap(err)
}

func (s *Service) UpsertSocialLinks(ctx context.Context, userID uuid.UUID, req SocialLinks) (SocialLinks, error) {
	item, err := s.repo.UpsertSocialLinks(ctx, userID, req)
	return item, s.wrap(err)
}

func (s *Service) Preferences(ctx context.Context, userID uuid.UUID) (NotificationPreferences, error) {
	item, err := s.repo.Preferences(ctx, userID)
	return item, s.wrap(err)
}

func (s *Service) UpsertPreferences(ctx context.Context, userID uuid.UUID, req NotificationPreferences) (NotificationPreferences, error) {
	item, err := s.repo.UpsertPreferences(ctx, userID, req)
	return item, s.wrap(err)
}

func (s *Service) Settings(ctx context.Context, userID uuid.UUID) (Settings, error) {
	item, err := s.repo.Settings(ctx, userID)
	return item, s.wrap(err)
}

func (s *Service) UpsertSettings(ctx context.Context, userID uuid.UUID, req Settings) (Settings, error) {
	item, err := s.repo.UpsertSettings(ctx, userID, req)
	return item, s.wrap(err)
}

func (s *Service) candidate(ctx context.Context, userID uuid.UUID) (CandidateProfile, error) {
	item, err := s.repo.CandidateByUserID(ctx, userID)
	return item, s.wrap(err)
}

func (s *Service) employer(ctx context.Context, userID uuid.UUID) (EmployerProfile, error) {
	item, err := s.repo.EmployerByUserID(ctx, userID)
	return item, s.wrap(err)
}

func (s *Service) admin(ctx context.Context, userID uuid.UUID) (AdminProfile, error) {
	item, err := s.repo.AdminByUserID(ctx, userID)
	return item, s.wrap(err)
}

func (s *Service) createUpload(ctx context.Context, userID uuid.UUID, profileType, uploadType string, file *multipart.FileHeader) (UploadResult, error) {
	ext := strings.ToLower(filepath.Ext(file.Filename))
	fileName := uuid.NewString() + ext
	baseURL := strings.TrimRight(s.cfg.Storage.BaseURL, "/")
	if baseURL == "" {
		baseURL = "/uploads"
	}
	fileURL := baseURL + "/" + uploadType + "/" + fileName
	if strings.EqualFold(s.cfg.Storage.Provider, "local") {
		if err := saveLocalUpload(uploadType, fileName, file); err != nil {
			return UploadResult{}, apperror.Internal(err)
		}
	}
	metadata := map[string]any{
		"original_name":   file.Filename,
		"optimization":    uploadType == "avatar",
		"virus_scan_hook": uploadType == "resume",
	}
	result, err := s.repo.CreateUpload(ctx, userID, profileType, uploadType, file.Filename, fileURL, file.Header.Get("Content-Type"), file.Size, metadata)
	return result, s.wrap(err)
}

func saveLocalUpload(uploadType, fileName string, file *multipart.FileHeader) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer func() { _ = src.Close() }()

	dir := filepath.Join("uploads", uploadType)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	dst, err := os.Create(filepath.Join(dir, fileName))
	if err != nil {
		return err
	}
	defer func() { _ = dst.Close() }()
	_, err = io.Copy(dst, src)
	return err
}

func (s *Service) wrap(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, auth.ErrNotFound) {
		return apperror.NotFound("Profile resource not found.")
	}
	return apperror.Database(err)
}

func validateUpload(file *multipart.FileHeader, maxSize int64, allowed map[string]bool) error {
	if file == nil {
		return apperror.Validation(map[string]string{"file": "is required"})
	}
	if file.Size > maxSize {
		return apperror.Validation(map[string]string{"file": "is too large"})
	}
	mime := file.Header.Get("Content-Type")
	if !allowed[mime] {
		return apperror.Validation(map[string]string{"file": "has an unsupported content type"})
	}
	return nil
}

func candidateCompletion(req CandidateProfileRequest, skills []Skill, education []Education, experience []Experience, resumeURL string) Completion {
	fields := map[string]bool{
		"first_name":   req.FirstName != "",
		"last_name":    req.LastName != "",
		"title":        req.Title != "",
		"headline":     req.Headline != "",
		"bio":          req.Bio != "",
		"phone":        req.Phone != "",
		"location":     req.Location != "",
		"availability": req.Availability != "",
		"resume":       resumeURL != "",
		"skills":       len(skills) > 0,
		"education":    len(education) > 0,
		"experience":   len(experience) > 0,
	}
	return completionFromFields(fields)
}

func namedCompletion(values map[string]string) Completion {
	fields := map[string]bool{}
	for key, value := range values {
		fields[key] = value != ""
	}
	return completionFromFields(fields)
}

func completionFromFields(fields map[string]bool) Completion {
	missing := []string{}
	done := 0
	for field, present := range fields {
		if present {
			done++
		} else {
			missing = append(missing, field)
		}
	}
	score := 0
	if len(fields) > 0 {
		score = done * 100 / len(fields)
	}
	return Completion{Score: score, Strength: strength(score), MissingFields: missing}
}

func strength(score int) string {
	switch {
	case score >= 80:
		return "strong"
	case score >= 50:
		return "medium"
	default:
		return "weak"
	}
}

func profileType(role string) string {
	switch role {
	case "EMPLOYER":
		return "employer"
	case "SUPER_ADMIN", "ADMIN":
		return "admin"
	default:
		return "candidate"
	}
}
