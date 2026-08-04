package config

import (
	"os"
	"testing"
)

func TestLoadReadsRequiredConfiguration(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/careeros?sslmode=disable")
	t.Setenv("REDIS_URL", "redis://localhost:6379/0")
	t.Setenv("JWT_ACCESS_SECRET", "access_secret_with_enough_length")
	t.Setenv("JWT_REFRESH_SECRET", "refresh_secret_with_enough_length")
	t.Setenv("SERVER_PORT", "9090")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load returned error: %v", err)
	}
	if cfg.Server.Port != "9090" {
		t.Fatalf("expected port 9090, got %s", cfg.Server.Port)
	}
	if cfg.Database.ConnectRetries == 0 {
		t.Fatal("expected database retry defaults")
	}
}

func TestLoadRejectsWeakProductionConfiguration(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/careeros?sslmode=disable")
	t.Setenv("REDIS_URL", "redis://localhost:6379/0")
	t.Setenv("JWT_ACCESS_SECRET", "short")
	t.Setenv("JWT_REFRESH_SECRET", "also_short")
	t.Setenv("CORS_ALLOW_ORIGINS", "*")

	if _, err := Load(); err == nil {
		t.Fatal("expected weak production configuration to fail")
	}
}

func TestLoadAcceptsProductionConfiguration(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/careeros?sslmode=disable")
	t.Setenv("REDIS_URL", "redis://localhost:6379/0")
	t.Setenv("JWT_ACCESS_SECRET", "access_secret_with_at_least_32_characters")
	t.Setenv("JWT_REFRESH_SECRET", "refresh_secret_with_at_least_32_characters")
	t.Setenv("CORS_ALLOW_ORIGINS", "https://jobsview.in")
	t.Setenv("MAIL_PROVIDER", "resend")
	t.Setenv("RESEND_API_KEY", "test_resend_key")
	t.Setenv("STORAGE_PROVIDER", "r2")
	t.Setenv("STORAGE_BASE_URL", "https://assets.jobsview.in")
	t.Setenv("RAZORPAY_KEY_ID", "rzp_test_jobs_view")
	t.Setenv("RAZORPAY_KEY_SECRET", "razorpay_test_secret")
	t.Setenv("RAZORPAY_WEBHOOK_SECRET", "razorpay_test_webhook_secret")

	if _, err := Load(); err != nil {
		t.Fatalf("expected production configuration to load: %v", err)
	}
}

func TestLoadRejectsResumeBuilderBypassInProduction(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/careeros?sslmode=disable")
	t.Setenv("REDIS_URL", "redis://localhost:6379/0")
	t.Setenv("JWT_ACCESS_SECRET", "access_secret_with_at_least_32_characters")
	t.Setenv("JWT_REFRESH_SECRET", "refresh_secret_with_at_least_32_characters")
	t.Setenv("CORS_ALLOW_ORIGINS", "https://jobsview.in")
	t.Setenv("MAIL_PROVIDER", "resend")
	t.Setenv("RESEND_API_KEY", "test_resend_key")
	t.Setenv("STORAGE_PROVIDER", "r2")
	t.Setenv("STORAGE_BASE_URL", "https://assets.jobsview.in")
	t.Setenv("RAZORPAY_KEY_ID", "rzp_test_jobs_view")
	t.Setenv("RAZORPAY_KEY_SECRET", "razorpay_test_secret")
	t.Setenv("RAZORPAY_WEBHOOK_SECRET", "razorpay_test_webhook_secret")
	t.Setenv("RESUME_BUILDER_TEST_EMAILS", "candidate@jobsview.local")

	if _, err := Load(); err == nil {
		t.Fatal("expected production resume builder bypass to be rejected")
	}
}

func TestMain(m *testing.M) {
	_ = os.Unsetenv("ENV")
	os.Exit(m.Run())
}
