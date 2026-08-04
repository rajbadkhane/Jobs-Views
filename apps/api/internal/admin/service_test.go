package admin

import "testing"

func TestNormalizePageBoundsLimitAndPage(t *testing.T) {
	limit, page := normalizePage(500, 0)

	if limit != 20 {
		t.Fatalf("expected default limit 20, got %d", limit)
	}
	if page != 1 {
		t.Fatalf("expected default page 1, got %d", page)
	}
}

func TestRandomTokenReturnsHexEncodedBytes(t *testing.T) {
	token, err := randomToken(16)
	if err != nil {
		t.Fatalf("expected token, got error: %v", err)
	}
	if len(token) != 32 {
		t.Fatalf("expected 32 hex characters, got %d", len(token))
	}
}
