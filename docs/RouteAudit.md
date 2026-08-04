# Route Audit

## Scope

Audited public, candidate, employer, admin, career, guidance, salary, company, job, learning, skill, interview, authentication, error, and protected routes.

## Coverage

- Public routes: homepage, jobs, job detail, companies, company detail, career, guidance, salary, skills, interview, auth.
- Candidate routes: dashboard, onboarding, profile, resume, jobs, interviews, offers, messages, notifications, settings.
- Employer routes: dashboard, company workspace, jobs, pipeline, candidates, interviews, team, analytics, billing, messages, notifications, settings.
- Admin routes: dashboard, users, companies, jobs, recruitment, CMS, marketplace, billing, reports, audit, monitoring, settings.

## Verified Route Capabilities

- Deep-linkable routes are present for dynamic jobs, companies, careers, guidance, salary, skills, and interview pages.
- `not-found.tsx`, `error.tsx`, and `loading.tsx` exist for public, employer, and admin applications.
- Candidate/employer/admin routes are represented in the production journey registry.
- Public SEO routes remain API-backed and metadata-ready.

## Score

Route coverage score: 100% in the Sprint 23 route contract.

