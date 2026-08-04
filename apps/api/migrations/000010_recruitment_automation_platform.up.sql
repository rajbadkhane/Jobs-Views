CREATE TABLE IF NOT EXISTS hiring_workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    template_type VARCHAR(80) DEFAULT 'custom' NOT NULL,
    industry VARCHAR(120),
    stages JSONB DEFAULT '[]'::jsonb NOT NULL,
    document_requirements JSONB DEFAULT '[]'::jsonb NOT NULL,
    joining_checklist JSONB DEFAULT '[]'::jsonb NOT NULL,
    automation_rules JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS job_workflows (
    job_id UUID PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    template_id UUID REFERENCES hiring_workflow_templates(id) ON DELETE SET NULL,
    stages JSONB DEFAULT '[]'::jsonb NOT NULL,
    active_stage VARCHAR(80) DEFAULT 'applied' NOT NULL,
    automation_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS automation_rule_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    trigger_key VARCHAR(100) NOT NULL,
    name VARCHAR(180) NOT NULL,
    actions JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS recruiter_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    task_type VARCHAR(80) NOT NULL,
    title VARCHAR(220) NOT NULL,
    due_at TIMESTAMPTZ,
    priority VARCHAR(30) DEFAULT 'normal' NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(30) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'done', 'overdue', 'cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS recruiter_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    title VARCHAR(220) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(80) DEFAULT 'Asia/Calcutta' NOT NULL,
    interviewer_ids JSONB DEFAULT '[]'::jsonb NOT NULL,
    event_type VARCHAR(60) DEFAULT 'interview' NOT NULL,
    status VARCHAR(40) DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'rescheduled', 'cancelled', 'completed', 'no_show')),
    meeting_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS job_document_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    document_key VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL,
    mandatory BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (job_id, document_key)
);

CREATE TABLE IF NOT EXISTS candidate_document_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    candidate_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_key VARCHAR(100) NOT NULL,
    file_url TEXT,
    status VARCHAR(40) DEFAULT 'submitted' NOT NULL CHECK (status IN ('missing', 'submitted', 'verified', 'rejected')),
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (application_id, document_key)
);

CREATE TABLE IF NOT EXISTS joining_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    current_step VARCHAR(100) DEFAULT 'offer_accepted' NOT NULL,
    steps JSONB DEFAULT '[]'::jsonb NOT NULL,
    joining_date DATE,
    status VARCHAR(40) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in_progress', 'joined', 'closed', 'cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES automation_rule_configs(id) ON DELETE SET NULL,
    trigger_key VARCHAR(100) NOT NULL,
    resource_type VARCHAR(80) NOT NULL,
    resource_id UUID,
    actions JSONB DEFAULT '[]'::jsonb NOT NULL,
    status VARCHAR(40) DEFAULT 'queued' NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'skipped')),
    error TEXT,
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    metric_key VARCHAR(100) NOT NULL,
    metric_value NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    measured_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hiring_workflow_templates_company ON hiring_workflow_templates (company_id, template_type, is_default);
CREATE INDEX IF NOT EXISTS idx_automation_rule_configs_company ON automation_rule_configs (company_id, trigger_key, is_active);
CREATE INDEX IF NOT EXISTS idx_recruiter_tasks_company_assignee ON recruiter_tasks (company_id, assigned_to, status, due_at);
CREATE INDEX IF NOT EXISTS idx_recruiter_calendar_events_company_time ON recruiter_calendar_events (company_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_candidate_document_submissions_user ON candidate_document_submissions (candidate_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_executions_trigger ON automation_executions (trigger_key, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_company ON workflow_analytics (company_id, metric_key, measured_at DESC);

CREATE TRIGGER trg_hiring_workflow_templates_updated_at BEFORE UPDATE ON hiring_workflow_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_job_workflows_updated_at BEFORE UPDATE ON job_workflows FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_automation_rule_configs_updated_at BEFORE UPDATE ON automation_rule_configs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_recruiter_tasks_updated_at BEFORE UPDATE ON recruiter_tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_recruiter_calendar_events_updated_at BEFORE UPDATE ON recruiter_calendar_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_candidate_document_submissions_updated_at BEFORE UPDATE ON candidate_document_submissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_joining_workflows_updated_at BEFORE UPDATE ON joining_workflows FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO hiring_workflow_templates (name, template_type, industry, is_default, stages, document_requirements, joining_checklist, automation_rules)
VALUES
    (
        'Default Recruitment Workflow',
        'global',
        'all',
        TRUE,
        '[
          {"key":"applied","label":"Applied","color":"#2563EB","icon":"inbox","order":1},
          {"key":"screening","label":"Screening","color":"#0F766E","icon":"search","order":2},
          {"key":"shortlisted","label":"Shortlisted","color":"#16A34A","icon":"check","order":3},
          {"key":"hr_interview","label":"HR Interview","color":"#7C3AED","icon":"message","order":4},
          {"key":"technical_interview","label":"Technical Interview","color":"#4F46E5","icon":"code","order":5},
          {"key":"final_interview","label":"Final Interview","color":"#9333EA","icon":"star","order":6},
          {"key":"offer","label":"Offer","color":"#F59E0B","icon":"file","order":7},
          {"key":"hired","label":"Hired","color":"#059669","icon":"award","order":8},
          {"key":"joined","label":"Joined","color":"#047857","icon":"briefcase","order":9},
          {"key":"closed","label":"Closed","color":"#64748B","icon":"archive","order":10}
        ]'::jsonb,
        '[{"key":"resume","label":"Resume","mandatory":true},{"key":"identity","label":"Identity proof","mandatory":true}]'::jsonb,
        '["Offer accepted","Documents submitted","Verification","Joining date","Joined","Probation placeholder"]'::jsonb,
        '[{"trigger":"candidate_applied","actions":["send_email","send_in_app"]},{"trigger":"interview_scheduled","actions":["send_calendar_invite","schedule_reminder"]}]'::jsonb
    ),
    (
        'Blue Collar Hiring Workflow',
        'blue_collar',
        'blue_collar',
        TRUE,
        '[
          {"key":"applied","label":"Applied","color":"#2563EB","icon":"inbox","order":1},
          {"key":"screening","label":"Screening","color":"#0F766E","icon":"search","order":2},
          {"key":"shortlisted","label":"Shortlisted","color":"#16A34A","icon":"check","order":3},
          {"key":"hr_interview","label":"HR Interview","color":"#7C3AED","icon":"message","order":4},
          {"key":"offer","label":"Offer","color":"#F59E0B","icon":"file","order":5},
          {"key":"hired","label":"Hired","color":"#059669","icon":"award","order":6},
          {"key":"joined","label":"Joined","color":"#047857","icon":"briefcase","order":7},
          {"key":"closed","label":"Closed","color":"#64748B","icon":"archive","order":8}
        ]'::jsonb,
        '[{"key":"aadhaar","label":"Aadhaar","mandatory":true},{"key":"pan","label":"PAN","mandatory":true},{"key":"medical_fitness","label":"Medical Fitness","mandatory":true},{"key":"police_verification","label":"Police Verification","mandatory":false}]'::jsonb,
        '["Documents collected","Background check","Shift assigned","Uniform or equipment issued","Joined"]'::jsonb,
        '[{"trigger":"candidate_shortlisted","actions":["send_whatsapp_placeholder","notify_recruiter"]},{"trigger":"offer_accepted","actions":["move_stage","create_task"]}]'::jsonb
    )
ON CONFLICT DO NOTHING;
