package response

import "github.com/gofiber/fiber/v2"

type SuccessBody struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
}

type ErrorBody struct {
	Success bool         `json:"success"`
	Error   ErrorPayload `json:"error"`
}

type ErrorPayload struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

func Success(c *fiber.Ctx, status int, message string, data any) error {
	return c.Status(status).JSON(SuccessBody{Success: true, Message: message, Data: data})
}

func OK(c *fiber.Ctx, message string, data any) error {
	return Success(c, fiber.StatusOK, message, data)
}

func Created(c *fiber.Ctx, message string, data any) error {
	return Success(c, fiber.StatusCreated, message, data)
}

func Error(c *fiber.Ctx, status int, code, message string, details any) error {
	return c.Status(status).JSON(ErrorBody{
		Success: false,
		Error:   ErrorPayload{Code: code, Message: message, Details: details},
	})
}
