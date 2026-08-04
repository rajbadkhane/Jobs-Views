ALTER TABLE jobs
    ADD COLUMN salary_period VARCHAR(20) DEFAULT 'annual' NOT NULL
        CHECK (salary_period IN ('hourly', 'daily', 'monthly', 'annual')),
    ADD COLUMN salary_basis VARCHAR(20) DEFAULT 'ctc' NOT NULL
        CHECK (salary_basis IN ('gross', 'take_home', 'ctc'));

CREATE TABLE salary_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(180) NOT NULL,
    publisher VARCHAR(180) NOT NULL,
    source_url TEXT UNIQUE NOT NULL,
    source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('first_party_jobs', 'government', 'industry_report', 'reviewed_import')),
    license_notes TEXT,
    methodology_notes TEXT,
    published_on DATE,
    last_reviewed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE salary_role_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_role VARCHAR(160) NOT NULL,
    role_slug VARCHAR(180) NOT NULL,
    alias VARCHAR(180) NOT NULL,
    role_family VARCHAR(80) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (role_slug, alias)
);

CREATE TABLE salary_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) UNIQUE NOT NULL,
    geography_level VARCHAR(20) NOT NULL CHECK (geography_level IN ('city', 'state', 'remote', 'national')),
    state_name VARCHAR(120),
    country VARCHAR(100) DEFAULT 'India' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE salary_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES salary_sources(id) ON DELETE RESTRICT,
    status VARCHAR(30) DEFAULT 'preview' NOT NULL CHECK (status IN ('preview', 'committed', 'rejected', 'failed')),
    file_name VARCHAR(255),
    row_count INT DEFAULT 0 NOT NULL,
    accepted_count INT DEFAULT 0 NOT NULL,
    rejected_count INT DEFAULT 0 NOT NULL,
    validation_errors JSONB DEFAULT '[]'::jsonb NOT NULL,
    imported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    committed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE salary_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES salary_sources(id) ON DELETE RESTRICT,
    import_id UUID REFERENCES salary_imports(id) ON DELETE SET NULL,
    canonical_role VARCHAR(160) NOT NULL,
    role_slug VARCHAR(180) NOT NULL,
    location_id UUID REFERENCES salary_locations(id) ON DELETE SET NULL,
    geography_name VARCHAR(120) NOT NULL,
    geography_level VARCHAR(20) NOT NULL CHECK (geography_level IN ('city', 'state', 'remote', 'national')),
    experience_min NUMERIC(4,1) DEFAULT 0 NOT NULL CHECK (experience_min >= 0),
    experience_max NUMERIC(4,1) CHECK (experience_max IS NULL OR experience_max >= experience_min),
    work_mode VARCHAR(20) CHECK (work_mode IS NULL OR work_mode IN ('remote', 'hybrid', 'on_site')),
    education VARCHAR(120),
    shift VARCHAR(60),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    salary_period VARCHAR(20) DEFAULT 'annual' NOT NULL CHECK (salary_period IN ('hourly', 'daily', 'monthly', 'annual')),
    salary_basis VARCHAR(20) DEFAULT 'gross' NOT NULL CHECK (salary_basis IN ('gross', 'take_home', 'ctc')),
    p25_annual NUMERIC(14,2),
    median_annual NUMERIC(14,2),
    p75_annual NUMERIC(14,2),
    mean_annual NUMERIC(14,2),
    sample_size INT CHECK (sample_size IS NULL OR sample_size >= 0),
    observation_start DATE,
    observation_end DATE,
    effective_date DATE NOT NULL,
    confidence VARCHAR(20) DEFAULT 'low' NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),
    provenance JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CHECK (p25_annual IS NULL OR p25_annual >= 0),
    CHECK (median_annual IS NULL OR median_annual >= 0),
    CHECK (p75_annual IS NULL OR p75_annual >= 0),
    CHECK (mean_annual IS NULL OR mean_annual >= 0),
    CHECK (p25_annual IS NULL OR median_annual IS NULL OR p25_annual <= median_annual),
    CHECK (median_annual IS NULL OR p75_annual IS NULL OR median_annual <= p75_annual)
);

CREATE INDEX idx_salary_benchmarks_lookup ON salary_benchmarks (role_slug, geography_level, geography_name, experience_min, experience_max, effective_date DESC) WHERE is_published;
CREATE INDEX idx_salary_benchmarks_source ON salary_benchmarks (source_id, effective_date DESC);

CREATE TABLE resume_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    template_slug VARCHAR(80) NOT NULL CHECK (template_slug IN ('ats-classic', 'student-fresher', 'frontline-skilled', 'modern-professional', 'technical-portfolio')),
    content JSONB DEFAULT '{}'::jsonb NOT NULL,
    section_order JSONB DEFAULT '[]'::jsonb NOT NULL,
    style JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    last_version INT DEFAULT 1 NOT NULL CHECK (last_version > 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE resume_document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_document_id UUID NOT NULL REFERENCES resume_documents(id) ON DELETE CASCADE,
    version INT NOT NULL CHECK (version > 0),
    name VARCHAR(160) NOT NULL,
    template_slug VARCHAR(80) NOT NULL,
    content JSONB NOT NULL,
    section_order JSONB NOT NULL,
    style JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (resume_document_id, version)
);

CREATE INDEX idx_resume_documents_candidate ON resume_documents (candidate_profile_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_resume_versions_document ON resume_document_versions (resume_document_id, version DESC);

INSERT INTO salary_sources (name, publisher, source_url, source_type, license_notes, methodology_notes, published_on, last_reviewed_at) VALUES
('Periodic Labour Force Survey 2025', 'Ministry of Statistics and Programme Implementation', 'https://mospi.gov.in/uploads/publications_reports/publications_reports1780040415321_0624fb13-fb47-40bc-b470-7c7e9635c3ef_PLFS_2025_F_REV_29052026.pdf', 'government', 'Use only reviewed tables with attribution.', 'Broad employment and earnings baseline; not a role-city salary survey.', '2026-05-29', CURRENT_TIMESTAMP),
('Occupational Wage Survey', 'Labour Bureau, Government of India', 'https://labourbureau.gov.in/occupational-wage-survey', 'government', 'Use published occupational tables with attribution and survey dates.', 'Occupation and industry wage observations for covered survey rounds.', NULL, CURRENT_TIMESTAMP),
('Jobs and Salaries Primer FY25-26', 'TeamLease Services', 'https://group.teamlease.com/insights/jobs-and-salaries-primer-2025/', 'industry_report', 'Import numeric tables only after redistribution rights are reviewed.', 'Industry salary trends across covered cities and functional areas.', NULL, CURRENT_TIMESTAMP),
('Salary Trends Report 2025-26', 'Randstad India', 'https://info.randstad.in/download-salary-trends-report-2025-2026', 'industry_report', 'Import numeric tables only after redistribution rights are reviewed.', 'City and seniority salary trends for covered professional roles.', NULL, CURRENT_TIMESTAMP),
('Jobs View Published Jobs', 'Jobs View', 'https://jobsview.in/jobs', 'first_party_jobs', 'Aggregate only public, valid INR compensation with source job IDs retained.', 'Nightly aggregation of disclosed compensation on active published jobs.', NULL, CURRENT_TIMESTAMP)
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO salary_locations (name, slug, geography_level, state_name) VALUES
('Delhi NCR', 'delhi-ncr', 'city', 'Delhi NCR'), ('Mumbai', 'mumbai', 'city', 'Maharashtra'),
('Bengaluru', 'bengaluru', 'city', 'Karnataka'), ('Hyderabad', 'hyderabad', 'city', 'Telangana'),
('Pune', 'pune', 'city', 'Maharashtra'), ('Chennai', 'chennai', 'city', 'Tamil Nadu'),
('Kolkata', 'kolkata', 'city', 'West Bengal'), ('Ahmedabad', 'ahmedabad', 'city', 'Gujarat'),
('Jaipur', 'jaipur', 'city', 'Rajasthan'), ('Indore', 'indore', 'city', 'Madhya Pradesh'),
('Lucknow', 'lucknow', 'city', 'Uttar Pradesh'), ('Kochi', 'kochi', 'city', 'Kerala'),
('Remote India', 'remote-india', 'remote', NULL), ('India', 'india', 'national', NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO salary_role_aliases (canonical_role, role_slug, alias, role_family) VALUES
('Delivery Executive','delivery-executive','delivery executive','frontline'), ('Delivery Executive','delivery-executive','delivery rider','frontline'),
('Driver','driver','driver','frontline'), ('Security Guard','security-guard','security guard','frontline'),
('Warehouse Associate','warehouse-associate','warehouse associate','frontline'), ('Retail Associate','retail-associate','retail sales','frontline'),
('Office Assistant','office-assistant','office assistant','frontline'), ('Data Entry Operator','data-entry-operator','data entry operator','frontline'),
('Housekeeping Associate','housekeeping-associate','housekeeping','frontline'), ('Field Sales Executive','field-sales-executive','field sales','frontline'),
('Telecaller','telecaller','telecaller','frontline'), ('Electrician / ITI Technician','iti-technician','electrician','frontline'),
('Machine Operator','machine-operator','machine operator','frontline'), ('Frontend Developer','frontend-developer','frontend developer','professional'),
('Backend Developer','backend-developer','backend developer','professional'), ('Full Stack Developer','full-stack-developer','full stack developer','professional'),
('QA Engineer','qa-engineer','qa engineer','professional'), ('Data Analyst','data-analyst','data analyst','professional'),
('DevOps / Cloud Engineer','devops-cloud-engineer','devops engineer','professional'), ('Product Manager','product-manager','product manager','professional'),
('Digital Marketing Specialist','digital-marketing-specialist','digital marketing','professional'), ('HR / Recruiter','hr-recruiter','recruiter','professional'),
('Accountant','accountant','accountant','professional'), ('Nursing / Healthcare Support','healthcare-support','nursing','professional'),
('Teacher','teacher','teacher','professional')
ON CONFLICT (role_slug, alias) DO NOTHING;
