package validator

import "testing"

type sampleRequest struct {
	Email string `validate:"required,email"`
	Name  string `validate:"required"`
}

func TestStructReturnsValidationDetails(t *testing.T) {
	v := New()
	details := v.Struct(sampleRequest{Email: "bad"})
	if details == nil {
		t.Fatal("expected validation errors")
	}
	if details["email"] == "" || details["name"] == "" {
		t.Fatalf("expected email and name validation messages, got %+v", details)
	}
}
