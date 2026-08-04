CREATE TABLE IF NOT EXISTS subscription_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    plan_slug VARCHAR(100) NOT NULL,
    next_path TEXT,
    purpose VARCHAR(40) DEFAULT 'subscription' NOT NULL,
    otp_hash VARCHAR(128) NOT NULL,
    attempts INT DEFAULT 0 NOT NULL,
    consumed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscription_otps_lookup
ON subscription_otps (email, plan_slug, purpose, created_at DESC)
WHERE consumed_at IS NULL;

