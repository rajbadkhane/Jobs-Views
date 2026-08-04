package application

import "testing"

func TestNormalizePageBoundsLimitAndPage(t *testing.T) {
	limit, page := normalizePage(500, -2)
	if limit != 20 || page != 1 {
		t.Fatalf("unexpected pagination defaults: limit=%d page=%d", limit, page)
	}
}

func TestParseDateHandlesEmptyAndValidDate(t *testing.T) {
	if parseDate("") != nil {
		t.Fatal("expected nil date for empty input")
	}
	if parseDate("2026-07-01") == nil {
		t.Fatal("expected parsed date")
	}
}
