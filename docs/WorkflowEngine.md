# Jobs View Workflow Engine

## Purpose

The workflow engine defines the hiring pipeline used by ATS screens, automation rules, analytics, reports, and candidate timelines.

## Default Workflow

1. Applied
2. Screening
3. Shortlisted
4. HR Interview
5. Technical Interview
6. Final Interview
7. Offer
8. Hired
9. Joined
10. Closed

## Customization

Workflow stages support:

- Rename
- Reorder
- Custom color
- Custom icon
- Company scoped templates
- Job scoped overrides
- Automation keys

## Database

- `hiring_workflow_templates` stores global, industry, and company templates.
- `job_workflows` stores the active workflow for a job.
- `workflow_analytics` stores measured workflow performance by company and job.

## Integration Notes

Existing application statuses remain compatible. The workflow layer maps UI stage movement and automation output to the current application status model.

