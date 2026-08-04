package profile

import (
	"time"

	"github.com/google/uuid"
)

type CandidateProfile struct {
	ID              uuid.UUID `json:"id"`
	UserID          uuid.UUID `json:"user_id"`
	FirstName       string    `json:"first_name"`
	LastName        string    `json:"last_name"`
	Title           string    `json:"title"`
	Headline        string    `json:"headline"`
	Bio             string    `json:"bio"`
	Phone           string    `json:"phone"`
	Location        string    `json:"location"`
	Availability    string    `json:"availability"`
	AvatarURL       string    `json:"avatar_url"`
	ResumeURL       string    `json:"resume_url"`
	Visibility      string    `json:"visibility"`
	CompletedScore  int       `json:"completed_score"`
	ProfileStrength string    `json:"profile_strength"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type EmployerProfile struct {
	ID              uuid.UUID  `json:"id"`
	UserID          uuid.UUID  `json:"user_id"`
	CompanyID       *uuid.UUID `json:"company_id,omitempty"`
	FirstName       string     `json:"first_name"`
	LastName        string     `json:"last_name"`
	Title           string     `json:"title"`
	Phone           string     `json:"phone"`
	AvatarURL       string     `json:"avatar_url"`
	CompletedScore  int        `json:"completed_score"`
	ProfileStrength string     `json:"profile_strength"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type AdminProfile struct {
	ID              uuid.UUID `json:"id"`
	UserID          uuid.UUID `json:"user_id"`
	FirstName       string    `json:"first_name"`
	LastName        string    `json:"last_name"`
	Title           string    `json:"title"`
	AvatarURL       string    `json:"avatar_url"`
	CompletedScore  int       `json:"completed_score"`
	ProfileStrength string    `json:"profile_strength"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type Completion struct {
	Score         int      `json:"score"`
	Strength      string   `json:"strength"`
	MissingFields []string `json:"missing_fields"`
}

type CandidateProfileRequest struct {
	FirstName    string `json:"first_name" validate:"required"`
	LastName     string `json:"last_name" validate:"required"`
	Title        string `json:"title"`
	Headline     string `json:"headline"`
	Bio          string `json:"bio"`
	Phone        string `json:"phone"`
	Location     string `json:"location"`
	Availability string `json:"availability"`
	Visibility   string `json:"visibility" validate:"omitempty,oneof=public private"`
}

type EmployerProfileRequest struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Title     string `json:"title"`
	Phone     string `json:"phone"`
}

type AdminProfileRequest struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Title     string `json:"title"`
}

type SkillRequest struct {
	Name            string  `json:"name" validate:"required"`
	Category        string  `json:"category"`
	Level           string  `json:"level" validate:"required,oneof=beginner intermediate advanced expert"`
	YearsExperience float64 `json:"years_experience"`
}

type Skill struct {
	ID              uuid.UUID `json:"id"`
	Name            string    `json:"name"`
	Category        string    `json:"category"`
	Level           string    `json:"level"`
	YearsExperience float64   `json:"years_experience"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type EducationRequest struct {
	Qualification  string `json:"qualification" validate:"required"`
	University     string `json:"university" validate:"required"`
	FieldOfStudy   string `json:"field_of_study"`
	CertificateURL string `json:"certificate_url"`
	StartYear      int    `json:"start_year"`
	EndYear        int    `json:"end_year"`
	Grade          string `json:"grade"`
}

type Education struct {
	ID             uuid.UUID `json:"id"`
	Qualification  string    `json:"qualification"`
	University     string    `json:"university"`
	FieldOfStudy   string    `json:"field_of_study"`
	CertificateURL string    `json:"certificate_url"`
	StartYear      int       `json:"start_year"`
	EndYear        int       `json:"end_year"`
	Grade          string    `json:"grade"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type ExperienceRequest struct {
	CompanyName  string   `json:"company_name" validate:"required"`
	Title        string   `json:"title" validate:"required"`
	Location     string   `json:"location"`
	StartDate    string   `json:"start_date"`
	EndDate      string   `json:"end_date"`
	IsCurrent    bool     `json:"is_current"`
	Description  string   `json:"description"`
	Achievements []string `json:"achievements"`
}

type Experience struct {
	ID           uuid.UUID  `json:"id"`
	CompanyName  string     `json:"company_name"`
	Title        string     `json:"title"`
	Location     string     `json:"location"`
	StartDate    *time.Time `json:"start_date,omitempty"`
	EndDate      *time.Time `json:"end_date,omitempty"`
	IsCurrent    bool       `json:"is_current"`
	Description  string     `json:"description"`
	Achievements []string   `json:"achievements"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type SocialLinks struct {
	LinkedIn  string `json:"linkedin"`
	GitHub    string `json:"github"`
	Portfolio string `json:"portfolio"`
	Website   string `json:"website"`
	Twitter   string `json:"twitter"`
}

type NotificationPreferences struct {
	EmailEnabled     bool `json:"email_enabled"`
	SMSEnabled       bool `json:"sms_enabled"`
	PushEnabled      bool `json:"push_enabled"`
	MarketingEnabled bool `json:"marketing_enabled"`
}

type Settings struct {
	Theme    string `json:"theme" validate:"required,oneof=light dark system"`
	Language string `json:"language" validate:"required"`
	Timezone string `json:"timezone" validate:"required"`
	Privacy  string `json:"privacy" validate:"required,oneof=public private limited"`
}

type UploadResult struct {
	ID              uuid.UUID `json:"id"`
	FileName        string    `json:"file_name"`
	FileURL         string    `json:"file_url"`
	MimeType        string    `json:"mime_type"`
	FileSize        int64     `json:"file_size"`
	VirusScanStatus string    `json:"virus_scan_status"`
}

type ResumeDocumentRequest struct {
	Name         string         `json:"name" validate:"required,min=2"`
	TemplateSlug string         `json:"template_slug" validate:"required,oneof=ats-classic student-fresher frontline-skilled modern-professional technical-portfolio"`
	Content      map[string]any `json:"content"`
	SectionOrder []string       `json:"section_order"`
	Style        map[string]any `json:"style"`
}

type ResumeDocument struct {
	ID           uuid.UUID      `json:"id"`
	Name         string         `json:"name"`
	TemplateSlug string         `json:"template_slug"`
	Content      map[string]any `json:"content"`
	SectionOrder []string       `json:"section_order"`
	Style        map[string]any `json:"style"`
	IsPrimary    bool           `json:"is_primary"`
	LastVersion  int            `json:"last_version"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}

type ResumeDocumentVersion struct {
	Version      int            `json:"version"`
	Name         string         `json:"name"`
	TemplateSlug string         `json:"template_slug"`
	Content      map[string]any `json:"content"`
	SectionOrder []string       `json:"section_order"`
	Style        map[string]any `json:"style"`
	CreatedAt    time.Time      `json:"created_at"`
}
