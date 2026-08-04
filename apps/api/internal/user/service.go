package user

import (
	"context"
	"errors"

	"careeros/api/internal/auth"
	"careeros/api/pkg/apperror"
	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Me(ctx context.Context, id uuid.UUID) (Account, error) {
	return s.account(ctx, id)
}

func (s *Service) List(ctx context.Context, limit, page int) ([]Account, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if page <= 0 {
		page = 1
	}
	items, err := s.repo.List(ctx, limit, (page-1)*limit)
	if err != nil {
		return nil, apperror.Database(err)
	}
	return items, nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req UpdateAccountRequest, actor uuid.UUID, ip, userAgent string) (Account, error) {
	account, err := s.repo.Update(ctx, id, req)
	if err != nil {
		if errors.Is(err, auth.ErrNotFound) {
			return Account{}, apperror.NotFound("User not found.")
		}
		return Account{}, apperror.Database(err)
	}
	_ = s.repo.AddAudit(ctx, actor, "user.updated", "user", &id, map[string]any{"target_user_id": id.String()}, ip, userAgent)
	return account, nil
}

func (s *Service) Delete(ctx context.Context, id, actor uuid.UUID, ip, userAgent string) error {
	if err := s.repo.SoftDelete(ctx, id); err != nil {
		return apperror.Database(err)
	}
	_ = s.repo.AddAudit(ctx, actor, "user.deleted", "user", &id, map[string]any{"target_user_id": id.String()}, ip, userAgent)
	return nil
}

func (s *Service) Sessions(ctx context.Context, userID uuid.UUID) ([]Session, error) {
	items, err := s.repo.Sessions(ctx, userID)
	if err != nil {
		return nil, apperror.Database(err)
	}
	return items, nil
}

func (s *Service) Devices(ctx context.Context, userID uuid.UUID) ([]Device, error) {
	items, err := s.repo.Devices(ctx, userID)
	if err != nil {
		return nil, apperror.Database(err)
	}
	return items, nil
}

func (s *Service) LoginHistory(ctx context.Context, userID uuid.UUID) ([]LoginEvent, error) {
	items, err := s.repo.LoginHistory(ctx, userID)
	if err != nil {
		return nil, apperror.Database(err)
	}
	return items, nil
}

func (s *Service) AuditTrail(ctx context.Context, userID uuid.UUID) ([]AuditEvent, error) {
	items, err := s.repo.AuditTrail(ctx, userID)
	if err != nil {
		return nil, apperror.Database(err)
	}
	return items, nil
}

func (s *Service) account(ctx context.Context, id uuid.UUID) (Account, error) {
	account, err := s.repo.GetByID(ctx, id)
	if errors.Is(err, auth.ErrNotFound) {
		return Account{}, apperror.NotFound("User not found.")
	}
	if err != nil {
		return Account{}, apperror.Database(err)
	}
	return account, nil
}
