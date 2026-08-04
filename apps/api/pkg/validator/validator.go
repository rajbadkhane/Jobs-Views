package validator

import (
	"strings"

	govalidator "github.com/go-playground/validator/v10"
)

type Validator struct {
	validate *govalidator.Validate
}

func New() *Validator {
	return &Validator{validate: govalidator.New()}
}

func (v *Validator) Struct(value any) map[string]string {
	if err := v.validate.Struct(value); err != nil {
		errors := make(map[string]string)
		for _, fieldErr := range err.(govalidator.ValidationErrors) {
			name := strings.ToLower(fieldErr.Field())
			errors[name] = validationMessage(fieldErr)
		}
		return errors
	}
	return nil
}

func validationMessage(err govalidator.FieldError) string {
	switch err.Tag() {
	case "required":
		return "is required"
	case "email":
		return "must be a valid email address"
	case "min":
		return "must be at least " + err.Param() + " characters"
	case "oneof":
		return "must be one of: " + err.Param()
	default:
		return "is invalid"
	}
}
