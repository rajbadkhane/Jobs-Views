DROP TRIGGER IF EXISTS trg_joining_workflows_updated_at ON joining_workflows;
DROP TRIGGER IF EXISTS trg_candidate_document_submissions_updated_at ON candidate_document_submissions;
DROP TRIGGER IF EXISTS trg_recruiter_calendar_events_updated_at ON recruiter_calendar_events;
DROP TRIGGER IF EXISTS trg_recruiter_tasks_updated_at ON recruiter_tasks;
DROP TRIGGER IF EXISTS trg_automation_rule_configs_updated_at ON automation_rule_configs;
DROP TRIGGER IF EXISTS trg_job_workflows_updated_at ON job_workflows;
DROP TRIGGER IF EXISTS trg_hiring_workflow_templates_updated_at ON hiring_workflow_templates;

DROP TABLE IF EXISTS workflow_analytics;
DROP TABLE IF EXISTS automation_executions;
DROP TABLE IF EXISTS joining_workflows;
DROP TABLE IF EXISTS candidate_document_submissions;
DROP TABLE IF EXISTS job_document_requirements;
DROP TABLE IF EXISTS recruiter_calendar_events;
DROP TABLE IF EXISTS recruiter_tasks;
DROP TABLE IF EXISTS automation_rule_configs;
DROP TABLE IF EXISTS job_workflows;
DROP TABLE IF EXISTS hiring_workflow_templates;
