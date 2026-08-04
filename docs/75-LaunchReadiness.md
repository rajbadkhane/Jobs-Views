# Jobs View Launch Readiness

## Current Status

Jobs View has production hardening in progress: SEO metadata, programmatic SEO routes, `llms.txt`, security headers, production config validation, Docker artifacts, and CI checks are now implemented.

## Verified Locally

- Go API unit tests pass with `go test ./...`.
- Web, employer, and admin TypeScript checks pass.
- Web unit tests pass.
- Production Next builds are expected to run through CI for all frontend apps.

## Launch Blockers

- `npm audit --audit-level=high` currently reports high severity issues in the frontend dependency tree.
- The available audit fix path requires major upgrades to Next, React, ESLint, Vitest, and Turbo.
- The major upgrade is blocked by current workspace peer ranges, especially shared UI peers pinned to React 18.
- Redis must be running and healthy in production; local `/health` remains degraded when Redis is unavailable.
- Lighthouse, Google Rich Results, and Schema Validator must be run against a deployed URL.
- E2E tests for candidate, employer, admin, RBAC, and multi-tenant flows still need browser automation coverage.

## Required Before Public Launch

- Upgrade frontend framework/tooling dependency tree in a dedicated migration branch.
- Update workspace peer dependencies for React 19/Next 16 compatibility or pin to a patched Next release if one becomes available for the current major.
- Run `npm audit --audit-level=high` until clean.
- Run Lighthouse on public, candidate auth, employer, and admin routes.
- Validate JSON-LD using Google Rich Results and Schema.org validators.
- Start Redis in production and confirm `/api/v1/health`, `/api/v1/ready`, and `/api/v1/live`.
- Configure GA4/GTM/Clarity IDs and verify events in production.
- Configure database backups and restore rehearsal.
- Run E2E suites across desktop and mobile browsers.
