package server

import (
	"errors"
	"log/slog"

	"careeros/api/pkg/apperror"
	"careeros/api/pkg/response"
	"github.com/gofiber/fiber/v2"
)

func ErrorHandler(log *slog.Logger) fiber.ErrorHandler {
	return func(c *fiber.Ctx, err error) error {
		var appErr *apperror.AppError
		if errors.As(err, &appErr) {
			return response.Error(c, appErr.Status, appErr.Code, appErr.Message, appErr.Details)
		}

		var fiberErr *fiber.Error
		if errors.As(err, &fiberErr) {
			code := "INTERNAL_ERROR"
			if fiberErr.Code == fiber.StatusTooManyRequests {
				code = "RATE_LIMIT_EXCEEDED"
			}
			return response.Error(c, fiberErr.Code, code, fiberErr.Message, nil)
		}

		log.Error("unhandled request error", "error", err)
		return response.Error(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred.", nil)
	}
}
