package subscription

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"math/big"
	"strings"
	"time"

	"careeros/api/internal/mail"
	"careeros/api/pkg/apperror"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Service struct {
	repo    *Repository
	mailer  mail.Sender
	payment PaymentProvider
}

func NewService(repo *Repository, mailer mail.Sender, payment PaymentProvider) *Service {
	return &Service{repo: repo, mailer: mailer, payment: payment}
}

func (s *Service) Plans(ctx context.Context) ([]Plan, error) {
	items, err := s.repo.Plans(ctx)
	if err != nil {
		return nil, apperror.Database(err)
	}
	return items, nil
}

func (s *Service) CreateRawOrder(ctx context.Context, req CreateOrderRequest) (CreateOrderResponse, error) {
	if req.Amount < 100 {
		return CreateOrderResponse{}, apperror.Validation(map[string]string{"amount": "must be at least 100 paise"})
	}
	currency := strings.ToUpper(strings.TrimSpace(req.Currency))
	if currency == "" {
		currency = "INR"
	}
	if len(currency) != 3 {
		return CreateOrderResponse{}, apperror.Validation(map[string]string{"currency": "must be a 3 letter ISO currency code"})
	}
	receipt := strings.TrimSpace(req.Receipt)
	if receipt == "" {
		receipt = "jobsview_" + uuid.NewString()
	}
	orderID, err := s.payment.CreateRawOrder(ctx, req.Amount, currency, receipt)
	if errors.Is(err, ErrPaymentUnavailable) {
		return CreateOrderResponse{}, apperror.New(fiber.StatusServiceUnavailable, "PAYMENT_UNAVAILABLE", "Payment checkout is not configured yet.", nil)
	}
	var razorErr RazorpayAPIError
	if errors.As(err, &razorErr) {
		if razorErr.Status == fiber.StatusUnauthorized {
			return CreateOrderResponse{}, apperror.New(fiber.StatusUnauthorized, "RAZORPAY_AUTH_FAILED", "Razorpay authentication failed. Check server credentials.", nil)
		}
		return CreateOrderResponse{}, apperror.New(fiber.StatusBadGateway, "RAZORPAY_ORDER_FAILED", "The payment order could not be created. Please retry.", razorErr.Message)
	}
	if err != nil {
		return CreateOrderResponse{}, apperror.New(fiber.StatusInternalServerError, "RAZORPAY_ORDER_FAILED", "The payment order could not be created. Please retry.", err.Error())
	}
	return CreateOrderResponse{OrderID: orderID, Amount: req.Amount, Currency: currency}, nil
}

func (s *Service) VerifyRawPayment(_ context.Context, req VerifyRawPaymentRequest) (VerifyRawPaymentResponse, error) {
	if err := s.payment.VerifySignature(req.OrderID, req.PaymentID, req.Signature); errors.Is(err, ErrPaymentUnavailable) {
		return VerifyRawPaymentResponse{}, apperror.New(fiber.StatusServiceUnavailable, "PAYMENT_UNAVAILABLE", "Payment checkout is not configured yet.", nil)
	} else if err != nil {
		return VerifyRawPaymentResponse{}, apperror.New(fiber.StatusBadRequest, "PAYMENT_SIGNATURE_INVALID", "Payment signature verification failed.", nil)
	}
	return VerifyRawPaymentResponse{Verified: true, OrderID: req.OrderID, PaymentID: req.PaymentID}, nil
}

func (s *Service) StartOTP(ctx context.Context, userID uuid.UUID, email string, req StartOTPRequest) (OTPStartResponse, error) {
	plan, err := s.repo.PlanBySlug(ctx, strings.TrimSpace(req.PlanSlug))
	if errors.Is(err, ErrNotFound) {
		return OTPStartResponse{}, apperror.NotFound("The selected candidate plan is unavailable.")
	}
	if err != nil {
		return OTPStartResponse{}, apperror.Database(err)
	}
	count, err := s.repo.RecentOTPCount(ctx, userID, time.Now().UTC().Add(-15*time.Minute))
	if err != nil {
		return OTPStartResponse{}, apperror.Database(err)
	}
	if count >= 3 {
		return OTPStartResponse{}, apperror.New(fiber.StatusTooManyRequests, "OTP_RATE_LIMITED", "Too many OTP requests. Try again in 15 minutes.", nil)
	}
	otp, err := numericOTP(6)
	if err != nil {
		return OTPStartResponse{}, apperror.Internal(err)
	}
	expiresAt := time.Now().UTC().Add(10 * time.Minute)
	order, err := s.repo.CreateOTPOrder(ctx, userID, strings.ToLower(strings.TrimSpace(email)), safeNext(req.Next), hashOTP(otp), expiresAt, plan)
	if err != nil {
		return OTPStartResponse{}, apperror.Database(err)
	}
	if s.mailer == nil {
		return OTPStartResponse{}, apperror.New(fiber.StatusServiceUnavailable, "MAIL_UNAVAILABLE", "Email verification is temporarily unavailable.", nil)
	}
	if err := s.mailer.Send(ctx, order.Email, "Your Jobs View payment OTP", otpEmailHTML(otp, plan)); err != nil {
		_ = s.repo.MarkCheckoutFailed(ctx, order.ID, "mail_delivery_failed")
		return OTPStartResponse{}, apperror.New(fiber.StatusServiceUnavailable, "MAIL_DELIVERY_FAILED", "We could not send the verification email. Please try again.", nil)
	}
	return OTPStartResponse{CheckoutID: order.ID, Email: maskEmail(order.Email), PlanSlug: plan.Slug, ExpiresAt: expiresAt}, nil
}

func (s *Service) VerifyOTP(ctx context.Context, userID uuid.UUID, req VerifyOTPRequest) (CheckoutResponse, error) {
	order, err := s.repo.OrderForUser(ctx, req.CheckoutID, userID)
	if errors.Is(err, ErrNotFound) {
		return CheckoutResponse{}, apperror.NotFound("Checkout not found.")
	}
	if err != nil {
		return CheckoutResponse{}, apperror.Database(err)
	}
	if order.Status == "payment_pending" && order.ProviderOrderID != "" {
		return checkoutResponse(order, s.payment.KeyID()), nil
	}
	if order.Status != "otp_pending" || time.Now().UTC().After(order.OTPExpiresAt) {
		return CheckoutResponse{}, apperror.New(fiber.StatusUnauthorized, "OTP_EXPIRED", "The OTP is invalid or expired.", nil)
	}
	if order.OTPAttempts >= 5 {
		return CheckoutResponse{}, apperror.New(fiber.StatusForbidden, "OTP_ATTEMPTS_EXCEEDED", "Too many OTP attempts. Request a new code.", nil)
	}
	if hashOTP(req.OTP) != order.OTPHash {
		_ = s.repo.IncrementAttempts(ctx, order.ID)
		return CheckoutResponse{}, apperror.New(fiber.StatusUnauthorized, "OTP_INVALID", "The OTP is invalid or expired.", nil)
	}
	providerOrderID, err := s.payment.CreateOrder(ctx, order)
	if errors.Is(err, ErrPaymentUnavailable) {
		return CheckoutResponse{}, apperror.New(fiber.StatusServiceUnavailable, "PAYMENT_UNAVAILABLE", "Payment checkout is not configured yet.", nil)
	}
	if err != nil {
		return CheckoutResponse{}, apperror.New(fiber.StatusBadGateway, "PAYMENT_ORDER_FAILED", "The payment order could not be created. Please retry.", nil)
	}
	if err := s.repo.MarkPaymentPending(ctx, order.ID, providerOrderID); err != nil {
		return CheckoutResponse{}, apperror.Database(err)
	}
	order.ProviderOrderID = providerOrderID
	order.Status = "payment_pending"
	return checkoutResponse(order, s.payment.KeyID()), nil
}

func (s *Service) VerifyPayment(ctx context.Context, userID uuid.UUID, req VerifyPaymentRequest) (PaymentResult, error) {
	order, err := s.repo.OrderForUser(ctx, req.CheckoutID, userID)
	if errors.Is(err, ErrNotFound) {
		return PaymentResult{}, apperror.NotFound("Checkout not found.")
	}
	if err != nil {
		return PaymentResult{}, apperror.Database(err)
	}
	if order.ProviderOrderID != req.ProviderOrderID || order.Status != "payment_pending" {
		return PaymentResult{}, apperror.New(fiber.StatusConflict, "PAYMENT_ORDER_MISMATCH", "The payment does not match this checkout.", nil)
	}
	if err := s.payment.VerifyPayment(ctx, order.ProviderOrderID, req.ProviderPaymentID, req.Signature, order.AmountPaise, order.Currency); err != nil {
		return PaymentResult{}, apperror.New(fiber.StatusPaymentRequired, "PAYMENT_NOT_CONFIRMED", "Payment could not be confirmed.", nil)
	}
	subscription, err := s.repo.Activate(ctx, order.ProviderOrderID, req.ProviderPaymentID)
	if err != nil {
		return PaymentResult{}, apperror.Database(err)
	}
	return PaymentResult{Status: "active", Next: order.Next, Subscription: statusFromActive(subscription)}, nil
}

func (s *Service) Current(ctx context.Context, userID uuid.UUID) (SubscriptionStatus, error) {
	item, err := s.repo.Current(ctx, userID)
	if errors.Is(err, ErrNotFound) {
		return SubscriptionStatus{Active: false, Status: s.repo.LatestSubscriptionStatus(ctx, userID), Entitlements: map[string]any{}}, nil
	}
	if err != nil {
		return SubscriptionStatus{}, apperror.Database(err)
	}
	return statusFromActive(item), nil
}

func (s *Service) OrderStatus(ctx context.Context, userID, checkoutID uuid.UUID) (OrderStatus, error) {
	item, err := s.repo.OrderForUser(ctx, checkoutID, userID)
	if errors.Is(err, ErrNotFound) {
		return OrderStatus{}, apperror.NotFound("Checkout not found.")
	}
	if err != nil {
		return OrderStatus{}, apperror.Database(err)
	}
	return OrderStatus{CheckoutID: item.ID, Status: item.Status, Next: item.Next}, nil
}

func (s *Service) CreateSupport(ctx context.Context, userID uuid.UUID, email string, req SupportRequest) (SupportResponse, error) {
	priority, planSlug := "normal", "none"
	if current, err := s.repo.Current(ctx, userID); err == nil {
		planSlug = current.Plan.Slug
		if current.Plan.Slug == "premium" {
			priority = "high"
		}
	}
	item, err := s.repo.CreateSupportTicket(ctx, userID, email, strings.TrimSpace(req.Subject), strings.TrimSpace(req.Message), priority, planSlug)
	if err != nil {
		return SupportResponse{}, apperror.Database(err)
	}
	return item, nil
}

func (s *Service) HandleWebhook(ctx context.Context, eventID, signature string, body []byte) error {
	if !s.payment.VerifyWebhook(body, signature) {
		return apperror.Unauthorized("Webhook signature is invalid.")
	}
	var event razorpayEvent
	if err := json.Unmarshal(body, &event); err != nil {
		return apperror.Validation(map[string]string{"body": "must be valid Razorpay event JSON"})
	}
	if eventID == "" {
		sum := sha256.Sum256(body)
		eventID = hex.EncodeToString(sum[:])
	}
	inserted, err := s.repo.SaveEvent(ctx, eventID, event.Event, body)
	if err != nil {
		return apperror.Database(err)
	}
	if !inserted {
		return nil
	}
	providerOrderID, providerPaymentID := event.references()
	status := "processed"
	message := ""
	switch event.Event {
	case "payment.captured", "order.paid":
		if providerOrderID == "" || providerPaymentID == "" {
			status, message = "ignored", "payment references are missing"
			break
		}
		if _, err := s.repo.Activate(ctx, providerOrderID, providerPaymentID); err != nil {
			status, message = "failed", err.Error()
		}
	case "payment.failed":
		if providerOrderID != "" {
			if err := s.repo.MarkFailed(ctx, providerOrderID, "payment_failed"); err != nil {
				status, message = "failed", err.Error()
			}
		}
	case "refund.processed":
		if providerPaymentID != "" {
			order, err := s.repo.OrderByPaymentID(ctx, providerPaymentID)
			if err == nil {
				err = s.repo.Refund(ctx, order.ProviderOrderID)
			}
			if err != nil {
				status, message = "failed", err.Error()
			}
		}
	default:
		status = "ignored"
	}
	_ = s.repo.FinishEvent(ctx, eventID, status, message)
	if status == "failed" {
		return apperror.Internal(errors.New(message))
	}
	return nil
}

func checkoutResponse(order CheckoutOrder, keyID string) CheckoutResponse {
	return CheckoutResponse{CheckoutID: order.ID, ProviderOrderID: order.ProviderOrderID, ProviderKeyID: keyID, AmountPaise: order.AmountPaise, Currency: order.Currency, PlanSlug: order.Plan.Slug, PlanName: order.Plan.Name, Email: order.Email, Next: order.Next}
}

func statusFromActive(item ActiveSubscription) SubscriptionStatus {
	var remaining *int
	if item.ApplicationLimit != nil {
		value := *item.ApplicationLimit - item.ApplicationsUsed
		if value < 0 {
			value = 0
		}
		remaining = &value
	}
	plan := item.Plan
	return SubscriptionStatus{Active: true, Status: item.Status, Plan: &plan, StartsAt: &item.StartsAt, EndsAt: &item.EndsAt, Entitlements: item.Entitlements, ApplicationsUsed: item.ApplicationsUsed, ApplicationsRemaining: remaining}
}

func hashOTP(value string) string {
	hash := sha256.Sum256([]byte(strings.TrimSpace(value)))
	return hex.EncodeToString(hash[:])
}

func numericOTP(length int) (string, error) {
	out := make([]byte, length)
	for i := range out {
		n, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		out[i] = byte('0' + n.Int64())
	}
	return string(out), nil
}

func safeNext(value string) string {
	value = strings.TrimSpace(value)
	if value == "" || !strings.HasPrefix(value, "/") || strings.HasPrefix(value, "//") {
		return "/"
	}
	return value
}

func maskEmail(value string) string {
	parts := strings.Split(strings.TrimSpace(value), "@")
	if len(parts) != 2 || len(parts[0]) < 2 {
		return value
	}
	return parts[0][:1] + strings.Repeat("*", len(parts[0])-1) + "@" + parts[1]
}

func otpEmailHTML(otp string, plan Plan) string {
	return fmt.Sprintf(`<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a"><h2>Confirm your Jobs View checkout</h2><p>Use this code to continue with the <strong>%s</strong> plan.</p><p style="font-size:28px;font-weight:800;letter-spacing:6px;color:#0A3A7A">%s</p><p>This code expires in 10 minutes. Jobs View never asks for this code by phone.</p></div>`, html.EscapeString(plan.Name), html.EscapeString(otp))
}

type razorpayEvent struct {
	Event   string `json:"event"`
	Payload struct {
		Payment struct {
			Entity struct {
				ID      string `json:"id"`
				OrderID string `json:"order_id"`
			} `json:"entity"`
		} `json:"payment"`
		Order struct {
			Entity struct {
				ID string `json:"id"`
			} `json:"entity"`
		} `json:"order"`
		Refund struct {
			Entity struct {
				PaymentID string `json:"payment_id"`
			} `json:"entity"`
		} `json:"refund"`
	} `json:"payload"`
}

func (e razorpayEvent) references() (string, string) {
	orderID := e.Payload.Payment.Entity.OrderID
	if orderID == "" {
		orderID = e.Payload.Order.Entity.ID
	}
	paymentID := e.Payload.Payment.Entity.ID
	if paymentID == "" {
		paymentID = e.Payload.Refund.Entity.PaymentID
	}
	return orderID, paymentID
}
