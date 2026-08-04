# Jobs View Automation Engine

## Purpose

The automation engine coordinates recruitment events without changing the existing API contract. It listens for domain triggers such as candidate application, shortlist, interview scheduled, rejection, offer accepted, profile update, and job update.

## Core Triggers

- `candidate_applied`
- `candidate_shortlisted`
- `interview_scheduled`
- `interview_passed`
- `offer_sent`
- `offer_accepted`
- `candidate_rejected`
- `candidate_joined`
- `document_missing`
- `profile_updated`
- `job_updated`

## Supported Actions

- Email and in-app notifications
- SMS and WhatsApp placeholders
- Recruiter notifications
- Task creation
- Calendar invites
- 24 hour and 1 hour reminders
- Stage movement
- Recommendation refresh
- Escalation

## Persistence

Sprint 22 adds `automation_rule_configs` for configurable rules and `automation_executions` for execution history. Rules may be global, company scoped, or job scoped. The engine keeps the action payload JSON based so channels can be added later without schema churn.

## Safety Rules

- Automation must respect RBAC and company isolation.
- Automation must be idempotent for the same trigger/resource pair.
- Failed actions should be retried by a background worker.
- Candidate-facing notifications must use approved templates.

