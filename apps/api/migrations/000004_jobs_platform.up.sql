CREATE TABLE job_taxonomies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES job_taxonomies(id) ON DELETE CASCADE,
    taxonomy_type VARCHAR(40) NOT NULL CHECK (taxonomy_type IN ('category', 'subcategory', 'industry', 'function', 'department')),
    name VARCHAR(140) NOT NULL,
    slug VARCHAR(160) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (taxonomy_type, slug)
);

CREATE TABLE job_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES company_branches(id) ON DELETE SET NULL,
    category_id UUID REFERENCES job_taxonomies(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES job_taxonomies(id) ON DELETE SET NULL,
    industry_id UUID REFERENCES job_taxonomies(id) ON DELETE SET NULL,
    function_id UUID REFERENCES job_taxonomies(id) ON DELETE SET NULL,
    department_id UUID REFERENCES company_departments(id) ON DELETE SET NULL,
    job_type_id INT REFERENCES job_types(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    short_description VARCHAR(500),
    full_description TEXT NOT NULL,
    responsibilities JSONB DEFAULT '[]'::jsonb NOT NULL,
    requirements JSONB DEFAULT '[]'::jsonb NOT NULL,
    qualifications JSONB DEFAULT '[]'::jsonb NOT NULL,
    benefits JSONB DEFAULT '[]'::jsonb NOT NULL,
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    experience_min NUMERIC(4, 1) DEFAULT 0 NOT NULL,
    experience_max NUMERIC(4, 1),
    education VARCHAR(180),
    openings INT DEFAULT 1 NOT NULL CHECK (openings > 0),
    expiry_date DATE,
    work_mode VARCHAR(30) DEFAULT 'on_site' NOT NULL CHECK (work_mode IN ('remote', 'hybrid', 'on_site')),
    country VARCHAR(100) DEFAULT 'India' NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    radius_km NUMERIC(8, 2),
    status VARCHAR(30) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'review', 'published', 'paused', 'expired', 'closed', 'archived', 'rejected')),
    visibility VARCHAR(30) DEFAULT 'public' NOT NULL CHECK (visibility IN ('public', 'private', 'invite_only', 'internal')),
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_urgent BOOLEAN DEFAULT FALSE NOT NULL,
    is_sponsored BOOLEAN DEFAULT FALSE NOT NULL,
    canonical_url TEXT,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    open_graph JSONB DEFAULT '{}'::jsonb NOT NULL,
    json_ld JSONB DEFAULT '{}'::jsonb NOT NULL,
    published_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    requirement_type VARCHAR(30) DEFAULT 'required' NOT NULL CHECK (requirement_type IN ('required', 'preferred')),
    level VARCHAR(30) DEFAULT 'intermediate' NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience NUMERIC(4, 1) DEFAULT 0 NOT NULL CHECK (years_experience >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (job_id, name, requirement_type)
);

CREATE TABLE job_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    event_type VARCHAR(40) NOT NULL CHECK (event_type IN ('view', 'save', 'share', 'application')),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    visitor_key VARCHAR(120),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE saved_jobs (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, job_id)
);

INSERT INTO job_types (name, slug) VALUES
('Full Time', 'full-time'),
('Part Time', 'part-time'),
('Contract', 'contract'),
('Internship', 'internship'),
('Freelance', 'freelance'),
('Temporary', 'temporary'),
('Apprenticeship', 'apprenticeship')
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX idx_jobs_company_status ON jobs (company_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_public_search ON jobs (status, visibility, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_location ON jobs (country, state, city) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_salary ON jobs (salary_min, salary_max) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_search ON jobs USING gin (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(full_description, '') || ' ' || coalesce(city, '') || ' ' || coalesce(state, '') || ' ' || coalesce(country, ''))
);
CREATE INDEX idx_job_skills_job ON job_skills (job_id);
CREATE INDEX idx_job_skills_name ON job_skills (lower(name));
CREATE INDEX idx_job_analytics_job ON job_analytics (job_id, created_at DESC);

CREATE TRIGGER trg_job_taxonomies_updated_at BEFORE UPDATE ON job_taxonomies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
