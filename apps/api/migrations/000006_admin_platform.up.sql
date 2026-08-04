CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    price NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    billing_interval VARCHAR(20) DEFAULT 'month' NOT NULL CHECK (billing_interval IN ('month', 'year')),
    features JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE company_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(40) DEFAULT 'active' NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
    starts_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    renews_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE billing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES company_subscriptions(id) ON DELETE SET NULL,
    invoice_number VARCHAR(80) UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    status VARCHAR(40) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'issued', 'paid', 'void', 'overdue')),
    due_date DATE,
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE billing_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES billing_invoices(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    status VARCHAR(40) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    provider VARCHAR(50) DEFAULT 'manual' NOT NULL,
    reference VARCHAR(160),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE cms_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('article', 'blog', 'help', 'faq', 'landing_page', 'static_page')),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    excerpt TEXT,
    body TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    seo JSONB DEFAULT '{}'::jsonb NOT NULL,
    author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE platform_settings (
    key VARCHAR(120) PRIMARY KEY,
    category VARCHAR(60) NOT NULL CHECK (category IN ('branding', 'email', 'sms', 'notifications', 'storage', 'security', 'feature_flags', 'general')),
    value JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(140) NOT NULL,
    resource_type VARCHAR(80),
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE admin_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(60) NOT NULL CHECK (report_type IN ('users', 'companies', 'jobs', 'applications', 'revenue')),
    format VARCHAR(20) DEFAULT 'csv' NOT NULL CHECK (format IN ('csv', 'excel', 'pdf')),
    filters JSONB DEFAULT '{}'::jsonb NOT NULL,
    status VARCHAR(30) DEFAULT 'queued' NOT NULL CHECK (status IN ('queued', 'processing', 'ready', 'failed')),
    file_url TEXT,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ticket_type VARCHAR(50) NOT NULL CHECK (ticket_type IN ('ticket', 'feedback', 'contact', 'bug', 'feature')),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
    priority VARCHAR(30) DEFAULT 'normal' NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE seo_redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_path VARCHAR(500) UNIQUE NOT NULL,
    target_path VARCHAR(500) NOT NULL,
    status_code INT DEFAULT 301 NOT NULL CHECK (status_code IN (301, 302, 307, 308)),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE seo_templates (
    key VARCHAR(120) PRIMARY KEY,
    title_template VARCHAR(255) NOT NULL,
    description_template VARCHAR(500) NOT NULL,
    schema_defaults JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO subscription_plans (name, slug, price, billing_interval, features) VALUES
('Free', 'free', 0, 'month', '{"job_posting_limit": 1}'::jsonb),
('Starter', 'starter', 2999, 'month', '{"job_posting_limit": 5}'::jsonb),
('Growth', 'growth', 9999, 'month', '{"job_posting_limit": 25}'::jsonb),
('Enterprise', 'enterprise', 0, 'year', '{"custom": true}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX idx_company_subscriptions_company ON company_subscriptions (company_id, status);
CREATE INDEX idx_billing_invoices_company ON billing_invoices (company_id, status);
CREATE INDEX idx_billing_payments_company ON billing_payments (company_id, status);
CREATE INDEX idx_cms_entries_type_status ON cms_entries (content_type, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_audit_logs_actor ON admin_audit_logs (actor_user_id, created_at DESC);
CREATE INDEX idx_admin_reports_type ON admin_reports (report_type, created_at DESC);
CREATE INDEX idx_support_tickets_status ON support_tickets (status, priority, created_at DESC);

CREATE TRIGGER trg_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_company_subscriptions_updated_at BEFORE UPDATE ON company_subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_billing_invoices_updated_at BEFORE UPDATE ON billing_invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cms_entries_updated_at BEFORE UPDATE ON cms_entries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_admin_reports_updated_at BEFORE UPDATE ON admin_reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_seo_redirects_updated_at BEFORE UPDATE ON seo_redirects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_seo_templates_updated_at BEFORE UPDATE ON seo_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
