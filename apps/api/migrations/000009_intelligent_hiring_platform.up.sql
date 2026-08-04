CREATE TABLE IF NOT EXISTS profile_onboarding_drafts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_step VARCHAR(80) DEFAULT 'basic' NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    completion_percent INT DEFAULT 0 NOT NULL CHECK (completion_percent >= 0 AND completion_percent <= 100),
    estimated_minutes_remaining INT DEFAULT 0 NOT NULL,
    autosaved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS resume_parse_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upload_id UUID,
    parser_provider VARCHAR(80) DEFAULT 'heuristic' NOT NULL,
    status VARCHAR(40) DEFAULT 'parsed' NOT NULL CHECK (status IN ('queued', 'parsed', 'reviewed', 'failed')),
    extracted JSONB DEFAULT '{}'::jsonb NOT NULL,
    confidence NUMERIC(5, 2) DEFAULT 0 NOT NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS recommendation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    event_type VARCHAR(60) NOT NULL CHECK (event_type IN ('impression', 'click', 'save', 'apply', 'dismiss', 'invite', 'shortlist')),
    score NUMERIC(5, 2),
    explanation JSONB DEFAULT '[]'::jsonb NOT NULL,
    source VARCHAR(80) DEFAULT 'recommendation_engine' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS candidate_view_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    recruiter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source VARCHAR(80) DEFAULT 'resume_database' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    candidate_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recruiter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    conversation_type VARCHAR(50) DEFAULT 'recruitment' NOT NULL CHECK (conversation_type IN ('recruitment', 'interview', 'offer', 'support')),
    status VARCHAR(40) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'archived', 'closed')),
    last_message_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb NOT NULL,
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS salary_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    inputs JSONB DEFAULT '{}'::jsonb NOT NULL,
    result JSONB DEFAULT '{}'::jsonb NOT NULL,
    source VARCHAR(80) DEFAULT 'salary_engine' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_parse_results_user ON resume_parse_results (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_events_user ON recommendation_events (user_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_events_company ON recommendation_events (company_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_view_events_candidate ON candidate_view_events (candidate_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_candidate ON conversations (candidate_user_id, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_company ON conversations (company_id, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_salary_calculations_user ON salary_calculations (user_id, created_at DESC);

CREATE TRIGGER trg_profile_onboarding_drafts_updated_at BEFORE UPDATE ON profile_onboarding_drafts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
