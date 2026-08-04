# 🗺️ Jobs View - Sitemap & Route Architecture

This sitemap outlines the page hierarchy and route structure of the Jobs View platform, divided by access control layers.

---

## 1. Route Tree Overview

```text
├── (Public Routes)
│   ├── /                           - Landing Page / Search Hub
│   ├── /jobs                       - Job Search & Filtering
│   │   └── /[slug]                 - Job Detail Page (SEO-optimized)
│   ├── /companies                  - Company Directory
│   │   └── /[slug]                 - Company Profile Page
│   ├── /about                      - About Jobs View
│   ├── /contact                    - Contact & Support
│   ├── /login                      - Login Page (Shared)
│   └── /register                   - Registration Page (Candidate/Employer)
│
├── /candidate (Protected: Candidate Role)
│   ├── /dashboard                  - Live Application Kanban Board
│   ├── /profile                    - Profile Editor & Resume Upload
│   ├── /saved-jobs                 - Bookmarked Job Listings
│   ├── /notifications              - In-app Notifications & Alerts
│   └── /settings                   - Account & Privacy Settings
│
├── /employer (Protected: Employer Role)
│   ├── /dashboard                  - Active Jobs & Hiring Overview
│   ├── /jobs                       - Job Listings Management
│   │   ├── /new                    - Job Posting Form
│   │   └── /[id]                   - Applicant ATS Kanban & Details
│   ├── /company                    - Edit Company Profile
│   ├── /team                       - Team Members & Invite Settings
│   ├── /billing                    - Subscription Plans & Invoicing
│   └── /settings                   - Account Settings
│
└── /admin (Protected: Super Admin Role)
    ├── /dashboard                  - System Metrics & Revenue Overview
    ├── /verification               - Company Verification Queue
    ├── /jobs                       - Job Moderation & Flagged Posts
    ├── /users                      - User Directory & Suspend/Ban Portal
    ├── /taxonomies                 - Skill & Location Tag Manager
    └── /settings                   - System-wide Configuration
```

---

## 2. Route Specifications & Access Control

### 2.1 Public Routes
No authentication required. Highly optimized for SEO, fast loading, and indexing by search engines.

- **`/` (Landing Page):** Showcases the value proposition, featured jobs, and top companies. Has a prominent central search bar.
- **`/jobs` & `/jobs/[slug]`:** Dynamically rendered. Job details use slugs (e.g., `/jobs/senior-backend-engineer-acme-102`) for search engine friendliness.
- **`/companies` & `/companies/[slug]`:** Profiles of verified companies including active job counts and responsiveness metrics.

### 2.2 Candidate Routes
Requires authentication with `role = candidate`. Managed by Next.js middleware.

- **`/candidate/dashboard`:** The central workspace for candidates, featuring their application board and recent activities.
- **`/candidate/profile`:** A multi-step form to update skills, experience, and manage the uploaded resume.

### 2.3 Employer Routes
Requires authentication with `role = employer`. Companies must have a `verified` status to access publishing features (unverified companies are restricted to draft mode).

- **`/employer/dashboard`:** Displays high-level stats (total applications, active posts, new candidates) and shortcuts.
- **`/employer/jobs/[id]`:** The core ATS workspace. Displays a Kanban board showing candidates who applied to job `[id]`.

### 2.4 Admin Routes
Requires authentication with `role = admin`. Locked behind IP whitelist or strict multi-factor authentication (MFA) in production.

- **`/admin/verification`:** Displays pending company registrations. Admins can view uploaded docs/domains and click "Approve" or "Reject".
- **`/admin/taxonomies`:** Interface to manage the list of skills, categories, and cities.
