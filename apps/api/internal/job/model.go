package job

import (
	"time"

	"github.com/google/uuid"
)

type Job struct {
	ID               uuid.UUID      `json:"id"`
	CompanyID        uuid.UUID      `json:"company_id"`
	CompanyName      string         `json:"company_name,omitempty"`
	CompanySlug      string         `json:"company_slug,omitempty"`
	CompanyLogoURL   string         `json:"company_logo_url,omitempty"`
	BranchID         *uuid.UUID     `json:"branch_id,omitempty"`
	CategoryID       *uuid.UUID     `json:"category_id,omitempty"`
	SubcategoryID    *uuid.UUID     `json:"subcategory_id,omitempty"`
	IndustryID       *uuid.UUID     `json:"industry_id,omitempty"`
	FunctionID       *uuid.UUID     `json:"function_id,omitempty"`
	DepartmentID     *uuid.UUID     `json:"department_id,omitempty"`
	JobTypeID        int            `json:"job_type_id"`
	JobType          string         `json:"job_type,omitempty"`
	Title            string         `json:"title"`
	Slug             string         `json:"slug"`
	ShortDescription string         `json:"short_description"`
	FullDescription  string         `json:"full_description"`
	Responsibilities []string       `json:"responsibilities"`
	Requirements     []string       `json:"requirements"`
	Qualifications   []string       `json:"qualifications"`
	Benefits         []string       `json:"benefits"`
	SalaryMin        float64        `json:"salary_min"`
	SalaryMax        float64        `json:"salary_max"`
	Currency         string         `json:"currency"`
	SalaryPeriod     string         `json:"salary_period"`
	SalaryBasis      string         `json:"salary_basis"`
	ExperienceMin    float64        `json:"experience_min"`
	ExperienceMax    float64        `json:"experience_max"`
	Education        string         `json:"education"`
	Openings         int            `json:"openings"`
	ExpiryDate       *time.Time     `json:"expiry_date,omitempty"`
	WorkMode         string         `json:"work_mode"`
	Country          string         `json:"country"`
	State            string         `json:"state"`
	City             string         `json:"city"`
	Latitude         float64        `json:"latitude"`
	Longitude        float64        `json:"longitude"`
	RadiusKM         float64        `json:"radius_km"`
	Status           string         `json:"status"`
	Visibility       string         `json:"visibility"`
	IsFeatured       bool           `json:"is_featured"`
	IsUrgent         bool           `json:"is_urgent"`
	IsSponsored      bool           `json:"is_sponsored"`
	CanonicalURL     string         `json:"canonical_url"`
	MetaTitle        string         `json:"meta_title"`
	MetaDescription  string         `json:"meta_description"`
	OpenGraph        map[string]any `json:"open_graph"`
	JSONLD           map[string]any `json:"json_ld"`
	Skills           []JobSkill     `json:"skills,omitempty"`
	PublishedAt      *time.Time     `json:"published_at,omitempty"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
}

type JobSkill struct {
	ID              uuid.UUID `json:"id"`
	Name            string    `json:"name"`
	RequirementType string    `json:"requirement_type"`
	Level           string    `json:"level"`
	YearsExperience float64   `json:"years_experience"`
}

type UpsertRequest struct {
	CompanyID        uuid.UUID      `json:"company_id" validate:"required"`
	BranchID         *uuid.UUID     `json:"branch_id"`
	CategoryID       *uuid.UUID     `json:"category_id"`
	SubcategoryID    *uuid.UUID     `json:"subcategory_id"`
	IndustryID       *uuid.UUID     `json:"industry_id"`
	FunctionID       *uuid.UUID     `json:"function_id"`
	DepartmentID     *uuid.UUID     `json:"department_id"`
	JobTypeSlug      string         `json:"job_type" validate:"required"`
	Title            string         `json:"title" validate:"required"`
	ShortDescription string         `json:"short_description"`
	FullDescription  string         `json:"full_description" validate:"required"`
	Responsibilities []string       `json:"responsibilities"`
	Requirements     []string       `json:"requirements"`
	Qualifications   []string       `json:"qualifications"`
	Benefits         []string       `json:"benefits"`
	SalaryMin        float64        `json:"salary_min"`
	SalaryMax        float64        `json:"salary_max"`
	Currency         string         `json:"currency"`
	SalaryPeriod     string         `json:"salary_period" validate:"omitempty,oneof=hourly daily monthly annual"`
	SalaryBasis      string         `json:"salary_basis" validate:"omitempty,oneof=gross take_home ctc"`
	ExperienceMin    float64        `json:"experience_min"`
	ExperienceMax    float64        `json:"experience_max"`
	Education        string         `json:"education"`
	Openings         int            `json:"openings"`
	ExpiryDate       string         `json:"expiry_date"`
	WorkMode         string         `json:"work_mode" validate:"required,oneof=remote hybrid on_site"`
	Country          string         `json:"country"`
	State            string         `json:"state"`
	City             string         `json:"city"`
	Latitude         float64        `json:"latitude"`
	Longitude        float64        `json:"longitude"`
	RadiusKM         float64        `json:"radius_km"`
	Visibility       string         `json:"visibility" validate:"required,oneof=public private invite_only internal"`
	IsFeatured       bool           `json:"is_featured"`
	IsUrgent         bool           `json:"is_urgent"`
	Skills           []SkillRequest `json:"skills"`
}

type SkillRequest struct {
	Name            string  `json:"name" validate:"required"`
	RequirementType string  `json:"requirement_type" validate:"required,oneof=required preferred"`
	Level           string  `json:"level" validate:"required,oneof=beginner intermediate advanced expert"`
	YearsExperience float64 `json:"years_experience"`
}

type TaxonomyRequest struct {
	ParentID     *uuid.UUID `json:"parent_id"`
	TaxonomyType string     `json:"taxonomy_type" validate:"required,oneof=category subcategory industry function department"`
	Name         string     `json:"name" validate:"required"`
	Description  string     `json:"description"`
}

type Taxonomy struct {
	ID           uuid.UUID  `json:"id"`
	ParentID     *uuid.UUID `json:"parent_id,omitempty"`
	TaxonomyType string     `json:"taxonomy_type"`
	Name         string     `json:"name"`
	Slug         string     `json:"slug"`
	Description  string     `json:"description"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type StatusRequest struct {
	Status string `json:"status" validate:"required,oneof=draft review published paused expired closed archived rejected"`
}

type BulkActionRequest struct {
	JobIDs []uuid.UUID `json:"job_ids" validate:"required"`
	Action string      `json:"action" validate:"required,oneof=publish pause delete"`
}

type SearchParams struct {
	Keyword    string
	Category   string
	Company    string
	Industry   string
	City       string
	State      string
	Country    string
	SalaryMin  float64
	Experience float64
	JobType    string
	WorkMode   string
	PostedDays int
	Sort       string
	Limit      int
	Page       int
}

type Analytics struct {
	Views          int64   `json:"views"`
	UniqueVisitors int64   `json:"unique_visitors"`
	Saves          int64   `json:"saves"`
	Shares         int64   `json:"shares"`
	Applications   int64   `json:"applications"`
	ConversionRate float64 `json:"conversion_rate"`
}

type SEO struct {
	CanonicalURL    string         `json:"canonical_url"`
	MetaTitle       string         `json:"meta_title"`
	MetaDescription string         `json:"meta_description"`
	OpenGraph       map[string]any `json:"open_graph"`
	JSONLD          map[string]any `json:"json_ld"`
}
