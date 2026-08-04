package admin

import (
	"time"

	"github.com/google/uuid"
)

type Dashboard struct {
	TotalUsers           int64   `json:"total_users"`
	ActiveUsers          int64   `json:"active_users"`
	Companies            int64   `json:"companies"`
	ActiveJobs           int64   `json:"active_jobs"`
	Applications         int64   `json:"applications"`
	Revenue              float64 `json:"revenue"`
	PendingVerifications int64   `json:"pending_verifications"`
	Reports              int64   `json:"reports"`
}

type TrendPoint struct {
	Name  string  `json:"name"`
	Value float64 `json:"value"`
}

type DashboardTrends struct {
	Users             []TrendPoint `json:"users"`
	Jobs              []TrendPoint `json:"jobs"`
	Applications      []TrendPoint `json:"applications"`
	Revenue           []TrendPoint `json:"revenue"`
	ApplicationFunnel []TrendPoint `json:"application_funnel"`
}

type ListParams struct {
	Query    string
	Status   string
	Role     string
	Company  string
	Location string
	JobType  string
	Limit    int
	Page     int
}

type PagedResult[T any] struct {
	Items []T   `json:"items"`
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

type AdminCompany struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Slug          string    `json:"slug"`
	Website       string    `json:"website"`
	Industry      string    `json:"industry"`
	Headquarters  string    `json:"headquarters"`
	SizeRange     string    `json:"size_range"`
	Status        string    `json:"status"`
	IsVerified    bool      `json:"is_verified"`
	VerifiedBadge bool      `json:"verified_badge"`
	GSTNumber     string    `json:"gst_number"`
	CINNumber     string    `json:"cin_number"`
	About         string    `json:"about"`
	LogoURL       string    `json:"logo_url"`
	Jobs          int64     `json:"open_jobs"`
	TeamMembers   int64     `json:"team_members"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type AdminJob struct {
	ID               uuid.UUID  `json:"id"`
	CompanyID        uuid.UUID  `json:"company_id"`
	CompanyName      string     `json:"company_name"`
	Title            string     `json:"title"`
	Slug             string     `json:"slug"`
	ShortDescription string     `json:"short_description"`
	FullDescription  string     `json:"full_description"`
	Requirements     []string   `json:"requirements"`
	Benefits         []string   `json:"benefits"`
	SalaryMin        float64    `json:"salary_min"`
	SalaryMax        float64    `json:"salary_max"`
	Currency         string     `json:"currency"`
	ExperienceMin    float64    `json:"experience_min"`
	ExperienceMax    float64    `json:"experience_max"`
	Openings         int        `json:"openings"`
	WorkMode         string     `json:"work_mode"`
	JobType          string     `json:"job_type"`
	Country          string     `json:"country"`
	State            string     `json:"state"`
	City             string     `json:"city"`
	Status           string     `json:"status"`
	Visibility       string     `json:"visibility"`
	IsFeatured       bool       `json:"is_featured"`
	IsUrgent         bool       `json:"is_urgent"`
	PublishedAt      *time.Time `json:"published_at,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type AdminUser struct {
	ID         uuid.UUID `json:"id"`
	Email      string    `json:"email"`
	Role       string    `json:"role"`
	IsActive   bool      `json:"is_active"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
}

type AssignRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=SUPER_ADMIN ADMIN EMPLOYER JOB_SEEKER"`
}

type ResetPasswordResult struct {
	Token string `json:"token"`
}

type ModerationRequest struct {
	Status string `json:"status" validate:"required"`
	Notes  string `json:"notes"`
}

type JobFlagRequest struct {
	IsFeatured bool `json:"is_featured"`
	IsUrgent   bool `json:"is_urgent"`
}

type QuickPostCompanyRequest struct {
	Name         string `json:"name"`
	Website      string `json:"website"`
	Industry     string `json:"industry"`
	Headquarters string `json:"headquarters"`
	SizeRange    string `json:"size_range"`
}

type QuickPostSkillRequest struct {
	Name            string  `json:"name"`
	RequirementType string  `json:"requirement_type"`
	Level           string  `json:"level"`
	YearsExperience float64 `json:"years_experience"`
}

type QuickPostJobBody struct {
	Title            string                  `json:"title"`
	ShortDescription string                  `json:"short_description"`
	FullDescription  string                  `json:"full_description"`
	SalaryMin        float64                 `json:"salary_min"`
	SalaryMax        float64                 `json:"salary_max"`
	Currency         string                  `json:"currency"`
	SalaryPeriod     string                  `json:"salary_period"`
	SalaryBasis      string                  `json:"salary_basis"`
	City             string                  `json:"city"`
	State            string                  `json:"state"`
	Country          string                  `json:"country"`
	WorkMode         string                  `json:"work_mode"`
	JobType          string                  `json:"job_type"`
	Education        string                  `json:"education"`
	ExperienceMin    float64                 `json:"experience_min"`
	ExperienceMax    float64                 `json:"experience_max"`
	Openings         int                     `json:"openings"`
	Requirements     []string                `json:"requirements"`
	Responsibilities []string                `json:"responsibilities"`
	Benefits         []string                `json:"benefits"`
	Skills           []QuickPostSkillRequest `json:"skills"`
}

type QuickPostJobRequest struct {
	Company QuickPostCompanyRequest `json:"company"`
	Job     QuickPostJobBody        `json:"job"`
	Publish bool                    `json:"publish"`
}

type QuickPostJobResult struct {
	Company   map[string]any `json:"company"`
	Job       map[string]any `json:"job"`
	PublicURL string         `json:"public_url"`
}

type PlanRequest struct {
	Name            string         `json:"name" validate:"required"`
	Slug            string         `json:"slug" validate:"required"`
	Price           float64        `json:"price"`
	Currency        string         `json:"currency"`
	BillingInterval string         `json:"billing_interval"`
	Features        map[string]any `json:"features"`
	IsActive        bool           `json:"is_active"`
}

type Plan struct {
	ID              int            `json:"id"`
	Name            string         `json:"name"`
	Slug            string         `json:"slug"`
	Price           float64        `json:"price"`
	Currency        string         `json:"currency"`
	BillingInterval string         `json:"billing_interval"`
	Features        map[string]any `json:"features"`
	IsActive        bool           `json:"is_active"`
}

type CMSRequest struct {
	ContentType            string           `json:"content_type" validate:"required"`
	Title                  string           `json:"title" validate:"required"`
	Slug                   string           `json:"slug" validate:"required"`
	Summary                string           `json:"summary"`
	Excerpt                string           `json:"excerpt"`
	Body                   string           `json:"body" validate:"required"`
	FeaturedImage          string           `json:"featured_image"`
	Gallery                []string         `json:"gallery"`
	Tags                   []string         `json:"tags"`
	Categories             []string         `json:"categories"`
	Status                 string           `json:"status"`
	Language               string           `json:"language"`
	SEO                    map[string]any   `json:"seo"`
	Schema                 map[string]any   `json:"schema"`
	Blocks                 []map[string]any `json:"blocks"`
	Entities               []map[string]any `json:"entities"`
	Related                []string         `json:"related"`
	AISummary              string           `json:"ai_summary"`
	ShortSummary           string           `json:"short_summary"`
	SuggestedInternalLinks []string         `json:"suggested_internal_links"`
	ScheduledAt            *time.Time       `json:"scheduled_at,omitempty"`
}

type CMSEntry struct {
	ID                     uuid.UUID        `json:"id"`
	ContentType            string           `json:"content_type"`
	Title                  string           `json:"title"`
	Slug                   string           `json:"slug"`
	Summary                string           `json:"summary"`
	Excerpt                string           `json:"excerpt"`
	Body                   string           `json:"body"`
	FeaturedImage          string           `json:"featured_image"`
	Gallery                []string         `json:"gallery"`
	Tags                   []string         `json:"tags"`
	Categories             []string         `json:"categories"`
	Status                 string           `json:"status"`
	Language               string           `json:"language"`
	SEO                    map[string]any   `json:"seo"`
	Schema                 map[string]any   `json:"schema"`
	Blocks                 []map[string]any `json:"blocks"`
	Entities               []map[string]any `json:"entities"`
	Related                []string         `json:"related"`
	AISummary              string           `json:"ai_summary"`
	ShortSummary           string           `json:"short_summary"`
	SuggestedInternalLinks []string         `json:"suggested_internal_links"`
	Version                int              `json:"version"`
	PublishedAt            *time.Time       `json:"published_at,omitempty"`
	CreatedAt              time.Time        `json:"created_at"`
	UpdatedAt              time.Time        `json:"updated_at"`
}

type SettingRequest struct {
	Key      string         `json:"key" validate:"required"`
	Category string         `json:"category" validate:"required"`
	Value    map[string]any `json:"value"`
	IsPublic bool           `json:"is_public"`
}

type AuditLog struct {
	ID           uuid.UUID      `json:"id"`
	ActorUserID  *uuid.UUID     `json:"actor_user_id,omitempty"`
	Action       string         `json:"action"`
	ResourceType string         `json:"resource_type"`
	ResourceID   *uuid.UUID     `json:"resource_id,omitempty"`
	Metadata     map[string]any `json:"metadata"`
	IPAddress    string         `json:"ip_address"`
	UserAgent    string         `json:"user_agent"`
	CreatedAt    time.Time      `json:"created_at"`
}

type ReportRequest struct {
	ReportType string         `json:"report_type" validate:"required,oneof=users companies jobs applications revenue"`
	Format     string         `json:"format" validate:"required,oneof=csv excel pdf"`
	Filters    map[string]any `json:"filters"`
}

type Report struct {
	ID         uuid.UUID      `json:"id"`
	ReportType string         `json:"report_type"`
	Format     string         `json:"format"`
	Filters    map[string]any `json:"filters"`
	Status     string         `json:"status"`
	FileURL    string         `json:"file_url"`
	CreatedAt  time.Time      `json:"created_at"`
}

type TicketRequest struct {
	Email      string         `json:"email"`
	TicketType string         `json:"ticket_type" validate:"required"`
	Subject    string         `json:"subject" validate:"required"`
	Message    string         `json:"message" validate:"required"`
	Priority   string         `json:"priority"`
	Metadata   map[string]any `json:"metadata"`
}

type Ticket struct {
	ID         uuid.UUID      `json:"id"`
	Email      string         `json:"email"`
	TicketType string         `json:"ticket_type"`
	Subject    string         `json:"subject"`
	Message    string         `json:"message"`
	Status     string         `json:"status"`
	Priority   string         `json:"priority"`
	Metadata   map[string]any `json:"metadata"`
	CreatedAt  time.Time      `json:"created_at"`
}

type SEOTemplate struct {
	Key                 string         `json:"key"`
	TitleTemplate       string         `json:"title_template"`
	DescriptionTemplate string         `json:"description_template"`
	SchemaDefaults      map[string]any `json:"schema_defaults"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
}

type SEORequest struct {
	Key                 string         `json:"key"`
	TitleTemplate       string         `json:"title_template"`
	DescriptionTemplate string         `json:"description_template"`
	SchemaDefaults      map[string]any `json:"schema_defaults"`
}

type BusinessDashboard struct {
	MRR                  float64 `json:"mrr"`
	ARR                  float64 `json:"arr"`
	Revenue              float64 `json:"revenue"`
	Collections          float64 `json:"collections"`
	Refunds              float64 `json:"refunds"`
	Invoices             int64   `json:"invoices"`
	Employers            int64   `json:"employers"`
	ActiveSubscriptions  int64   `json:"active_subscriptions"`
	MarketplacePurchases int64   `json:"marketplace_purchases"`
	JobBoosts            int64   `json:"job_boosts"`
	ResumeUnlocks        int64   `json:"resume_unlocks"`
	Leads                int64   `json:"leads"`
	OpenOperations       int64   `json:"open_operations"`
}

type MarketplaceOverview struct {
	Products      []map[string]any `json:"products"`
	Coupons       []map[string]any `json:"coupons"`
	Boosts        []map[string]any `json:"boosts"`
	Operations    []map[string]any `json:"operations"`
	Automation    []map[string]any `json:"automation"`
	Notifications []map[string]any `json:"notifications"`
}
