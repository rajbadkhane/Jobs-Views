# Google Stitch Master Prompt for Jobs View

Redesign the complete Jobs View platform using `docs/design.md` as the single source of truth for the design language.

Jobs View is not a job portal. Jobs View is a Career Operating System for candidates, employers, recruiters, hiring managers, HR, finance teams, and super admins.

## Non-Negotiable Constraints

Do not redesign business logic.

Do not redesign navigation architecture.

Do not redesign API flow.

Do not change routes.

Do not change RBAC.

Do not remove, rename, or invent workflows.

Do not remove existing features.

Do not change candidate, employer, or admin portal responsibilities.

Only redesign UI and UX.

Preserve every existing feature, workflow, page, route, permission model, role flow, authentication flow, data dependency, and backend assumption.

## Design Goal

Transform Jobs View into a premium, modern, enterprise SaaS platform.

The platform should feel like the next generation of LinkedIn + Ashby + Stripe while remaining intuitive for users familiar with Naukri and Indeed.

The design must be:

- Modern
- Minimal
- Premium
- Enterprise-grade
- Fast
- Professional
- Trustworthy
- Clear
- Responsive
- Accessible
- Component-driven

Focus on clarity, hierarchy, whitespace, typography, responsiveness, and lightweight motion rather than decorative effects.

## Inspiration

Use these products only as inspiration. Do not copy them.

- Ashby
- Greenhouse
- Lever
- Stripe Dashboard
- Linear
- Vercel
- LinkedIn Recruiter
- Indeed
- Naukri
- Notion
- Apple

## Technology Assumptions

Design for implementation with:

- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide Icons
- Recharts

Everything must remain reusable, scalable, and component-driven.

## Required Output Scope

Generate a complete UI/UX redesign system covering:

- Complete design system
- Component library
- Page layouts
- Dashboard layouts
- Landing pages
- Candidate portal
- Employer portal
- Admin portal
- Career Intelligence
- Candidate dashboard
- Employer dashboard
- Admin dashboard
- Job cards
- Company cards
- Candidate cards
- ATS pipeline
- Tables
- Forms
- Charts
- Search
- Filters
- Sidebar
- Navigation
- Notification center
- Dialogs
- Drawers
- Command palette
- Loading states
- Empty states
- Error states
- Hover states
- Micro interactions
- Animation guidelines
- Illustrations
- Mobile design
- Tablet design
- Desktop design
- Light mode
- Dark mode
- Accessibility

## Platform Areas to Redesign

### Public Website

Redesign public surfaces while preserving existing public routes and SEO intent.

Include:

- Homepage
- Job search
- Job detail
- Company page
- Programmatic SEO pages
- Career guides
- Salary pages
- Skill pages
- Interview pages
- Footer
- Navbar
- Search experience
- Landing sections

Public pages must be SEO-ready and should include clear hierarchy, semantic sections, structured content, internal linking, and strong responsive behavior.

### Candidate Portal

Redesign candidate surfaces while preserving all candidate workflows.

Include:

- Candidate dashboard
- My profile
- Resume
- Applications
- Saved jobs
- Job alerts
- Recommended jobs
- Notifications
- Messages
- Profile strength
- Career growth
- Settings
- Public candidate profile
- Career Intelligence

Candidate screens should feel helpful, focused, personal, and premium without becoming playful or casual.

### Employer Portal

Redesign employer and recruiter surfaces while preserving ATS and company workflows.

Include:

- Employer dashboard
- Company workspace
- Job management
- Create/edit job workflows
- Candidate pipeline
- Candidate profile
- Interview center
- Team management
- Analytics
- Billing
- Notifications
- Employer settings
- Help center

Employer screens should feel like a world-class ATS and hiring command center.

### Admin Portal

Redesign admin surfaces while preserving platform management workflows.

Include:

- Admin dashboard
- User management
- Company management
- Job moderation
- Recruitment monitoring
- Billing
- CMS
- SEO control center
- Reports
- Support center
- Audit center
- Monitoring
- Platform settings

Admin screens should feel like a premium platform control center inspired by Stripe Dashboard, Linear, Vercel, GitHub, and Atlassian Admin, without using an admin template.

## Design System Requirements

Create a complete design system with:

- Color tokens
- Typography scale
- Spacing scale
- Radius scale
- Shadow scale
- Motion tokens
- Icon rules
- Layout grid
- Container rules
- Responsive breakpoints
- Light theme
- Dark theme
- Status colors
- Chart colors
- Badge colors
- Focus states
- Disabled states
- Hover states
- Active states

The color system must be professional and restrained. Avoid flashy colors, gaming UI, neumorphism, glassmorphism, and excessive gradients.

Use gradients only where meaningful.

## Component Library Requirements

Design reusable components for:

- Buttons
- Icon buttons
- Inputs
- Textareas
- Selects
- Checkboxes
- Toggles
- Radio groups
- Search inputs
- Filter bars
- Cards
- KPI cards
- Job cards
- Company cards
- Candidate cards
- Salary cards
- Tables
- Data grids
- Tabs
- Badges
- Avatars
- Breadcrumbs
- Pagination
- Dropdowns
- Tooltips
- Toasts
- Dialogs
- Drawers
- Sheets
- Command menu
- Calendar
- Upload components
- Progress bars
- Skeletons
- Loading states
- Empty states
- Error states
- Timelines
- Charts
- Sidebars
- Navbars
- Footers
- Notification center

Every component must include:

- Default state
- Hover state
- Focus state
- Active state
- Loading state where relevant
- Disabled state where relevant
- Error state where relevant
- Empty state where relevant
- Mobile behavior
- Dark mode behavior
- Accessibility notes

## Dashboard Requirements

Every dashboard should include:

- Greeting or workspace context
- Summary
- KPI cards
- Quick actions
- Insights
- Recent activity
- Charts where relevant
- Notifications or alerts
- Loading state
- Empty state
- Error state

Dashboards should be modern SaaS dashboards, not marketing pages.

Use large KPI cards only where appropriate. Keep dashboards scannable, calm, and uncluttered.

## ATS Pipeline Requirements

The ATS pipeline must feel fast and operational.

Include:

- Kanban columns
- Candidate cards
- Status badges
- Ratings
- Tags
- Notes indicators
- Bulk actions
- Candidate drawer
- Interview actions
- Offer actions
- Reject/hire actions
- Timeline
- Loading state
- Empty state
- Error state
- Mobile behavior

Preserve the existing application statuses and workflows.

## Tables Requirements

Tables must support enterprise workflows.

Include:

- Sticky headers
- Row hover
- Row selection
- Bulk actions
- Filters
- Sorting
- Pagination
- Column visibility
- Status badges
- Row actions
- Empty state
- Loading skeleton
- Error state
- Responsive behavior

Mobile tables should become cards or use intentional horizontal scrolling.

## Forms Requirements

Forms must be production-grade.

Include:

- Labels
- Helper text
- Validation
- Error text
- Success state
- Loading state
- Password visibility
- Upload progress
- File validation
- Preview
- Clear primary and secondary actions

Forms should be accessible and keyboard-friendly.

## Motion Requirements

Use Framer Motion.

Animations must be lightweight.

Target 60 FPS.

Use 150-250ms motion for most interactions.

Animate only:

- Opacity
- Scale
- Translate
- Minimal rotation
- Progress

Use motion for:

- Hover
- Focus
- Selection
- Loading
- Success
- Notifications
- Cards
- Sidebar
- Drawer
- Dialog
- Dropdown
- Search
- Charts
- Progress
- Kanban
- Page transitions

Do not over-animate.

No animation should delay usability.

Respect reduced motion preferences.

## Accessibility Requirements

Design for WCAG AA.

Include:

- Keyboard navigation
- Visible focus states
- ARIA labels
- Semantic headings
- Screen reader support
- Color contrast
- Reduced motion
- Accessible icon buttons
- Accessible forms
- Accessible dialogs
- Accessible tables

Do not rely on color alone to communicate state.

## Responsive Requirements

Design for:

- 320px
- 375px
- 425px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px
- Ultra-wide

Mobile design must be intentional, not simply compressed desktop.

Use:

- Mobile drawer navigation
- Mobile bottom navigation where appropriate
- Single-column cards
- Large touch targets
- Sticky action bars where useful
- Responsive tables
- Responsive charts

## Visual Direction

Use:

- Clean surfaces
- Soft but restrained shadows
- Strong typography
- Clear hierarchy
- Enough whitespace
- Compact SaaS density where needed
- Calm status colors
- Professional icons
- Useful illustrations only
- Meaningful charts

Avoid:

- Flashy colors
- Gaming aesthetics
- Excessive gradients
- Glassmorphism
- Neumorphism
- Decorative blobs
- Random illustrations
- Card nesting
- Overly rounded UI
- Over-animation
- Generic template look

## Page-Level Quality Checklist

Every redesigned page must pass:

- Premium SaaS quality
- Preserves existing functionality
- Preserves existing workflow
- Preserves route and navigation architecture
- Preserves API assumptions
- Preserves RBAC
- Component-driven
- Responsive
- Accessible
- Fast
- Dark mode ready
- Light mode ready
- Loading state
- Empty state
- Error state
- Clear hierarchy
- Clear next action
- Consistent spacing
- Consistent typography
- Consistent icons
- Screenshot-worthy

## Final Instruction

Redesign Jobs View as a premium enterprise SaaS platform.

Keep the product logic exactly the same.

Improve only the interface, interaction quality, responsiveness, accessibility, clarity, visual hierarchy, component consistency, and motion.

The final design should feel like a polished operating system for careers and hiring: powerful enough for enterprise recruiting teams, simple enough for candidates, and trustworthy enough for platform administrators.
