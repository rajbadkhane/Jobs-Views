package auth

import (
	"context"
	"testing"
	"time"

	"careeros/api/internal/config"
	jwtpkg "careeros/api/pkg/jwt"
)

func testJWTManager() *jwtpkg.Manager {
	return jwtpkg.NewManager(config.JWTConfig{
		AccessSecret:  "access_secret_with_enough_length",
		RefreshSecret: "refresh_secret_with_enough_length",
		AccessTTL:     time.Minute,
		RefreshTTL:    time.Hour,
		Issuer:        "test",
	})
}

func TestLoginHardcodedAdminSucceedsWithoutRepository(t *testing.T) {
	service := NewService(nil, testJWTManager(), nil)

	result, err := service.Login(context.Background(), LoginRequest{
		Email:    "admin.one@jobsview.local",
		Password: "Admin@One2026!",
	}, "test-agent", "127.0.0.1")
	if err != nil {
		t.Fatalf("Login returned error: %v", err)
	}
	if result.User.Role != "SUPER_ADMIN" || !result.User.IsVerified || !result.Stateless {
		t.Fatalf("unexpected hardcoded admin result: %+v", result)
	}
	if result.AccessToken == "" {
		t.Fatal("expected access token")
	}
	claims, err := service.jwt.ParseAccess(result.AccessToken)
	if err != nil {
		t.Fatalf("ParseAccess returned error: %v", err)
	}
	if claims.Email != "admin.one@jobsview.local" || claims.Role != "SUPER_ADMIN" {
		t.Fatalf("unexpected claims: %+v", claims)
	}
}

func TestLoginHardcodedAdminRejectsWrongPassword(t *testing.T) {
	service := NewService(nil, testJWTManager(), nil)

	if _, err := service.Login(context.Background(), LoginRequest{
		Email:    "admin.one@jobsview.local",
		Password: "wrong-password",
	}, "test-agent", "127.0.0.1"); err == nil {
		t.Fatal("expected invalid credentials error")
	}
}
