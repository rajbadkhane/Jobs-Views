# Jobs View Frontend, Employer, and Admin Audit

Date: 2026-07-22

## Executive Summary

The three applications share a mature component and API foundation, but the shared UI package was not included in Tailwind v4 source discovery. Responsive classes used by `AppShell` were therefore absent from application CSS, which hid the desktop sidebar and degraded shared controls. This is the primary cause of the supplied admin screenshot.

The admin portal exposes real platform totals and several moderation actions, but its information architecture is incomplete, many records are loaded from public rather than administrative endpoints, and support, reporting, SEO, and settings workflows are mostly create-only forms. The employer portal is live-API aware but mixes real responses with static fallback content and includes unsafe demo actions. The public application has the strongest page-level states, though some career intelligence content is still static and must not be presented as measured user data.

## Application Structure

| Area | Current organization | Finding |
| --- | --- | --- |
| Public web | App Router pages with large experience components | Search and company experiences are well isolated; candidate and career intelligence components are too broad. |
| Employer | Route adapters render one large `employer-portal.tsx` | Page boundaries exist in routing but not in component ownership. This increases rerenders and makes unsupported fallbacks difficult to remove. |
| Admin | Route adapters render one large `admin-portal.tsx` plus shared table/overlay components | Tables and overlays are reusable, but page modules and data contracts need separation. |
| Shared UI | `packages/ui/src/components.tsx` contains the design system and shell | Strong reuse, but the file is oversized and its Tailwind classes were not compiled by consuming apps. |
| Shared data | `packages/shared` API client and `packages/hooks` query hooks | Correct centralization; admin list responses and query keys need consistent pagination and filtering. |

## Critical Findings

1. **Shared Tailwind classes are missing.** None of the app stylesheets declared `@source` for `packages/ui`, so classes such as `lg:flex` and `lg:pl-[304px]` were absent from production CSS.
2. **Mobile navigation is incomplete.** `AppShell` renders only `nav.slice(0, 5)`, leaving most employer and admin destinations inaccessible on mobile.
3. **Workspace links are incorrect.** The shared profile panel always points to candidate routes, including in employer and admin applications.
4. **Navigation grouping and icons are generic.** Most admin items appear under `Recent` with a briefcase icon, reducing scan speed.
5. **Employer demo mutations are unsafe.** Quick actions create an "Untitled Draft Job" and invite a generated `@example.com` address without confirmation or user input.
6. **Fabricated employer insights remain.** Source effectiveness, candidate ranking, and static company content can be mistaken for backend measurements.
7. **Admin job moderation is incomplete.** The screen consumes the public job list, which cannot reliably expose drafts, rejected jobs, or archived records.
8. **Admin workflows are create-heavy.** Reports, support, and SEO can be submitted but cannot be listed, inspected, updated, or downloaded through the current API.
9. **Settings use raw JSON.** This is error-prone, inaccessible to nontechnical administrators, and risks exposing secret values.
10. **Legacy routes duplicate canonical admin routes.** Root-level pages and aliases create inconsistent bookmarks and navigation behavior.

## UI, Accessibility, And Responsive Review

- Desktop admin content has no effective sidebar because of missing compiled utilities.
- Shared headers can duplicate page headings and consume excessive vertical space on short screens.
- Shared floating menus lack complete outside-click and navigation-close behavior.
- Admin tables support sorting, selection, resizing, density, and keyboard row opening. They still require a mobile record presentation and persistent preferences.
- Drawers and confirmation dialogs already include useful focus and Escape behavior and should remain the standard detail/action pattern.
- Loading and recoverable error states are generally present. Empty states are inconsistent in the employer portal and occasionally masked by fallback demo content.
- Jobs View blue and orange tokens are present, but generated gradient text and generic icon repetition make operational screens feel less professional.
- Touch targets and safe-area padding exist in parts of the shared shell but are not sufficient when navigation is truncated.

## API Support Matrix

| Workflow | Current support | Required work |
| --- | --- | --- |
| Admin dashboard totals | Supported | Add real time-series datasets; hide unavailable series. |
| Users | List and core moderation supported | Add details, sessions, devices, login history, revocation, pagination totals, and exports. |
| Companies | Public list plus status/verification mutations | Add admin list/detail including all statuses, documents, team, branches, departments, and related jobs. |
| Jobs | Public list plus status/flag mutations and quick post | Add admin all-status list/detail and bulk moderation. |
| Recruitment | Application list supported | Add application detail, timeline, interview, offer, and aggregate views. |
| Employer company/jobs/ATS | Core CRUD and pipeline supported with tenant checks | Add validated editor flows, interview updates, team permissions, billing, and support views. |
| Employer analytics | Aggregate endpoint supported | Remove invented scores and render only returned metrics. |
| Employer billing | Tables exist | Add company-scoped read endpoints for plan, usage, invoices, and payments. |
| CMS | List and upsert supported; revision table exists | Add detail, lifecycle actions, revision list, and restore. |
| SEO | Template upsert supported; redirects/templates tables exist | Add list, detail, delete, redirects, sitemap, and robots configuration reads. |
| Reports | Request row supported | Add list/status and actual file generation/download. |
| Support | Ticket creation supported | Add queue, detail, assignment, replies, status, and requester history. |
| Audit | Recent list supported | Add server filters, pagination totals, and export. |
| Monitoring | Basic health supported | Return explicit health states for configured dependencies and `not_configured` for absent services. |
| Marketplace | Read overview supported | Add a real admin view; mutation controls remain hidden until endpoints exist. |

## Remediation Priority

### Priority 1 - Critical

- Restore shared Tailwind source scanning and responsive shell behavior.
- Remove unsafe employer demo mutations and fabricated insights.
- Use administrative job/company datasets for moderation.
- Make every admin route reachable by keyboard and mobile navigation.

### Priority 2 - High

- Split employer and admin monoliths into route-level modules.
- Complete support, reporting, CMS, SEO, sessions, and billing APIs.
- Standardize pagination, totals, filters, query keys, and invalidation.
- Replace raw settings JSON with typed, masked forms.

### Priority 3 - Medium

- Add real dashboard trends, responsive record cards, persistent table preferences, and export workflows.
- Remove unsupported public career metrics or label non-personal educational examples clearly.
- Add focused accessibility and responsive regression coverage.

### Priority 4 - Low

- Decompose the shared component barrel into focused files.
- Add optional virtualization for genuinely large server-backed datasets.
- Expand visual regression coverage for dark mode and ultra-wide screens.

## Baseline Scores

| Category | Score / 10 |
| --- | --- |
| Architecture | 6.5 |
| Public frontend | 7.0 |
| Employer | 5.5 |
| Admin | 5.0 |
| Performance | 6.5 |
| UI consistency | 6.0 |
| UX | 5.5 |
| Accessibility | 6.5 |
| Code quality | 6.0 |
| Maintainability | 5.0 |
| Scalability | 6.0 |
| Production readiness | 4.5 |

## Acceptance Baseline

The remediation is complete only when shared shell classes exist in production CSS, the sidebar is visible at desktop widths, every workspace route is reachable on mobile, no fake mutation is issued, unsupported metrics are absent, admin moderation uses private datasets, and all application builds and focused responsive/accessibility checks pass.

## Remediation Status

Completed in this pass:

- Shared Tailwind source discovery and desktop sidebar utilities.
- Role-aware desktop, drawer, and mobile-bottom navigation.
- Workspace-correct account links and automatic menu closure.
- Responsive admin record cards below tablet width.
- Canonical admin routes and private paginated job/company moderation datasets.
- Real dashboard user, job, application, revenue, and funnel trends.
- Removal of generated employer invitations, placeholder draft jobs, and unsupported analytics fallbacks.
- Honest `not_configured` infrastructure states and queued report requests.

Still intentionally unavailable until their durable APIs exist:

- Generated report artifacts and download workers.
- Support ticket replies, assignment, and requester history.
- Employer billing, interview mutations, and support-ticket workflows.
- Admin session/device revocation and typed secret-bearing settings forms.
- Complete CMS revision restore and SEO redirect lifecycle controls.
