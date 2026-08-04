package job

import (
	"strings"
	"testing"

	"careeros/api/internal/config"
)

func TestSlugifyBuildsReadableUniqueSlug(t *testing.T) {
	slug := slugify("Senior Go Engineer, Platform")
	if !strings.HasPrefix(slug, "senior-go-engineer-platform-") {
		t.Fatalf("unexpected slug: %s", slug)
	}
}

func TestBuildSEOCreatesGoogleJobPostingShape(t *testing.T) {
	service := NewService(nil, config.Config{})
	seo := service.buildSEO(UpsertRequest{
		Title:            "Backend Engineer",
		FullDescription:  "Build APIs for Jobs View.",
		ShortDescription: "Build APIs.",
		JobTypeSlug:      "full-time",
		WorkMode:         "remote",
		Currency:         "INR",
		Country:          "India",
		City:             "Bengaluru",
		State:            "Karnataka",
	}, "backend-engineer-123", "Jobs View")

	if seo.JSONLD["@type"] != "JobPosting" {
		t.Fatalf("expected JobPosting JSON-LD, got %+v", seo.JSONLD)
	}
	if seo.CanonicalURL == "" || seo.MetaTitle == "" || seo.MetaDescription == "" {
		t.Fatalf("expected complete SEO metadata: %+v", seo)
	}
}
