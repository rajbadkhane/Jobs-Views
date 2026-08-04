package server

import (
	"log/slog"
	"time"

	"careeros/api/internal/admin"
	"careeros/api/internal/application"
	"careeros/api/internal/auth"
	"careeros/api/internal/company"
	"careeros/api/internal/config"
	"careeros/api/internal/health"
	"careeros/api/internal/job"
	"careeros/api/internal/middleware"
	"careeros/api/internal/profile"
	"careeros/api/internal/salary"
	"careeros/api/internal/subscription"
	"careeros/api/internal/user"
	jwtpkg "careeros/api/pkg/jwt"
	"careeros/api/pkg/response"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Dependencies struct {
	Config              config.Config
	Logger              *slog.Logger
	DB                  *pgxpool.Pool
	Redis               *redis.Client
	AuthHandler         *auth.Handler
	AuthRepository      *auth.Repository
	UserHandler         *user.Handler
	ProfileHandler      *profile.Handler
	CompanyHandler      *company.Handler
	JobHandler          *job.Handler
	ApplicationHandler  *application.Handler
	AdminHandler        *admin.Handler
	SubscriptionHandler *subscription.Handler
	SalaryHandler       *salary.Handler
	JWT                 *jwtpkg.Manager
}

func New(deps Dependencies) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName:      "Jobs View API",
		ReadTimeout:  deps.Config.Server.ReadTimeout,
		WriteTimeout: deps.Config.Server.WriteTimeout,
		ProxyHeader:  fiber.HeaderXForwardedFor,
		ErrorHandler: ErrorHandler(deps.Logger),
	})

	middleware.Register(app, deps.Config, deps.Logger)

	healthHandler := health.NewHandler(deps.DB, deps.Redis)
	healthHandler.RegisterRoutes(app)
	app.Get("/healthz", healthHandler.Health)

	api := app.Group("/api")
	v1 := api.Group("/v1")
	healthHandler.RegisterRoutes(v1)
	deps.AuthHandler.RegisterRoutes(v1)
	deps.SubscriptionHandler.RegisterPublicRoutes(v1)
	deps.SubscriptionHandler.RegisterCheckoutCompatibilityRoutes(api)
	deps.SubscriptionHandler.RegisterCheckoutCompatibilityRoutes(v1)
	deps.SalaryHandler.RegisterPublicRoutes(v1)
	deps.ProfileHandler.RegisterPublicRoutes(v1)
	v1.Get("/companies/me", middleware.Authenticate(deps.JWT), deps.CompanyHandler.MyCompanies)
	v1.Get("/jobs/company/:company_id", middleware.Authenticate(deps.JWT), deps.JobHandler.CompanyJobs)
	deps.CompanyHandler.RegisterPublicRoutes(v1)
	deps.JobHandler.RegisterPublicRoutes(v1)
	deps.AdminHandler.RegisterPublicRoutes(v1)

	protected := v1.Group("", middleware.Authenticate(deps.JWT))
	protected.Post("/auth/logout-all", deps.AuthHandler.LogoutAll)
	deps.SubscriptionHandler.RegisterProtectedRoutes(protected)
	deps.UserHandler.RegisterRoutes(protected)
	deps.UserHandler.RegisterAdminRoutes(
		protected,
		middleware.RequirePermission("user:view_all", deps.AuthRepository, deps.Redis),
		middleware.RequirePermission("user:suspend", deps.AuthRepository, deps.Redis),
		middleware.RequirePermission("user:delete", deps.AuthRepository, deps.Redis),
	)
	deps.ProfileHandler.RegisterRoutes(protected)
	deps.CompanyHandler.RegisterRoutes(protected)
	deps.CompanyHandler.RegisterAdminRoutes(
		protected,
		middleware.RequirePermission("company:verify", deps.AuthRepository, deps.Redis),
	)
	deps.JobHandler.RegisterRoutes(protected)
	deps.ApplicationHandler.RegisterRoutes(protected)
	deps.JobHandler.RegisterAdminRoutes(
		protected,
		middleware.RequirePermission("settings:configure", deps.AuthRepository, deps.Redis),
	)
	protected.Get("/me", func(c *fiber.Ctx) error {
		return response.OK(c, "Authenticated user loaded.", fiber.Map{
			"id":          c.Locals("user_id"),
			"email":       c.Locals("user_email"),
			"role":        c.Locals("user_role"),
			"permissions": c.Locals("user_permissions"),
		})
	})
	protected.Get("/rbac/employer", middleware.RequirePermission("job:create", deps.AuthRepository, deps.Redis), func(c *fiber.Ctx) error {
		return response.OK(c, "RBAC permission granted.", fiber.Map{"permission": "job:create"})
	})
	adminRoutes := protected.Group("", middleware.RequirePermission("settings:configure", deps.AuthRepository, deps.Redis))
	deps.AdminHandler.RegisterRoutes(adminRoutes)
	deps.SalaryHandler.RegisterAdminRoutes(adminRoutes)

	app.Use(func(c *fiber.Ctx) error {
		return response.Error(c, fiber.StatusNotFound, "NOT_FOUND", "The requested route could not be found.", nil)
	})

	return app
}

func Shutdown(app *fiber.App, timeout time.Duration) error {
	return app.ShutdownWithTimeout(timeout)
}
