package auth

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
	IsActive     bool
	IsVerified   bool
	Role         string
	Permissions  []string
}

type AuthResult struct {
	User              UserResponse `json:"user"`
	AccessToken       string       `json:"access_token"`
	RefreshToken      string       `json:"refresh_token,omitempty"`
	ExpiresAt         time.Time    `json:"expires_at"`
	VerificationToken string       `json:"verification_token,omitempty"`
	Stateless         bool         `json:"-"`
}

type UserResponse struct {
	ID         uuid.UUID `json:"id"`
	Email      string    `json:"email"`
	Role       string    `json:"role"`
	IsVerified bool      `json:"is_verified"`
}

type RegisterRequest struct {
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required,min=8"`
	Role        string `json:"role" validate:"required,oneof=EMPLOYER JOB_SEEKER"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Mobile      string `json:"mobile"`
	CompanyName string `json:"company_name"`
	Website     string `json:"website"`
	GSTNumber   string `json:"gst_number"`
	CINNumber   string `json:"cin_number"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Token    string `json:"token" validate:"required"`
	Password string `json:"password" validate:"required,min=8"`
}
