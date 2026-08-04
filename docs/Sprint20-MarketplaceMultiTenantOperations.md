# Sprint 20 - Marketplace Platform, Multi-Tenant Operations, and Business Growth Engine

## Multi-Tenant Features

- Added `organizations` as the parent commercial tenant above companies.
- Companies, branches, departments, and company users can now be scoped to an organization.
- Company users can also be scoped by branch and department for future department-level and branch-level permissions.
- Existing company isolation remains intact through `company_id`; organization scope is additive.

## Subscription System

- Added `plan_entitlements` for feature limits and booleans.
- Added shared marketplace entitlement engine for:
  - Job limits
  - Recruiter limits
  - Featured jobs
  - AI matching
  - Analytics
  - Career branding
  - Priority support
  - Bulk import
  - API access
  - Resume database
- Added Professional plan seed alongside existing Free, Starter, Growth, and Enterprise plans.

## Marketplace Features

- Added `marketplace_products` for featured jobs, boosts, urgent hiring, premium listings, sponsored jobs, resume unlocks, premium search, and API access.
- Added `marketplace_purchases`.
- Added `job_boosts` with schedule, active, expired, and cancelled states.
- Added `resume_database_unlocks`.
- Added shared product pricing and boost expiry helpers.

## Revenue Platform

- Added coupons.
- Added tax rules.
- Added company wallets.
- Added wallet transactions.
- Added purchase records.
- Added Super Admin business dashboard API:
  - `GET /api/v1/admin/business-dashboard`
- Added marketplace overview API:
  - `GET /api/v1/admin/marketplace`

## Business Dashboard

Business metrics include:

- MRR
- ARR
- Revenue
- Collections
- Refunds
- Invoices
- Employers
- Active subscriptions
- Marketplace purchases
- Job boosts
- Resume unlocks
- Leads
- Open operations

The shared marketplace engine also calculates churn, LTV, employer growth, and application velocity.

## Operations Features

- Added employer leads for sales, demo, employer, and support lead tracking.
- Added recruiter CRM items for notes, follow-ups, tasks, reminders, and labels.
- Added document templates for offer letters, appointment letters, experience letters, joining letters, and HR templates.
- Added employer API keys and webhook endpoints for future ATS, HRMS, ERP, and SSO integrations.
- Added operations queue for fraud, spam jobs, duplicates, verification, blacklists, moderation, and automation.
- Added notification templates for email, SMS, WhatsApp placeholder, push, and in-app.
- Added automation rules for auto-expiry, auto-archive, notifications, renewals, recommendation refresh, sitemap refresh, and SEO refresh.

## Search Marketplace

- Sprint 19 content search remains active.
- Sprint 20 adds marketplace products and commercial operations as indexable internal admin data.
- Resume database unlocking is represented in the data model for employer candidate search.

## Security

- Organization isolation is additive to existing company isolation.
- Subscription validation is represented through shared entitlements.
- Marketplace, payments, jobs, CMS, and operations are auditable through existing admin audit patterns and new operation records.

## Files Changed

- `packages/shared/src/marketplace-engine.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/api.ts`
- `packages/hooks/src/index.ts`
- `apps/api/migrations/000008_marketplace_operations.up.sql`
- `apps/api/migrations/000008_marketplace_operations.down.sql`
- `apps/api/internal/admin/model.go`
- `apps/api/internal/admin/repository.go`
- `apps/api/internal/admin/service.go`
- `apps/api/internal/admin/handler.go`
- `apps/admin/app/admin/business/page.tsx`
- `apps/admin/app/admin/marketplace/page.tsx`

## Remaining Work

- Add write endpoints for coupons, marketplace products, boosts, leads, CRM, documents, API keys, and webhooks.
- Add employer-facing purchase and boost flows.
- Add candidate resume database UI with entitlement checks.
- Add automated workers for expiry, archive, renewals, recommendation refresh, sitemap refresh, and SEO refresh.
- Add secure impersonation with step-up auth and detailed audit trails.
- Add payment provider integration when the gateway decision is made.
