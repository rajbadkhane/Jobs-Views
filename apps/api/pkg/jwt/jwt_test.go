package jwt

import (
	"testing"
	"time"

	"careeros/api/internal/config"
	"github.com/google/uuid"
)

func TestGenerateAndParseAccessToken(t *testing.T) {
	manager := NewManager(config.JWTConfig{
		AccessSecret:  "access_secret_with_enough_length",
		RefreshSecret: "refresh_secret_with_enough_length",
		AccessTTL:     time.Minute,
		RefreshTTL:    time.Hour,
		Issuer:        "test",
	})
	userID := uuid.New()

	token, err := manager.GenerateAccess(userID, "user@example.com", "EMPLOYER", []string{"job:create"})
	if err != nil {
		t.Fatalf("GenerateAccess returned error: %v", err)
	}

	claims, err := manager.ParseAccess(token)
	if err != nil {
		t.Fatalf("ParseAccess returned error: %v", err)
	}
	if claims.UserID != userID || claims.Role != "EMPLOYER" {
		t.Fatalf("unexpected claims: %+v", claims)
	}
}
