package subscription

import (
	"careeros/api/pkg/apperror"
	"careeros/api/pkg/response"
	"careeros/api/pkg/validator"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	service   *Service
	validator *validator.Validator
}

func NewHandler(service *Service, validator *validator.Validator) *Handler {
	return &Handler{service: service, validator: validator}
}

func (h *Handler) RegisterPublicRoutes(router fiber.Router) {
	group := router.Group("/subscriptions")
	group.Get("/plans", h.Plans)
	group.Post("/webhooks/razorpay", h.RazorpayWebhook)
}

func (h *Handler) RegisterCheckoutCompatibilityRoutes(router fiber.Router) {
	router.Post("/create-order", h.CreateOrder)
	router.Post("/verify-payment", h.VerifyRawPayment)
}

func (h *Handler) RegisterProtectedRoutes(router fiber.Router) {
	group := router.Group("/subscriptions")
	group.Get("/me", h.Current)
	group.Get("/orders/:id", h.OrderStatus)
	group.Post("/otp/start", h.StartOTP)
	group.Post("/otp/verify", h.VerifyOTP)
	group.Post("/payment/verify", h.VerifyPayment)
	group.Post("/support", h.CreateSupport)
}

func (h *Handler) Plans(c *fiber.Ctx) error {
	items, err := h.service.Plans(c.Context())
	if err != nil {
		return err
	}
	return response.OK(c, "Candidate plans loaded.", fiber.Map{"items": items})
}

func (h *Handler) CreateOrder(c *fiber.Ctx) error {
	var req CreateOrderRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateRawOrder(c.Context(), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Razorpay order created.", item)
}

func (h *Handler) VerifyRawPayment(c *fiber.Ctx) error {
	var req VerifyRawPaymentRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.VerifyRawPayment(c.Context(), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Payment signature verified.", item)
}

func (h *Handler) Current(c *fiber.Ctx) error {
	if err := candidateOnly(c); err != nil {
		return err
	}
	item, err := h.service.Current(c.Context(), currentUserID(c))
	if err != nil {
		return err
	}
	return response.OK(c, "Candidate subscription loaded.", item)
}

func (h *Handler) StartOTP(c *fiber.Ctx) error {
	if err := candidateOnly(c); err != nil {
		return err
	}
	var req StartOTPRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.StartOTP(c.Context(), currentUserID(c), currentUserEmail(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Subscription OTP sent.", item)
}

func (h *Handler) VerifyOTP(c *fiber.Ctx) error {
	if err := candidateOnly(c); err != nil {
		return err
	}
	var req VerifyOTPRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.VerifyOTP(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Subscription OTP verified.", item)
}

func (h *Handler) VerifyPayment(c *fiber.Ctx) error {
	if err := candidateOnly(c); err != nil {
		return err
	}
	var req VerifyPaymentRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.VerifyPayment(c.Context(), currentUserID(c), req)
	if err != nil {
		return err
	}
	return response.OK(c, "Candidate subscription activated.", item)
}

func (h *Handler) OrderStatus(c *fiber.Ctx) error {
	if err := candidateOnly(c); err != nil {
		return err
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apperror.Validation(map[string]string{"id": "must be a valid UUID"})
	}
	item, err := h.service.OrderStatus(c.Context(), currentUserID(c), id)
	if err != nil {
		return err
	}
	return response.OK(c, "Checkout status loaded.", item)
}

func (h *Handler) RazorpayWebhook(c *fiber.Ctx) error {
	if err := h.service.HandleWebhook(c.Context(), c.Get("X-Razorpay-Event-Id"), c.Get("X-Razorpay-Signature"), c.Body()); err != nil {
		return err
	}
	return response.OK(c, "Webhook accepted.", nil)
}

func (h *Handler) CreateSupport(c *fiber.Ctx) error {
	if err := candidateOnly(c); err != nil {
		return err
	}
	var req SupportRequest
	if err := h.bind(c, &req); err != nil {
		return err
	}
	item, err := h.service.CreateSupport(c.Context(), currentUserID(c), currentUserEmail(c), req)
	if err != nil {
		return err
	}
	return response.Created(c, "Support request created.", item)
}

func (h *Handler) bind(c *fiber.Ctx, req any) error {
	if err := c.BodyParser(req); err != nil {
		return apperror.Validation(map[string]string{"body": "must be valid JSON"})
	}
	if details := h.validator.Struct(req); details != nil {
		return apperror.Validation(details)
	}
	return nil
}

func candidateOnly(c *fiber.Ctx) error {
	if role, _ := c.Locals("user_role").(string); role != "JOB_SEEKER" {
		return apperror.Forbidden("A candidate account is required for this subscription.")
	}
	return nil
}

func currentUserID(c *fiber.Ctx) uuid.UUID {
	id, _ := c.Locals("user_id").(uuid.UUID)
	return id
}

func currentUserEmail(c *fiber.Ctx) string {
	email, _ := c.Locals("user_email").(string)
	return email
}
