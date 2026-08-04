package jwt

import (
	"time"

	"careeros/api/internal/config"
	golangjwt "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	UserID      uuid.UUID `json:"sub"`
	Email       string    `json:"email"`
	Role        string    `json:"role"`
	Permissions []string  `json:"permissions"`
	golangjwt.RegisteredClaims
}

type Manager struct {
	accessSecret  []byte
	refreshSecret []byte
	accessTTL     time.Duration
	refreshTTL    time.Duration
	issuer        string
}

func NewManager(cfg config.JWTConfig) *Manager {
	return &Manager{
		accessSecret:  []byte(cfg.AccessSecret),
		refreshSecret: []byte(cfg.RefreshSecret),
		accessTTL:     cfg.AccessTTL,
		refreshTTL:    cfg.RefreshTTL,
		issuer:        cfg.Issuer,
	}
}

func (m *Manager) AccessTTL() time.Duration {
	return m.accessTTL
}

func (m *Manager) RefreshTTL() time.Duration {
	return m.refreshTTL
}

func (m *Manager) GenerateAccess(userID uuid.UUID, email, role string, permissions []string) (string, error) {
	now := time.Now().UTC()
	claims := Claims{
		UserID:      userID,
		Email:       email,
		Role:        role,
		Permissions: permissions,
		RegisteredClaims: golangjwt.RegisteredClaims{
			Issuer:    m.issuer,
			Subject:   userID.String(),
			IssuedAt:  golangjwt.NewNumericDate(now),
			ExpiresAt: golangjwt.NewNumericDate(now.Add(m.accessTTL)),
		},
	}
	return golangjwt.NewWithClaims(golangjwt.SigningMethodHS256, claims).SignedString(m.accessSecret)
}

func (m *Manager) ParseAccess(token string) (*Claims, error) {
	claims := &Claims{}
	parsed, err := golangjwt.ParseWithClaims(token, claims, func(token *golangjwt.Token) (any, error) {
		return m.accessSecret, nil
	}, golangjwt.WithIssuer(m.issuer))
	if err != nil || !parsed.Valid {
		return nil, err
	}
	return claims, nil
}
