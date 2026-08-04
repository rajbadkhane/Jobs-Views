# Jobs View Deployment Checklist

Date: 2026-07-11

## Environment

- [ ] Set `NEXT_PUBLIC_API_URL`.
- [ ] Set `NEXT_PUBLIC_SITE_URL`.
- [ ] Set `NEXT_PUBLIC_ADMIN_SITE_URL`.
- [ ] Set `NEXT_PUBLIC_EMPLOYER_SITE_URL`.
- [ ] Set `NEXT_PUBLIC_MONITORING_ENDPOINT`.
- [ ] Set `NEXT_PUBLIC_RELEASE`.
- [ ] Set `NEXT_PUBLIC_APP_ENV=production`.
- [ ] Set database credentials.
- [ ] Set Redis URL.
- [ ] Set JWT access and refresh secrets.
- [ ] Set Resend API key in the backend environment.
- [ ] Set Cloudflare R2 credentials.

## Build

- [x] Web production build passes.
- [x] Employer production build passes.
- [x] Admin production build passes.
- [x] Typecheck passes.
- [x] Lint passes.
- [x] Unit tests pass.
- [ ] Docker compose config verified on a machine with Docker.
- [ ] Docker images built and pushed.

## Runtime

- [x] Security headers configured.
- [x] Static asset cache headers configured.
- [x] Image optimization formats configured.
- [x] Offline UX added.
- [x] Web-vitals telemetry added.
- [x] Session-expired event handling added.
- [x] API request IDs added.
- [x] GET retry with backoff added.
- [ ] Production monitoring ingestion endpoint connected.
- [ ] Alert rules configured.
- [ ] Uptime checks configured.

## Services

- [x] PostgreSQL health check configured.
- [x] Redis health check configured.
- [x] Web health check configured in production compose.
- [x] Admin health check configured in production compose.
- [x] Employer health check configured in production compose.
- [ ] API Dockerfile and health check verified with backend runtime.
- [ ] Backup and restore process tested.

## Security

- [x] `X-Frame-Options` configured.
- [x] `X-Content-Type-Options` configured.
- [x] HSTS configured.
- [x] Referrer policy configured.
- [x] Permissions policy configured.
- [x] CSP configured.
- [ ] CSP verified against production domains.
- [ ] Cookie flags verified in backend.
- [ ] CSRF strategy verified in backend.
- [ ] Rate-limit 429 UX tested against live API.

## Performance

- [x] Production builds measured.
- [x] Static caching added.
- [x] React Query cache tuned.
- [ ] Lighthouse CI configured.
- [ ] Bundle budgets enforced.
- [ ] Recharts split into lazy chunks.
- [ ] Portal routes split into smaller client bundles.

## Go / No-Go

Go only after:

- Docker compose validates and boots in production mode.
- Monitoring endpoint receives web vitals and error events.
- Lighthouse performance is 95+ on public pages.
- Portal bundle-size remediation plan is accepted.
- Backend health, readiness, liveness, graceful shutdown, Redis, and DB are verified in the target environment.
