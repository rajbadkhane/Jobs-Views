package subscription

import (
	"testing"

	"careeros/api/internal/config"
)

func TestRazorpayWebhookSignature(t *testing.T) {
	t.Parallel()
	body := []byte(`{"event":"payment.captured"}`)
	provider := NewRazorpayProvider(config.RazorpayConfig{WebhookSecret: "webhook-secret"})
	signature := sign(string(body), "webhook-secret")
	if !provider.VerifyWebhook(body, signature) {
		t.Fatal("expected a valid webhook signature")
	}
	if provider.VerifyWebhook(body, "invalid") {
		t.Fatal("invalid webhook signature was accepted")
	}
}

func TestRazorpayProviderRejectsMissingCredentials(t *testing.T) {
	t.Parallel()
	provider := NewRazorpayProvider(config.RazorpayConfig{})
	if provider.VerifyWebhook([]byte("{}"), "signature") {
		t.Fatal("unconfigured provider accepted a webhook")
	}
}

func TestRazorpayPaymentSignature(t *testing.T) {
	t.Parallel()
	provider := NewRazorpayProvider(config.RazorpayConfig{KeySecret: "payment-secret"})
	signature := sign("order_test|pay_test", "payment-secret")
	if err := provider.VerifySignature("order_test", "pay_test", signature); err != nil {
		t.Fatalf("expected valid payment signature: %v", err)
	}
	if err := provider.VerifySignature("order_test", "pay_test", "invalid"); err == nil {
		t.Fatal("invalid payment signature was accepted")
	}
}
