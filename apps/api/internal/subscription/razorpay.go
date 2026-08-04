package subscription

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"careeros/api/internal/config"
)

var ErrPaymentUnavailable = errors.New("payment checkout is not configured")

type PaymentProvider interface {
	KeyID() string
	CreateOrder(ctx context.Context, checkout CheckoutOrder) (string, error)
	CreateRawOrder(ctx context.Context, amountPaise int, currency, receipt string) (string, error)
	VerifyPayment(ctx context.Context, providerOrderID, providerPaymentID, signature string, amountPaise int, currency string) error
	VerifySignature(providerOrderID, providerPaymentID, signature string) error
	VerifyWebhook(body []byte, signature string) bool
}

type RazorpayAPIError struct {
	Status  int
	Message string
}

func (e RazorpayAPIError) Error() string {
	return fmt.Sprintf("razorpay request failed with status %d: %s", e.Status, e.Message)
}

type RazorpayProvider struct {
	config config.RazorpayConfig
	client *http.Client
}

func NewRazorpayProvider(cfg config.RazorpayConfig) *RazorpayProvider {
	return &RazorpayProvider{config: cfg, client: &http.Client{Timeout: 12 * time.Second}}
}

func (p *RazorpayProvider) KeyID() string { return p.config.KeyID }

func (p *RazorpayProvider) CreateOrder(ctx context.Context, checkout CheckoutOrder) (string, error) {
	if p.config.KeyID == "" || p.config.KeySecret == "" {
		return "", ErrPaymentUnavailable
	}
	payload := map[string]any{
		"amount":   checkout.AmountPaise,
		"currency": checkout.Currency,
		"receipt":  checkout.ID.String(),
		"notes": map[string]string{
			"checkout_id": checkout.ID.String(),
			"plan":        checkout.Plan.Slug,
			"user_id":     checkout.UserID.String(),
		},
	}
	var response struct {
		ID string `json:"id"`
	}
	if err := p.request(ctx, http.MethodPost, "/orders", payload, &response); err != nil {
		return "", err
	}
	if response.ID == "" {
		return "", fmt.Errorf("razorpay returned an empty order id")
	}
	return response.ID, nil
}

func (p *RazorpayProvider) CreateRawOrder(ctx context.Context, amountPaise int, currency, receipt string) (string, error) {
	if p.config.KeyID == "" || p.config.KeySecret == "" {
		return "", ErrPaymentUnavailable
	}
	payload := map[string]any{
		"amount":   amountPaise,
		"currency": strings.ToUpper(strings.TrimSpace(currency)),
		"receipt":  strings.TrimSpace(receipt),
	}
	var response struct {
		ID string `json:"id"`
	}
	if err := p.request(ctx, http.MethodPost, "/orders", payload, &response); err != nil {
		return "", err
	}
	if response.ID == "" {
		return "", fmt.Errorf("razorpay returned an empty order id")
	}
	return response.ID, nil
}

func (p *RazorpayProvider) VerifyPayment(ctx context.Context, providerOrderID, providerPaymentID, signature string, amountPaise int, currency string) error {
	if p.config.KeySecret == "" {
		return ErrPaymentUnavailable
	}
	if err := p.VerifySignature(providerOrderID, providerPaymentID, signature); err != nil {
		return err
	}
	var payment struct {
		ID       string `json:"id"`
		OrderID  string `json:"order_id"`
		Status   string `json:"status"`
		Amount   int    `json:"amount"`
		Currency string `json:"currency"`
	}
	if err := p.request(ctx, http.MethodGet, "/payments/"+providerPaymentID, nil, &payment); err != nil {
		return err
	}
	if payment.ID != providerPaymentID || payment.OrderID != providerOrderID || payment.Status != "captured" || payment.Amount != amountPaise || !strings.EqualFold(payment.Currency, currency) {
		return errors.New("razorpay payment does not match the checkout order")
	}
	return nil
}

func (p *RazorpayProvider) VerifySignature(providerOrderID, providerPaymentID, signature string) error {
	if p.config.KeySecret == "" {
		return ErrPaymentUnavailable
	}
	expected := sign(strings.TrimSpace(providerOrderID)+"|"+strings.TrimSpace(providerPaymentID), p.config.KeySecret)
	if !hmac.Equal([]byte(expected), []byte(strings.ToLower(strings.TrimSpace(signature)))) {
		return errors.New("invalid razorpay payment signature")
	}
	return nil
}

func (p *RazorpayProvider) VerifyWebhook(body []byte, signature string) bool {
	if p.config.WebhookSecret == "" || signature == "" {
		return false
	}
	expected := sign(string(body), p.config.WebhookSecret)
	return hmac.Equal([]byte(expected), []byte(strings.ToLower(strings.TrimSpace(signature))))
}

func (p *RazorpayProvider) request(ctx context.Context, method, path string, payload any, target any) error {
	var body io.Reader
	if payload != nil {
		raw, err := json.Marshal(payload)
		if err != nil {
			return err
		}
		body = bytes.NewReader(raw)
	}
	req, err := http.NewRequestWithContext(ctx, method, strings.TrimRight(p.config.APIBaseURL, "/")+path, body)
	if err != nil {
		return err
	}
	req.SetBasicAuth(p.config.KeyID, p.config.KeySecret)
	req.Header.Set("Content-Type", "application/json")
	response, err := p.client.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		message, _ := io.ReadAll(io.LimitReader(response.Body, 4096))
		return RazorpayAPIError{Status: response.StatusCode, Message: strings.TrimSpace(string(message))}
	}
	return json.NewDecoder(response.Body).Decode(target)
}

func sign(value, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(value))
	return hex.EncodeToString(mac.Sum(nil))
}
