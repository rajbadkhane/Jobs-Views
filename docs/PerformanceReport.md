# Jobs View Performance Report

Date: 2026-07-11

## Implemented Improvements

- Disabled production browser source maps in shared Next config.
- Enabled immutable cache headers for static assets and `_next/static`.
- Added AVIF/WebP image format support and 30-day minimum image cache TTL.
- Added environment-driven CSP connect origins for API and monitoring endpoints.
- Added web-vitals reporting with no vendor lock-in.
- Added offline state UX to reduce perceived failure during network loss.
- Tuned React Query cache defaults:
  - Stale time: configurable, default 60 seconds.
  - GC time: configurable, default 10 minutes.
  - Refetch on reconnect enabled.
  - Refetch on focus disabled to avoid repeated dashboard fetches.
- Added idempotent GET retry with backoff for transient API failures.

## Build Measurements

### Web

- Build status: passed
- Build time: about 108 seconds
- Shared first-load JS: 87.5 kB
- Homepage first-load JS: 299 kB
- Jobs first-load JS: 308 kB
- Job detail first-load JS: 255 kB
- Candidate dashboard first-load JS: 312 kB
- Auth routes first-load JS: 318 kB
- Career Intelligence routes first-load JS: 261 kB

### Employer

- Build status: passed
- Build time: about 78 seconds
- Shared first-load JS: 87.5 kB
- Portal routes first-load JS: 313 kB
- Status routes first-load JS: 248 kB

### Admin

- Build status: passed
- Build time: about 74 seconds
- Shared first-load JS: 87.5 kB
- Admin routes first-load JS: 311 kB

## Performance Risks

- Dashboard and portal routes ship large route-level JS because each portal uses a broad client component.
- Auth route first-load JS is high due to form, validation, auth status, and UI dependencies.
- Recharts contributes to dashboard bundles and test warnings.
- Command center and AppShell are globally mounted in authenticated apps, adding baseline JS.

## Next Performance Targets

- Split candidate, employer, and admin portal views with route-level dynamic imports.
- Lazy-load Recharts panels below the fold.
- Move static content-heavy pages toward Server Components where possible.
- Add Lighthouse CI for homepage, jobs, job detail, candidate dashboard, employer dashboard, and admin dashboard.
- Add bundle analyzer output in CI with budget thresholds:
  - Public pages under 220 kB first-load JS.
  - Dashboard pages under 250 kB first-load JS.
  - Auth pages under 240 kB first-load JS.
