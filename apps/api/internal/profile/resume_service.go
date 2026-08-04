package profile

import (
	"context"

	"careeros/api/pkg/apperror"
	"github.com/google/uuid"
)

var defaultResumeSections = []string{"contact", "summary", "experience", "education", "skills", "projects", "certifications", "languages", "links"}

func (s *Service) requireResumeAccess(ctx context.Context, userID uuid.UUID) error {
	allowed, err := s.repo.ResumeBuilderAllowed(ctx, userID, s.cfg.ResumeBuilder.TestEmails)
	if err != nil {
		return s.wrap(err)
	}
	if !allowed {
		return apperror.Forbidden("A Premium plan is required to use the complete resume builder.")
	}
	return nil
}
func (s *Service) ResumeDocuments(ctx context.Context, userID uuid.UUID) ([]ResumeDocument, error) {
	if err := s.requireResumeAccess(ctx, userID); err != nil {
		return nil, err
	}
	items, err := s.repo.ResumeDocuments(ctx, userID)
	return items, s.wrap(err)
}
func (s *Service) ResumeDocument(ctx context.Context, userID, id uuid.UUID) (ResumeDocument, error) {
	if err := s.requireResumeAccess(ctx, userID); err != nil {
		return ResumeDocument{}, err
	}
	item, err := s.repo.ResumeDocument(ctx, userID, id)
	return item, s.wrap(err)
}
func (s *Service) CreateResumeDocument(ctx context.Context, userID uuid.UUID, req ResumeDocumentRequest) (ResumeDocument, error) {
	if err := s.requireResumeAccess(ctx, userID); err != nil {
		return ResumeDocument{}, err
	}
	if len(req.Content) == 0 {
		seed, err := s.repo.ResumeSeed(ctx, userID)
		if err != nil {
			return ResumeDocument{}, s.wrap(err)
		}
		req.Content = seed
	}
	if len(req.SectionOrder) == 0 {
		req.SectionOrder = append([]string{}, defaultResumeSections...)
	}
	item, err := s.repo.CreateResumeDocument(ctx, userID, req)
	return item, s.wrap(err)
}
func (s *Service) UpdateResumeDocument(ctx context.Context, userID, id uuid.UUID, req ResumeDocumentRequest) (ResumeDocument, error) {
	if err := s.requireResumeAccess(ctx, userID); err != nil {
		return ResumeDocument{}, err
	}
	item, err := s.repo.UpdateResumeDocument(ctx, userID, id, req)
	return item, s.wrap(err)
}
func (s *Service) DeleteResumeDocument(ctx context.Context, userID, id uuid.UUID) error {
	if err := s.requireResumeAccess(ctx, userID); err != nil {
		return err
	}
	return s.wrap(s.repo.DeleteResumeDocument(ctx, userID, id))
}
func (s *Service) DuplicateResumeDocument(ctx context.Context, userID, id uuid.UUID) (ResumeDocument, error) {
	if err := s.requireResumeAccess(ctx, userID); err != nil {
		return ResumeDocument{}, err
	}
	item, err := s.repo.DuplicateResumeDocument(ctx, userID, id)
	return item, s.wrap(err)
}
func (s *Service) ResumeVersions(ctx context.Context, userID, id uuid.UUID) ([]ResumeDocumentVersion, error) {
	if err := s.requireResumeAccess(ctx, userID); err != nil {
		return nil, err
	}
	items, err := s.repo.ResumeVersions(ctx, userID, id)
	return items, s.wrap(err)
}
func (s *Service) RestoreResumeVersion(ctx context.Context, userID, id uuid.UUID, version int) (ResumeDocument, error) {
	if err := s.requireResumeAccess(ctx, userID); err != nil {
		return ResumeDocument{}, err
	}
	item, err := s.repo.RestoreResumeVersion(ctx, userID, id, version)
	return item, s.wrap(err)
}
