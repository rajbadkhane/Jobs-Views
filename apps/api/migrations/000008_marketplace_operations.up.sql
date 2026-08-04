CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(180) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(40) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'suspended', 'blacklisted')),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE company_branches
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE company_departments
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES company_branches(id) ON DELETE SET NULL;

ALTER TABLE company_users
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES company_branches(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES company_departments(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS plan_entitlements (
    plan_id INT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(80) NOT NULL,
    feature_value JSONB DEFAULT 'true'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (plan_id, feature_key)
);

CREATE TABLE IF NOT EXISTS marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(80) NOT NULL,
    price NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    duration_days INT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) UNIQUE NOT NULL,
    discount_type VARCHAR(30) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value NUMERIC(12, 2) NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ends_at TIMESTAMPTZ,
    max_redemptions INT,
    redeemed_count INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS tax_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    region VARCHAR(80) DEFAULT 'IN' NOT NULL,
    rate NUMERIC(6, 3) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS company_wallets (
    company_id UUID PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    credits INT DEFAULT 0 NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    transaction_type VARCHAR(40) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund', 'purchase', 'adjustment')),
    amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    credits INT DEFAULT 0 NOT NULL,
    reference_type VARCHAR(80),
    reference_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID REFERENCES marketplace_products(id) ON DELETE SET NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    status VARCHAR(40) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    purchased_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS job_boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_code VARCHAR(80) NOT NULL,
    status VARCHAR(40) DEFAULT 'active' NOT NULL CHECK (status IN ('scheduled', 'active', 'expired', 'cancelled')),
    starts_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS resume_database_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    candidate_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unlocked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (company_id, candidate_user_id)
);

CREATE TABLE IF NOT EXISTS employer_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    lead_type VARCHAR(50) DEFAULT 'sales' NOT NULL CHECK (lead_type IN ('employer', 'sales', 'demo', 'support')),
    source VARCHAR(80),
    name VARCHAR(180) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(40),
    status VARCHAR(50) DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'contacted', 'demo_scheduled', 'converted', 'lost')),
    value NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS recruiter_crm_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    candidate_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    item_type VARCHAR(40) NOT NULL CHECK (item_type IN ('note', 'task', 'reminder', 'label', 'follow_up')),
    title VARCHAR(255) NOT NULL,
    body TEXT,
    due_at TIMESTAMPTZ,
    status VARCHAR(40) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'done', 'cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    template_type VARCHAR(60) NOT NULL CHECK (template_type IN ('offer_letter', 'appointment_letter', 'experience_letter', 'joining_letter', 'hr_template')),
    title VARCHAR(180) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb NOT NULL,
    status VARCHAR(40) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS employer_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    key_hash CHAR(64) UNIQUE NOT NULL,
    scopes JSONB DEFAULT '[]'::jsonb NOT NULL,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events JSONB DEFAULT '[]'::jsonb NOT NULL,
    secret_hash CHAR(64),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS operations_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_type VARCHAR(80) NOT NULL CHECK (queue_type IN ('fraud', 'spam_job', 'duplicate', 'verification', 'blacklist', 'moderation', 'automation')),
    resource_type VARCHAR(80) NOT NULL,
    resource_id UUID,
    severity VARCHAR(30) DEFAULT 'normal' NOT NULL CHECK (severity IN ('low', 'normal', 'high', 'critical')),
    status VARCHAR(40) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel VARCHAR(40) NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'push', 'in_app')),
    key VARCHAR(120) UNIQUE NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_key VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    schedule VARCHAR(120),
    action VARCHAR(120) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO marketplace_products (code, name, category, price, duration_days) VALUES
('featured_job', 'Featured Job', 'visibility', 1499, 7),
('boost_job', 'Boost Job', 'visibility', 999, 3),
('urgent_hiring', 'Urgent Hiring Badge', 'visibility', 699, 7),
('premium_listing', 'Premium Listing', 'visibility', 1999, 14),
('sponsored_job', 'Sponsored Job', 'ads', 2999, 7),
('resume_unlock', 'Resume Unlock', 'resume_database', 99, NULL),
('premium_search', 'Premium Candidate Search', 'resume_database', 1999, 30),
('api_access', 'Employer API Access', 'platform', 4999, 30)
ON CONFLICT (code) DO NOTHING;

INSERT INTO subscription_plans (name, slug, price, billing_interval, features) VALUES
('Professional', 'professional', 9999, 'month', '{"job_posting_limit": 25, "resume_database": true}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_companies_organization ON companies (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_company_users_org_scope ON company_users (organization_id, branch_id, department_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_company ON marketplace_purchases (company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_boosts_job ON job_boosts (job_id, status);
CREATE INDEX IF NOT EXISTS idx_resume_unlocks_company ON resume_database_unlocks (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employer_leads_status ON employer_leads (status, lead_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiter_crm_company ON recruiter_crm_items (company_id, candidate_user_id, status);
CREATE INDEX IF NOT EXISTS idx_operations_queue_status ON operations_queue (queue_type, status, severity);

CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_plan_entitlements_updated_at BEFORE UPDATE ON plan_entitlements FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_marketplace_products_updated_at BEFORE UPDATE ON marketplace_products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_employer_leads_updated_at BEFORE UPDATE ON employer_leads FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_recruiter_crm_items_updated_at BEFORE UPDATE ON recruiter_crm_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_webhook_endpoints_updated_at BEFORE UPDATE ON webhook_endpoints FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_operations_queue_updated_at BEFORE UPDATE ON operations_queue FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_automation_rules_updated_at BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
