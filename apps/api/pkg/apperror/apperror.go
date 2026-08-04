package apperror

import "github.com/gofiber/fiber/v2"

type AppError struct {
	Status  int
	Code    string
	Message string
	Details any
}

func (e *AppError) Error() string {
	return e.Message
}

func New(status int, code, message string, details any) *AppError {
	return &AppError{Status: status, Code: code, Message: message, Details: details}
}

func Validation(details any) *AppError {
	return New(fiber.StatusUnprocessableEntity, "VALIDATION_FAILED", "The request contains validation errors.", details)
}

func Database(err error) *AppError {
	return New(fiber.StatusInternalServerError, "DATABASE_ERROR", "A database operation failed.", err.Error())
}

func Unauthorized(message string) *AppError {
	if message == "" {
		message = "Authentication is required."
	}
	return New(fiber.StatusUnauthorized, "UNAUTHORIZED", message, nil)
}

func Forbidden(message string) *AppError {
	if message == "" {
		message = "You do not have permission to perform this action."
	}
	return New(fiber.StatusForbidden, "FORBIDDEN", message, nil)
}

func NotFound(message string) *AppError {
	if message == "" {
		message = "The requested resource could not be found."
	}
	return New(fiber.StatusNotFound, "NOT_FOUND", message, nil)
}

func Conflict(message string) *AppError {
	return New(fiber.StatusConflict, "CONFLICT", message, nil)
}

func Internal(err error) *AppError {
	details := any(nil)
	if err != nil {
		details = err.Error()
	}
	return New(fiber.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred.", details)
}
