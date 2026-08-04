package company

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

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

func (s *Service) Register(ctx context.Context, userID uuid.UUID, req RegisterRequest) (Company, error) {
	slug := slugify(req.Name)
	item, err := s.repo.Create(ctx, userID, req, slug)
	return item, s.wrap(err)
}

func (s *Service) MyCompanies(ctx context.Context, userID uuid.UUID) ([]Company, error) {
	items, err := s.repo.MyCompanies(ctx, userID)
	return items, s.wrap(err)
}

func (s *Service) PublicBySlug(ctx context.Context, slug string) (Company, error) {
	item, err := s.repo.BySlug(ctx, slug)
	if err != nil {
		return Company{}, s.wrap(err)
	}
	if item.Status != "approved" {
		return Company{}, s.wrap(auth.ErrNotFound)
	}
	_ = s.repo.Track(ctx, item.ID, "view", nil, map[string]any{"source": "public_page"})
	return item, nil
}

func (s *Service) Search(ctx context.Context, query, industry, location, status, sort string, verified *bool, limit, page int) ([]Company, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if page <= 0 {
		page = 1
	}
	items, err := s.repo.Search(ctx, query, industry, location, verified, status, sort, limit, (page-1)*limit)
	return items, s.wrap(err)
}

func (s *Service) Update(ctx context.Context, companyID, userID uuid.UUID, req UpdateRequest) (Company, error) {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner", "hr", "manager"); err != nil {
		return Company{}, err
	}
	item, err := s.repo.Update(ctx, companyID, req)
	return item, s.wrap(err)
}

func (s *Service) Delete(ctx context.Context, companyID, userID uuid.UUID) error {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner"); err != nil {
		return err
	}
	return s.wrap(s.repo.SoftDelete(ctx, companyID))
}

func (s *Service) SetStatus(ctx context.Context, companyID, reviewer uuid.UUID, req StatusRequest) (Company, error) {
	item, err := s.repo.SetStatus(ctx, companyID, reviewer, req)
	return item, s.wrap(err)
}

func (s *Service) Verify(ctx context.Context, companyID, reviewer uuid.UUID, req VerificationRequest) (Company, error) {
	item, err := s.repo.UpsertVerification(ctx, companyID, reviewer, req)
	return item, s.wrap(err)
}

func (s *Service) Team(ctx context.Context, companyID, userID uuid.UUID) ([]TeamMember, error) {
	if err := s.requireMember(ctx, companyID, userID); err != nil {
		return nil, err
	}
	items, err := s.repo.Team(ctx, companyID)
	return items, s.wrap(err)
}

func (s *Service) Invite(ctx context.Context, companyID, userID uuid.UUID, req InviteRequest) (InviteResult, error) {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner", "hr", "manager"); err != nil {
		return InviteResult{}, err
	}
	token, err := randomToken(32)
	if err != nil {
		return InviteResult{}, apperror.Internal(err)
	}
	item, err := s.repo.Invite(ctx, companyID, userID, req, token, time.Now().UTC().Add(7*24*time.Hour))
	return item, s.wrap(err)
}

func (s *Service) Branches(ctx context.Context, companyID uuid.UUID) ([]Branch, error) {
	items, err := s.repo.Branches(ctx, companyID)
	return items, s.wrap(err)
}

func (s *Service) CreateBranch(ctx context.Context, companyID, userID uuid.UUID, req BranchRequest) (Branch, error) {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner", "hr", "manager"); err != nil {
		return Branch{}, err
	}
	item, err := s.repo.CreateBranch(ctx, companyID, req)
	return item, s.wrap(err)
}

func (s *Service) DeleteBranch(ctx context.Context, companyID, branchID, userID uuid.UUID) error {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner", "hr", "manager"); err != nil {
		return err
	}
	return s.wrap(s.repo.DeleteBranch(ctx, companyID, branchID))
}

func (s *Service) Departments(ctx context.Context, companyID uuid.UUID) ([]Department, error) {
	items, err := s.repo.Departments(ctx, companyID)
	return items, s.wrap(err)
}

func (s *Service) CreateDepartment(ctx context.Context, companyID, userID uuid.UUID, req DepartmentRequest) (Department, error) {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner", "hr", "manager"); err != nil {
		return Department{}, err
	}
	item, err := s.repo.CreateDepartment(ctx, companyID, req)
	return item, s.wrap(err)
}

func (s *Service) DeleteDepartment(ctx context.Context, companyID, departmentID, userID uuid.UUID) error {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner", "hr", "manager"); err != nil {
		return err
	}
	return s.wrap(s.repo.DeleteDepartment(ctx, companyID, departmentID))
}

func (s *Service) Settings(ctx context.Context, companyID, userID uuid.UUID) (Settings, error) {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner", "hr", "manager"); err != nil {
		return Settings{}, err
	}
	item, err := s.repo.Settings(ctx, companyID)
	return item, s.wrap(err)
}

func (s *Service) UpsertSettings(ctx context.Context, companyID, userID uuid.UUID, req Settings) (Settings, error) {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner"); err != nil {
		return Settings{}, err
	}
	item, err := s.repo.UpsertSettings(ctx, companyID, req)
	return item, s.wrap(err)
}

func (s *Service) Dashboard(ctx context.Context, companyID, userID uuid.UUID) (DashboardStats, error) {
	if err := s.requireMember(ctx, companyID, userID); err != nil {
		return DashboardStats{}, err
	}
	stats, err := s.repo.Dashboard(ctx, companyID)
	return stats, s.wrap(err)
}

func (s *Service) UploadMedia(ctx context.Context, companyID, userID uuid.UUID, mediaType string, file *multipart.FileHeader) (MediaResult, error) {
	if err := s.requireCompanyRole(ctx, companyID, userID, "owner", "hr", "manager"); err != nil {
		return MediaResult{}, err
	}
	if err := validateMedia(mediaType, file); err != nil {
		return MediaResult{}, err
	}
	result, err := s.createMedia(ctx, companyID, mediaType, file)
	if err != nil {
		return MediaResult{}, err
	}
	return result, s.wrap(s.repo.ApplyMedia(ctx, companyID, result))
}

func (s *Service) requireMember(ctx context.Context, companyID, userID uuid.UUID) error {
	ok, _, err := s.repo.IsMember(ctx, companyID, userID)
	if err != nil {
		return s.wrap(err)
	}
	if !ok {
		return apperror.Forbidden("You are not a member of this company.")
	}
	return nil
}

func (s *Service) requireCompanyRole(ctx context.Context, companyID, userID uuid.UUID, roles ...string) error {
	ok, role, err := s.repo.IsMember(ctx, companyID, userID)
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
	return apperror.Forbidden("Your company role cannot perform this action.")
}

func (s *Service) createMedia(ctx context.Context, companyID uuid.UUID, mediaType string, file *multipart.FileHeader) (MediaResult, error) {
	ext := strings.ToLower(filepath.Ext(file.Filename))
	fileName := uuid.NewString() + ext
	baseURL := strings.TrimRight(s.cfg.Storage.BaseURL, "/")
	if baseURL == "" {
		baseURL = "/uploads"
	}
	fileURL := baseURL + "/companies/" + mediaType + "/" + fileName
	if strings.EqualFold(s.cfg.Storage.Provider, "local") {
		if err := saveLocalCompanyMedia(mediaType, fileName, file); err != nil {
			return MediaResult{}, apperror.Internal(err)
		}
	}
	metadata := map[string]any{"original_name": file.Filename, "r2_ready": true}
	item, err := s.repo.CreateMedia(ctx, companyID, mediaType, file.Filename, fileURL, file.Header.Get("Content-Type"), file.Size, metadata)
	return item, s.wrap(err)
}

func (s *Service) wrap(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, auth.ErrNotFound) {
		return apperror.NotFound("Company resource not found.")
	}
	return apperror.Database(err)
}

func validateMedia(mediaType string, file *multipart.FileHeader) error {
	if file == nil {
		return apperror.Validation(map[string]string{"file": "is required"})
	}
	if file.Size > 12<<20 {
		return apperror.Validation(map[string]string{"file": "is too large"})
	}
	mime := file.Header.Get("Content-Type")
	images := map[string]bool{"image/jpeg": true, "image/png": true, "image/webp": true}
	docs := map[string]bool{"application/pdf": true, "image/jpeg": true, "image/png": true, "image/webp": true}
	if mediaType == "document" && !docs[mime] {
		return apperror.Validation(map[string]string{"file": "has an unsupported content type"})
	}
	if mediaType != "document" && !images[mime] {
		return apperror.Validation(map[string]string{"file": "has an unsupported content type"})
	}
	return nil
}

func saveLocalCompanyMedia(mediaType, fileName string, file *multipart.FileHeader) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer func() { _ = src.Close() }()
	dir := filepath.Join("uploads", "companies", mediaType)
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

func slugify(value string) string {
	slug := strings.ToLower(strings.TrimSpace(value))
	replacer := strings.NewReplacer(" ", "-", "_", "-", "/", "-", ".", "-")
	return strings.Trim(replacer.Replace(slug), "-") + "-" + uuid.NewString()[:8]
}

func randomToken(bytes int) (string, error) {
	buffer := make([]byte, bytes)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return hex.EncodeToString(buffer), nil
}
