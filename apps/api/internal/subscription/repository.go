package subscription

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("candidate subscription resource not found")

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db} }

func (r *Repository) Plans(ctx context.Context) ([]Plan, error) {
	rows, err := r.db.Query(ctx, `SELECT id, name, slug, price_paise, currency, duration_days, application_limit, entitlements FROM candidate_subscription_plans WHERE is_active = true ORDER BY price_paise`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Plan{}
	for rows.Next() {
		item, err := scanPlan(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) PlanBySlug(ctx context.Context, slug string) (Plan, error) {
	row := r.db.QueryRow(ctx, `SELECT id, name, slug, price_paise, currency, duration_days, application_limit, entitlements FROM candidate_subscription_plans WHERE slug = $1 AND is_active = true`, strings.ToLower(slug))
	item, err := scanPlan(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return Plan{}, ErrNotFound
	}
	return item, err
}

func (r *Repository) RecentOTPCount(ctx context.Context, userID uuid.UUID, since time.Time) (int, error) {
	var count int
	err := r.db.QueryRow(ctx, `SELECT count(*) FROM candidate_subscription_orders WHERE user_id = $1 AND created_at >= $2`, userID, since).Scan(&count)
	return count, err
}

func (r *Repository) CreateOTPOrder(ctx context.Context, userID uuid.UUID, email, next, otpHash string, expiresAt time.Time, plan Plan) (CheckoutOrder, error) {
	entitlements, _ := json.Marshal(plan.Entitlements)
	var id uuid.UUID
	err := r.db.QueryRow(ctx, `
		INSERT INTO candidate_subscription_orders
		(user_id, plan_id, email, next_path, amount_paise, currency, duration_days, application_limit, entitlements, otp_hash, otp_expires_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id
	`, userID, plan.ID, strings.ToLower(email), next, plan.PricePaise, plan.Currency, plan.DurationDays, plan.ApplicationLimit, string(entitlements), otpHash, expiresAt).Scan(&id)
	if err != nil {
		return CheckoutOrder{}, err
	}
	return r.OrderForUser(ctx, id, userID)
}

func (r *Repository) OrderForUser(ctx context.Context, id, userID uuid.UUID) (CheckoutOrder, error) {
	return scanOrder(r.db.QueryRow(ctx, orderSelect()+` WHERE o.id = $1 AND o.user_id = $2`, id, userID))
}

func (r *Repository) OrderByProviderID(ctx context.Context, providerOrderID string) (CheckoutOrder, error) {
	return scanOrder(r.db.QueryRow(ctx, orderSelect()+` WHERE o.provider_order_id = $1`, providerOrderID))
}

func (r *Repository) OrderByPaymentID(ctx context.Context, providerPaymentID string) (CheckoutOrder, error) {
	return scanOrder(r.db.QueryRow(ctx, orderSelect()+` WHERE o.provider_payment_id = $1`, providerPaymentID))
}

func (r *Repository) IncrementAttempts(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE candidate_subscription_orders SET otp_attempts = otp_attempts + 1 WHERE id = $1`, id)
	return err
}

func (r *Repository) MarkPaymentPending(ctx context.Context, id uuid.UUID, providerOrderID string) error {
	tag, err := r.db.Exec(ctx, `UPDATE candidate_subscription_orders SET status='payment_pending', otp_verified_at=NOW(), provider_order_id=$2 WHERE id=$1 AND status='otp_pending'`, id, providerOrderID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *Repository) MarkFailed(ctx context.Context, providerOrderID, code string) error {
	_, err := r.db.Exec(ctx, `UPDATE candidate_subscription_orders SET status='failed', failure_code=$2 WHERE provider_order_id=$1 AND status <> 'paid'`, providerOrderID, code)
	return err
}

func (r *Repository) MarkCheckoutFailed(ctx context.Context, id uuid.UUID, code string) error {
	_, err := r.db.Exec(ctx, `UPDATE candidate_subscription_orders SET status='failed', failure_code=$2 WHERE id=$1 AND status <> 'paid'`, id, code)
	return err
}

func (r *Repository) Activate(ctx context.Context, providerOrderID, providerPaymentID string) (ActiveSubscription, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return ActiveSubscription{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	order, err := scanOrder(tx.QueryRow(ctx, orderSelect()+` WHERE o.provider_order_id = $1 FOR UPDATE`, providerOrderID))
	if err != nil {
		return ActiveSubscription{}, err
	}
	if order.Status == "paid" {
		item, err := currentSubscriptionTx(ctx, tx, order.UserID)
		if err != nil {
			return ActiveSubscription{}, err
		}
		if err := tx.Commit(ctx); err != nil {
			return ActiveSubscription{}, err
		}
		return item, nil
	}
	if order.Status != "payment_pending" {
		return ActiveSubscription{}, ErrNotFound
	}

	if _, err := tx.Exec(ctx, `UPDATE candidate_subscriptions SET status=CASE WHEN ends_at <= NOW() THEN 'expired' ELSE 'cancelled' END WHERE user_id=$1 AND status='active'`, order.UserID); err != nil {
		return ActiveSubscription{}, err
	}
	if _, err := tx.Exec(ctx, `UPDATE candidate_subscription_orders SET status='paid', provider_payment_id=$2, paid_at=NOW() WHERE id=$1`, order.ID, providerPaymentID); err != nil {
		return ActiveSubscription{}, err
	}
	entitlements, _ := json.Marshal(order.Entitlements)
	var subscriptionID uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO candidate_subscriptions (user_id, plan_id, order_id, price_paise, currency, application_limit, entitlements, starts_at, ends_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()+make_interval(days => $8)) RETURNING id
	`, order.UserID, order.Plan.ID, order.ID, order.AmountPaise, order.Currency, order.ApplicationLimit, string(entitlements), order.DurationDays).Scan(&subscriptionID)
	if err != nil {
		return ActiveSubscription{}, err
	}
	item, err := currentSubscriptionTx(ctx, tx, order.UserID)
	if err != nil {
		return ActiveSubscription{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return ActiveSubscription{}, err
	}
	return item, nil
}

func (r *Repository) Refund(ctx context.Context, providerOrderID string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var orderID uuid.UUID
	if err := tx.QueryRow(ctx, `UPDATE candidate_subscription_orders SET status='refunded' WHERE provider_order_id=$1 RETURNING id`, providerOrderID).Scan(&orderID); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `UPDATE candidate_subscriptions SET status='refunded' WHERE order_id=$1 AND status='active'`, orderID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *Repository) Current(ctx context.Context, userID uuid.UUID) (ActiveSubscription, error) {
	_, _ = r.db.Exec(ctx, `UPDATE candidate_subscriptions SET status='expired' WHERE user_id=$1 AND status='active' AND ends_at <= NOW()`, userID)
	item, err := currentSubscriptionQuery(ctx, r.db, userID)
	if errors.Is(err, pgx.ErrNoRows) {
		return ActiveSubscription{}, ErrNotFound
	}
	return item, err
}

func (r *Repository) LatestSubscriptionStatus(ctx context.Context, userID uuid.UUID) string {
	var status string
	_ = r.db.QueryRow(ctx, `SELECT status FROM candidate_subscriptions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1`, userID).Scan(&status)
	if status == "" {
		return "none"
	}
	return status
}

func (r *Repository) SaveEvent(ctx context.Context, id, eventType string, payload []byte) (bool, error) {
	var inserted bool
	err := r.db.QueryRow(ctx, `
		INSERT INTO candidate_payment_events (provider_event_id, event_type, payload) VALUES ($1,$2,$3)
		ON CONFLICT (provider_event_id) DO NOTHING RETURNING true
	`, id, eventType, payload).Scan(&inserted)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return inserted, err
}

func (r *Repository) FinishEvent(ctx context.Context, id, status, message string) error {
	_, err := r.db.Exec(ctx, `UPDATE candidate_payment_events SET status=$2, error_message=NULLIF($3,''), processed_at=NOW() WHERE provider_event_id=$1`, id, status, message)
	return err
}

func (r *Repository) CreateSupportTicket(ctx context.Context, userID uuid.UUID, email, subject, message, priority, planSlug string) (SupportResponse, error) {
	metadata, _ := json.Marshal(map[string]string{"candidate_plan": planSlug})
	var item SupportResponse
	err := r.db.QueryRow(ctx, `
		INSERT INTO support_tickets (requester_user_id,email,ticket_type,subject,message,status,priority,metadata)
		VALUES ($1,$2,'ticket',$3,$4,'open',$5,$6) RETURNING id,status,priority
	`, userID, email, subject, message, priority, string(metadata)).Scan(&item.ID, &item.Status, &item.Priority)
	return item, err
}

type rowScanner interface {
	Scan(...any) error
}

func scanPlan(row rowScanner) (Plan, error) {
	var item Plan
	var raw []byte
	err := row.Scan(&item.ID, &item.Name, &item.Slug, &item.PricePaise, &item.Currency, &item.DurationDays, &item.ApplicationLimit, &raw)
	if err != nil {
		return item, err
	}
	_ = json.Unmarshal(raw, &item.Entitlements)
	return item, nil
}

func scanOrder(row rowScanner) (CheckoutOrder, error) {
	var item CheckoutOrder
	var raw []byte
	err := row.Scan(&item.ID, &item.UserID, &item.Plan.ID, &item.Plan.Name, &item.Plan.Slug, &item.Email, &item.Next, &item.Status,
		&item.AmountPaise, &item.Currency, &item.DurationDays, &item.ApplicationLimit, &raw, &item.OTPHash, &item.OTPExpiresAt,
		&item.OTPAttempts, &item.OTPVerifiedAt, &item.ProviderOrderID, &item.ProviderPaymentID, &item.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return item, ErrNotFound
	}
	if err != nil {
		return item, err
	}
	_ = json.Unmarshal(raw, &item.Entitlements)
	item.Plan.PricePaise = item.AmountPaise
	item.Plan.Currency = item.Currency
	item.Plan.DurationDays = item.DurationDays
	item.Plan.ApplicationLimit = item.ApplicationLimit
	item.Plan.Entitlements = item.Entitlements
	return item, nil
}

func orderSelect() string {
	return `SELECT o.id,o.user_id,p.id,p.name,p.slug,o.email,o.next_path,o.status,o.amount_paise,o.currency,o.duration_days,o.application_limit,o.entitlements,o.otp_hash,o.otp_expires_at,o.otp_attempts,o.otp_verified_at,coalesce(o.provider_order_id,''),coalesce(o.provider_payment_id,''),o.created_at FROM candidate_subscription_orders o JOIN candidate_subscription_plans p ON p.id=o.plan_id`
}

type queryRower interface {
	QueryRow(context.Context, string, ...any) pgx.Row
}

func currentSubscriptionQuery(ctx context.Context, db queryRower, userID uuid.UUID) (ActiveSubscription, error) {
	var item ActiveSubscription
	var raw []byte
	err := db.QueryRow(ctx, `
		SELECT s.id,s.user_id,p.id,p.name,p.slug,s.status,s.price_paise,s.currency,s.application_limit,s.entitlements,s.starts_at,s.ends_at,
		(SELECT count(*) FROM applications a WHERE a.candidate_user_id=s.user_id AND a.deleted_at IS NULL AND a.created_at >= s.starts_at AND a.created_at < s.ends_at)
		FROM candidate_subscriptions s JOIN candidate_subscription_plans p ON p.id=s.plan_id
		WHERE s.user_id=$1 AND s.status='active' AND s.ends_at > NOW() ORDER BY s.created_at DESC LIMIT 1
	`, userID).Scan(&item.ID, &item.UserID, &item.Plan.ID, &item.Plan.Name, &item.Plan.Slug, &item.Status, &item.PricePaise, &item.Currency,
		&item.ApplicationLimit, &raw, &item.StartsAt, &item.EndsAt, &item.ApplicationsUsed)
	if err != nil {
		return item, err
	}
	_ = json.Unmarshal(raw, &item.Entitlements)
	item.Plan.PricePaise = item.PricePaise
	item.Plan.Currency = item.Currency
	item.Plan.DurationDays = int(item.EndsAt.Sub(item.StartsAt).Hours() / 24)
	item.Plan.ApplicationLimit = item.ApplicationLimit
	item.Plan.Entitlements = item.Entitlements
	return item, nil
}

func currentSubscriptionTx(ctx context.Context, tx pgx.Tx, userID uuid.UUID) (ActiveSubscription, error) {
	return currentSubscriptionQuery(ctx, tx, userID)
}
