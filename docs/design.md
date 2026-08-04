# Jobs View Design Language

This document is the single source of truth for the Jobs View visual and interaction design language. It is written for Google Stitch AI and for every designer, engineer, and reviewer working on Jobs View.

The redesign goal is to elevate the complete Jobs View platform into a premium, production-grade SaaS experience while preserving every existing feature, API, route, RBAC flow, business rule, database architecture, and workflow.

Do not redesign functionality. Do not invent new modules. Do not remove features. Redesign only UI and UX.

Jobs View must feel like an enterprise operating system for careers, hiring, recruitment, administration, and intelligence. It should be clear, fast, trustworthy, responsive, accessible, and coherent across public, candidate, employer, recruiter, HR, finance, and super-admin experiences.

---

## 1. Product Vision

Jobs View is not a job portal.

Jobs View is a Career Operating System.

A job portal is a directory. Jobs View is an operational platform. It helps candidates manage career growth, profiles, resumes, applications, saved jobs, interviews, offers, notifications, and intelligence. It helps employers manage companies, jobs, hiring pipelines, teams, interviews, analytics, billing, and settings. It helps admins operate the complete platform: users, companies, jobs, CMS, SEO, billing, reports, support, audit logs, and system health.

The platform should feel like a polished enterprise SaaS product, not a marketing brochure and not a consumer entertainment app.

### Core Users

Candidate:
Uses Jobs View to discover jobs, maintain a profile, upload resumes, track applications, manage saved jobs, receive notifications, use career intelligence, and prepare for growth.

Employer:
Uses Jobs View to register and verify a company, manage company profile, post jobs, review applications, invite team members, and monitor hiring.

Recruiter:
Uses Jobs View daily as an ATS workspace: search candidates, move applications through stages, add notes/tags/ratings, schedule interviews, and collaborate with hiring teams.

Hiring Manager:
Uses Jobs View to review shortlisted candidates, see interview feedback, participate in hiring decisions, and track role progress.

HR:
Uses Jobs View to manage interviews, offers, team workflows, compliance documents, and employer settings.

Finance:
Uses Jobs View to review subscription usage, invoices, billing history, plan limits, and company billing settings.

Super Admin:
Uses Jobs View to operate the entire ecosystem: users, companies, jobs, CMS, SEO, reports, support, audit trails, monitoring, settings, and moderation.

### Product Feeling

Every screen should feel:

- Professional, not playful.
- Premium, not decorative.
- Minimal, not empty.
- Trustworthy, not cold.
- Modern, not trendy for its own sake.
- Fast, not animated for spectacle.
- Friendly, not casual.
- Enterprise-grade, not template-driven.

### Preservation Rule

The redesign must preserve:

- Existing routes.
- Existing role redirects.
- Existing authentication flows.
- Existing RBAC rules.
- Existing API contracts.
- Existing backend behavior.
- Existing database architecture.
- Existing workflows.
- Existing public, candidate, employer, and admin modules.

Any UI proposal that requires backend behavior changes must be rejected unless explicitly requested in a separate functional sprint.

---

## 2. Visual Identity

Jobs View should communicate quiet confidence. The design language should be suitable for a serious career and hiring platform used by Indian candidates, recruiters, employers, and administrators.

### Identity Keywords

- Professional
- Premium
- Minimal
- Trustworthy
- Modern
- Fast
- Friendly
- Operational
- Structured
- Calm
- Intelligent

### What Jobs View Is Not

Jobs View is not:

- A gaming UI.
- A neon dashboard.
- A crypto dashboard.
- A social media clone.
- A loud marketing site.
- A generic admin template.
- A glassmorphism showcase.
- A gradient-heavy landing page.
- A neumorphic interface.
- A decorative card collage.

### Visual Rules

- Avoid flashy colors.
- Avoid gaming-style glow effects.
- Avoid glassmorphism.
- Avoid neumorphism.
- Avoid gradients everywhere.
- Use gradients only when they clarify hierarchy or brand emphasis.
- Avoid one-note palettes dominated by a single hue.
- Avoid decorative blobs, orbs, bokeh, and floating abstract shapes.
- Do not place cards inside cards.
- Do not style entire sections as floating cards.
- Use cards for repeated items, dashboards, compact surfaces, tables, modals, and tools.
- Prefer clean bands, structured grids, and strong spacing.
- Use visible data and controls over decorative illustration.

### Personality

Jobs View should feel like:

- LinkedIn Recruiter’s seriousness.
- Stripe’s clarity.
- Linear’s polish.
- Vercel’s restraint.
- Notion’s readability.
- Apple’s spacing discipline.

It should never look copied from any of these products.

---

## 3. Design Inspiration

Use these products as inspiration only. Do not copy layout, branding, color systems, illustrations, icons, components, wording, or interaction patterns exactly.

### LinkedIn Recruiter

Use for:

- Recruiter seriousness.
- Candidate profile density.
- Search and filter behavior.
- Talent workflow expectations.

Avoid:

- Overcrowded legacy interface patterns.
- Excessive blue dominance.

### Indeed

Use for:

- Search clarity.
- Job listing readability.
- Candidate-first discovery.

Avoid:

- Generic job-board appearance.

### Naukri

Use for:

- India-specific job portal expectations.
- Candidate, recruiter, and employer mental models.

Avoid:

- Dense visual clutter.
- Legacy ad-heavy patterns.

### Ashby

Use for:

- ATS clarity.
- Candidate pipeline calmness.
- Recruiting workflow polish.

Avoid:

- Copying exact ATS boards.

### Greenhouse

Use for:

- Structured hiring workflows.
- Interview and offer state clarity.

Avoid:

- Heavy enterprise stiffness.

### Linear

Use for:

- Motion restraint.
- Sidebar quality.
- Keyboard-friendly navigation.
- Compact, elegant surfaces.

Avoid:

- Over-minimal controls that hide obvious workflows.

### Stripe

Use for:

- Tables.
- Settings.
- Billing.
- Documentation-like clarity.
- Enterprise trust.

Avoid:

- Purple-heavy gradient branding.

### Vercel

Use for:

- Minimal layouts.
- Deployment and system surfaces.
- Monitoring pages.

Avoid:

- Excessive black-and-white austerity.

### Notion

Use for:

- Content readability.
- CMS/editor calmness.
- Empty-state simplicity.

Avoid:

- Too much document-like softness for operational workflows.

### Apple

Use for:

- Spacing.
- Typography restraint.
- Premium feel.

Avoid:

- Oversized lifestyle marketing patterns for internal dashboards.

---

## 4. Color System

The Jobs View color system must work in light and dark modes, support dense SaaS workflows, clearly communicate status, and remain accessible.

Use colors as semantic tokens. Do not hardcode random colors in components.

### Core Philosophy

- Neutral surfaces dominate.
- Primary color guides action.
- Status colors communicate state.
- Charts use distinct but restrained hues.
- Badges and tags use low-saturation backgrounds.
- Focus states must be obvious.
- Disabled states must still be legible.

### Light Theme Tokens

Background:

- `color.background.base`: `#F7F8FA`
- `color.background.surface`: `#FFFFFF`
- `color.background.subtle`: `#F1F5F9`
- `color.background.muted`: `#E2E8F0`
- `color.background.inverse`: `#0F172A`

Text:

- `color.text.primary`: `#0F172A`
- `color.text.secondary`: `#475569`
- `color.text.muted`: `#64748B`
- `color.text.disabled`: `#94A3B8`
- `color.text.inverse`: `#FFFFFF`

Border:

- `color.border.subtle`: `#E2E8F0`
- `color.border.default`: `#CBD5E1`
- `color.border.strong`: `#94A3B8`
- `color.border.focus`: `#0F766E`

Primary:

- `color.primary.50`: `#F0FDFA`
- `color.primary.100`: `#CCFBF1`
- `color.primary.200`: `#99F6E4`
- `color.primary.300`: `#5EEAD4`
- `color.primary.400`: `#2DD4BF`
- `color.primary.500`: `#14B8A6`
- `color.primary.600`: `#0D9488`
- `color.primary.700`: `#0F766E`
- `color.primary.800`: `#115E59`
- `color.primary.900`: `#134E4A`

Secondary:

- `color.secondary.50`: `#EFF6FF`
- `color.secondary.100`: `#DBEAFE`
- `color.secondary.200`: `#BFDBFE`
- `color.secondary.300`: `#93C5FD`
- `color.secondary.400`: `#60A5FA`
- `color.secondary.500`: `#3B82F6`
- `color.secondary.600`: `#2563EB`
- `color.secondary.700`: `#1D4ED8`
- `color.secondary.800`: `#1E40AF`
- `color.secondary.900`: `#1E3A8A`

Neutral:

- `color.neutral.50`: `#F8FAFC`
- `color.neutral.100`: `#F1F5F9`
- `color.neutral.200`: `#E2E8F0`
- `color.neutral.300`: `#CBD5E1`
- `color.neutral.400`: `#94A3B8`
- `color.neutral.500`: `#64748B`
- `color.neutral.600`: `#475569`
- `color.neutral.700`: `#334155`
- `color.neutral.800`: `#1E293B`
- `color.neutral.900`: `#0F172A`

Status:

- `color.success.text`: `#047857`
- `color.success.bg`: `#ECFDF5`
- `color.success.border`: `#A7F3D0`
- `color.warning.text`: `#B45309`
- `color.warning.bg`: `#FFFBEB`
- `color.warning.border`: `#FDE68A`
- `color.error.text`: `#BE123C`
- `color.error.bg`: `#FFF1F2`
- `color.error.border`: `#FDA4AF`
- `color.info.text`: `#0369A1`
- `color.info.bg`: `#F0F9FF`
- `color.info.border`: `#BAE6FD`

### Dark Theme Tokens

Background:

- `color.dark.background.base`: `#020617`
- `color.dark.background.surface`: `#0F172A`
- `color.dark.background.subtle`: `#111827`
- `color.dark.background.muted`: `#1E293B`
- `color.dark.background.inverse`: `#FFFFFF`

Text:

- `color.dark.text.primary`: `#F8FAFC`
- `color.dark.text.secondary`: `#CBD5E1`
- `color.dark.text.muted`: `#94A3B8`
- `color.dark.text.disabled`: `#64748B`
- `color.dark.text.inverse`: `#0F172A`

Border:

- `color.dark.border.subtle`: `#1E293B`
- `color.dark.border.default`: `#334155`
- `color.dark.border.strong`: `#475569`
- `color.dark.border.focus`: `#2DD4BF`

Dark status backgrounds should be muted overlays:

- Success background: `rgba(16, 185, 129, 0.12)`
- Warning background: `rgba(245, 158, 11, 0.14)`
- Error background: `rgba(244, 63, 94, 0.14)`
- Info background: `rgba(14, 165, 233, 0.14)`

### Interaction Colors

Hover:

- Primary hover: `color.primary.800`
- Secondary hover background: `color.neutral.100`
- Ghost hover background: `color.neutral.100`
- Dark hover background: `color.dark.background.muted`

Focus:

- Use a visible 2px focus ring.
- Focus ring color: `color.primary.600` in light mode.
- Focus ring color: `color.primary.400` in dark mode.
- Focus ring offset: 2px.

Active:

- Active primary: `color.primary.900`
- Active neutral: `color.neutral.200`
- Active dark neutral: `color.dark.background.muted`

Disabled:

- Disabled background: `color.neutral.100`
- Disabled text: `color.text.disabled`
- Disabled border: `color.border.subtle`
- Disabled opacity should not drop below 0.55.

### Chart Colors

Use charts with restrained contrast:

- Chart teal: `#0F766E`
- Chart blue: `#2563EB`
- Chart violet: `#7C3AED`
- Chart amber: `#D97706`
- Chart rose: `#E11D48`
- Chart slate: `#475569`
- Chart emerald: `#059669`
- Chart cyan: `#0891B2`

Do not use more than 6 chart colors in a single chart unless required.

### Status Colors

Application statuses:

- Applied: info
- Viewed: neutral
- Screening: info
- Shortlisted: success
- Assessment: warning
- Interview Scheduled: warning
- Interview Completed: info
- Offer Sent: success
- Offer Accepted: success
- Offer Declined: error
- Rejected: error
- Withdrawn: neutral
- Hired: success

Job statuses:

- Draft: neutral
- Review: warning
- Published: success
- Paused: warning
- Expired: neutral
- Closed: neutral
- Archived: neutral
- Rejected: error

Company statuses:

- Pending: warning
- Approved: success
- Rejected: error
- Suspended: error
- Verified: success

### Tags and Badges

Tags should be subtle:

- Background 50-level color.
- Border 100/200-level color.
- Text 700-level color.
- Border radius 999px for tags and pills.
- Badge text should never be smaller than 11px.

---

## 5. Typography

Jobs View uses Inter as the primary typeface.

Typography must be readable, compact enough for SaaS workflows, and responsive without using viewport-width font scaling.

### Font Family

Primary:

- `Inter`
- Fallback: `ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`

### Font Weights

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

Avoid excessive bold text. Use semibold for most headings and labels.

### Desktop Type Scale

Display:

- Size: 48px
- Line height: 56px
- Weight: 650/700
- Use only for true public hero or major landing page hero.

H1:

- Size: 36px
- Line height: 44px
- Weight: 650/700

H2:

- Size: 28px
- Line height: 36px
- Weight: 600

H3:

- Size: 22px
- Line height: 30px
- Weight: 600

H4:

- Size: 18px
- Line height: 26px
- Weight: 600

Body:

- Size: 15px or 16px
- Line height: 24px or 26px
- Weight: 400

Body small:

- Size: 14px
- Line height: 20px

Caption:

- Size: 12px
- Line height: 16px
- Weight: 400 or 500

Table text:

- Header: 12px, uppercase optional, medium, tracking 0.04em maximum.
- Cell: 14px, line height 20px.

Button:

- Size: 14px
- Line height: 20px
- Weight: 500 or 600

### Tablet Type Scale

H1:

- Size: 32px
- Line height: 40px

H2:

- Size: 24px
- Line height: 32px

H3:

- Size: 20px
- Line height: 28px

Body:

- Size: 15px
- Line height: 24px

### Mobile Type Scale

H1:

- Size: 28px
- Line height: 36px

H2:

- Size: 22px
- Line height: 30px

H3:

- Size: 18px
- Line height: 26px

Body:

- Size: 14px or 15px
- Line height: 22px or 24px

Caption:

- Size: 12px
- Line height: 16px

### Typography Rules

- Do not use negative letter spacing.
- Letter spacing should be 0 unless uppercase labels require slight tracking.
- Do not use viewport-based font sizing.
- Do not use oversized text inside cards, sidebars, compact panels, tables, or forms.
- Use text hierarchy to support scanning.
- Avoid long centered paragraphs in dashboards.
- Align operational copy left.
- Public hero copy may be centered only when layout supports it.

---

## 6. Spacing

Jobs View uses an 8px grid.

All spacing should align to 4px or 8px increments. Prefer 8px increments for layout and 4px increments for icon/text gaps.

### Base Scale

- 0: 0px
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 5: 20px
- 6: 24px
- 8: 32px
- 10: 40px
- 12: 48px
- 16: 64px
- 20: 80px
- 24: 96px

### Container Widths

Public site:

- Max width: 1200px to 1280px.
- Wide sections may use 1440px.
- Full-bleed hero backgrounds are allowed only for public landing pages with meaningful imagery.

Candidate app:

- Max width: 1440px.
- Dashboard content should use 4-column responsive cards where possible.

Employer app:

- Max width: 1680px.
- ATS and analytics pages may use wider layouts.

Admin app:

- Max width: 1720px.
- Tables and monitoring views may use full available width.

### Page Padding

Desktop:

- Horizontal: 32px.
- Vertical page content: 24px to 32px.

Tablet:

- Horizontal: 24px.
- Vertical: 20px to 24px.

Mobile:

- Horizontal: 16px.
- Vertical: 16px to 20px.

### Section Spacing

Public homepage:

- Hero to next section: 48px to 64px.
- Section vertical padding: 64px to 96px desktop, 40px to 56px mobile.

Dashboards:

- Section gaps: 20px to 24px.
- Card grid gaps: 16px to 20px.

Forms:

- Field gap: 16px.
- Label to input: 6px to 8px.
- Helper text: 6px below field.

Tables:

- Header cell padding: 12px 16px.
- Body cell padding: 14px 16px.

### Whitespace Rules

- Use whitespace to group related actions.
- Dense pages are allowed, but they must remain scannable.
- Avoid decorative empty space in operational tools.
- Do not create oversized hero areas for dashboards.
- Dashboard headers should be compact and action-oriented.

---

## 7. Border Radius

Jobs View should use restrained radius. Rounded corners should feel modern but not toy-like.

### Radius Tokens

- `radius.none`: 0px
- `radius.xs`: 4px
- `radius.sm`: 6px
- `radius.md`: 8px
- `radius.lg`: 12px
- `radius.xl`: 16px
- `radius.full`: 999px

### Component Radius

Cards:

- Standard: 8px.
- Dashboard KPI cards: 8px or 12px maximum.
- Do not exceed 12px unless a modal/sheet pattern requires a softer surface.

Buttons:

- Default: 8px.
- Icon buttons: 8px.
- Pills/tags: 999px.

Inputs:

- 8px.

Dialogs:

- 12px.

Drawers and sheets:

- 12px on exposed corners.

Avatars:

- User avatar circle: 999px.
- Company logo: 8px or 12px.

Tables:

- Table container: 8px.
- Rows: no individual radius unless card table on mobile.

Dropdowns:

- 8px.

Badges:

- 999px.

Charts:

- Chart container: 8px.
- Bar radius: 4px to 8px.

---

## 8. Shadow System

Shadows should be subtle and functional. They indicate elevation, sticky surfaces, dropdowns, modals, and hover states.

### Light Theme Shadows

Small:

- `0 1px 2px rgba(15, 23, 42, 0.06)`

Medium:

- `0 8px 24px rgba(15, 23, 42, 0.08)`

Large:

- `0 18px 45px rgba(15, 23, 42, 0.10)`

Dropdown:

- `0 12px 32px rgba(15, 23, 42, 0.14)`

Dialog:

- `0 24px 72px rgba(15, 23, 42, 0.22)`

Sticky header:

- `0 1px 0 rgba(15, 23, 42, 0.08)`

Sidebar:

- `8px 0 32px rgba(15, 23, 42, 0.06)`

Hover:

- `0 10px 28px rgba(15, 23, 42, 0.10)`

### Dark Theme Shadows

Use less visible shadows in dark mode. Prefer borders and contrast.

Dark shadow:

- `0 16px 40px rgba(0, 0, 0, 0.30)`

Dark dialog:

- `0 28px 80px rgba(0, 0, 0, 0.55)`

### Shadow Rules

- Do not apply heavy shadows to every card.
- Use hover shadows only on actionable cards.
- Use borders for static cards.
- Sticky headers need separation but not drama.
- Dropdowns and dialogs need clear elevation.

---

## 9. Animations

Use Framer Motion for motion.

Animations must be lightweight and must never delay usability.

Target 60 FPS.

### Duration

- Fast micro-interaction: 120ms to 160ms.
- Standard UI transition: 180ms to 220ms.
- Drawer/dialog: 200ms to 250ms.
- Page transition: 180ms to 240ms.

### Easing

Use restrained easing:

- `easeOut` for entry.
- `easeIn` for exit.
- `easeInOut` for toggles.
- Spring only for small, tactile interactions.

### Allowed Animation Properties

Animate:

- Opacity.
- Scale.
- Translate X/Y.
- Minimal rotation.
- Color transitions.
- Progress width.

Avoid animating:

- Height of large sections.
- Width of large layouts.
- Top/left layout positions.
- Expensive filters.
- Blur-heavy effects.

### Motion Rules

- Never animate layout excessively.
- Hover lift should be subtle: translateY -1px or -2px.
- Button hover should feel responsive, not bouncy.
- Cards should not jump or resize on hover.
- Sidebar transitions should be smooth and predictable.
- Drawers should slide from the correct edge.
- Dialogs should fade and scale from 0.98 to 1.
- Dropdowns should fade and translate 4px.
- Kanban cards may lift slightly during drag.
- Charts may animate on first render but not constantly.
- Loading skeletons should pulse gently.
- Notifications may slide in and fade.

### Reduced Motion

Respect `prefers-reduced-motion`.

When reduced motion is enabled:

- Disable page transitions.
- Disable hover lift.
- Keep opacity transitions minimal.
- Preserve instant state changes.

---

## 10. Icons

Use Lucide icons.

### Icon Sizes

- Inline text icon: 14px.
- Button icon: 16px.
- Toolbar icon: 18px.
- Navigation icon: 18px to 20px.
- Empty state icon: 32px to 48px.
- Dashboard hero icon: 24px to 32px.

### Stroke Width

- Default: 2px.
- Do not mix stroke widths in the same component group.

### Icon Rules

- Icons must clarify actions.
- Do not use icons as decoration without purpose.
- Prefer icons for common tool actions: save, search, filter, upload, download, edit, delete, copy, pause, archive, calendar, settings.
- Use icon + text for primary workflows.
- Use icon-only buttons for dense toolbars only.
- Every icon-only button must have an accessible label and tooltip.
- Keep icon/text gap at 6px to 8px.

---

## 11. Layout Rules

### Public Website

Public pages should prioritize discovery, trust, SEO, and clarity.

Public layouts may include:

- Sticky navbar.
- Search-first hero.
- SEO sections.
- Job/company/category cards.
- Career guide sections.
- CTAs.
- Footer with internal links.

Public pages should not feel like a dashboard. They can have more editorial rhythm but must remain product-specific and premium.

Hero sections must make Jobs View immediately identifiable. The first viewport should clearly signal the product and purpose.

### Candidate App

Candidate layouts should prioritize:

- Profile progress.
- Recommended jobs.
- Application status.
- Resume readiness.
- Saved jobs.
- Notifications.
- Career growth.

Use:

- App shell.
- Compact page header.
- Dashboard cards.
- Clear next actions.
- Mobile bottom nav where useful.

### Employer App

Employer layouts should prioritize:

- Company status.
- Active/draft jobs.
- Applications.
- Pipeline.
- Interviews.
- Team management.
- Hiring analytics.

Use:

- Sidebar navigation on desktop.
- Sticky top header.
- Wide dashboard.
- Tables and Kanban.
- Drawer for candidate details.
- Dialogs for job creation, interview scheduling, offers, and invites.

### Admin App

Admin layouts should prioritize:

- Platform health.
- Moderation queues.
- User/company/job management.
- Reports.
- CMS.
- SEO controls.
- Audit and monitoring.

Use:

- Premium sidebar.
- Sticky header.
- Dense but readable tables.
- Drawers for details.
- Dialogs for confirmation.
- Dashboard cards and charts.

### Authentication

Auth screens should be calm and trustworthy.

Use:

- Centered form layout.
- Clear title and subtitle.
- Simple fields.
- Password visibility toggle.
- Role-specific registration fields.
- Error and validation feedback.

Do not use loud hero illustrations or excessive marketing content.

### Responsive

Desktop:

- Sidebar + content for app surfaces.
- Top nav for public pages.

Tablet:

- Collapsible sidebar.
- Two-column grids.

Mobile:

- Top header + bottom navigation or drawer.
- Cards become single column.
- Tables become cards or horizontally scrollable.
- Important actions remain reachable.

---

## 12. Component Library

Every component should be reusable, accessible, responsive, and dark-mode compatible.

### Buttons

Variants:

- Primary
- Secondary
- Ghost
- Danger
- Link
- Icon

States:

- Default
- Hover
- Focus
- Active
- Loading
- Disabled

Rules:

- Primary action per surface should be obvious.
- Avoid more than one primary button in a local action group.
- Loading buttons must show spinner and preserve width.
- Danger buttons require clear labels.

### Inputs

Types:

- Text
- Email
- Password
- Search
- Number
- Select
- Textarea
- Date
- File

Rules:

- Labels are required.
- Placeholder is not a replacement for label.
- Helper text appears below input.
- Error text appears below helper.
- Focus ring must be visible.
- Disabled input must remain readable.

### Cards

Types:

- KPI card
- Job card
- Company card
- Candidate card
- Dashboard card
- Settings card
- Empty state card

Rules:

- Cards should have clear hierarchy.
- Do not nest cards.
- Repeated cards should align heights where possible.
- Actionable cards may use hover lift.
- Static cards should rely on border and light shadow.

### Tables

Features:

- Sticky headers.
- Hover rows.
- Row selection.
- Bulk actions.
- Filters.
- Sorting.
- Pagination.
- Column visibility.
- Responsive behavior.

Rules:

- Header text should be compact.
- Row actions should be right aligned.
- Use checkboxes for selection.
- Use badges for status.
- Use avatars/logos for people/companies.
- On mobile, convert to cards or allow horizontal scroll.

### Filters

Use:

- Search input.
- Dropdowns.
- Multi-select.
- Date range.
- Status chips.
- Clear filters.

Rules:

- Filters should be visibly connected to tables/lists.
- Preserve filter state where possible.
- Avoid hiding essential filters too deeply.

### Search

Public search:

- Large, prominent, keyword-first.
- Location and experience filters.

App search:

- Compact command/search input.
- Keyboard friendly.
- Clear empty state.

### Navbar

Public navbar:

- Logo.
- Primary links.
- Search.
- Auth actions.
- Theme toggle.
- Mobile menu.

App navbar/header:

- Page title.
- Breadcrumb or workspace context.
- Search/command.
- Notifications.
- Profile menu.

### Sidebar

Desktop:

- Fixed or sticky.
- Clear active state.
- Workspace switcher.
- Grouped navigation.

Mobile:

- Drawer.
- Close button.
- Same navigation hierarchy.

### Footer

Use for public pages only.

Include:

- SEO links.
- Popular cities.
- Skills.
- Companies.
- Career resources.
- Legal links.
- Support links.

### Hero

Public hero:

- Product name or clear category.
- Search/action.
- Trust stats.
- Relevant visual asset.

Dashboard hero:

- Compact greeting.
- Summary.
- Quick actions.
- No oversized marketing composition.

### Job Card

Include:

- Title.
- Company.
- Location.
- Job type.
- Salary if available.
- Skills.
- Posted date.
- Save/share/apply actions.
- Status or match indicator where relevant.

### Company Card

Include:

- Logo.
- Company name.
- Verification badge.
- Industry.
- Location.
- Open jobs.
- Rating or trust signal.

### Salary Card

Include:

- Role.
- Range.
- Median.
- City.
- Skill premium.
- Trend.

### Candidate Card

Include:

- Avatar.
- Name.
- Current title.
- Skills.
- Experience.
- Rating/tags if recruiter view.
- Application status if pipeline view.

### Dashboard Card

Include:

- Label.
- Value.
- Delta/trend.
- Small contextual icon.
- Optional sparkline.
- Click-through action.

### Charts

Types:

- Line
- Area
- Bar
- Donut
- Funnel
- Progress

Rules:

- Use accessible color contrast.
- Show tooltips.
- Label axes where needed.
- Avoid 3D charts.
- Avoid excessive animation.

### Dialogs

Use for:

- Confirmation.
- Create/edit forms.
- Short workflows.

Rules:

- Focus trap.
- Esc closes unless destructive confirmation requires explicit choice.
- Clear title.
- Clear primary/secondary actions.

### Drawer

Use for:

- Candidate profile.
- Company details.
- Job preview.
- Filters.

Rules:

- Slide from right on desktop.
- Full width on mobile.
- Sticky footer actions if form is long.

### Timeline

Use for:

- Application history.
- Audit logs.
- Recruiter activity.
- Company verification.

Rules:

- Reverse chronological for audit.
- Chronological for workflow journeys when helpful.
- Include actor, event, timestamp, and status.

### Progress

Use for:

- Profile completion.
- Resume upload.
- Application progress.
- Subscription usage.

Rules:

- Always include readable text.
- Do not rely on color alone.

### Avatar

Use:

- Candidate photo.
- User initials.
- Company logo square.

Rules:

- Provide fallback initials.
- Preserve aspect ratio.

### Badge

Use for:

- Status.
- Role.
- Verification.
- Skill.
- Tag.

Rules:

- Use semantic colors.
- Keep text short.

### Tabs

Use for:

- Related views within same page.
- Filters with small option sets.

Rules:

- Active state must be obvious.
- Keyboard navigable.

### Pagination

Use for:

- Tables.
- Search results.
- Admin lists.

Rules:

- Show current page.
- Include next/previous.
- On mobile, keep controls compact.

### Empty State

Include:

- Clear title.
- Helpful description.
- Next action if available.

Rules:

- Do not blame user.
- Do not over-illustrate.

### Loading

Use:

- Skeletons for cards/tables.
- Spinners only for small actions.
- Progress bars for uploads.

### Toast

Use for:

- Success.
- Error.
- Undo.
- Background updates.

Rules:

- Do not overload with too many toasts.
- Keep message short.

### Upload

Use for:

- Avatar.
- Resume.
- Logo.
- Banner.
- Gallery.
- Documents.

Rules:

- Show accepted types.
- Show max size.
- Show progress.
- Show preview when possible.
- Show validation errors.

### Calendar

Use for:

- Interviews.
- Scheduling.
- Reports.

Rules:

- Clear today state.
- Clear selected state.
- Keyboard navigable.

### Command Menu

Use for:

- Admin navigation.
- Employer search.
- Quick actions.

Rules:

- Keyboard first.
- Search input auto-focused.
- Group results.

### Breadcrumb

Use for:

- Public SEO pages.
- Deep admin/employer views.
- Job detail.
- Company pages.

### Tooltip

Use for:

- Icon-only buttons.
- Dense controls.
- Abbreviations.

Rules:

- Short text.
- Accessible trigger.

---

## 13. Page Standards

Every page should answer: What should I do next?

Every dashboard should include:

- Greeting or context.
- Summary.
- Quick actions.
- Insights.
- Recent activity.

### Homepage

Structure:

- Sticky navbar.
- Search-first hero.
- Trust stats.
- Trending jobs/skills/companies.
- Recommended jobs.
- Top companies.
- Categories.
- Career services.
- Career guides.
- Testimonials.
- CTA.
- SEO footer.

Behavior:

- Search must be prominent.
- Mobile search must remain usable.
- First viewport must identify Jobs View.

### Job Search

Structure:

- Search bar.
- Filters.
- Results list.
- Sort.
- Pagination/infinite loading.
- Empty state.

Behavior:

- Filters should update results clearly.
- Saved jobs should be visible.

### Job Detail

Structure:

- Job title.
- Company summary.
- Apply/save/share.
- Salary/location/type.
- Description.
- Responsibilities.
- Requirements.
- Skills.
- Benefits.
- Similar jobs.
- Structured data.

### Company Page

Structure:

- Logo/banner.
- Company name.
- Verification badge.
- About.
- Mission/vision/culture.
- Locations.
- Benefits.
- Open jobs.
- Gallery.
- SEO content.

### Candidate Dashboard

Structure:

- Greeting.
- Profile strength.
- Recommended jobs.
- Application status.
- Resume status.
- Saved jobs.
- Interviews.
- Notifications.

### Employer Dashboard

Structure:

- Company status.
- Active/draft/published/closed jobs.
- Applications.
- Interviews.
- Offers.
- Hires.
- Team.
- Analytics.
- Quick actions.

### Admin Dashboard

Structure:

- Platform KPIs.
- System health.
- Moderation queues.
- Growth charts.
- Quick actions.
- Audit highlights.

### Career Intelligence

Structure:

- Career health.
- Resume insights.
- Salary insights.
- Skill intelligence.
- Roadmaps.
- Learning.
- Recommendations.

### Settings

Structure:

- Account/profile settings.
- Security.
- Notifications.
- Privacy.
- Preferences.
- Danger zone.

### Billing

Structure:

- Current plan.
- Usage.
- Invoices.
- Payments.
- Upgrade actions.

### CMS

Structure:

- Content list.
- Status.
- Owner.
- Updated date.
- Preview/publish actions.

### Reports

Structure:

- Report types.
- Filters.
- Export actions.
- Schedule state.

### Support

Structure:

- Tickets.
- Priority.
- Status.
- Owner.
- Reply/assign actions.

---

## 14. Dashboard Design

Dashboards must feel like modern SaaS command centers.

### Dashboard Requirements

- Compact page header.
- Greeting or workspace context.
- KPI cards.
- Charts.
- Recent activity.
- Quick actions.
- Alerts or notifications.
- Empty states.
- Loading skeletons.

### KPI Cards

KPI cards should show:

- Icon.
- Label.
- Value.
- Delta.
- Detail text.
- Optional sparkline.

KPI cards should not be overly tall.

### Charts

Charts should:

- Use clear labels.
- Use tooltips.
- Avoid too many colors.
- Maintain minimum height.
- Be responsive.

### Quick Actions

Quick actions should be:

- Near the top.
- Limited to the most important workflows.
- Role-specific.

### No Clutter Rule

If a dashboard has too much information:

- Group related widgets.
- Use tabs.
- Use drawers.
- Move detail into drill-down pages.

---

## 15. Tables

Tables are core to employer and admin workflows.

### Table Requirements

- Sticky header.
- Hover rows.
- Selected rows.
- Bulk action bar.
- Filters.
- Sortable columns.
- Pagination.
- Column visibility.
- Responsive behavior.

### Table States

- Loading skeleton.
- Empty state.
- Error state.
- Filtered empty state.
- Partial data state.

### Mobile Tables

On mobile:

- Convert rows to cards when possible.
- Or use horizontal scroll for dense operational tables.
- Keep row actions accessible.

---

## 16. Forms

Forms must be clear, forgiving, and production-grade.

### Form Requirements

- Visible labels.
- Helper text.
- Validation messages.
- Loading state.
- Success state.
- Error state.
- Password visibility toggle.
- Upload progress.

### Field Sizes

- Input height: 40px to 44px.
- Large search: 48px to 56px.
- Textarea minimum height: 120px.

### Validation

- Show validation near the field.
- Do not show errors before user interaction unless submit failed.
- Use plain language.

### Upload Forms

Show:

- Accepted file types.
- Max file size.
- Progress.
- Preview.
- Remove/replace action.

---

## 17. Accessibility

Jobs View must meet WCAG AA.

### Requirements

- Keyboard navigation.
- Visible focus states.
- Correct ARIA attributes.
- Semantic HTML.
- Sufficient color contrast.
- Reduced motion support.
- Screen reader support.
- Labels for all inputs.
- Accessible names for icon buttons.
- Proper heading order.

### Keyboard

Users must be able to:

- Navigate menus.
- Operate dialogs.
- Submit forms.
- Use tabs.
- Use tables and checkboxes.
- Close drawers/dialogs.

### Contrast

- Body text contrast must pass AA.
- Status badges must pass AA where possible.
- Do not rely on color alone.

---

## 18. Performance

Performance is part of design.

### Requirements

- Lazy loading.
- Code splitting.
- Image optimization.
- Font optimization.
- Motion optimization.
- Virtual scrolling for large tables/lists.
- Skeleton loading.
- Memoization for expensive derived UI.

### Rules

- Avoid large images above the fold unless essential.
- Use responsive images.
- Avoid unnecessary client components.
- Keep charts lazy where possible.
- Avoid excessive animation.
- Avoid layout shifts.

---

## 19. Responsive Standards

Design for these widths:

- 320px
- 375px
- 425px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px
- Ultra-wide

### Mobile

- Single-column layout.
- Sticky header.
- Bottom navigation when useful.
- Drawer navigation.
- Large touch targets.
- Avoid tiny table controls.

### Tablet

- Two-column layouts.
- Collapsible sidebar.
- Cards may use 2-column grids.

### Desktop

- Sidebar + content for apps.
- Wide dashboards.
- Dense tables.

### Ultra-wide

- Do not stretch content endlessly.
- Use max-width containers.
- For admin/employer tables, allow wider data surfaces.

---

## 20. Design Principles

Every page should answer:

What should I do next?

Every dashboard should have:

- Greeting.
- Summary.
- Quick actions.
- Insights.
- Recent activity.

Everything should feel alive.

Alive does not mean noisy. It means:

- Data updates are visible.
- Loading states are polished.
- Empty states are helpful.
- Interactions respond quickly.
- Motion supports understanding.

### Clarity

Users should know:

- Where they are.
- What changed.
- What requires attention.
- What the next action is.

### Trust

Design should support:

- Verification badges.
- Audit trails.
- System health.
- Clear permissions.
- Secure settings.
- Transparent status.

### Focus

Each screen should have one dominant purpose.

---

## 21. Motion Principles

No animation should delay usability.

Use micro-interactions only.

Animate:

- Hover.
- Focus.
- Selection.
- Loading.
- Success.
- Notifications.
- Cards.
- Sidebar.
- Dialogs.

Never over animate.

### Motion Examples

Button hover:

- Background transition 150ms.
- Optional icon translate 1px.

Card hover:

- Translate Y -2px.
- Shadow slightly stronger.

Dialog:

- Opacity 0 to 1.
- Scale 0.98 to 1.

Drawer:

- Translate X 100% to 0.

Toast:

- Translate Y 8px to 0.
- Fade in.

Skeleton:

- Subtle pulse.

---

## 22. Quality Checklist

Every page must pass:

- Premium.
- Responsive.
- Accessible.
- Fast.
- SEO ready.
- Dark mode.
- Mobile first.
- Reusable.
- Consistent.
- Screenshot worthy.

### Stitch Review Checklist

Before approval, verify:

- The page preserves existing functionality.
- No route/API/RBAC behavior is changed.
- Layout follows Jobs View spacing rules.
- Typography matches scale.
- Color tokens are semantic.
- Components are reusable.
- Loading, error, and empty states exist.
- Mobile layout is intentionally designed.
- Dark mode is complete.
- Focus states are visible.
- Icon-only buttons have labels/tooltips.
- Tables support operational workflows.
- Forms have validation and helper text.
- Motion is subtle and respects reduced motion.
- SEO pages include metadata and JSON-LD.
- Dashboards show summary, actions, insights, and activity.
- The screen clearly answers what the user should do next.

---

## 23. Google Stitch AI Execution Rules

This section is written directly for Google Stitch AI. Follow these rules when generating or redesigning Jobs View screens.

### Primary Instruction

Redesign the UI and UX only. Preserve all existing product behavior.

Do not remove existing routes. Do not rename existing modules. Do not change API assumptions. Do not change RBAC behavior. Do not introduce new business logic. Do not invent features that are not already represented in Jobs View. If a feature already exists as a page, route, action, button, table, dashboard, or workflow, preserve it and improve its interface quality.

### Stitch Output Expectations

When generating a screen, Stitch should produce:

- A premium SaaS layout.
- Clear hierarchy.
- Responsive design across mobile, tablet, desktop, and ultra-wide.
- Light and dark theme compatibility.
- Reusable component patterns.
- Accessible controls.
- Realistic loading, empty, error, and success states.
- Clear action placement.
- No decorative filler.
- No generic admin-template feel.

### Do Not

- Do not create a new product concept.
- Do not create a landing page when the route is an app/dashboard/tool route.
- Do not replace functional surfaces with marketing copy.
- Do not hide important actions in decorative layouts.
- Do not create fake features.
- Do not remove secondary actions.
- Do not make dashboards feel like portfolio pages.
- Do not use excessive gradients.
- Do not use glassmorphism.
- Do not use neumorphism.
- Do not use neon colors.
- Do not use gaming-style cards.
- Do not use decorative orbs or abstract blobs.
- Do not create cards inside cards.
- Do not use one-note color palettes.
- Do not over-round cards and buttons.
- Do not animate large layouts unnecessarily.

### Always

- Always preserve the existing screen purpose.
- Always preserve core actions.
- Always show clear primary and secondary actions.
- Always include responsive states.
- Always include empty states.
- Always include loading states for data-heavy pages.
- Always include error states for backend-connected pages.
- Always include accessible labels for icon-only controls.
- Always use semantic status colors.
- Always use Lucide icons.
- Always keep dashboards compact and actionable.
- Always use consistent spacing.
- Always maintain visual continuity across candidate, employer, admin, and public surfaces.

### Stitch Interpretation of Existing Screens

If the current screen appears visually unfinished but functionally rich, keep the function and redesign the surface. For example:

- A plain table should become a premium table with filters, sticky header, row actions, status badges, pagination, and loading/empty/error states.
- A static card grid should become a responsive, data-driven dashboard grid.
- A rough form should become a polished form with labels, helper text, validation, loading state, and confirmation.
- A basic sidebar should become a premium navigation system with active states, workspace context, collapse behavior, and mobile drawer.
- A placeholder visual should become a refined empty or upcoming state without pretending functionality exists.

### Stitch Review Output

When presenting a redesign, Stitch should be able to explain:

- What user role the screen serves.
- What the user is expected to do next.
- Which existing actions were preserved.
- How the layout responds on mobile.
- How loading/empty/error states appear.
- How accessibility is handled.
- How dark mode behaves.
- Which components are reused.

---

## 24. Role-Specific Design Standards

Jobs View has multiple user roles. Each role shares the Jobs View design language, but each role needs a distinct information architecture emphasis.

### Candidate Experience

Candidate screens should feel encouraging, focused, and personal without becoming casual or playful.

Candidate UI priorities:

- Help the candidate understand profile readiness.
- Help the candidate find relevant jobs quickly.
- Help the candidate track application status.
- Help the candidate improve resume and career strength.
- Help the candidate act on notifications and interviews.

Candidate dashboard should include:

- Greeting with candidate name.
- Profile strength.
- Resume status.
- Recommended jobs.
- Applications pipeline.
- Saved jobs.
- Interviews.
- Notifications.
- Career growth prompt.

Candidate profile should include:

- Personal details.
- Education.
- Experience.
- Skills.
- Languages.
- Projects.
- Certifications.
- Social links.
- Portfolio.
- Avatar and resume upload.

Candidate visual tone:

- Calm.
- Helpful.
- Career-progress oriented.
- Less dense than employer/admin.
- Clear progress indicators.

Candidate mobile priority:

- Dashboard summary.
- Recommended jobs.
- Applications.
- Resume/profile actions.

### Employer Experience

Employer screens should feel operational, business-focused, and efficient.

Employer UI priorities:

- Company verification state.
- Job creation and management.
- Application flow.
- Recruiter/team collaboration.
- Hiring analytics.
- Interviews and offers.

Employer dashboard should include:

- Company workspace context.
- Company approval/verification status.
- Active jobs.
- Draft jobs.
- Published jobs.
- Applications today.
- Total applications.
- Interviews.
- Offers.
- Hires.
- Team members.
- Quick actions.

Employer visual tone:

- Enterprise.
- Clear.
- Data-rich.
- Hiring operations oriented.
- Slightly denser than candidate.

Employer mobile priority:

- Job status.
- Pipeline.
- Candidate quick review.
- Interview schedule.
- Notifications.

### Recruiter Experience

Recruiter screens should prioritize speed, search, and repeated action.

Recruiter UI priorities:

- Candidate pipeline.
- Fast candidate review.
- Resume and profile scanning.
- Notes, tags, ratings.
- Interview scheduling.
- Status updates.
- Bulk actions.

Recruiter pipeline must support:

- Kanban columns.
- Status chips.
- Candidate cards.
- Drag-ready interactions.
- Bulk status update.
- Candidate detail drawer.
- Quick reject/shortlist/interview actions.

Recruiter candidate profile should support:

- Resume preview/download.
- Skills.
- Experience.
- Education.
- Portfolio.
- ATS score.
- Notes.
- Tags.
- Ratings.
- Timeline.
- Interview history.

### Hiring Manager Experience

Hiring manager screens should be decision-focused.

UI priorities:

- Candidate summary.
- Fit signals.
- Interview feedback.
- Role requirements.
- Decision actions.

Avoid overwhelming hiring managers with recruiter-specific operational controls unless they are required by permissions.

### HR Experience

HR screens should focus on coordination, compliance, and communication.

UI priorities:

- Interviews.
- Offer status.
- Candidate communication.
- Company settings.
- Documents.
- Team permissions.

### Finance Experience

Finance screens should be precise and auditable.

UI priorities:

- Current plan.
- Usage.
- Invoices.
- Payments.
- Billing history.
- Export.
- GST/tax information.

Finance design should use Stripe-like clarity: simple tables, clear amounts, clear dates, clear status, minimal decoration.

### Super Admin Experience

Super Admin screens should feel like a control center.

Admin UI priorities:

- Platform KPIs.
- Users.
- Companies.
- Job moderation.
- Applications.
- Billing.
- CMS.
- SEO.
- Reports.
- Support.
- Audit logs.
- Monitoring.
- Settings.

Admin visual tone:

- Dense but not cluttered.
- High trust.
- Strong table design.
- Clear destructive-action handling.
- Strong auditability.

Admin mobile priority:

- Monitoring.
- Queues.
- User/company/job lookup.
- Critical actions.

---

## 25. Public Website Design Standards

The public website must be premium, SEO-ready, and conversion-focused, but it should not become a generic marketing site.

### Public Homepage

The homepage should communicate:

- Jobs View is a career operating system.
- Candidates can search jobs and grow careers.
- Employers can hire and manage recruitment.
- Companies are verified.
- Career intelligence and guides are available.

Homepage first viewport:

- Clear Jobs View branding.
- Search input or job discovery action.
- Candidate and employer paths.
- Trust statistics.
- A strong visual signal related to jobs/careers/hiring.

Do not create a split generic hero where one side is a card and the other side is generic copy. The hero must feel integrated and product-specific.

### Job Search Public Page

Job search must prioritize utility:

- Search input.
- Location.
- Experience.
- Salary.
- Remote/hybrid/on-site.
- Category.
- Company.
- Sorting.
- Pagination or infinite scroll.

Job cards must be highly scannable.

### Job Detail Public Page

Job detail must be SEO and Google Jobs ready.

Required visual areas:

- Job title.
- Company card.
- Location and work mode.
- Salary if available.
- Job type.
- Apply/save/share actions.
- Responsibilities.
- Requirements.
- Qualifications.
- Skills.
- Benefits.
- About company.
- Similar jobs.
- Breadcrumbs.

Sticky apply action is allowed on mobile.

### Company Public Page

Company pages must feel trustworthy.

Required visual areas:

- Logo.
- Banner.
- Verification badge.
- Company status.
- About.
- Mission.
- Vision.
- Culture.
- Locations.
- Benefits.
- Open jobs.
- Gallery.
- Social links.

### Career Content Pages

Career, skill, salary, and interview pages should be structured for humans and AI systems.

Required:

- Semantic H1.
- Summary paragraph.
- Table of contents if long.
- FAQ section.
- Related links.
- Structured data.
- Clear canonical URL.

---

## 26. Enterprise SaaS Surface Rules

Jobs View dashboards and portals must feel like real tools used daily.

### App Shell

The app shell should include:

- Sidebar or mobile drawer.
- Sticky top header.
- Workspace context.
- Page title.
- Search or command input.
- Notifications.
- Profile menu.
- Content container.

### Sidebar

Sidebar sections should be clear but not over-divided.

Sidebar should support:

- Active page state.
- Hover state.
- Collapsed state if needed.
- Workspace switcher.
- Role-appropriate nav.
- Mobile drawer.

Sidebar should not:

- Use loud colors.
- Use giant icons.
- Use decorative backgrounds.

### Header

Header should support:

- Page title.
- Breadcrumb/context.
- Search.
- Actions.
- Notifications.

Sticky header should use border and slight shadow.

### Workspace Switcher

Employer and admin surfaces may use workspace switchers.

Switcher should show:

- Company/platform name.
- Status or environment.
- Small logo/avatar.
- Dropdown affordance.

### Notifications

Notification entry point should show:

- Bell icon.
- Unread indicator.
- Dropdown or link to notifications page.

---

## 27. State Design

Every component and page must include state design.

### Loading State

Use skeletons for:

- Cards.
- Tables.
- Lists.
- Profile panels.
- Job cards.

Use spinners only for:

- Button actions.
- Small inline operations.

Loading state rules:

- Preserve layout dimensions.
- Prevent layout shift.
- Avoid full-page spinners unless app shell is loading.

### Empty State

Empty states must be useful.

Include:

- Title.
- Description.
- Suggested action where possible.

Examples:

- No applications: suggest exploring recommended jobs.
- No saved jobs: suggest saving jobs from search.
- No company branches: suggest adding first branch.
- No CMS entries: suggest creating content.
- No reports: suggest generating first report.

### Error State

Error states must be calm and actionable.

Include:

- What failed.
- Retry action.
- Secondary navigation or support action if useful.

Avoid:

- Raw technical errors in user-facing UI.
- Panic language.

### Success State

Success should be clear but not overdone.

Use:

- Toast.
- Inline confirmation.
- Updated status badge.
- Timeline event.

### Offline State

Show:

- Offline banner.
- Disabled network actions.
- Retry when connection returns.

---

## 28. Data Density Rules

Different surfaces require different density.

### Public Pages

Density:

- Medium.
- More whitespace.
- SEO content blocks.
- Larger search and CTA elements.

### Candidate Pages

Density:

- Medium.
- Clear cards.
- Progress and recommendations.

### Employer Pages

Density:

- Medium-high.
- Tables and boards.
- Bulk actions.
- Operational quick controls.

### Admin Pages

Density:

- High but structured.
- Tables, filters, status, monitoring.
- Avoid excessive vertical whitespace.

### Density Controls

Where relevant, allow:

- Compact table rows.
- Column visibility.
- Filter drawers.
- Saved views.

Do not make everything spacious if users need to compare many records.

---

## 29. Copywriting and Microcopy

Jobs View copy should be direct, useful, and professional.

### Voice

- Clear.
- Human.
- Confident.
- Concise.
- Helpful.

### Avoid

- Hype.
- Jargon without context.
- Cute language.
- Overly casual phrases.
- Fear-based error messages.

### Button Labels

Use verbs:

- Create job.
- Publish.
- Pause.
- Archive.
- Apply.
- Save.
- Withdraw.
- Schedule.
- Invite.
- Approve.
- Reject.
- Export.

Avoid vague labels:

- Click here.
- Submit when more specific action exists.
- Manage when a more specific label exists.

### Empty State Copy

Example:

No applications yet.
Jobs you apply to will appear here with status updates and recruiter activity.

### Error Copy

Example:

We could not load applications.
Check your connection and try again.

### Validation Copy

Example:

Enter a valid email address.

Not:

Invalid input.

---

## 30. Dark Mode Standards

Dark mode is not simply inverted light mode.

### Dark Mode Rules

- Use deep slate backgrounds.
- Use borders for separation.
- Reduce shadow reliance.
- Avoid pure black except where intentional.
- Keep status badges readable.
- Keep charts accessible.
- Avoid saturated colors on dark surfaces.

### Dark Mode Surfaces

Base:

- `#020617`

Surface:

- `#0F172A`

Elevated:

- `#111827`

Border:

- `#1E293B`

Text:

- Primary: `#F8FAFC`
- Secondary: `#CBD5E1`
- Muted: `#94A3B8`

### Dark Mode Components

Cards:

- Surface background.
- Subtle border.
- Minimal shadow.

Inputs:

- Dark surface.
- Border visible.
- Focus ring teal.

Tables:

- Header slightly darker or lighter than body.
- Hover row uses subtle slate.

Charts:

- Grid lines low contrast.
- Tooltips use elevated dark surface.

---

## 31. Mobile Interaction Standards

Mobile Jobs View must feel intentionally designed, not squeezed down.

### Touch Targets

Minimum touch target:

- 44px height/width.

### Mobile Navigation

Use:

- Sticky top header.
- Bottom navigation for candidate primary routes where useful.
- Drawer for full navigation.

### Mobile Tables

Options:

- Convert rows to cards.
- Use horizontal scroll only if comparison requires columns.

### Mobile Forms

Rules:

- Single column.
- Labels visible.
- Full-width buttons.
- Sticky submit footer for long forms if useful.

### Mobile Dashboards

Rules:

- Prioritize summary first.
- Put quick actions near top.
- Use single-column cards.
- Avoid huge charts above critical actions.

---

## 32. Admin and Moderation Safety Patterns

Admin actions can affect the whole platform, so design must prevent mistakes.

### Destructive Actions

Destructive actions include:

- Delete user.
- Suspend user.
- Suspend company.
- Reject company.
- Delete job.
- Archive job.
- Delete CMS entry.
- Maintenance mode.

Rules:

- Use danger color.
- Require confirmation dialog.
- Explain consequence.
- Use specific labels.
- Show target name in confirmation.

Example:

Suspend TechNova Careers
Recruiters from this company will lose access until reactivated.

### Auditability

Admin screens should show:

- Actor.
- Action.
- Target.
- Timestamp.
- Status.
- IP or device where relevant.

### Moderation Queues

Moderation queues should include:

- Clear status.
- Submitted date.
- Risk indicators.
- Review action.
- Approve/reject controls.
- Detail drawer.

---

## 33. Employer ATS Patterns

The employer ATS is a daily-use workspace. It must be fast and scannable.

### Pipeline

Pipeline columns:

- Applied.
- Screening.
- Shortlisted.
- Assessment.
- Interview.
- Offer.
- Hired.
- Rejected.

Candidate cards should show:

- Candidate name.
- Role/job.
- Current stage.
- Rating.
- Tags.
- Last activity.
- Quick action.

### Candidate Detail Drawer

Drawer should include:

- Header summary.
- Resume preview/download.
- Skills.
- Experience.
- Education.
- Notes.
- Tags.
- Timeline.
- Interviews.
- Offers.
- Actions.

### Interview Center

Interview UI should show:

- Calendar.
- Upcoming interviews.
- Past interviews.
- Interviewers.
- Mode.
- Meeting link.
- Feedback status.

### Offer Management

Offer UI should show:

- Candidate.
- Position.
- Salary.
- Joining date.
- Letter status.
- Offer state.

---

## 34. Candidate Career Intelligence Patterns

Career intelligence should feel credible and calm.

It must not feel like gimmicky AI.

### Career Health

Show:

- Score.
- Breakdown.
- Recommendations.
- Missing fields.
- Progress.

### Resume Insights

Show:

- Resume status.
- ATS score.
- Keywords.
- Missing sections.
- Formatting issues.
- Version history.

### Salary Insights

Show:

- Current salary if available.
- Market range.
- City comparison.
- Skill premium.
- Experience growth.
- Chart.

### Skill Intelligence

Show:

- Trending skills.
- Skill gap.
- Demand graph.
- Roadmap.
- Certifications.

### AI-Ready Placeholder Rule

If AI is not implemented, label states honestly:

- AI analysis will appear here when enabled.
- Recommendations are based on your current profile data.

Do not fake AI output.

---

## 35. SEO and Structured Content Design

SEO pages must be designed for humans first and structured for search engines second.

### Public SEO Page Structure

Every SEO page should include:

- H1.
- Clear summary.
- Related entities.
- FAQ block.
- Internal links.
- Breadcrumb.
- JSON-LD.

### JobPosting Page

Job detail pages must visually support Google Jobs schema:

- Title.
- Description.
- Hiring organization.
- Job location.
- Employment type.
- Date posted.
- Valid through.
- Salary if available.

### Organization Page

Company pages must support Organization schema:

- Company name.
- Logo.
- URL.
- Address/location.
- SameAs links.
- Open jobs.

### FAQ Blocks

FAQ should:

- Use real questions.
- Use concise answers.
- Be visible on page.
- Match FAQ schema.

### Internal Linking

Public pages should link to:

- Related jobs.
- Related companies.
- Related skills.
- Related career guides.
- Related salary pages.
- Related interview guides.

---

## 36. Implementation Guardrails

Design should map cleanly to the current frontend architecture.

### Component Reuse

Prefer existing component primitives:

- Button.
- Card.
- Badge.
- Avatar.
- Table.
- Dialog.
- Drawer.
- Tabs.
- Pagination.
- Skeleton.
- EmptyState.
- LoadingState.

If a new component is needed, it must be general enough to reuse across modules.

### Tailwind Rules

- Use semantic token classes where available.
- Avoid one-off arbitrary colors.
- Avoid arbitrary spacing unless necessary.
- Keep class lists readable.

### Client vs Server Components

- Public SEO pages should be server-rendered where possible.
- Interactive dashboards can use client components.
- Avoid unnecessary client components on static content pages.

### Data States

Backend-connected pages must include:

- Loading.
- Error.
- Empty.
- Success.
- Refetch/retry.

### Route Preservation

Existing routes should remain stable.

If a design introduces a new visual navigation path, it must still point to existing routes.

---

## 37. Final Stitch Prompt Template

When asking Stitch to redesign a Jobs View screen, use this pattern:

Redesign the Jobs View `[screen name]` screen using `docs/design.md` as the only design source of truth.

Preserve:

- Existing routes.
- Existing API behavior.
- Existing RBAC behavior.
- Existing business logic.
- Existing workflow.
- Existing data model.

Improve only:

- Layout.
- Visual hierarchy.
- Component quality.
- Responsiveness.
- Accessibility.
- Loading/empty/error states.
- Dark mode.
- Motion.
- SEO structure where public.

The result must feel like premium enterprise SaaS inspired by LinkedIn Recruiter, Ashby, Linear, Stripe, Vercel, Notion, and Apple, without copying any of them.

The screen must answer: What should the user do next?

---

### Final Rule

Jobs View should feel like a serious, premium SaaS platform that helps people operate their careers and hiring workflows with confidence.

If a design looks decorative but does not improve clarity, remove the decoration.

If a design looks impressive but slows down work, simplify it.

If a design changes functionality, reject it.

If a design preserves functionality and makes the platform clearer, faster, more trustworthy, and more beautiful, approve it.
