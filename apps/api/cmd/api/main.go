package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"careeros/api/internal/admin"
	"careeros/api/internal/application"
	"careeros/api/internal/auth"
	"careeros/api/internal/cache"
	"careeros/api/internal/company"
	"careeros/api/internal/config"
	"careeros/api/internal/database"
	"careeros/api/internal/job"
	"careeros/api/internal/mail"
	"careeros/api/internal/profile"
	"careeros/api/internal/salary"
	"careeros/api/internal/server"
	"careeros/api/internal/subscription"
	"careeros/api/internal/user"
	jwtpkg "careeros/api/pkg/jwt"
	"careeros/api/pkg/logger"
	"careeros/api/pkg/validator"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	ctx := context.Background()
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	log := logger.New(cfg.AppEnv)
	db, err := database.Connect(ctx, cfg.Database)
	if err != nil {
		return err
	}
	defer database.Close(db)

	redisClient, err := cache.Connect(ctx, cfg.Redis)
	if err != nil {
		if cfg.IsProduction() {
			return err
		}
		log.Warn("redis unavailable; continuing without cache in development", "error", err)
	}
	defer func() { _ = cache.Close(redisClient) }()

	jwtManager := jwtpkg.NewManager(cfg.JWT)
	authRepo := auth.NewRepository(db)
	mailSender := mail.NewSender(cfg.Mail, log)
	authService := auth.NewService(authRepo, jwtManager, mailSender)
	validate := validator.New()
	authHandler := auth.NewHandler(authService, validate, cfg)
	userRepo := user.NewRepository(db)
	userHandler := user.NewHandler(user.NewService(userRepo), validate)
	profileRepo := profile.NewRepository(db)
	profileHandler := profile.NewHandler(profile.NewService(profileRepo, cfg), validate)
	companyRepo := company.NewRepository(db)
	companyHandler := company.NewHandler(company.NewService(companyRepo, cfg), validate)
	jobRepo := job.NewRepository(db)
	jobHandler := job.NewHandler(job.NewService(jobRepo, cfg), validate)
	applicationRepo := application.NewRepository(db)
	applicationHandler := application.NewHandler(application.NewService(applicationRepo), validate)
	adminRepo := admin.NewRepository(db)
	adminHandler := admin.NewHandler(admin.NewService(adminRepo, db, redisClient), validate)
	subscriptionRepo := subscription.NewRepository(db)
	paymentProvider := subscription.NewRazorpayProvider(cfg.Razorpay)
	subscriptionHandler := subscription.NewHandler(subscription.NewService(subscriptionRepo, mailSender, paymentProvider), validate)
	salaryHandler := salary.NewHandler(salary.NewService(salary.NewRepository(db), redisClient), validate)

	app := server.New(server.Dependencies{
		Config:              cfg,
		Logger:              log,
		DB:                  db,
		Redis:               redisClient,
		AuthHandler:         authHandler,
		AuthRepository:      authRepo,
		UserHandler:         userHandler,
		ProfileHandler:      profileHandler,
		CompanyHandler:      companyHandler,
		JobHandler:          jobHandler,
		ApplicationHandler:  applicationHandler,
		AdminHandler:        adminHandler,
		SubscriptionHandler: subscriptionHandler,
		SalaryHandler:       salaryHandler,
		JWT:                 jwtManager,
	})

	errCh := make(chan error, 1)
	go func() {
		log.Info("starting api", "address", cfg.Address())
		errCh <- app.Listen(cfg.Address())
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	select {
	case sig := <-quit:
		log.Info("shutdown signal received", "signal", sig.String())
		return server.Shutdown(app, cfg.Server.ShutdownTimeout)
	case err := <-errCh:
		return err
	}
}
