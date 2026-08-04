package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv           string
	Server           ServerConfig
	Database         DatabaseConfig
	Redis            RedisConfig
	JWT              JWTConfig
	Mail             MailConfig
	Storage          StorageConfig
	Razorpay         RazorpayConfig
	ResumeBuilder    ResumeBuilderConfig
	CORSAllowOrigins string
	RateLimit        RateLimitConfig
}

type ServerConfig struct {
	Host            string
	Port            string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	ShutdownTimeout time.Duration
}

type DatabaseConfig struct {
	URL               string
	MaxConns          int32
	MinConns          int32
	ConnectRetries    int
	ConnectRetryDelay time.Duration
}

type RedisConfig struct {
	URL               string
	ConnectRetries    int
	ConnectRetryDelay time.Duration
}

type JWTConfig struct {
	AccessSecret  string
	RefreshSecret string
	AccessTTL     time.Duration
	RefreshTTL    time.Duration
	Issuer        string
}

type MailConfig struct {
	From     string
	Provider string
	APIKey   string
}

type StorageConfig struct {
	Provider    string
	Bucket      string
	BaseURL     string
	R2AccountID string
	R2AccessKey string
	R2SecretKey string
	R2Endpoint  string
}

type RazorpayConfig struct {
	KeyID         string
	KeySecret     string
	WebhookSecret string
	APIBaseURL    string
}

type ResumeBuilderConfig struct {
	TestEmails []string
}

type RateLimitConfig struct {
	Max        int
	Expiration time.Duration
}

func Load() (Config, error) {
	_ = godotenv.Load()
	_ = godotenv.Load(".env.local", ".env", "../.env.local", "../.env", "../../.env.local", "../../.env")

	cfg := Config{
		AppEnv: get("APP_ENV", get("ENV", "development")),
		Server: ServerConfig{
			Host:            get("SERVER_HOST", "0.0.0.0"),
			Port:            get("SERVER_PORT", get("PORT", "8080")),
			ReadTimeout:     duration("SERVER_READ_TIMEOUT", 10*time.Second),
			WriteTimeout:    duration("SERVER_WRITE_TIMEOUT", 10*time.Second),
			ShutdownTimeout: duration("SERVER_SHUTDOWN_TIMEOUT", 10*time.Second),
		},
		Database: DatabaseConfig{
			URL:               required("DATABASE_URL"),
			MaxConns:          int32(integer("DATABASE_MAX_CONNS", 10)),
			MinConns:          int32(integer("DATABASE_MIN_CONNS", 1)),
			ConnectRetries:    integer("DATABASE_CONNECT_RETRIES", 5),
			ConnectRetryDelay: duration("DATABASE_CONNECT_RETRY_DELAY", 2*time.Second),
		},
		Redis: RedisConfig{
			URL:               required("REDIS_URL"),
			ConnectRetries:    integer("REDIS_CONNECT_RETRIES", 5),
			ConnectRetryDelay: duration("REDIS_CONNECT_RETRY_DELAY", 2*time.Second),
		},
		JWT: JWTConfig{
			AccessSecret:  get("JWT_ACCESS_SECRET", get("JWT_SECRET", "")),
			RefreshSecret: get("JWT_REFRESH_SECRET", get("JWT_SECRET", "")),
			AccessTTL:     duration("JWT_ACCESS_TTL", 72*time.Hour),
			RefreshTTL:    duration("JWT_REFRESH_TTL", 7*24*time.Hour),
			Issuer:        get("JWT_ISSUER", "jobs-view-api"),
		},
		Mail: MailConfig{
			From:     get("MAIL_FROM", "no-reply@jobsview.local"),
			Provider: get("MAIL_PROVIDER", "log"),
			APIKey:   get("RESEND_API_KEY", ""),
		},
		Storage: StorageConfig{
			Provider:    get("STORAGE_PROVIDER", "local"),
			Bucket:      get("STORAGE_BUCKET", get("CLOUDFLARE_R2_BUCKET", "jobs-view-assets")),
			BaseURL:     get("STORAGE_BASE_URL", ""),
			R2AccountID: get("CLOUDFLARE_R2_ACCOUNT_ID", ""),
			R2AccessKey: get("CLOUDFLARE_R2_ACCESS_KEY", ""),
			R2SecretKey: get("CLOUDFLARE_R2_SECRET_KEY", ""),
			R2Endpoint:  get("CLOUDFLARE_R2_ENDPOINT", ""),
		},
		Razorpay: RazorpayConfig{
			KeyID:         get("RAZORPAY_KEY_ID", ""),
			KeySecret:     get("RAZORPAY_KEY_SECRET", ""),
			WebhookSecret: get("RAZORPAY_WEBHOOK_SECRET", ""),
			APIBaseURL:    get("RAZORPAY_API_BASE_URL", "https://api.razorpay.com/v1"),
		},
		ResumeBuilder: ResumeBuilderConfig{
			TestEmails: csv("RESUME_BUILDER_TEST_EMAILS"),
		},
		CORSAllowOrigins: get("CORS_ALLOW_ORIGINS", defaultCORSAllowOrigins()),
		RateLimit: RateLimitConfig{
			Max:        integer("RATE_LIMIT_MAX", 60),
			Expiration: duration("RATE_LIMIT_EXPIRATION", time.Minute),
		},
	}

	if cfg.JWT.AccessSecret == "" || cfg.JWT.RefreshSecret == "" {
		return Config{}, fmt.Errorf("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required")
	}
	if cfg.Database.URL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.Redis.URL == "" {
		return Config{}, fmt.Errorf("REDIS_URL is required")
	}
	if err := cfg.validateProduction(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func (c Config) Address() string {
	return c.Server.Host + ":" + c.Server.Port
}

func (c Config) IsProduction() bool {
	return strings.EqualFold(c.AppEnv, "production")
}

func (c Config) validateProduction() error {
	if !c.IsProduction() {
		return nil
	}
	if len(c.JWT.AccessSecret) < 32 || len(c.JWT.RefreshSecret) < 32 {
		return fmt.Errorf("production JWT secrets must be at least 32 characters")
	}
	if c.CORSAllowOrigins == "*" || strings.Contains(c.CORSAllowOrigins, "localhost") {
		return fmt.Errorf("production CORS_ALLOW_ORIGINS must list trusted origins")
	}
	if strings.EqualFold(c.Mail.Provider, "resend") && c.Mail.APIKey == "" {
		return fmt.Errorf("RESEND_API_KEY is required when MAIL_PROVIDER=resend")
	}
	if c.Razorpay.KeyID == "" || c.Razorpay.KeySecret == "" || c.Razorpay.WebhookSecret == "" {
		return fmt.Errorf("RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET are required in production")
	}
	if len(c.ResumeBuilder.TestEmails) > 0 {
		return fmt.Errorf("RESUME_BUILDER_TEST_EMAILS must be empty in production")
	}
	if c.Storage.Provider != "local" && c.Storage.BaseURL == "" {
		return fmt.Errorf("STORAGE_BASE_URL is required for production object storage")
	}
	return nil
}

func csv(key string) []string {
	value := get(key, "")
	if value == "" {
		return nil
	}
	items := strings.Split(value, ",")
	result := make([]string, 0, len(items))
	for _, item := range items {
		if normalized := strings.ToLower(strings.TrimSpace(item)); normalized != "" {
			result = append(result, normalized)
		}
	}
	return result
}

func get(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func defaultCORSAllowOrigins() string {
	return strings.Join([]string{
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3001",
		"http://localhost:3002",
		"http://127.0.0.1:3002",
	}, ",")
}

func required(key string) string {
	return strings.TrimSpace(os.Getenv(key))
}

func integer(key string, fallback int) int {
	value := get(key, "")
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func duration(key string, fallback time.Duration) time.Duration {
	value := get(key, "")
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return parsed
}
