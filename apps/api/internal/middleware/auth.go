package middleware

import (
	"strings"

	"careeros/api/pkg/apperror"
	jwtpkg "careeros/api/pkg/jwt"
	"github.com/gofiber/fiber/v2"
)

func Authenticate(jwtManager *jwtpkg.Manager) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := bearerToken(c)
		if token == "" {
			token = c.Cookies("access_token")
		}
		if token == "" {
			return apperror.Unauthorized("Access token is required.")
		}
		claims, err := jwtManager.ParseAccess(token)
		if err != nil {
			return apperror.Unauthorized("Access token is invalid or expired.")
		}
		c.Locals("user_id", claims.UserID)
		c.Locals("user_email", claims.Email)
		c.Locals("user_role", claims.Role)
		c.Locals("user_permissions", claims.Permissions)
		return c.Next()
	}
}

func bearerToken(c *fiber.Ctx) string {
	header := c.Get("Authorization")
	if header == "" {
		return ""
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}
	return strings.TrimSpace(parts[1])
}
