package company

import (
	"time"

	"github.com/google/uuid"
)

type Company struct {
	ID                uuid.UUID      `json:"id"`
	Name              string         `json:"name"`
	Slug              string         `json:"slug"`
	Website           string         `json:"website"`
	LogoURL           string         `json:"logo_url"`
	BannerURL         string         `json:"banner_url"`
	Description       string         `json:"description"`
	About             string         `json:"about"`
	Mission           string         `json:"mission"`
	Vision            string         `json:"vision"`
	Culture           string         `json:"culture"`
	SizeRange         string         `json:"size_range"`
	Industry          string         `json:"industry"`
	FoundedYear       int            `json:"founded_year"`
	Headquarters      string         `json:"headquarters"`
	GSTNumber         string         `json:"gst_number,omitempty"`
	CINNumber         string         `json:"cin_number,omitempty"`
	SocialLinks       map[string]any `json:"social_links"`
	Benefits          []string       `json:"benefits"`
	Gallery           []string       `json:"gallery"`
	Status            string         `json:"status"`
	IsVerified        bool           `json:"is_verified"`
	VerifiedBadge     bool           `json:"verified_badge"`
	VerificationNotes string         `json:"verification_notes,omitempty"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
}

type RegisterRequest struct {
	Name         string `json:"name" validate:"required"`
	Website      string `json:"website"`
	Industry     string `json:"industry"`
	SizeRange    string `json:"size_range"`
	Headquarters string `json:"headquarters"`
	GSTNumber    string `json:"gst_number"`
	CINNumber    string `json:"cin_number"`
}

type UpdateRequest struct {
	Name         string         `json:"name"`
	Website      string         `json:"website"`
	LogoURL      string         `json:"logo_url"`
	BannerURL    string         `json:"banner_url"`
	Description  string         `json:"description"`
	About        string         `json:"about"`
	Mission      string         `json:"mission"`
	Vision       string         `json:"vision"`
	Culture      string         `json:"culture"`
	SizeRange    string         `json:"size_range"`
	Industry     string         `json:"industry"`
	FoundedYear  int            `json:"founded_year"`
	Headquarters string         `json:"headquarters"`
	GSTNumber    string         `json:"gst_number"`
	CINNumber    string         `json:"cin_number"`
	SocialLinks  map[string]any `json:"social_links"`
	Benefits     []string       `json:"benefits"`
	Gallery      []string       `json:"gallery"`
}

type StatusRequest struct {
	Status string `json:"status" validate:"required,oneof=pending approved rejected suspended"`
	Notes  string `json:"notes"`
}

type VerificationRequest struct {
	GSTStatus         string `json:"gst_status"`
	CINStatus         string `json:"cin_status"`
	WebsiteStatus     string `json:"website_status"`
	DomainEmailStatus string `json:"domain_email_status"`
	ManualStatus      string `json:"manual_status" validate:"required,oneof=pending approved rejected"`
	Notes             string `json:"notes"`
}

type TeamMember struct {
	CompanyID   uuid.UUID  `json:"company_id"`
	UserID      uuid.UUID  `json:"user_id"`
	Email       string     `json:"email"`
	Role        string     `json:"role"`
	Permissions []string   `json:"permissions"`
	AcceptedAt  *time.Time `json:"accepted_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type InviteRequest struct {
	Email       string   `json:"email" validate:"required,email"`
	Role        string   `json:"role" validate:"required,oneof=owner hr recruiter manager"`
	Permissions []string `json:"permissions"`
}

type InviteResult struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Token     string    `json:"token,omitempty"`
	ExpiresAt time.Time `json:"expires_at"`
}

type BranchRequest struct {
	Name           string `json:"name" validate:"required"`
	Address        string `json:"address" validate:"required"`
	Location       string `json:"location"`
	City           string `json:"city"`
	State          string `json:"state"`
	Country        string `json:"country"`
	GoogleMapsURL  string `json:"google_maps_url"`
	IsHeadquarters bool   `json:"is_headquarters"`
}

type Branch struct {
	ID             uuid.UUID `json:"id"`
	CompanyID      uuid.UUID `json:"company_id"`
	Name           string    `json:"name"`
	Address        string    `json:"address"`
	Location       string    `json:"location"`
	City           string    `json:"city"`
	State          string    `json:"state"`
	Country        string    `json:"country"`
	GoogleMapsURL  string    `json:"google_maps_url"`
	IsHeadquarters bool      `json:"is_headquarters"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type DepartmentRequest struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
}

type Department struct {
	ID          uuid.UUID `json:"id"`
	CompanyID   uuid.UUID `json:"company_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Settings struct {
	Brand         map[string]any `json:"brand"`
	Privacy       map[string]any `json:"privacy"`
	Notifications map[string]any `json:"notifications"`
	Security      map[string]any `json:"security"`
	Billing       map[string]any `json:"billing"`
}

type MediaResult struct {
	ID        uuid.UUID      `json:"id"`
	MediaType string         `json:"media_type"`
	FileName  string         `json:"file_name"`
	FileURL   string         `json:"file_url"`
	MimeType  string         `json:"mime_type"`
	FileSize  int64          `json:"file_size"`
	Metadata  map[string]any `json:"metadata"`
	CreatedAt time.Time      `json:"created_at"`
}

type DashboardStats struct {
	Views          int64 `json:"views"`
	Followers      int64 `json:"followers"`
	OpenJobs       int64 `json:"open_jobs"`
	Applications   int64 `json:"applications"`
	CandidateViews int64 `json:"candidate_views"`
}
