# Jobs View Bundle Analysis

Date: 2026-07-11

## Summary

Production builds now complete for all three frontend apps. The largest issue is not build failure anymore; it is route bundle size for dashboard-style pages.

## Build Output

| App | Build Result | Approx Build Time | Shared JS | Largest First Load JS |
| --- | --- | ---: | ---: | ---: |
| Web | Passed | 108s | 87.5 kB | 318 kB |
| Employer | Passed | 78s | 87.5 kB | 313 kB |
| Admin | Passed | 74s | 87.5 kB | 311 kB |

## Bundle Improvements Completed

- Enabled `optimizePackageImports` for `lucide-react`.
- Enabled AVIF/WebP image formats.
- Disabled production browser source maps.
- Added static asset immutable cache headers.
- Reduced unnecessary refetch pressure through React Query defaults.
- Added runtime telemetry without bundling a vendor SDK.

## High-Impact Bundle Findings

1. Auth pages load about 318 kB first-load JS.
2. Candidate dashboard pages load about 312 kB first-load JS.
3. Employer portal pages load about 313 kB first-load JS.
4. Admin portal pages load about 311 kB first-load JS.
5. The shared UI package is powerful but pulls charts, motion, tables, shell, and command center through one barrel export.
6. Recharts should be isolated into a chart-only lazy boundary.
7. Portal views should be split per route instead of sharing a broad multi-view client component.

## Recommended Bundle Plan

1. Split `packages/ui/src/components.tsx` into smaller entry points:
   - `@career-os/ui/primitives`
   - `@career-os/ui/charts`
   - `@career-os/ui/shell`
   - `@career-os/ui/search`
2. Dynamically import chart sections in admin/employer dashboards.
3. Split candidate platform views into route-specific components.
4. Split employer portal views into route-specific components.
5. Split admin portal views into route-specific components.
6. Consider a lightweight chart fallback for mobile or low-power devices.
7. Add CI bundle budget checks after refactor.

## Current Status

Bundle status: acceptable for MVP preview, not yet ideal for public launch at scale.
