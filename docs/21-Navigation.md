# 🗺️ Jobs View - Navigation Architecture

This document specifies the navigation elements, menu items, and layout placements for the four user perspectives: Public, Candidate, Employer, and Super Admin.

---

## 1. Public Navigation

### 1.1 Header (Navbar)
- **Position:** Sticky top, high z-index, glassmorphic background blur.
- **Left:** Jobs View Logo (links to `/`).
- **Center:** 
  - [Jobs](file:///d:/New%20folder/Jobs%20View/docs/08-Sitemap.md#L6) (`/jobs`)
  - [Companies](file:///d:/New%20folder/Jobs%20View/docs/08-Sitemap.md#L8) (`/companies`)
  - Career Resources (`/career`)
  - About (`/about`)
- **Right:**
  - "Log In" button (ghost style, links to `/login`)
  - "Register" button (primary style, links to `/register`)

### 1.2 Footer
- **Position:** Bottom of all public pages.
- **Columns:**
  - **Company:** About Us, Contact, Careers, Press.
  - **For Candidates:** Browse Jobs, Browse Companies, Resume Builder, Career Advice.
  - **For Employers:** Post a Job, Pricing, ATS Features, Talent Pool.
  - **Legal:** Privacy Policy, Terms of Service, Security.
- **Bottom Bar:** Copyright notice and social icons (Twitter, GitHub, LinkedIn).

---

## 2. Candidate Navigation

### 2.1 Left Sidebar (Desktop)
- **Logo:** Mini logo at the top.
- **Menu Items:**
  - **Dashboard** (`/candidate/dashboard`): Live application board (Kanban).
  - **Profile** (`/candidate/profile`): Profile builder and resume manager.
  - **Saved Jobs** (`/candidate/saved-jobs`): Bookmarked listings.
  - **Notifications** (`/candidate/notifications`): In-app alerts with unread badge count.
  - **Settings** (`/candidate/settings`): Account and privacy controls.
- **Bottom:** User profile summary (avatar, name, email) which opens a dropdown for "Logout".

### 2.2 Bottom Tab Bar (Mobile)
On screens `< 640px`, the sidebar is hidden and replaced by a sticky bottom navigation bar:
- [Dashboard] | [Jobs (Search)] | [Notifications] | [Profile]

---

## 3. Employer Navigation

### 3.1 Left Sidebar (Desktop)
- **Company Branding:** Showcases company logo and name at the top.
- **Menu Items:**
  - **Dashboard** (`/employer/dashboard`): Overview of active jobs, applicant counts, and action items.
  - **Jobs** (`/employer/jobs`): List of job posts (draft, published, closed) and a "Post a Job" button.
  - **Applications** (`/employer/jobs/[id]`): Quick access to applicant pipelines.
  - **Analytics** (`/employer/analytics`): Funnel performance metrics.
  - **Team** (`/employer/team`): Manage recruiter/reviewer seats.
  - **Billing** (`/employer/billing`): Manage subscription plans and Stripe invoices.
  - **Settings** (`/employer/settings`): Company details and notification preferences.

---

## 4. Super Admin Navigation

### 4.1 Left Sidebar (Desktop)
- **Branding:** Jobs View Admin Portal logo.
- **Menu Items:**
  - **Dashboard** (`/admin/dashboard`): System metrics (daily signups, job counts, active subscriptions).
  - **Verification Queue** (`/admin/verification`): List of pending employer verifications.
  - **Job Moderation** (`/admin/jobs`): Flagged job listings.
  - **User Directory** (`/admin/users`): Database search of all users (Candidates & Employers).
  - **Companies** (`/admin/companies`): Manage company profiles.
  - **Reports** (`/admin/reports`): View spam reports, feedback, and system errors.
  - **Taxonomies** (`/admin/taxonomies`): Manage predefined skill tags, categories, and locations.
  - **Settings** (`/admin/settings`): Global system configurations.
