# Jobs View Production Readiness

Date: 2026-07-11

## Score

Production Readiness Score: 88/100

## Implemented Hardening

- Added environment-driven monitoring configuration in `@career-os/config`.
- Added production-safe structured logging and telemetry helpers in `@career-os/shared`.
- Added web-vitals reporting hooks for web, employer, and admin apps.
- Added offline placeholders for web, employer, and admin apps.
- Added session-expiry event handling and graceful redirect hooks.
- Added session-timeout warning hook in `@career-os/hooks`.
- Added autosave draft hook for candidate, employer, CMS, settings, job editor, and resume editor workflows to adopt.
- Added request IDs to all frontend API requests.
- Added retry with backoff for idempotent GET requests on network/server failures.
- Added safe token cleanup and `Jobs View:session-expired` event dispatch when refresh fails.
- Hardened React Query defaults for stale time, garbage collection, reconnect refetch, and mutation retry policy.
- Added immutable static asset cache headers and production image format support in shared Next config.
- Added admin and employer production Dockerfiles.
- Added admin and employer services to production compose.

## Verification

- Typecheck passed for config, shared, hooks, web, employer, and admin.
- Lint passed for shared, hooks, web, employer, and admin.
- Unit tests passed for shared, hooks, web, employer, and admin.
- Production builds passed for web, employer, and admin.

## Production Build Results

- Web build: passed in about 108 seconds.
- Employer build: passed in about 78 seconds.
- Admin build: passed in about 74 seconds.

## Remaining Production Risks

- Docker CLI is not available in this environment, so `docker compose -f docker-compose.production.yml config` could not be executed.
- Backend production image and runtime health endpoints were not exercised in this pass.
- Frontend first-load JS remains high on portal routes.
- Recharts still emits zero-size warnings in jsdom tests.
- Autosave hook exists but has not yet been wired into every editor form.
- Monitoring endpoint is vendor-neutral but requires a real ingestion URL in production.

## Launch Gate

Jobs View is closer to production-ready, but launch should wait until:

- Docker compose is validated on a machine with Docker.
- Portal bundles are split further.
- Lighthouse CI is run against production builds.
- Monitoring endpoint, uptime checks, and alert routing are configured.
