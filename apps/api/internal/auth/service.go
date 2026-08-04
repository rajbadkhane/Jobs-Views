package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"careeros/api/internal/mail"
	"careeros/api/pkg/apperror"
	jwtpkg "careeros/api/pkg/jwt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo   *Repository
	jwt    *jwtpkg.Manager
	mailer mail.Sender
}

func NewService(repo *Repository, jwt *jwtpkg.Manager, mailer mail.Sender) *Service {
	return &Service{repo: repo, jwt: jwt, mailer: mailer}
}

func (s *Service) Register(ctx context.Context, req RegisterRequest, userAgent, ip string) (AuthResult, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return AuthResult{}, apperror.Internal(err)
	}
	user, err := s.repo.CreateUser(ctx, req, string(hash))
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return AuthResult{}, apperror.Conflict("An account already exists for this email.")
		}
		return AuthResult{}, apperror.Database(err)
	}
	verifyToken, err := randomToken(32)
	if err == nil {
		_ = s.repo.CreateVerificationToken(ctx, user.ID, verifyToken, time.Now().UTC().Add(24*time.Hour))
	}
	result, err := s.issue(ctx, user, userAgent, ip)
	result.VerificationToken = verifyToken
	if err == nil {
		_ = s.repo.RecordLogin(ctx, &user.ID, user.Email, userAgent, ip, true, "registered")
		_ = s.repo.TouchDevice(ctx, user.ID, userAgent, ip)
		if verifyToken != "" && s.mailer != nil {
			_ = s.mailer.Send(ctx, user.Email, "Verify your Jobs View email", "<p>Your Jobs View verification token is:</p><p><strong>"+verifyToken+"</strong></p>")
		}
	}
	return result, err
}

func (s *Service) Login(ctx context.Context, req LoginRequest, userAgent, ip string) (AuthResult, error) {
	user, err := s.repo.FindUserByEmail(ctx, req.Email)
	if errors.Is(err, ErrNotFound) {
		_ = s.repo.RecordLogin(ctx, nil, req.Email, userAgent, ip, false, "invalid_credentials")
		return AuthResult{}, apperror.Unauthorized("Invalid email or password.")
	}
	if err != nil {
		return AuthResult{}, apperror.Database(err)
	}
	if !user.IsActive {
		_ = s.repo.RecordLogin(ctx, &user.ID, user.Email, userAgent, ip, false, "inactive")
		return AuthResult{}, apperror.Forbidden("This account is inactive.")
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		_ = s.repo.RecordLogin(ctx, &user.ID, user.Email, userAgent, ip, false, "invalid_credentials")
		return AuthResult{}, apperror.Unauthorized("Invalid email or password.")
	}
	result, err := s.issue(ctx, user, userAgent, ip)
	if err == nil {
		_ = s.repo.RecordLogin(ctx, &user.ID, user.Email, userAgent, ip, true, "")
		_ = s.repo.TouchDevice(ctx, user.ID, userAgent, ip)
	}
	return result, err
}

func (s *Service) Refresh(ctx context.Context, refreshToken, userAgent, ip string) (AuthResult, error) {
	newRefresh, err := randomToken(32)
	if err != nil {
		return AuthResult{}, apperror.Internal(err)
	}
	userID, err := s.repo.RotateSession(ctx, refreshToken, newRefresh, time.Now().UTC().Add(s.jwt.RefreshTTL()))
	if errors.Is(err, ErrNotFound) {
		return AuthResult{}, apperror.Unauthorized("Refresh token is invalid or expired.")
	}
	if err != nil {
		return AuthResult{}, apperror.Database(err)
	}
	user, err := s.repo.FindUserByID(ctx, userID)
	if err != nil {
		return AuthResult{}, apperror.Database(err)
	}
	access, err := s.jwt.GenerateAccess(user.ID, user.Email, user.Role, user.Permissions)
	if err != nil {
		return AuthResult{}, apperror.Internal(err)
	}
	return AuthResult{
		User:         user.response(),
		AccessToken:  access,
		RefreshToken: newRefresh,
		ExpiresAt:    time.Now().UTC().Add(s.jwt.AccessTTL()),
	}, nil
}

func (s *Service) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return nil
	}
	if err := s.repo.RevokeSession(ctx, refreshToken); err != nil {
		return apperror.Database(err)
	}
	return nil
}

func (s *Service) LogoutAll(ctx context.Context, userID uuid.UUID) error {
	if err := s.repo.RevokeAllSessions(ctx, userID); err != nil {
		return apperror.Database(err)
	}
	return nil
}

func (s *Service) ForgotPassword(ctx context.Context, email string) (string, error) {
	token, err := randomToken(32)
	if err != nil {
		return "", apperror.Internal(err)
	}
	if err := s.repo.CreatePasswordReset(ctx, email, token, time.Now().UTC().Add(time.Hour)); err != nil {
		return "", apperror.Database(err)
	}
	if s.mailer != nil {
		_ = s.mailer.Send(ctx, email, "Reset your Jobs View password", "<p>Your Jobs View password reset token is:</p><p><strong>"+token+"</strong></p>")
	}
	return token, nil
}

func (s *Service) ResetPassword(ctx context.Context, token, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return apperror.Internal(err)
	}
	err = s.repo.ResetPassword(ctx, token, string(hash))
	if errors.Is(err, ErrNotFound) {
		return apperror.NotFound("Password reset token is invalid or expired.")
	}
	if err != nil {
		return apperror.Database(err)
	}
	return nil
}

func (s *Service) VerifyEmail(ctx context.Context, token string) error {
	err := s.repo.VerifyEmail(ctx, token)
	if errors.Is(err, ErrNotFound) {
		return apperror.NotFound("Verification token is invalid or expired.")
	}
	if err != nil {
		return apperror.Database(err)
	}
	return nil
}

func (s *Service) issue(ctx context.Context, user User, userAgent, ip string) (AuthResult, error) {
	access, err := s.jwt.GenerateAccess(user.ID, user.Email, user.Role, user.Permissions)
	if err != nil {
		return AuthResult{}, apperror.Internal(err)
	}
	refresh, err := randomToken(32)
	if err != nil {
		return AuthResult{}, apperror.Internal(err)
	}
	if err := s.repo.CreateSession(ctx, user.ID, refresh, userAgent, ip, time.Now().UTC().Add(s.jwt.RefreshTTL())); err != nil {
		return AuthResult{}, apperror.Database(err)
	}
	return AuthResult{
		User:         user.response(),
		AccessToken:  access,
		RefreshToken: refresh,
		ExpiresAt:    time.Now().UTC().Add(s.jwt.AccessTTL()),
	}, nil
}

func (u User) response() UserResponse {
	return UserResponse{ID: u.ID, Email: u.Email, Role: u.Role, IsVerified: u.IsVerified}
}

func randomToken(bytes int) (string, error) {
	buffer := make([]byte, bytes)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return hex.EncodeToString(buffer), nil
}
