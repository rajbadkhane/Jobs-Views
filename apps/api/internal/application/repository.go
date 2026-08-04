package application

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"time"

	"careeros/api/internal/auth"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

var (
	ErrSubscriptionRequired = errors.New("candidate subscription required")
	ErrSubscriptionExpired  = errors.New("candidate subscription expired")
	ErrApplicationLimit     = errors.New("candidate application limit reached")
)

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, userID uuid.UUID, req ApplyRequest, profileSnapshot, resumeSnapshot map[string]any) (Application, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return Application{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if err := enforceApplicationEntitlement(ctx, tx, userID); err != nil {
		return Application{}, err
	}
	var profileID *uuid.UUID
	_ = tx.QueryRow(ctx, `SELECT id FROM candidate_profiles WHERE user_id = $1 AND deleted_at IS NULL`, userID).Scan(&profileID)
	var companyID uuid.UUID
	err = tx.QueryRow(ctx, `SELECT company_id FROM jobs WHERE id = $1 AND status = 'published' AND deleted_at IS NULL`, req.JobID).Scan(&companyID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Application{}, auth.ErrNotFound
	}
	if err != nil {
		return Application{}, err
	}
	profileBytes, _ := json.Marshal(profileSnapshot)
	resumeBytes, _ := json.Marshal(resumeSnapshot)
	source := req.Source
	if source == "" {
		source = "career_os"
	}
	var id uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO applications (candidate_user_id, candidate_profile_id, job_id, company_id, resume_snapshot, profile_snapshot, cover_letter, expected_salary, notice_period, source)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NULLIF($8, 0), $9, $10)
		RETURNING id
	`, userID, profileID, req.JobID, companyID, resumeBytes, profileBytes, req.CoverLetter, req.ExpectedSalary, req.NoticePeriod, source).Scan(&id)
	if err != nil {
		return Application{}, err
	}
	if _, err := tx.Exec(ctx, `INSERT INTO application_timeline (application_id, actor_user_id, event_type, from_status, to_status, message, metadata) VALUES ($1,$2,'application_created','','applied','Application submitted.','{}'::jsonb)`, id, userID); err != nil {
		return Application{}, err
	}
	if _, err := tx.Exec(ctx, `INSERT INTO job_analytics (job_id, event_type, actor_user_id, metadata) VALUES ($1, 'application', $2, '{}'::jsonb)`, req.JobID, userID); err != nil {
		return Application{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return Application{}, err
	}
	return r.ByID(ctx, id)
}

func enforceApplicationEntitlement(ctx context.Context, tx pgx.Tx, userID uuid.UUID) error {
	_, _ = tx.Exec(ctx, `UPDATE candidate_subscriptions SET status='expired' WHERE user_id=$1 AND status='active' AND ends_at <= NOW()`, userID)
	var subscriptionID uuid.UUID
	var limit *int
	var startsAt, endsAt time.Time
	err := tx.QueryRow(ctx, `SELECT id, application_limit, starts_at, ends_at FROM candidate_subscriptions WHERE user_id=$1 AND status='active' AND ends_at > NOW() ORDER BY created_at DESC LIMIT 1 FOR UPDATE`, userID).Scan(&subscriptionID, &limit, &startsAt, &endsAt)
	if errors.Is(err, pgx.ErrNoRows) {
		var hadSubscription bool
		_ = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM candidate_subscriptions WHERE user_id=$1)`, userID).Scan(&hadSubscription)
		if hadSubscription {
			return ErrSubscriptionExpired
		}
		return ErrSubscriptionRequired
	}
	if err != nil {
		return err
	}
	if limit == nil {
		return nil
	}
	var used int
	if err := tx.QueryRow(ctx, `SELECT count(*) FROM applications WHERE candidate_user_id=$1 AND deleted_at IS NULL AND created_at >= $2 AND created_at < $3`, userID, startsAt, endsAt).Scan(&used); err != nil {
		return err
	}
	if used >= *limit {
		return ErrApplicationLimit
	}
	return nil
}

func (r *Repository) ByID(ctx context.Context, id uuid.UUID) (Application, error) {
	rows, err := r.db.Query(ctx, applicationSelect()+` WHERE a.id = $1 AND a.deleted_at IS NULL`, id)
	if err != nil {
		return Application{}, err
	}
	items, err := scanApplications(rows)
	if err != nil {
		return Application{}, err
	}
	if len(items) == 0 {
		return Application{}, auth.ErrNotFound
	}
	return items[0], nil
}

func (r *Repository) CandidateApplications(ctx context.Context, userID uuid.UUID, params CandidateParams) ([]Application, error) {
	args := []any{userID}
	where := []string{"a.candidate_user_id = $1", "a.deleted_at IS NULL"}
	if params.Status != "" {
		args = append(args, params.Status)
		where = append(where, "a.status = $"+strconv.Itoa(len(args)))
	}
	args = append(args, params.Limit, (params.Page-1)*params.Limit)
	rows, err := r.db.Query(ctx, applicationSelect()+`
		WHERE `+strings.Join(where, " AND ")+`
		ORDER BY a.last_activity_at DESC
		LIMIT $`+strconv.Itoa(len(args)-1)+` OFFSET $`+strconv.Itoa(len(args)), args...)
	if err != nil {
		return nil, err
	}
	return scanApplications(rows)
}

func (r *Repository) Inbox(ctx context.Context, params InboxParams) ([]Application, error) {
	args := []any{params.CompanyID}
	where := []string{"a.company_id = $1", "a.deleted_at IS NULL"}
	if params.JobID != nil {
		args = append(args, *params.JobID)
		where = append(where, "a.job_id = $"+strconv.Itoa(len(args)))
	}
	if params.Status != "" {
		args = append(args, params.Status)
		where = append(where, "a.status = $"+strconv.Itoa(len(args)))
	}
	if params.Keyword != "" {
		args = append(args, "%"+strings.ToLower(params.Keyword)+"%")
		where = append(where, "(lower(u.email) LIKE $"+strconv.Itoa(len(args))+" OR lower(coalesce(cp.first_name, '') || ' ' || coalesce(cp.last_name, '')) LIKE $"+strconv.Itoa(len(args))+")")
	}
	orderBy := "a.last_activity_at DESC"
	if params.Sort == "oldest" {
		orderBy = "a.created_at ASC"
	}
	args = append(args, params.Limit, (params.Page-1)*params.Limit)
	rows, err := r.db.Query(ctx, applicationSelect()+`
		WHERE `+strings.Join(where, " AND ")+`
		ORDER BY `+orderBy+`
		LIMIT $`+strconv.Itoa(len(args)-1)+` OFFSET $`+strconv.Itoa(len(args)), args...)
	if err != nil {
		return nil, err
	}
	return scanApplications(rows)
}

func (r *Repository) UpdateStatus(ctx context.Context, id uuid.UUID, actor uuid.UUID, status, message string) (Application, error) {
	current, err := r.ByID(ctx, id)
	if err != nil {
		return Application{}, err
	}
	_, err = r.db.Exec(ctx, `UPDATE applications SET status = $1, last_activity_at = NOW() WHERE id = $2`, status, id)
	if err != nil {
		return Application{}, err
	}
	_ = r.AddTimeline(ctx, id, &actor, "status_changed", current.Status, status, message, nil)
	_ = r.CreateNotification(ctx, current.CandidateUserID, current.CompanyID, id, "in_app", "candidate", "Application status updated", "Your application status changed to "+status+".", map[string]any{"status": status})
	return r.ByID(ctx, id)
}

func (r *Repository) BulkStatus(ctx context.Context, ids []uuid.UUID, actor uuid.UUID, status, message string) error {
	for _, id := range ids {
		if _, err := r.UpdateStatus(ctx, id, actor, status, message); err != nil {
			return err
		}
	}
	return nil
}

func (r *Repository) SaveJob(ctx context.Context, userID uuid.UUID, req SaveJobRequest) error {
	collection := req.Collection
	if collection == "" {
		collection = "default"
	}
	_, err := r.db.Exec(ctx, `
		INSERT INTO saved_jobs (user_id, job_id, notes, collection)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, job_id) DO UPDATE SET notes = EXCLUDED.notes, collection = EXCLUDED.collection, updated_at = NOW()
	`, userID, req.JobID, req.Notes, collection)
	return err
}

func (r *Repository) RemoveSavedJob(ctx context.Context, userID, jobID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2`, userID, jobID)
	return err
}

func (r *Repository) SavedJobs(ctx context.Context, userID uuid.UUID) ([]SavedJob, error) {
	rows, err := r.db.Query(ctx, `
		SELECT j.id, j.title, j.slug, c.name, coalesce(sj.notes, ''), sj.collection, sj.created_at, sj.updated_at
		FROM saved_jobs sj
		JOIN jobs j ON j.id = sj.job_id
		JOIN companies c ON c.id = j.company_id
		WHERE sj.user_id = $1
		ORDER BY sj.updated_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []SavedJob{}
	for rows.Next() {
		var item SavedJob
		if err := rows.Scan(&item.JobID, &item.Title, &item.Slug, &item.Company, &item.Notes, &item.Collection, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) AddNote(ctx context.Context, applicationID, author uuid.UUID, req NoteRequest) (Note, error) {
	tags, _ := json.Marshal(req.Tags)
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return Note{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var item Note
	err = tx.QueryRow(ctx, `
		INSERT INTO application_notes (application_id, author_user_id, note, is_internal)
		VALUES ($1, $2, $3, $4)
		RETURNING id, application_id, author_user_id, note, is_internal, created_at, updated_at
	`, applicationID, author, req.Note, req.IsInternal).Scan(&item.ID, &item.ApplicationID, &item.AuthorUserID, &item.Note, &item.IsInternal, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return Note{}, err
	}
	if req.Rating > 0 || len(req.Tags) > 0 {
		_, err = tx.Exec(ctx, `UPDATE applications SET rating = NULLIF($1, 0), tags = $2, last_activity_at = NOW() WHERE id = $3`, req.Rating, tags, applicationID)
		if err != nil {
			return Note{}, err
		}
	}
	metadata, _ := json.Marshal(map[string]any{"note_id": item.ID.String()})
	_, err = tx.Exec(ctx, `INSERT INTO application_timeline (application_id, actor_user_id, event_type, message, metadata) VALUES ($1, $2, 'note_added', $3, $4)`, applicationID, author, req.Note, metadata)
	if err != nil {
		return Note{}, err
	}
	return item, tx.Commit(ctx)
}

func (r *Repository) Notes(ctx context.Context, applicationID uuid.UUID) ([]Note, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, application_id, author_user_id, note, is_internal, created_at, updated_at
		FROM application_notes WHERE application_id = $1 ORDER BY created_at DESC
	`, applicationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Note{}
	for rows.Next() {
		var item Note
		if err := rows.Scan(&item.ID, &item.ApplicationID, &item.AuthorUserID, &item.Note, &item.IsInternal, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) CreateInterview(ctx context.Context, applicationID, actor uuid.UUID, req InterviewRequest, scheduledAt time.Time) (Interview, error) {
	interviewers, _ := json.Marshal(req.Interviewers)
	feedback, _ := json.Marshal(req.Feedback)
	var item Interview
	var rawInterviewers, rawFeedback []byte
	err := r.db.QueryRow(ctx, `
		INSERT INTO application_interviews (application_id, round, scheduled_at, mode, location, meeting_url, interviewers, feedback, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, application_id, round, scheduled_at, mode, coalesce(location, ''), coalesce(meeting_url, ''), interviewers, feedback, status, created_by, created_at, updated_at
	`, applicationID, req.Round, scheduledAt, req.Mode, req.Location, req.MeetingURL, interviewers, feedback, actor).Scan(&item.ID, &item.ApplicationID, &item.Round, &item.ScheduledAt, &item.Mode, &item.Location, &item.MeetingURL, &rawInterviewers, &rawFeedback, &item.Status, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return Interview{}, err
	}
	_ = json.Unmarshal(rawInterviewers, &item.Interviewers)
	_ = json.Unmarshal(rawFeedback, &item.Feedback)
	_, _ = r.UpdateStatus(ctx, applicationID, actor, "interview_scheduled", "Interview scheduled.")
	return item, nil
}

func (r *Repository) Interviews(ctx context.Context, applicationID uuid.UUID) ([]Interview, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, application_id, round, scheduled_at, mode, coalesce(location, ''), coalesce(meeting_url, ''), interviewers, feedback, status, created_by, created_at, updated_at
		FROM application_interviews WHERE application_id = $1 ORDER BY scheduled_at DESC
	`, applicationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Interview{}
	for rows.Next() {
		var item Interview
		var rawInterviewers, rawFeedback []byte
		if err := rows.Scan(&item.ID, &item.ApplicationID, &item.Round, &item.ScheduledAt, &item.Mode, &item.Location, &item.MeetingURL, &rawInterviewers, &rawFeedback, &item.Status, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(rawInterviewers, &item.Interviewers)
		_ = json.Unmarshal(rawFeedback, &item.Feedback)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) CreateOffer(ctx context.Context, applicationID, actor uuid.UUID, req OfferRequest, joiningDate *time.Time) (Offer, error) {
	currency := req.Currency
	if currency == "" {
		currency = "INR"
	}
	var item Offer
	err := r.db.QueryRow(ctx, `
		INSERT INTO application_offers (application_id, salary, currency, joining_date, position, letter_url, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, application_id, salary, currency, joining_date, position, coalesce(letter_url, ''), status, created_by, created_at, updated_at
	`, applicationID, req.Salary, currency, joiningDate, req.Position, req.LetterURL, actor).Scan(&item.ID, &item.ApplicationID, &item.Salary, &item.Currency, &item.JoiningDate, &item.Position, &item.LetterURL, &item.Status, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return Offer{}, err
	}
	_, _ = r.UpdateStatus(ctx, applicationID, actor, "offer_sent", "Offer sent.")
	return item, nil
}

func (r *Repository) Offers(ctx context.Context, applicationID uuid.UUID) ([]Offer, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, application_id, salary, currency, joining_date, position, coalesce(letter_url, ''), status, created_by, created_at, updated_at
		FROM application_offers WHERE application_id = $1 ORDER BY created_at DESC
	`, applicationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Offer{}
	for rows.Next() {
		var item Offer
		if err := rows.Scan(&item.ID, &item.ApplicationID, &item.Salary, &item.Currency, &item.JoiningDate, &item.Position, &item.LetterURL, &item.Status, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) Timeline(ctx context.Context, applicationID uuid.UUID) ([]TimelineEvent, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, application_id, actor_user_id, event_type, coalesce(from_status, ''), coalesce(to_status, ''), coalesce(message, ''), metadata, created_at
		FROM application_timeline WHERE application_id = $1 ORDER BY created_at DESC
	`, applicationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []TimelineEvent{}
	for rows.Next() {
		var item TimelineEvent
		var metadata []byte
		if err := rows.Scan(&item.ID, &item.ApplicationID, &item.ActorUserID, &item.EventType, &item.FromStatus, &item.ToStatus, &item.Message, &metadata, &item.CreatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(metadata, &item.Metadata)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) AddTimeline(ctx context.Context, applicationID uuid.UUID, actor *uuid.UUID, eventType, fromStatus, toStatus, message string, metadata map[string]any) error {
	bytes, _ := json.Marshal(metadata)
	_, err := r.db.Exec(ctx, `
		INSERT INTO application_timeline (application_id, actor_user_id, event_type, from_status, to_status, message, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, applicationID, actor, eventType, fromStatus, toStatus, message, bytes)
	return err
}

func (r *Repository) Notifications(ctx context.Context, userID uuid.UUID) ([]Notification, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, channel, audience, title, message, is_read, metadata, created_at
		FROM recruitment_notifications WHERE recipient_user_id = $1 ORDER BY created_at DESC LIMIT 100
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Notification{}
	for rows.Next() {
		var item Notification
		var metadata []byte
		if err := rows.Scan(&item.ID, &item.Channel, &item.Audience, &item.Title, &item.Message, &item.IsRead, &metadata, &item.CreatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(metadata, &item.Metadata)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) NotificationSummary(ctx context.Context, userID uuid.UUID) (NotificationSummary, error) {
	var item NotificationSummary
	err := r.db.QueryRow(ctx, `SELECT count(*) FROM recruitment_notifications WHERE recipient_user_id = $1 AND is_read = false`, userID).Scan(&item.Unread)
	return item, err
}

func (r *Repository) MarkNotificationRead(ctx context.Context, userID, notificationID uuid.UUID) error {
	tag, err := r.db.Exec(ctx, `UPDATE recruitment_notifications SET is_read = true WHERE id = $1 AND recipient_user_id = $2`, notificationID, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return auth.ErrNotFound
	}
	return nil
}

func (r *Repository) MarkAllNotificationsRead(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE recruitment_notifications SET is_read = true WHERE recipient_user_id = $1`, userID)
	return err
}

func (r *Repository) DeleteNotification(ctx context.Context, userID, notificationID uuid.UUID) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM recruitment_notifications WHERE id = $1 AND recipient_user_id = $2`, notificationID, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return auth.ErrNotFound
	}
	return nil
}

func (r *Repository) CreateNotification(ctx context.Context, recipient uuid.UUID, companyID uuid.UUID, applicationID uuid.UUID, channel, audience, title, message string, metadata map[string]any) error {
	bytes, _ := json.Marshal(metadata)
	_, err := r.db.Exec(ctx, `
		INSERT INTO recruitment_notifications (recipient_user_id, company_id, application_id, channel, audience, title, message, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, recipient, companyID, applicationID, channel, audience, title, message, bytes)
	return err
}

func (r *Repository) Analytics(ctx context.Context, companyID uuid.UUID) (Analytics, error) {
	item := Analytics{ByStatus: map[string]int64{}}
	rows, err := r.db.Query(ctx, `SELECT status, count(*) FROM applications WHERE company_id = $1 AND deleted_at IS NULL GROUP BY status`, companyID)
	if err != nil {
		return item, err
	}
	for rows.Next() {
		var status string
		var count int64
		if err := rows.Scan(&status, &count); err != nil {
			rows.Close()
			return item, err
		}
		item.ByStatus[status] = count
		item.TotalApplications += count
	}
	rows.Close()
	err = r.db.QueryRow(ctx, `
		SELECT
			count(*) FILTER (WHERE status IN ('interview_scheduled', 'interview_completed')),
			count(*) FILTER (WHERE status IN ('offer_sent', 'offer_accepted', 'offer_declined')),
			count(*) FILTER (WHERE status = 'hired'),
			coalesce(avg(extract(epoch from (last_activity_at - created_at)) / 86400) FILTER (WHERE status = 'hired'), 0)
		FROM applications WHERE company_id = $1 AND deleted_at IS NULL
	`, companyID).Scan(&item.Interviews, &item.Offers, &item.Hires, &item.TimeToHireDays)
	if item.TotalApplications > 0 {
		item.ConversionRate = float64(item.Hires) / float64(item.TotalApplications)
	}
	return item, err
}

func (r *Repository) CandidateSnapshot(ctx context.Context, userID uuid.UUID) (map[string]any, map[string]any, error) {
	profile := map[string]any{}
	resume := map[string]any{}
	var profileBytes []byte
	err := r.db.QueryRow(ctx, `
		SELECT jsonb_build_object(
			'id', cp.id, 'first_name', cp.first_name, 'last_name', cp.last_name, 'title', cp.title,
			'bio', cp.bio, 'phone', cp.phone, 'location', cp.location, 'resume_url', cp.resume_url,
			'skills', coalesce((SELECT jsonb_agg(jsonb_build_object('name', name, 'level', level, 'years_experience', years_experience)) FROM candidate_skills WHERE candidate_profile_id = cp.id), '[]'::jsonb),
			'education', coalesce((SELECT jsonb_agg(to_jsonb(e)) FROM candidate_education e WHERE e.candidate_profile_id = cp.id), '[]'::jsonb),
			'experience', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM candidate_experiences x WHERE x.candidate_profile_id = cp.id), '[]'::jsonb)
		)
		FROM candidate_profiles cp WHERE cp.user_id = $1 AND cp.deleted_at IS NULL
	`, userID).Scan(&profileBytes)
	if errors.Is(err, pgx.ErrNoRows) {
		return profile, resume, auth.ErrNotFound
	}
	if err != nil {
		return profile, resume, err
	}
	_ = json.Unmarshal(profileBytes, &profile)
	if url, ok := profile["resume_url"].(string); ok {
		resume["resume_url"] = url
	}
	return profile, resume, nil
}

func (r *Repository) IsCompanyMember(ctx context.Context, companyID, userID uuid.UUID) (bool, string, error) {
	var role string
	err := r.db.QueryRow(ctx, `SELECT role FROM company_users WHERE company_id = $1 AND user_id = $2`, companyID, userID).Scan(&role)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, "", nil
	}
	return err == nil, role, err
}

func (r *Repository) TrackJobApplication(ctx context.Context, jobID, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `INSERT INTO job_analytics (job_id, event_type, actor_user_id, metadata) VALUES ($1, 'application', $2, '{}'::jsonb)`, jobID, userID)
	return err
}

type jobInfo struct {
	CompanyID uuid.UUID
}

func (r *Repository) jobInfo(ctx context.Context, jobID uuid.UUID) (jobInfo, error) {
	var item jobInfo
	err := r.db.QueryRow(ctx, `SELECT company_id FROM jobs WHERE id = $1 AND status = 'published' AND deleted_at IS NULL`, jobID).Scan(&item.CompanyID)
	if errors.Is(err, pgx.ErrNoRows) {
		return item, auth.ErrNotFound
	}
	return item, err
}

func applicationSelect() string {
	return `SELECT a.id, a.candidate_user_id, a.candidate_profile_id, coalesce(cp.first_name || ' ' || cp.last_name, ''), u.email,
		a.job_id, j.title, j.slug, a.company_id, c.name, a.resume_snapshot, a.profile_snapshot,
		coalesce(a.cover_letter, ''), coalesce(a.expected_salary, 0), coalesce(a.notice_period, ''), a.source,
		a.status, coalesce(a.rating, 0), a.tags, a.last_activity_at, a.created_at, a.updated_at
		FROM applications a
		JOIN users u ON u.id = a.candidate_user_id
		JOIN jobs j ON j.id = a.job_id
		JOIN companies c ON c.id = a.company_id
		LEFT JOIN candidate_profiles cp ON cp.id = a.candidate_profile_id`
}

func scanApplications(rows pgx.Rows) ([]Application, error) {
	defer rows.Close()
	items := []Application{}
	for rows.Next() {
		var item Application
		var resume, profile, tags []byte
		if err := rows.Scan(&item.ID, &item.CandidateUserID, &item.CandidateProfileID, &item.CandidateName, &item.CandidateEmail,
			&item.JobID, &item.JobTitle, &item.JobSlug, &item.CompanyID, &item.CompanyName, &resume, &profile,
			&item.CoverLetter, &item.ExpectedSalary, &item.NoticePeriod, &item.Source, &item.Status, &item.Rating, &tags,
			&item.LastActivityAt, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(resume, &item.ResumeSnapshot)
		_ = json.Unmarshal(profile, &item.ProfileSnapshot)
		_ = json.Unmarshal(tags, &item.Tags)
		items = append(items, item)
	}
	return items, rows.Err()
}

func parseDate(value string) *time.Time {
	if value == "" {
		return nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil
	}
	return &parsed
}
