package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateUser(ctx context.Context, req RegisterRequest, passwordHash string) (User, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return User{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var user User
	err = tx.QueryRow(ctx, `
		INSERT INTO users (email, password_hash)
		VALUES ($1, $2)
		RETURNING id, email, password_hash, is_active, is_verified
	`, strings.ToLower(req.Email), passwordHash).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.IsActive, &user.IsVerified)
	if err != nil {
		return User{}, err
	}

	var roleID int
	err = tx.QueryRow(ctx, `SELECT id FROM roles WHERE name = $1`, req.Role).Scan(&roleID)
	if err != nil {
		return User{}, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, user.ID, roleID)
	if err != nil {
		return User{}, err
	}

	if req.Role == "JOB_SEEKER" {
		firstName := fallback(req.FirstName, "New")
		lastName := fallback(req.LastName, "Candidate")
		_, err = tx.Exec(ctx, `
			INSERT INTO candidate_profiles (user_id, first_name, last_name)
			VALUES ($1, $2, $3)
		`, user.ID, firstName, lastName)
		if err != nil {
			return User{}, err
		}
	}

	if req.Role == "EMPLOYER" && req.CompanyName != "" {
		slug := slugify(req.CompanyName)
		var companyID uuid.UUID
		err = tx.QueryRow(ctx, `
			INSERT INTO companies (name, slug, website, gst_number, cin_number, status)
			VALUES ($1, $2, $3, $4, $5, 'pending')
			RETURNING id
		`, req.CompanyName, slug, req.Website, req.GSTNumber, req.CINNumber).Scan(&companyID)
		if err != nil {
			return User{}, err
		}
		_, err = tx.Exec(ctx, `INSERT INTO company_users (company_id, user_id, role) VALUES ($1, $2, 'owner')`, companyID, user.ID)
		if err != nil {
			return User{}, err
		}
	}

	user.Role = req.Role
	user.Permissions, err = r.permissionsForRole(ctx, tx, req.Role)
	if err != nil {
		return User{}, err
	}
	return user, tx.Commit(ctx)
}

func (r *Repository) FindUserByEmail(ctx context.Context, email string) (User, error) {
	return r.scanUser(ctx, `WHERE u.email = $1 AND u.deleted_at IS NULL`, strings.ToLower(email))
}

func (r *Repository) FindUserByID(ctx context.Context, id uuid.UUID) (User, error) {
	return r.scanUser(ctx, `WHERE u.id = $1 AND u.deleted_at IS NULL`, id)
}

func (r *Repository) CreateSession(ctx context.Context, userID uuid.UUID, refreshToken, userAgent, ip string, expiresAt time.Time) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	_, err = tx.Exec(ctx, `
		INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
		VALUES ($1, $2, $3, NULLIF($4, '')::inet, $5)
	`, userID, hashToken(refreshToken), userAgent, ip, expiresAt)
	if err != nil {
		return err
	}

	// Enforce limit of up to 10 concurrent devices per account: revoke older sessions beyond the newest 10
	_, err = tx.Exec(ctx, `
		UPDATE user_sessions
		SET revoked_at = NOW()
		WHERE user_id = $1 AND revoked_at IS NULL AND id NOT IN (
			SELECT id FROM user_sessions
			WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
			ORDER BY created_at DESC
			LIMIT 10
		)
	`, userID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *Repository) RecordLogin(ctx context.Context, userID *uuid.UUID, email, userAgent, ip string, success bool, reason string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO login_history (user_id, email, ip_address, user_agent, success, reason)
		VALUES ($1, $2, NULLIF($3, '')::inet, $4, $5, $6)
	`, userID, strings.ToLower(email), ip, userAgent, success, reason)
	return err
}

func (r *Repository) TouchDevice(ctx context.Context, userID uuid.UUID, userAgent, ip string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO user_devices (user_id, user_agent, ip_address)
		VALUES ($1, $2, NULLIF($3, '')::inet)
	`, userID, userAgent, ip)
	return err
}

func (r *Repository) RotateSession(ctx context.Context, oldToken, newToken string, expiresAt time.Time) (uuid.UUID, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return uuid.Nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var userID uuid.UUID
	err = tx.QueryRow(ctx, `
		SELECT user_id FROM user_sessions
		WHERE refresh_token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
		FOR UPDATE
	`, hashToken(oldToken)).Scan(&userID)
	if errors.Is(err, pgx.ErrNoRows) {
		return uuid.Nil, ErrNotFound
	}
	if err != nil {
		return uuid.Nil, err
	}

	_, err = tx.Exec(ctx, `
		UPDATE user_sessions
		SET refresh_token_hash = $1, expires_at = $2
		WHERE refresh_token_hash = $3
	`, hashToken(newToken), expiresAt, hashToken(oldToken))
	if err != nil {
		return uuid.Nil, err
	}
	return userID, tx.Commit(ctx)
}

func (r *Repository) RevokeSession(ctx context.Context, refreshToken string) error {
	_, err := r.db.Exec(ctx, `UPDATE user_sessions SET revoked_at = NOW() WHERE refresh_token_hash = $1`, hashToken(refreshToken))
	return err
}

func (r *Repository) RevokeAllSessions(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, userID)
	return err
}

func (r *Repository) CreateVerificationToken(ctx context.Context, userID uuid.UUID, token string, expiresAt time.Time) error {
	_, err := r.db.Exec(ctx, `INSERT INTO verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`, userID, hashToken(token), expiresAt)
	return err
}

func (r *Repository) VerifyEmail(ctx context.Context, token string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var userID uuid.UUID
	err = tx.QueryRow(ctx, `
		UPDATE verification_tokens
		SET used_at = NOW()
		WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
		RETURNING user_id
	`, hashToken(token)).Scan(&userID)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `UPDATE users SET is_verified = TRUE, email_verified_at = NOW() WHERE id = $1`, userID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *Repository) CreatePasswordReset(ctx context.Context, email, token string, expiresAt time.Time) error {
	user, err := r.FindUserByEmail(ctx, email)
	if errors.Is(err, ErrNotFound) {
		return nil
	}
	if err != nil {
		return err
	}
	_, err = r.db.Exec(ctx, `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`, user.ID, hashToken(token), expiresAt)
	return err
}

func (r *Repository) ResetPassword(ctx context.Context, token, passwordHash string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var userID uuid.UUID
	err = tx.QueryRow(ctx, `
		UPDATE password_resets
		SET used_at = NOW()
		WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
		RETURNING user_id
	`, hashToken(token)).Scan(&userID)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `UPDATE users SET password_hash = $1 WHERE id = $2`, passwordHash, userID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, userID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *Repository) RoleHasPermission(ctx context.Context, role, permission string) (bool, error) {
	if role == "SUPER_ADMIN" {
		return true, nil
	}
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM roles r
			JOIN role_permissions rp ON rp.role_id = r.id
			JOIN permissions p ON p.id = rp.permission_id
			WHERE r.name = $1 AND p.name = $2
		)
	`, role, permission).Scan(&exists)
	return exists, err
}

func (r *Repository) scanUser(ctx context.Context, where string, args ...any) (User, error) {
	query := fmt.Sprintf(`
		SELECT u.id, u.email, u.password_hash, u.is_active, u.is_verified, r.name
		FROM users u
		JOIN user_roles ur ON ur.user_id = u.id
		JOIN roles r ON r.id = ur.role_id
		%s
		LIMIT 1
	`, where)
	var user User
	err := r.db.QueryRow(ctx, query, args...).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.IsActive, &user.IsVerified, &user.Role)
	if errors.Is(err, pgx.ErrNoRows) {
		return User{}, ErrNotFound
	}
	if err != nil {
		return User{}, err
	}
	user.Permissions, err = r.permissionsForRole(ctx, r.db, user.Role)
	if err != nil {
		return User{}, err
	}
	return user, nil
}

type querier interface {
	Query(context.Context, string, ...any) (pgx.Rows, error)
}

func (r *Repository) permissionsForRole(ctx context.Context, q querier, role string) ([]string, error) {
	rows, err := q.Query(ctx, `
		SELECT p.name
		FROM roles r
		JOIN role_permissions rp ON rp.role_id = r.id
		JOIN permissions p ON p.id = rp.permission_id
		WHERE r.name = $1
		ORDER BY p.name
	`, role)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	permissions := []string{}
	for rows.Next() {
		var permission string
		if err := rows.Scan(&permission); err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}
	return permissions, rows.Err()
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func fallback(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func slugify(value string) string {
	slug := strings.ToLower(strings.TrimSpace(value))
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug + "-" + uuid.NewString()[:8]
}
