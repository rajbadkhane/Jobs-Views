# Jobs View API

Go Fiber backend foundation for Jobs View.

## Run

```bash
go mod tidy
go run ./cmd/api
```

## Migrations

Apply migrations in order from `migrations/*.up.sql`, then `seeds/000001_rbac.sql`.

Rollback order:

1. `seeds/000001_rbac.rollback.sql`
2. `migrations/000001_initial_schema.down.sql`

## Health

- `GET /health`
- `GET /ready`
- `GET /live`
- `GET /api/v1/health`
- `GET /api/v1/ready`
- `GET /api/v1/live`

## Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/verify?token=...`

## Protected Probes

- `GET /api/v1/me`
- `GET /api/v1/rbac/employer`

## Identity

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users/me/sessions`
- `GET /api/v1/users/me/devices`
- `GET /api/v1/users/me/login-history`
- `GET /api/v1/users/me/audit-trail`
- `GET /api/v1/profiles/me`
- `GET /api/v1/profiles/completion`
- `PUT /api/v1/profiles/candidate`
- `PUT /api/v1/profiles/employer`
- `PUT /api/v1/profiles/admin`
- `POST /api/v1/profiles/avatar`
- `POST /api/v1/profiles/resume`
- `GET|POST|PUT /api/v1/profiles/skills`
- `GET|POST /api/v1/profiles/education`
- `GET|POST /api/v1/profiles/experience`
- `GET|PUT /api/v1/profiles/social-links`
- `GET|PUT /api/v1/profiles/notification-preferences`
- `GET|PUT /api/v1/profiles/settings`
- `GET /api/v1/profiles/search`
- `GET /api/v1/profiles/public/:id`

## Companies

- `GET /api/v1/companies`
- `GET /api/v1/companies/:slug`
- `POST /api/v1/companies`
- `GET /api/v1/companies/me`
- `PATCH /api/v1/companies/:id`
- `DELETE /api/v1/companies/:id`
- `PATCH /api/v1/companies/:id/status`
- `POST /api/v1/companies/:id/verification`
- `GET|POST /api/v1/companies/:id/team`
- `POST /api/v1/companies/:id/team/invite`
- `GET|POST /api/v1/companies/:id/branches`
- `GET|POST /api/v1/companies/:id/departments`
- `GET /api/v1/companies/:id/dashboard`
- `GET|PUT /api/v1/companies/:id/settings`
- `POST /api/v1/companies/:id/media/:type`

## Jobs

- `GET /api/v1/jobs`
- `GET /api/v1/jobs/:slug`
- `GET /api/v1/jobs/:slug/seo`
- `GET /api/v1/jobs/:slug/structured-data`
- `GET /api/v1/jobs/taxonomies`
- `POST /api/v1/jobs`
- `GET /api/v1/jobs/company/:company_id`
- `PATCH /api/v1/jobs/:id`
- `DELETE /api/v1/jobs/:id`
- `POST /api/v1/jobs/:id/duplicate`
- `PATCH /api/v1/jobs/:id/status`
- `POST /api/v1/jobs/bulk`
- `POST /api/v1/jobs/:id/save`
- `POST /api/v1/jobs/:id/share`
- `GET /api/v1/jobs/:id/analytics`
- `POST /api/v1/jobs/taxonomies`

## Applications

- `POST /api/v1/applications`
- `GET /api/v1/applications/me`
- `GET /api/v1/applications/inbox/:company_id`
- `PATCH /api/v1/applications/:id/status`
- `POST /api/v1/applications/bulk/status`
- `GET /api/v1/applications/:id/timeline`
- `GET|POST /api/v1/applications/:id/notes`
- `GET|POST /api/v1/applications/:id/interviews`
- `GET|POST /api/v1/applications/:id/offers`
- `GET /api/v1/applications/analytics/:company_id`
- `GET /api/v1/applications/notifications`
- `GET|POST /api/v1/saved-jobs`
- `DELETE /api/v1/saved-jobs/:job_id`

## Admin

All admin routes require authentication and `settings:configure`.

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/suspend`
- `PATCH /api/v1/admin/users/:id/activate`
- `DELETE /api/v1/admin/users/:id`
- `POST /api/v1/admin/users/:id/reset-password`
- `PATCH /api/v1/admin/users/:id/roles`
- `PATCH /api/v1/admin/companies/:id/status`
- `PATCH /api/v1/admin/jobs/:id/status`
- `PATCH /api/v1/admin/jobs/:id/flags`
- `GET /api/v1/admin/applications`
- `GET|POST /api/v1/admin/plans`
- `GET|POST /api/v1/admin/cms`
- `GET|PUT /api/v1/admin/settings`
- `GET /api/v1/admin/audit-logs`
- `POST /api/v1/admin/reports`
- `POST /api/v1/admin/support/tickets`
- `POST /api/v1/admin/seo/templates`
- `GET /api/v1/admin/system-health`
