package health

import (
	"context"
	"time"

	"careeros/api/internal/cache"
	"careeros/api/internal/database"
	"careeros/api/pkg/response"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Handler struct {
	db    *pgxpool.Pool
	redis *redis.Client
}

func NewHandler(db *pgxpool.Pool, redis *redis.Client) *Handler {
	return &Handler{db: db, redis: redis}
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	router.Get("/health", h.Health)
	router.Get("/ready", h.Ready)
	router.Get("/live", h.Live)
}

func (h *Handler) Health(c *fiber.Ctx) error {
	return h.check(c)
}

func (h *Handler) Ready(c *fiber.Ctx) error {
	return h.check(c)
}

func (h *Handler) Live(c *fiber.Ctx) error {
	return response.OK(c, "Service is live.", fiber.Map{"status": "ok"})
}

func (h *Handler) check(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
	defer cancel()

	dbErr := database.Health(ctx, h.db)
	redisErr := cache.Health(ctx, h.redis)
	status := fiber.StatusOK
	data := fiber.Map{"status": "ok", "database": "ok", "redis": "ok"}

	if dbErr != nil {
		status = fiber.StatusServiceUnavailable
		data["status"] = "degraded"
		data["database"] = dbErr.Error()
	}
	if redisErr != nil {
		status = fiber.StatusServiceUnavailable
		data["status"] = "degraded"
		data["redis"] = redisErr.Error()
	}
	return response.Success(c, status, "Health check completed.", data)
}
