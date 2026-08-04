package salary

import "time"

type Option struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type Options struct {
	Roles     []Option `json:"roles"`
	Locations []Option `json:"locations"`
	WorkModes []Option `json:"work_modes"`
	Periods   []Option `json:"periods"`
}

type EstimateRequest struct {
	Role       string   `json:"role" validate:"required"`
	City       string   `json:"city" validate:"required"`
	Experience float64  `json:"experience" validate:"min=0,max=50"`
	WorkMode   string   `json:"work_mode" validate:"omitempty,oneof=remote hybrid on_site"`
	Education  string   `json:"education"`
	Shift      string   `json:"shift"`
	Skills     []string `json:"skills"`
	Display    string   `json:"display" validate:"omitempty,oneof=monthly annual"`
}

type Source struct {
	Name         string     `json:"name"`
	Publisher    string     `json:"publisher"`
	URL          string     `json:"url"`
	PublishedOn  *time.Time `json:"published_on,omitempty"`
	Methodology  string     `json:"methodology"`
	LastReviewed *time.Time `json:"last_reviewed_at,omitempty"`
}

type Benchmark struct {
	Role             string    `json:"role"`
	RoleSlug         string    `json:"role_slug"`
	Geography        string    `json:"geography"`
	GeographyLevel   string    `json:"geography_level"`
	P25Annual        *float64  `json:"p25_annual,omitempty"`
	MedianAnnual     *float64  `json:"median_annual,omitempty"`
	P75Annual        *float64  `json:"p75_annual,omitempty"`
	MeanAnnual       *float64  `json:"mean_annual,omitempty"`
	SampleSize       *int      `json:"sample_size,omitempty"`
	EffectiveDate    time.Time `json:"effective_date"`
	Confidence       string    `json:"confidence"`
	SalaryBasis      string    `json:"salary_basis"`
	Source           Source    `json:"source"`
	ComparableCities []Option  `json:"comparable_cities"`
}

type Estimate struct {
	Available      bool       `json:"available"`
	Message        string     `json:"message"`
	RequestedRole  string     `json:"requested_role"`
	RequestedCity  string     `json:"requested_city"`
	Display        string     `json:"display"`
	Benchmark      *Benchmark `json:"benchmark,omitempty"`
	Stale          bool       `json:"stale"`
	MethodologyURL string     `json:"methodology_url"`
}

type ImportRow struct {
	RoleSlug       string   `json:"role_slug" validate:"required"`
	Geography      string   `json:"geography" validate:"required"`
	GeographyLevel string   `json:"geography_level" validate:"required,oneof=city state remote national"`
	ExperienceMin  float64  `json:"experience_min" validate:"min=0,max=50"`
	ExperienceMax  *float64 `json:"experience_max"`
	WorkMode       string   `json:"work_mode"`
	Education      string   `json:"education"`
	Shift          string   `json:"shift"`
	SalaryBasis    string   `json:"salary_basis" validate:"required,oneof=gross take_home ctc"`
	P25Annual      *float64 `json:"p25_annual"`
	MedianAnnual   *float64 `json:"median_annual"`
	P75Annual      *float64 `json:"p75_annual"`
	MeanAnnual     *float64 `json:"mean_annual"`
	SampleSize     *int     `json:"sample_size"`
	EffectiveDate  string   `json:"effective_date" validate:"required"`
}

type ImportPreviewRequest struct {
	SourceID string      `json:"source_id" validate:"required,uuid"`
	FileName string      `json:"file_name"`
	Rows     []ImportRow `json:"rows" validate:"required,min=1,max=5000,dive"`
}

type ImportPreview struct {
	ID            string           `json:"id"`
	Status        string           `json:"status"`
	RowCount      int              `json:"row_count"`
	AcceptedCount int              `json:"accepted_count"`
	RejectedCount int              `json:"rejected_count"`
	Errors        map[int][]string `json:"errors"`
}

type SourceRecord struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Publisher   string     `json:"publisher"`
	URL         string     `json:"source_url"`
	SourceType  string     `json:"source_type"`
	PublishedOn *time.Time `json:"published_on,omitempty"`
	IsActive    bool       `json:"is_active"`
}
