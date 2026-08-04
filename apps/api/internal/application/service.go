package application

import (
	"context"
	"errors"
	"time"

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

func (s *Service) Apply(ctx context.Context, userID uuid.UUID, req ApplyRequest) (Application, error) {
	profile, resume, err := s.repo.CandidateSnapshot(ctx, userID)
	if err != nil {
		return Application{}, s.wrap(err)
	}
	item, err := s.repo.Create(ctx, userID, req, profile, resume)
	return item, s.wrap(err)
}

func (s *Service) CandidateDashboard(ctx context.Context, userID uuid.UUID, params CandidateParams) ([]Application, error) {
	params.Limit, params.Page = normalizePage(params.Limit, params.Page)
	items, err := s.repo.CandidateApplications(ctx, userID, params)
	return items, s.wrap(err)
}

func (s *Service) Inbox(ctx context.Context, userID uuid.UUID, params InboxParams) ([]Application, error) {
	if err := s.requireMember(ctx, params.CompanyID, userID); err != nil {
		return nil, err
	}
	params.Limit, params.Page = normalizePage(params.Limit, params.Page)
	items, err := s.repo.Inbox(ctx, params)
	return items, s.wrap(err)
}

func (s *Service) UpdateStatus(ctx context.Context, id, actor uuid.UUID, req StatusRequest) (Application, error) {
	app, err := s.repo.ByID(ctx, id)
	if err != nil {
		return Application{}, s.wrap(err)
	}
	if req.Status == "withdrawn" && app.CandidateUserID == actor {
		item, err := s.repo.UpdateStatus(ctx, id, actor, req.Status, req.Message)
		return item, s.wrap(err)
	}
	if err := s.requireMember(ctx, app.CompanyID, actor); err != nil {
		return Application{}, err
	}
	item, err := s.repo.UpdateStatus(ctx, id, actor, req.Status, req.Message)
	return item, s.wrap(err)
}

func (s *Service) BulkStatus(ctx context.Context, actor uuid.UUID, req BulkStatusRequest) error {
	for _, id := range req.ApplicationIDs {
		app, err := s.repo.ByID(ctx, id)
		if err != nil {
			return s.wrap(err)
		}
		if err := s.requireMember(ctx, app.CompanyID, actor); err != nil {
			return err
		}
	}
	return s.wrap(s.repo.BulkStatus(ctx, req.ApplicationIDs, actor, req.Status, req.Message))
}

func (s *Service) SaveJob(ctx context.Context, userID uuid.UUID, req SaveJobRequest) error {
	return s.wrap(s.repo.SaveJob(ctx, userID, req))
}

func (s *Service) RemoveSavedJob(ctx context.Context, userID, jobID uuid.UUID) error {
	return s.wrap(s.repo.RemoveSavedJob(ctx, userID, jobID))
}

func (s *Service) SavedJobs(ctx context.Context, userID uuid.UUID) ([]SavedJob, error) {
	items, err := s.repo.SavedJobs(ctx, userID)
	return items, s.wrap(err)
}

func (s *Service) AddNote(ctx context.Context, applicationID, actor uuid.UUID, req NoteRequest) (Note, error) {
	app, err := s.repo.ByID(ctx, applicationID)
	if err != nil {
		return Note{}, s.wrap(err)
	}
	if err := s.requireMember(ctx, app.CompanyID, actor); err != nil {
		return Note{}, err
	}
	item, err := s.repo.AddNote(ctx, applicationID, actor, req)
	return item, s.wrap(err)
}

func (s *Service) Notes(ctx context.Context, applicationID, actor uuid.UUID) ([]Note, error) {
	app, err := s.repo.ByID(ctx, applicationID)
	if err != nil {
		return nil, s.wrap(err)
	}
	if app.CandidateUserID != actor {
		if err := s.requireMember(ctx, app.CompanyID, actor); err != nil {
			return nil, err
		}
	}
	items, err := s.repo.Notes(ctx, applicationID)
	return items, s.wrap(err)
}

func (s *Service) CreateInterview(ctx context.Context, applicationID, actor uuid.UUID, req InterviewRequest) (Interview, error) {
	app, err := s.repo.ByID(ctx, applicationID)
	if err != nil {
		return Interview{}, s.wrap(err)
	}
	if err := s.requireMember(ctx, app.CompanyID, actor); err != nil {
		return Interview{}, err
	}
	scheduledAt, err := time.Parse(time.RFC3339, req.ScheduledAt)
	if err != nil {
		return Interview{}, apperror.Validation(map[string]string{"scheduled_at": "must be RFC3339"})
	}
	item, err := s.repo.CreateInterview(ctx, applicationID, actor, req, scheduledAt)
	return item, s.wrap(err)
}

func (s *Service) Interviews(ctx context.Context, applicationID, actor uuid.UUID) ([]Interview, error) {
	app, err := s.repo.ByID(ctx, applicationID)
	if err != nil {
		return nil, s.wrap(err)
	}
	if app.CandidateUserID != actor {
		if err := s.requireMember(ctx, app.CompanyID, actor); err != nil {
			return nil, err
		}
	}
	items, err := s.repo.Interviews(ctx, applicationID)
	return items, s.wrap(err)
}

func (s *Service) CreateOffer(ctx context.Context, applicationID, actor uuid.UUID, req OfferRequest) (Offer, error) {
	app, err := s.repo.ByID(ctx, applicationID)
	if err != nil {
		return Offer{}, s.wrap(err)
	}
	if err := s.requireMember(ctx, app.CompanyID, actor); err != nil {
		return Offer{}, err
	}
	item, err := s.repo.CreateOffer(ctx, applicationID, actor, req, parseDate(req.JoiningDate))
	return item, s.wrap(err)
}

func (s *Service) Offers(ctx context.Context, applicationID, actor uuid.UUID) ([]Offer, error) {
	app, err := s.repo.ByID(ctx, applicationID)
	if err != nil {
		return nil, s.wrap(err)
	}
	if app.CandidateUserID != actor {
		if err := s.requireMember(ctx, app.CompanyID, actor); err != nil {
			return nil, err
		}
	}
	items, err := s.repo.Offers(ctx, applicationID)
	return items, s.wrap(err)
}

func (s *Service) Timeline(ctx context.Context, applicationID, actor uuid.UUID) ([]TimelineEvent, error) {
	app, err := s.repo.ByID(ctx, applicationID)
	if err != nil {
		return nil, s.wrap(err)
	}
	if app.CandidateUserID != actor {
		if err := s.requireMember(ctx, app.CompanyID, actor); err != nil {
			return nil, err
		}
	}
	items, err := s.repo.Timeline(ctx, applicationID)
	return items, s.wrap(err)
}

func (s *Service) Notifications(ctx context.Context, userID uuid.UUID) ([]Notification, error) {
	items, err := s.repo.Notifications(ctx, userID)
	return items, s.wrap(err)
}

func (s *Service) NotificationSummary(ctx context.Context, userID uuid.UUID) (NotificationSummary, error) {
	item, err := s.repo.NotificationSummary(ctx, userID)
	return item, s.wrap(err)
}

func (s *Service) MarkNotificationRead(ctx context.Context, userID, notificationID uuid.UUID) error {
	return s.wrap(s.repo.MarkNotificationRead(ctx, userID, notificationID))
}

func (s *Service) MarkAllNotificationsRead(ctx context.Context, userID uuid.UUID) error {
	return s.wrap(s.repo.MarkAllNotificationsRead(ctx, userID))
}

func (s *Service) DeleteNotification(ctx context.Context, userID, notificationID uuid.UUID) error {
	return s.wrap(s.repo.DeleteNotification(ctx, userID, notificationID))
}

func (s *Service) Analytics(ctx context.Context, companyID, actor uuid.UUID) (Analytics, error) {
	if err := s.requireMember(ctx, companyID, actor); err != nil {
		return Analytics{}, err
	}
	item, err := s.repo.Analytics(ctx, companyID)
	return item, s.wrap(err)
}

func (s *Service) requireMember(ctx context.Context, companyID, userID uuid.UUID) error {
	ok, _, err := s.repo.IsCompanyMember(ctx, companyID, userID)
	if err != nil {
		return s.wrap(err)
	}
	if !ok {
		return apperror.Forbidden("You are not a member of this company.")
	}
	return nil
}

func (s *Service) wrap(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, auth.ErrNotFound) {
		return apperror.NotFound("Application resource not found.")
	}
	if errors.Is(err, ErrSubscriptionRequired) {
		return apperror.New(402, "SUBSCRIPTION_REQUIRED", "Choose a candidate plan before applying for jobs.", nil)
	}
	if errors.Is(err, ErrSubscriptionExpired) {
		return apperror.New(402, "SUBSCRIPTION_EXPIRED", "Your candidate plan has expired. Renew to continue applying.", nil)
	}
	if errors.Is(err, ErrApplicationLimit) {
		return apperror.New(402, "APPLICATION_LIMIT_REACHED", "Your Basic plan application limit has been reached. Upgrade to Premium to continue.", nil)
	}
	return apperror.Database(err)
}

func normalizePage(limit, page int) (int, int) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if page <= 0 {
		page = 1
	}
	return limit, page
}
