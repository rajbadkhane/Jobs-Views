package subscription

import (
	"context"
	"regexp"
	"testing"
)

func TestSafeNext(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		in   string
		want string
	}{
		{name: "internal", in: "/jobs/driver", want: "/jobs/driver"},
		{name: "empty", in: "", want: "/"},
		{name: "absolute URL", in: "https://example.com", want: "/"},
		{name: "protocol relative", in: "//example.com", want: "/"},
	}
	for _, test := range tests {
		test := test
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			if got := safeNext(test.in); got != test.want {
				t.Fatalf("safeNext(%q) = %q, want %q", test.in, got, test.want)
			}
		})
	}
}

func TestNumericOTP(t *testing.T) {
	t.Parallel()
	otp, err := numericOTP(6)
	if err != nil {
		t.Fatal(err)
	}
	if !regexp.MustCompile(`^[0-9]{6}$`).MatchString(otp) {
		t.Fatalf("numericOTP returned %q", otp)
	}
}

func TestOTPHashIsDeterministicAndNotPlaintext(t *testing.T) {
	t.Parallel()
	first := hashOTP("123456")
	second := hashOTP("123456")
	if first != second {
		t.Fatal("hashOTP must be deterministic")
	}
	if first == "123456" {
		t.Fatal("hashOTP must not retain plaintext")
	}
}

func TestCreateRawOrderRejectsSmallAmount(t *testing.T) {
	t.Parallel()
	service := NewService(nil, nil, nil)
	if _, err := service.CreateRawOrder(context.Background(), CreateOrderRequest{Amount: 99, Currency: "INR"}); err == nil {
		t.Fatal("expected amount below 100 paise to be rejected")
	}
}
