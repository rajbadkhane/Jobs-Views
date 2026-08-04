package user

import (
	"context"
	"encoding/json"
	"errors"

	"careeros/api/internal/auth"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (Account, error) {
	var account Account
	err := r.db.QueryRow(ctx, `
		SELECT u.id, u.email, r.name, u.is_active, u.is_verified, u.email_verified_at, u.created_at, u.updated_at
		FROM users u
		JOIN user_roles ur ON ur.user_id = u.id
		JOIN roles r ON r.id = ur.role_id
		WHERE u.id = $1 AND u.deleted_at IS NULL
	`, id).Scan(&account.ID, &account.Email, &account.Role, &account.IsActive, &account.IsVerified, &account.EmailVerifiedAt, &account.CreatedAt, &account.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Account{}, auth.ErrNotFound
	}
	return account, err
}

func (r *Repository) List(ctx context.Context, limit, offset int) ([]Account, error) {
	rows, err := r.db.Query(ctx, `
		SELECT u.id, u.email, r.name, u.is_active, u.is_verified, u.email_verified_at, u.created_at, u.updated_at
		FROM users u
		JOIN user_roles ur ON ur.user_id = u.id
		JOIN roles r ON r.id = ur.role_id
		WHERE u.deleted_at IS NULL
		ORDER BY u.created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	accounts := []Account{}
	for rows.Next() {
		var account Account
		if err := rows.Scan(&account.ID, &account.Email, &account.Role, &account.IsActive, &account.IsVerified, &account.EmailVerifiedAt, &account.CreatedAt, &account.UpdatedAt); err != nil {
			return nil, err
		}
		accounts = append(accounts, account)
	}
	return accounts, rows.Err()
}

func (r *Repository) Update(ctx context.Context, id uuid.UUID, req UpdateAccountRequest) (Account, error) {
	account, err := r.GetByID(ctx, id)
	if err != nil {
		return Account{}, err
	}
	email := account.Email
	if req.Email != "" {
		email = req.Email
	}
	isActive := account.IsActive
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	_, err = r.db.Exec(ctx, `UPDATE users SET email = $1, is_active = $2 WHERE id = $3`, email, isActive, id)
	if err != nil {
		return Account{}, err
	}
	return r.GetByID(ctx, id)
}

func (r *Repository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET deleted_at = NOW(), is_active = FALSE WHERE id = $1`, id)
	return err
}

func (r *Repository) Sessions(ctx context.Context, userID uuid.UUID) ([]Session, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, coalesce(user_agent, ''), coalesce(ip_address::text, ''), expires_at, revoked_at, created_at
		FROM user_sessions
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []Session{}
	for rows.Next() {
		var item Session
		if err := rows.Scan(&item.ID, &item.UserAgent, &item.IPAddress, &item.ExpiresAt, &item.RevokedAt, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) Devices(ctx context.Context, userID uuid.UUID) ([]Device, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, coalesce(user_agent, ''), coalesce(ip_address::text, ''), last_seen_at, created_at
		FROM user_devices
		WHERE user_id = $1
		ORDER BY last_seen_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []Device{}
	for rows.Next() {
		var item Device
		if err := rows.Scan(&item.ID, &item.UserAgent, &item.IPAddress, &item.LastSeenAt, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) LoginHistory(ctx context.Context, userID uuid.UUID) ([]LoginEvent, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, coalesce(email, ''), coalesce(ip_address::text, ''), coalesce(user_agent, ''), success, coalesce(reason, ''), created_at
		FROM login_history
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []LoginEvent{}
	for rows.Next() {
		var item LoginEvent
		if err := rows.Scan(&item.ID, &item.UserID, &item.Email, &item.IPAddress, &item.UserAgent, &item.Success, &item.Reason, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) AuditTrail(ctx context.Context, userID uuid.UUID) ([]AuditEvent, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, action, coalesce(resource_type, ''), resource_id, metadata, coalesce(ip_address::text, ''), coalesce(user_agent, ''), created_at
		FROM audit_events
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 100
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []AuditEvent{}
	for rows.Next() {
		var item AuditEvent
		var metadata []byte
		if err := rows.Scan(&item.ID, &item.UserID, &item.Action, &item.ResourceType, &item.ResourceID, &metadata, &item.IPAddress, &item.UserAgent, &item.CreatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(metadata, &item.Metadata)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) AddAudit(ctx context.Context, userID uuid.UUID, action, resourceType string, resourceID *uuid.UUID, metadata map[string]any, ip, userAgent string) error {
	bytes, _ := json.Marshal(metadata)
	_, err := r.db.Exec(ctx, `
		INSERT INTO audit_events (user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
		VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::inet, $7)
	`, userID, action, resourceType, resourceID, string(bytes), ip, userAgent)
	return err
}
