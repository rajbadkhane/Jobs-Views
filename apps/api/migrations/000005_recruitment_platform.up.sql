ALTER TABLE saved_jobs
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS collection VARCHAR(120) DEFAULT 'default' NOT NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_profile_id UUID REFERENCES candidate_profiles(id) ON DELETE SET NULL,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    resume_snapshot JSONB DEFAULT '{}'::jsonb NOT NULL,
    profile_snapshot JSONB DEFAULT '{}'::jsonb NOT NULL,
    cover_letter TEXT,
    expected_salary NUMERIC(12, 2),
    notice_period VARCHAR(80),
    source VARCHAR(80) DEFAULT 'career_os' NOT NULL,
    status VARCHAR(40) DEFAULT 'applied' NOT NULL CHECK (status IN (
        'applied', 'viewed', 'screening', 'shortlisted', 'assessment',
        'interview_scheduled', 'interview_completed', 'offer_sent',
        'offer_accepted', 'offer_declined', 'rejected', 'withdrawn', 'hired'
    )),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    tags JSONB DEFAULT '[]'::jsonb NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (candidate_user_id, job_id)
);

CREATE TABLE application_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(80) NOT NULL,
    from_status VARCHAR(40),
    to_status VARCHAR(40),
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE application_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE application_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    round VARCHAR(120) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    mode VARCHAR(30) NOT NULL CHECK (mode IN ('online', 'offline')),
    location TEXT,
    meeting_url TEXT,
    interviewers JSONB DEFAULT '[]'::jsonb NOT NULL,
    feedback JSONB DEFAULT '{}'::jsonb NOT NULL,
    status VARCHAR(40) DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE application_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    salary NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    joining_date DATE,
    position VARCHAR(180) NOT NULL,
    letter_url TEXT,
    status VARCHAR(40) DEFAULT 'sent' NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'withdrawn')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE recruitment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    channel VARCHAR(30) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    audience VARCHAR(30) NOT NULL CHECK (audience IN ('candidate', 'employer', 'admin')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_applications_candidate ON applications (candidate_user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_company_status ON applications (company_id, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_job ON applications (job_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_application_timeline_app ON application_timeline (application_id, created_at DESC);
CREATE INDEX idx_application_notes_app ON application_notes (application_id, created_at DESC);
CREATE INDEX idx_application_interviews_app ON application_interviews (application_id, scheduled_at DESC);
CREATE INDEX idx_application_offers_app ON application_offers (application_id, created_at DESC);
CREATE INDEX idx_recruitment_notifications_recipient ON recruitment_notifications (recipient_user_id, created_at DESC);

CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_application_notes_updated_at BEFORE UPDATE ON application_notes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_application_interviews_updated_at BEFORE UPDATE ON application_interviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_application_offers_updated_at BEFORE UPDATE ON application_offers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
