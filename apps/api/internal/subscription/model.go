package subscription

import (
	"time"

	"github.com/google/uuid"
)

type Plan struct {
	ID               int            `json:"id"`
	Name             string         `json:"name"`
	Slug             string         `json:"slug"`
	PricePaise       int            `json:"price_paise"`
	Currency         string         `json:"currency"`
	DurationDays     int            `json:"duration_days"`
	ApplicationLimit *int           `json:"application_limit"`
	Entitlements     map[string]any `json:"entitlements"`
}

type StartOTPRequest struct {
	PlanSlug string `json:"plan_slug" validate:"required,oneof=basic premium"`
	Next     string `json:"next"`
}

type VerifyOTPRequest struct {
	CheckoutID uuid.UUID `json:"checkout_id" validate:"required"`
	OTP        string    `json:"otp" validate:"required,len=6,numeric"`
}

type VerifyPaymentRequest struct {
	CheckoutID        uuid.UUID `json:"checkout_id" validate:"required"`
	ProviderOrderID   string    `json:"razorpay_order_id" validate:"required"`
	ProviderPaymentID string    `json:"razorpay_payment_id" validate:"required"`
	Signature         string    `json:"razorpay_signature" validate:"required"`
}

type OTPStartResponse struct {
	CheckoutID uuid.UUID `json:"checkout_id"`
	Email      string    `json:"email_masked"`
	PlanSlug   string    `json:"plan_slug"`
	ExpiresAt  time.Time `json:"expires_at"`
}

type CheckoutResponse struct {
	CheckoutID      uuid.UUID `json:"checkout_id"`
	ProviderOrderID string    `json:"razorpay_order_id"`
	ProviderKeyID   string    `json:"razorpay_key_id"`
	AmountPaise     int       `json:"amount_paise"`
	Currency        string    `json:"currency"`
	PlanSlug        string    `json:"plan_slug"`
	PlanName        string    `json:"plan_name"`
	Email           string    `json:"email"`
	Next            string    `json:"next"`
}

type SubscriptionStatus struct {
	Active                bool           `json:"active"`
	Status                string         `json:"status"`
	Plan                  *Plan          `json:"plan,omitempty"`
	StartsAt              *time.Time     `json:"starts_at,omitempty"`
	EndsAt                *time.Time     `json:"ends_at,omitempty"`
	Entitlements          map[string]any `json:"entitlements"`
	ApplicationsUsed      int            `json:"applications_used"`
	ApplicationsRemaining *int           `json:"applications_remaining"`
}

type PaymentResult struct {
	Status       string             `json:"status"`
	Next         string             `json:"next"`
	Subscription SubscriptionStatus `json:"subscription"`
}

type OrderStatus struct {
	CheckoutID uuid.UUID `json:"checkout_id"`
	Status     string    `json:"status"`
	Next       string    `json:"next"`
}

type SupportRequest struct {
	Subject string `json:"subject" validate:"required,min=3,max=255"`
	Message string `json:"message" validate:"required,min=10,max=4000"`
}

type SupportResponse struct {
	ID       uuid.UUID `json:"id"`
	Status   string    `json:"status"`
	Priority string    `json:"priority"`
}

type CreateOrderRequest struct {
	Amount   int    `json:"amount" validate:"required,min=100"`
	Currency string `json:"currency" validate:"omitempty,len=3"`
	Receipt  string `json:"receipt" validate:"omitempty,max=40"`
}

type CreateOrderResponse struct {
	OrderID  string `json:"order_id"`
	Amount   int    `json:"amount"`
	Currency string `json:"currency"`
}

type VerifyRawPaymentRequest struct {
	OrderID   string `json:"razorpay_order_id" validate:"required"`
	PaymentID string `json:"razorpay_payment_id" validate:"required"`
	Signature string `json:"razorpay_signature" validate:"required"`
}

type VerifyRawPaymentResponse struct {
	Verified  bool   `json:"verified"`
	OrderID   string `json:"razorpay_order_id"`
	PaymentID string `json:"razorpay_payment_id"`
}

type CheckoutOrder struct {
	ID                uuid.UUID
	UserID            uuid.UUID
	Plan              Plan
	Email             string
	Next              string
	Status            string
	AmountPaise       int
	Currency          string
	DurationDays      int
	ApplicationLimit  *int
	Entitlements      map[string]any
	OTPHash           string
	OTPExpiresAt      time.Time
	OTPAttempts       int
	OTPVerifiedAt     *time.Time
	ProviderOrderID   string
	ProviderPaymentID string
	CreatedAt         time.Time
}

type ActiveSubscription struct {
	ID               uuid.UUID
	UserID           uuid.UUID
	Plan             Plan
	Status           string
	PricePaise       int
	Currency         string
	ApplicationLimit *int
	Entitlements     map[string]any
	StartsAt         time.Time
	EndsAt           time.Time
	ApplicationsUsed int
}
