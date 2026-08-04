ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    ADD COLUMN IF NOT EXISTS banner_url TEXT,
    ADD COLUMN IF NOT EXISTS about TEXT,
    ADD COLUMN IF NOT EXISTS mission TEXT,
    ADD COLUMN IF NOT EXISTS vision TEXT,
    ADD COLUMN IF NOT EXISTS culture TEXT,
    ADD COLUMN IF NOT EXISTS founded_year INT,
    ADD COLUMN IF NOT EXISTS headquarters VARCHAR(180),
    ADD COLUMN IF NOT EXISTS gst_number VARCHAR(30),
    ADD COLUMN IF NOT EXISTS cin_number VARCHAR(30),
    ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS verified_badge BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS verification_notes TEXT,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

ALTER TABLE company_users
    ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb NOT NULL,
    ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

CREATE TABLE company_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'recruiter' NOT NULL CHECK (role IN ('owner', 'hr', 'recruiter', 'manager')),
    permissions JSONB DEFAULT '[]'::jsonb NOT NULL,
    token_hash CHAR(64) UNIQUE NOT NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE company_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    gst_status VARCHAR(30) DEFAULT 'pending' NOT NULL,
    cin_status VARCHAR(30) DEFAULT 'pending' NOT NULL,
    website_status VARCHAR(30) DEFAULT 'pending' NOT NULL,
    domain_email_status VARCHAR(30) DEFAULT 'pending' NOT NULL,
    manual_status VARCHAR(30) DEFAULT 'pending' NOT NULL CHECK (manual_status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (company_id)
);

CREATE TABLE company_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    location VARCHAR(150),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India' NOT NULL,
    google_maps_url TEXT,
    is_headquarters BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE company_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (company_id, name)
);

CREATE TABLE company_settings (
    company_id UUID PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
    brand JSONB DEFAULT '{}'::jsonb NOT NULL,
    privacy JSONB DEFAULT '{"public_profile": true}'::jsonb NOT NULL,
    notifications JSONB DEFAULT '{}'::jsonb NOT NULL,
    security JSONB DEFAULT '{}'::jsonb NOT NULL,
    billing JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE company_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    media_type VARCHAR(30) NOT NULL CHECK (media_type IN ('logo', 'banner', 'gallery', 'document')),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(120) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'local' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE company_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'follow', 'job_view', 'application', 'candidate_view')),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_companies_status ON companies (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_verified ON companies (is_verified, verified_badge) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_search ON companies USING gin (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(industry, '') || ' ' || coalesce(headquarters, '') || ' ' || coalesce(about, ''))
);
CREATE INDEX idx_company_invites_company ON company_invites (company_id);
CREATE INDEX idx_company_branches_company ON company_branches (company_id);
CREATE INDEX idx_company_departments_company ON company_departments (company_id);
CREATE INDEX idx_company_media_company ON company_media (company_id);
CREATE INDEX idx_company_analytics_company ON company_analytics (company_id, created_at DESC);

CREATE TRIGGER trg_company_verifications_updated_at BEFORE UPDATE ON company_verifications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_company_branches_updated_at BEFORE UPDATE ON company_branches FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_company_departments_updated_at BEFORE UPDATE ON company_departments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
