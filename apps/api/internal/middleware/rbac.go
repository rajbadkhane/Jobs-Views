package middleware

import (
	"context"
	"encoding/json"
	"time"

	"careeros/api/internal/auth"
	"careeros/api/pkg/apperror"
	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

func RequirePermission(permission string, repo *auth.Repository, redis *redis.Client) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, ok := c.Locals("user_role").(string)
		if !ok || role == "" {
			return apperror.Unauthorized("Authentication is required.")
		}
		if role == "SUPER_ADMIN" {
			return c.Next()
		}

		allowed, err := cachedRolePermission(c.Context(), role, permission, repo, redis)
		if err != nil {
			return apperror.Internal(err)
		}
		if !allowed {
			return apperror.Forbidden("")
		}
		return c.Next()
	}
}

func cachedRolePermission(ctx context.Context, role, permission string, repo *auth.Repository, redis *redis.Client) (bool, error) {
	key := "rbac:" + role + ":" + permission
	if redis != nil {
		value, err := redis.Get(ctx, key).Result()
		if err == nil {
			var allowed bool
			if json.Unmarshal([]byte(value), &allowed) == nil {
				return allowed, nil
			}
		}
	}

	allowed, err := repo.RoleHasPermission(ctx, role, permission)
	if err != nil {
		return false, err
	}
	if redis != nil {
		bytes, _ := json.Marshal(allowed)
		_ = redis.Set(ctx, key, string(bytes), 10*time.Minute).Err()
	}
	return allowed, nil
}
