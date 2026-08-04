# Sprint 18 - Route Architecture, Career Graph, and Recommendation Engine

## Route Architecture

Candidate routes now exist under `/candidate`:

- `/candidate`
- `/candidate/profile`
- `/candidate/profile/[section]`
- `/candidate/resume`
- `/candidate/resume/[section]`
- `/candidate/jobs`
- `/candidate/jobs/[section]`
- `/candidate/interviews`
- `/candidate/interviews/[section]`
- `/candidate/offers`
- `/candidate/messages`
- `/candidate/notifications`
- `/candidate/career-health`
- `/candidate/career-intelligence`
- `/candidate/salary`
- `/candidate/guidance`
- `/candidate/settings`

Employer routes now exist under `/employer` in the employer app:

- `/employer`
- `/employer/jobs`
- `/employer/jobs/[...segments]`
- `/employer/candidates`
- `/employer/candidates/[candidateId]`
- `/employer/pipeline`
- `/employer/interviews`
- `/employer/company`
- `/employer/company/[section]`
- `/employer/team`
- `/employer/team/[section]`
- `/employer/billing`
- `/employer/messages`
- `/employer/notifications`
- `/employer/settings`
- `/employer/analytics`
- `/employer/help`

Admin routes now exist under `/admin` in the admin app:

- `/admin`
- `/admin/jobs`
- `/admin/jobs/[...segments]`
- `/admin/companies`
- `/admin/candidates`
- `/admin/users`
- `/admin/recruitment`
- `/admin/billing`
- `/admin/reports`
- `/admin/seo`
- `/admin/cms`
- `/admin/support`
- `/admin/audit`
- `/admin/monitoring`
- `/admin/settings`
- `/admin/system`

Public route architecture added:

- `/career`
- `/guidance`
- `/guidance/[topic]`
- `/salary`
- `/salary/calculator`

## Route Refactors

- Existing large candidate, employer, and admin components are reused through route adapters.
- Navigation now points to the new bookmarkable route hierarchy.
- Role redirects now resolve to `/candidate`, `/employer`, and `/admin`.
- Private workspace routes are marked `noindex`.

## Career Graph

`packages/shared/src/career-engine.ts` defines a reusable graph:

- Industry
- Department
- Job family
- Role
- Specialization
- Skill
- Education
- Experience
- Salary band
- Career progression

Seed paths include Security and Technology examples.

## Recommendation Engine

The shared engine supports:

- Candidate-to-job matching.
- Employer job-to-candidate matching.
- Ranked recommendations.
- Match reasons.
- Missing requirements.

Weights follow the sprint brief:

- Education: 20
- Experience: 25
- Skills: 25
- Location: 10
- Salary: 5
- Industry: 5
- Language: 5
- Certificates: 5
- Availability: 5

Scores are clamped to 100 because the requested weights total 105.

## Profile Engine

The profile engine calculates:

- Completion score.
- Strength label.
- Missing fields.

Supported fields include education, experience, preferred job, skills, certificates, languages, location, preferred cities/states, salary expectation, employment type, work mode, availability, profile photo, resume, career goal, industry preference, and department preference.

## Salary Engine

The salary engine estimates:

- Minimum salary.
- Average salary.
- Maximum salary.
- Top cities.
- Growth forecast.
- Promotion forecast.

Inputs include role, city/location, experience, skills, certificates, and company size.

## Employer Matching

Employer matching uses the same scoring engine in reverse:

- Top candidates.
- Nearby candidates.
- Freshers and experienced candidate ranking.
- Invite/shortlist/message workflows can consume ranked results without a new API contract.

## Remaining Work

- Wire backend profile/job payloads directly into the new engine hooks where route-specific widgets need live rankings.
- Replace seeded career graph nodes with database-backed career taxonomy when the backend graph module is ready.
- Add route-level tests for the new route adapters.
- Add deep links from more action buttons inside the large view components.
