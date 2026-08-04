CREATE TABLE candidate_subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    price_paise INT NOT NULL CHECK (price_paise > 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    duration_days INT DEFAULT 30 NOT NULL CHECK (duration_days > 0),
    application_limit INT CHECK (application_limit IS NULL OR application_limit > 0),
    entitlements JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE candidate_subscription_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES candidate_subscription_plans(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    next_path TEXT DEFAULT '/' NOT NULL,
    status VARCHAR(40) DEFAULT 'otp_pending' NOT NULL CHECK (status IN ('otp_pending', 'payment_pending', 'paid', 'failed', 'expired', 'refunded')),
    amount_paise INT NOT NULL CHECK (amount_paise > 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    duration_days INT NOT NULL CHECK (duration_days > 0),
    application_limit INT CHECK (application_limit IS NULL OR application_limit > 0),
    entitlements JSONB DEFAULT '{}'::jsonb NOT NULL,
    otp_hash VARCHAR(128) NOT NULL,
    otp_expires_at TIMESTAMPTZ NOT NULL,
    otp_attempts INT DEFAULT 0 NOT NULL,
    otp_verified_at TIMESTAMPTZ,
    provider VARCHAR(40) DEFAULT 'razorpay' NOT NULL,
    provider_order_id VARCHAR(160) UNIQUE,
    provider_payment_id VARCHAR(160) UNIQUE,
    paid_at TIMESTAMPTZ,
    failure_code VARCHAR(120),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE candidate_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES candidate_subscription_plans(id) ON DELETE RESTRICT,
    order_id UUID UNIQUE NOT NULL REFERENCES candidate_subscription_orders(id) ON DELETE RESTRICT,
    status VARCHAR(40) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'refunded')),
    price_paise INT NOT NULL,
    currency VARCHAR(10) NOT NULL,
    application_limit INT CHECK (application_limit IS NULL OR application_limit > 0),
    entitlements JSONB DEFAULT '{}'::jsonb NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE candidate_payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_event_id VARCHAR(180) UNIQUE NOT NULL,
    event_type VARCHAR(120) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    status VARCHAR(30) DEFAULT 'received' NOT NULL CHECK (status IN ('received', 'processed', 'ignored', 'failed')),
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_candidate_orders_user_status ON candidate_subscription_orders (user_id, status, created_at DESC);
CREATE INDEX idx_candidate_subscriptions_user_dates ON candidate_subscriptions (user_id, status, ends_at DESC);
CREATE UNIQUE INDEX idx_candidate_subscriptions_one_active ON candidate_subscriptions (user_id) WHERE status = 'active';

CREATE TRIGGER trg_candidate_subscription_plans_updated_at BEFORE UPDATE ON candidate_subscription_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_candidate_subscription_orders_updated_at BEFORE UPDATE ON candidate_subscription_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_candidate_subscriptions_updated_at BEFORE UPDATE ON candidate_subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO candidate_subscription_plans (name, slug, price_paise, currency, duration_days, application_limit, entitlements) VALUES
('Basic', 'basic', 60000, 'INR', 30, 10, '{"saved_jobs":true,"application_tracking":true,"career_guidance":"standard","education":"standard","resume_builder":"basic","support":"standard","salary_insights":false,"interview_prep":false}'::jsonb),
('Premium', 'premium', 120000, 'INR', 30, NULL, '{"saved_jobs":true,"application_tracking":true,"career_guidance":"advanced","education":"advanced","resume_builder":"complete","resume_checks":true,"support":"priority","salary_insights":true,"interview_prep":true}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    price_paise = EXCLUDED.price_paise,
    currency = EXCLUDED.currency,
    duration_days = EXCLUDED.duration_days,
    application_limit = EXCLUDED.application_limit,
    entitlements = EXCLUDED.entitlements,
    is_active = TRUE;
