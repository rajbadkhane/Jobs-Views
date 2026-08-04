package application

import (
	"time"

	"github.com/google/uuid"
)

type Application struct {
	ID                 uuid.UUID      `json:"id"`
	CandidateUserID    uuid.UUID      `json:"candidate_user_id"`
	CandidateProfileID *uuid.UUID     `json:"candidate_profile_id,omitempty"`
	CandidateName      string         `json:"candidate_name,omitempty"`
	CandidateEmail     string         `json:"candidate_email,omitempty"`
	JobID              uuid.UUID      `json:"job_id"`
	JobTitle           string         `json:"job_title,omitempty"`
	JobSlug            string         `json:"job_slug,omitempty"`
	CompanyID          uuid.UUID      `json:"company_id"`
	CompanyName        string         `json:"company_name,omitempty"`
	ResumeSnapshot     map[string]any `json:"resume_snapshot"`
	ProfileSnapshot    map[string]any `json:"profile_snapshot"`
	CoverLetter        string         `json:"cover_letter"`
	ExpectedSalary     float64        `json:"expected_salary"`
	NoticePeriod       string         `json:"notice_period"`
	Source             string         `json:"source"`
	Status             string         `json:"status"`
	Rating             int            `json:"rating"`
	Tags               []string       `json:"tags"`
	LastActivityAt     time.Time      `json:"last_activity_at"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
}

type ApplyRequest struct {
	JobID          uuid.UUID `json:"job_id" validate:"required"`
	CoverLetter    string    `json:"cover_letter"`
	ExpectedSalary float64   `json:"expected_salary"`
	NoticePeriod   string    `json:"notice_period"`
	Source         string    `json:"source"`
}

type StatusRequest struct {
	Status  string `json:"status" validate:"required,oneof=applied viewed screening shortlisted assessment interview_scheduled interview_completed offer_sent offer_accepted offer_declined rejected withdrawn hired"`
	Message string `json:"message"`
}

type BulkStatusRequest struct {
	ApplicationIDs []uuid.UUID `json:"application_ids" validate:"required"`
	Status         string      `json:"status" validate:"required,oneof=viewed screening shortlisted assessment interview_scheduled interview_completed offer_sent offer_accepted offer_declined rejected withdrawn hired"`
	Message        string      `json:"message"`
}

type InboxParams struct {
	CompanyID uuid.UUID
	JobID     *uuid.UUID
	Status    string
	Keyword   string
	Sort      string
	Limit     int
	Page      int
}

type CandidateParams struct {
	Status string
	Limit  int
	Page   int
}

type SavedJob struct {
	JobID      uuid.UUID `json:"job_id"`
	Title      string    `json:"title"`
	Slug       string    `json:"slug"`
	Company    string    `json:"company"`
	Notes      string    `json:"notes"`
	Collection string    `json:"collection"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type SaveJobRequest struct {
	JobID      uuid.UUID `json:"job_id" validate:"required"`
	Notes      string    `json:"notes"`
	Collection string    `json:"collection"`
}

type NoteRequest struct {
	Note       string   `json:"note" validate:"required"`
	IsInternal bool     `json:"is_internal"`
	Rating     int      `json:"rating"`
	Tags       []string `json:"tags"`
}

type Note struct {
	ID            uuid.UUID `json:"id"`
	ApplicationID uuid.UUID `json:"application_id"`
	AuthorUserID  uuid.UUID `json:"author_user_id"`
	Note          string    `json:"note"`
	IsInternal    bool      `json:"is_internal"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type InterviewRequest struct {
	Round        string         `json:"round" validate:"required"`
	ScheduledAt  string         `json:"scheduled_at" validate:"required"`
	Mode         string         `json:"mode" validate:"required,oneof=online offline"`
	Location     string         `json:"location"`
	MeetingURL   string         `json:"meeting_url"`
	Interviewers []string       `json:"interviewers"`
	Feedback     map[string]any `json:"feedback"`
}

type Interview struct {
	ID            uuid.UUID      `json:"id"`
	ApplicationID uuid.UUID      `json:"application_id"`
	Round         string         `json:"round"`
	ScheduledAt   time.Time      `json:"scheduled_at"`
	Mode          string         `json:"mode"`
	Location      string         `json:"location"`
	MeetingURL    string         `json:"meeting_url"`
	Interviewers  []string       `json:"interviewers"`
	Feedback      map[string]any `json:"feedback"`
	Status        string         `json:"status"`
	CreatedBy     *uuid.UUID     `json:"created_by,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type OfferRequest struct {
	Salary      float64 `json:"salary" validate:"required"`
	Currency    string  `json:"currency"`
	JoiningDate string  `json:"joining_date"`
	Position    string  `json:"position" validate:"required"`
	LetterURL   string  `json:"letter_url"`
}

type Offer struct {
	ID            uuid.UUID  `json:"id"`
	ApplicationID uuid.UUID  `json:"application_id"`
	Salary        float64    `json:"salary"`
	Currency      string     `json:"currency"`
	JoiningDate   *time.Time `json:"joining_date,omitempty"`
	Position      string     `json:"position"`
	LetterURL     string     `json:"letter_url"`
	Status        string     `json:"status"`
	CreatedBy     *uuid.UUID `json:"created_by,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type TimelineEvent struct {
	ID            uuid.UUID      `json:"id"`
	ApplicationID uuid.UUID      `json:"application_id"`
	ActorUserID   *uuid.UUID     `json:"actor_user_id,omitempty"`
	EventType     string         `json:"event_type"`
	FromStatus    string         `json:"from_status"`
	ToStatus      string         `json:"to_status"`
	Message       string         `json:"message"`
	Metadata      map[string]any `json:"metadata"`
	CreatedAt     time.Time      `json:"created_at"`
}

type Notification struct {
	ID        uuid.UUID      `json:"id"`
	Channel   string         `json:"channel"`
	Audience  string         `json:"audience"`
	Title     string         `json:"title"`
	Message   string         `json:"message"`
	IsRead    bool           `json:"is_read"`
	Metadata  map[string]any `json:"metadata"`
	CreatedAt time.Time      `json:"created_at"`
}

type NotificationSummary struct {
	Unread int64 `json:"unread"`
}

type Analytics struct {
	TotalApplications int64            `json:"total_applications"`
	ByStatus          map[string]int64 `json:"by_status"`
	Interviews        int64            `json:"interviews"`
	Offers            int64            `json:"offers"`
	Hires             int64            `json:"hires"`
	ConversionRate    float64          `json:"conversion_rate"`
	TimeToHireDays    float64          `json:"time_to_hire_days"`
}
