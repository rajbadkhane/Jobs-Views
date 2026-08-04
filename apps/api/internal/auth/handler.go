package auth

import (
	"time"

	"careeros/api/internal/config"
	"careeros/api/pkg/apperror"
	"careeros/api/pkg/response"
	"careeros/api/pkg/validator"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	service   *Service
	validator *validator.Validator
	cfg       config.Config
}

func NewHandler(service *Service, validator *validator.Validator, cfg config.Config) *Handler {
	return &Handler{service: service, validator: validator, cfg: cfg}
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	auth := router.Group("/auth")
	auth.Post("/register", h.Register)
	auth.Post("/login", h.Login)
	auth.Post("/logout", h.Logout)
	auth.Post("/refresh", h.Refresh)
	auth.Post("/forgot-password", h.ForgotPassword)
	auth.Post("/reset-password", h.ResetPassword)
	auth.Get("/verify", h.VerifyEmail)
}

func (h *Handler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return apperror.Validation(map[string]string{"body": "must be valid JSON"})
	}
	if details := h.validator.Struct(req); details != nil {
		return apperror.Validation(details)
	}
	result, err := h.service.Register(c.Context(), req, c.Get("User-Agent"), c.IP())
	if err != nil {
		return err
	}
	h.setAuthCookies(c, result)
	if h.cfg.IsProduction() {
		result.VerificationToken = ""
	}
	return response.Created(c, "Account created successfully.", result)
}

func (h *Handler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return apperror.Validation(map[string]string{"body": "must be valid JSON"})
	}
	if details := h.validator.Struct(req); details != nil {
		return apperror.Validation(details)
	}
	result, err := h.service.Login(c.Context(), req, c.Get("User-Agent"), c.IP())
	if err != nil {
		return err
	}
	h.setAuthCookies(c, result)
	return response.OK(c, "Logged in successfully.", result)
}

func (h *Handler) Logout(c *fiber.Ctx) error {
	if err := h.service.Logout(c.Context(), c.Cookies("refresh_token")); err != nil {
		return err
	}
	h.clearAuthCookies(c)
	return response.OK(c, "Logged out successfully.", nil)
}

func (h *Handler) LogoutAll(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return apperror.Unauthorized("Authentication is required.")
	}
	if err := h.service.LogoutAll(c.Context(), userID); err != nil {
		return err
	}
	h.clearAuthCookies(c)
	return response.OK(c, "Logged out from all devices.", nil)
}

func (h *Handler) Refresh(c *fiber.Ctx) error {
	refreshToken := c.Cookies("refresh_token")
	if refreshToken == "" {
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}
		_ = c.BodyParser(&req)
		refreshToken = req.RefreshToken
	}
	if refreshToken == "" {
		refreshToken = c.Get("X-Refresh-Token")
	}
	if refreshToken == "" {
		return apperror.Unauthorized("Refresh token is required.")
	}
	result, err := h.service.Refresh(c.Context(), refreshToken, c.Get("User-Agent"), c.IP())
	if err != nil {
		return err
	}
	h.setAuthCookies(c, result)
	return response.OK(c, "Token refreshed successfully.", result)
}

func (h *Handler) ForgotPassword(c *fiber.Ctx) error {
	var req ForgotPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return apperror.Validation(map[string]string{"body": "must be valid JSON"})
	}
	if details := h.validator.Struct(req); details != nil {
		return apperror.Validation(details)
	}
	token, err := h.service.ForgotPassword(c.Context(), req.Email)
	if err != nil {
		return err
	}
	data := fiber.Map{"reset_token": token}
	if h.cfg.IsProduction() {
		data = nil
	}
	return response.OK(c, "Password reset instructions sent if the account exists.", data)
}

func (h *Handler) ResetPassword(c *fiber.Ctx) error {
	var req ResetPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return apperror.Validation(map[string]string{"body": "must be valid JSON"})
	}
	if details := h.validator.Struct(req); details != nil {
		return apperror.Validation(details)
	}
	if err := h.service.ResetPassword(c.Context(), req.Token, req.Password); err != nil {
		return err
	}
	return response.OK(c, "Password reset successfully.", nil)
}

func (h *Handler) VerifyEmail(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return apperror.Validation(map[string]string{"token": "is required"})
	}
	if err := h.service.VerifyEmail(c.Context(), token); err != nil {
		return err
	}
	return response.OK(c, "Email verified successfully.", nil)
}

func (h *Handler) setAuthCookies(c *fiber.Ctx, result AuthResult) {
	secure := h.cfg.IsProduction()
	sameSite := fiber.CookieSameSiteLaxMode
	if secure {
		sameSite = fiber.CookieSameSiteNoneMode
	}
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    result.AccessToken,
		HTTPOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Path:     "/",
		Expires:  time.Now().Add(h.service.jwt.AccessTTL()),
		MaxAge:   int(h.service.jwt.AccessTTL().Seconds()),
	})
	if result.Stateless || result.RefreshToken == "" {
		return
	}
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    result.RefreshToken,
		HTTPOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Path:     "/",
		Expires:  time.Now().Add(h.service.jwt.RefreshTTL()),
		MaxAge:   int(h.service.jwt.RefreshTTL().Seconds()),
	})
}

func (h *Handler) clearAuthCookies(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{Name: "access_token", Value: "", HTTPOnly: true, Path: "/", Expires: time.Unix(0, 0), MaxAge: -1})
	c.Cookie(&fiber.Cookie{Name: "refresh_token", Value: "", HTTPOnly: true, Path: "/", Expires: time.Unix(0, 0), MaxAge: -1})
}
