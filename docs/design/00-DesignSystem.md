# Jobs View Design System

This is the master design language for Jobs View and the source of truth for Google Stitch. This document is intended to remain stable. Section-specific documents in this folder should reference this file and apply it to individual product areas.

## Core Instruction For Stitch

Redesign only UI and UX. Do not redesign functionality, backend behavior, API contracts, RBAC, route structure, navigation architecture, or business workflows. Preserve every existing feature and workflow across candidate, employer, admin, and public experiences.

## Product Vision

Jobs View is not a job portal. Jobs View is a Career Operating System.

It serves candidates, employers, recruiters, hiring managers, HR, finance users, and super admins. It must feel like a premium enterprise SaaS platform for careers, hiring, and platform operations.

## Design Philosophy

Jobs View should be professional, premium, minimal, trustworthy, modern, fast, and friendly. It should be operational rather than decorative. It should feel like a serious system that people use every day to manage career and hiring workflows.

## Brand Personality

- Confident, not loud.
- Helpful, not cute.
- Modern, not trendy.
- Premium, not flashy.
- Efficient, not cold.
- Enterprise-grade, not generic.

## Design Principles

- Every page must answer: what should I do next?
- Every dashboard must include summary, quick actions, insights, and recent activity.
- Every workflow must be obvious and recoverable.
- Every component must be reusable.
- Every state must be designed: loading, empty, error, success, disabled, hover, focus, active.
- Every screen must support light mode, dark mode, desktop, tablet, and mobile.

## Visual Hierarchy

Use clear hierarchy:

- H1 identifies the page or public SEO entity.
- Page header gives context and primary action.
- Cards group related information.
- Tables handle dense operational data.
- Badges communicate status.
- Sidebars hold navigation.
- Drawers hold detail views.
- Dialogs handle short focused tasks.

## Color Palette

Use semantic tokens.

Primary teal:

- 50 `#F0FDFA`
- 100 `#CCFBF1`
- 200 `#99F6E4`
- 300 `#5EEAD4`
- 400 `#2DD4BF`
- 500 `#14B8A6`
- 600 `#0D9488`
- 700 `#0F766E`
- 800 `#115E59`
- 900 `#134E4A`

Secondary blue:

- 50 `#EFF6FF`
- 100 `#DBEAFE`
- 200 `#BFDBFE`
- 300 `#93C5FD`
- 400 `#60A5FA`
- 500 `#3B82F6`
- 600 `#2563EB`
- 700 `#1D4ED8`
- 800 `#1E40AF`
- 900 `#1E3A8A`

Neutral:

- 50 `#F8FAFC`
- 100 `#F1F5F9`
- 200 `#E2E8F0`
- 300 `#CBD5E1`
- 400 `#94A3B8`
- 500 `#64748B`
- 600 `#475569`
- 700 `#334155`
- 800 `#1E293B`
- 900 `#0F172A`

Status:

- Success text `#047857`, background `#ECFDF5`, border `#A7F3D0`
- Warning text `#B45309`, background `#FFFBEB`, border `#FDE68A`
- Error text `#BE123C`, background `#FFF1F2`, border `#FDA4AF`
- Info text `#0369A1`, background `#F0F9FF`, border `#BAE6FD`

Avoid flashy colors, neon, gaming palettes, glassmorphism, neumorphism, and excessive gradients.

## Typography

Use Inter.

Scale:

- Display: 48/56, weight 700
- H1: 36/44, weight 700
- H2: 28/36, weight 600
- H3: 22/30, weight 600
- H4: 18/26, weight 600
- Body: 15-16/24-26, weight 400
- Small: 14/20
- Caption: 12/16
- Button: 14/20, weight 500-600
- Table cell: 14/20

Do not use viewport-based font sizes. Do not use negative letter spacing.

## Spacing

Use an 8px grid. Allow 4px increments for small icon/text gaps.

Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

Desktop page padding: 24-32px.
Tablet page padding: 20-24px.
Mobile page padding: 16px.

## Grid System

Public pages use max width 1200-1280px.
Candidate app uses max width 1440px.
Employer app uses max width 1680px.
Admin app uses max width 1720px.

Use responsive grid tracks:

- Mobile: 1 column.
- Tablet: 2 columns where useful.
- Desktop: 3-4 columns for cards.
- Admin/employer analytics may use wider data surfaces.

## Container Width

Do not stretch readable content endlessly on ultra-wide screens. Use constrained containers for content pages and wider containers for tables, dashboards, and ATS boards.

## Border Radius

- Cards: 8px, max 12px.
- Buttons: 8px.
- Inputs: 8px.
- Dialogs: 12px.
- Drawers: 12px exposed corners.
- Badges/tags: 999px.
- Avatars: circle for users, 8-12px for company logos.

## Shadow System

Use subtle elevation.

- Small: `0 1px 2px rgba(15, 23, 42, 0.06)`
- Medium: `0 8px 24px rgba(15, 23, 42, 0.08)`
- Large: `0 18px 45px rgba(15, 23, 42, 0.10)`
- Dropdown: `0 12px 32px rgba(15, 23, 42, 0.14)`
- Dialog: `0 24px 72px rgba(15, 23, 42, 0.22)`

Use borders more than shadows in dark mode.

## Icons

Use Lucide icons only.

- Inline: 14px.
- Button: 16px.
- Navigation: 18-20px.
- Empty state: 32-48px.

Icon-only buttons need accessible labels and tooltips.

## Illustrations

Use illustrations sparingly. They must clarify the product, not decorate. Prefer real product/state visuals, meaningful empty-state illustrations, and domain-relevant imagery. Avoid abstract blobs and generic people-at-laptop art.

## Light Theme

Base `#F7F8FA`, surface `#FFFFFF`, text `#0F172A`, border `#E2E8F0`.

## Dark Theme

Base `#020617`, surface `#0F172A`, elevated `#111827`, text `#F8FAFC`, border `#1E293B`.

## Charts

Use restrained chart colors: teal, blue, violet, amber, rose, slate, emerald, cyan. Use tooltips, labels, and accessible contrast. Avoid 3D charts and excessive animation.

## Forms

Forms need labels, helper text, validation, loading, success, error, disabled states, password visibility, upload progress, and accessible focus rings.

## Buttons

Variants: primary, secondary, ghost, danger, link, icon. Primary actions should be obvious. Avoid multiple competing primary buttons in one group.

## Cards

Cards group related information. Do not nest cards. Use hover lift only for actionable cards.

## Tables

Tables need sticky headers, hover rows, selection, filters, sorting, pagination, column visibility, bulk actions, loading, empty, and error states.

## Sidebar

Use clear active states, workspace context, grouped navigation, and mobile drawer behavior.

## Header

Headers should be sticky where useful and include page title, context, search/command, notifications, and profile/workspace actions.

## Footer

Public footer includes SEO links, popular jobs, companies, cities, skills, support, legal, and company links.

## Dashboard Rules

Every dashboard includes greeting/context, summary, KPI cards, charts where useful, quick actions, insights, recent activity, loading, empty, and error states.

## Animation Rules

Use Framer Motion. Keep animations 150-250ms. Animate opacity, scale, translate, minimal rotation, and progress only. Do not animate heavy layout. Respect reduced motion.

## Accessibility

Meet WCAG AA. Use semantic HTML, keyboard navigation, ARIA labels, focus states, contrast, screen reader support, and reduced motion.

## Responsive Rules

Design for 320, 375, 425, 768, 1024, 1280, 1440, 1920, and ultra-wide. Mobile is intentional, not compressed desktop.

## Performance Rules

Use lazy loading, code splitting, image optimization, font optimization, skeleton loading, virtualization for large data, and lightweight motion.

## Component Naming Rules

Use clear names: `JobCard`, `CompanyCard`, `CandidateCard`, `DashboardKpiCard`, `FilterBar`, `DataTable`, `StatusBadge`, `ProfileStrengthCard`, `ApplicationTimeline`, `AtsPipeline`, `NotificationCenter`.

## Design Tokens

Tokens must map to color, typography, spacing, radius, shadow, motion, z-index, breakpoint, and status values. Use tokens instead of one-off visual values.

## Stitch Prompt

Read this design system first. Redesign only the requested Jobs View section. Preserve functionality, routes, APIs, RBAC, navigation architecture, and workflows. Improve only UI/UX.
