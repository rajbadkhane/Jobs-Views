# 🛠️ Jobs View - Feature Specifications

This document outlines the detailed feature set of the Jobs View platform, grouped by user role: **Candidate**, **Employer**, and **Super Admin**.

---

## 1. Candidate Features

### 🔐 1.1 Authentication & Onboarding
- **Sign Up / Sign In:** Email/Password and OAuth (Google, GitHub).
- **Onboarding Wizard:** A 3-step setup to upload a resume, parse details, and select job preferences (roles, locations, salary expectations).

### 👤 1.2 Profile & Resume Management
- **Profile Builder:** Rich text bio, work experience, education, projects, skills, and social links (GitHub, LinkedIn, Portfolio).
- **Resume Manager:** Upload resumes (PDF only, max 5MB).
- **AI-Assisted Parsing:** Extract work experience, education, and skills from the uploaded PDF to pre-populate the profile.
- **Privacy Controls:** Toggle profile visibility between *Public* (searchable by verified employers) and *Private* (only visible to applied companies).

### 🔍 1.3 Job Search & Discovery
- **Advanced Search:** Full-text search on titles, descriptions, and companies.
- **Faceted Filters:** Filter by Job Type (Full-time, Part-time, Contract, Internship), Location (Remote, Hybrid, On-site, City/State), Salary Range, and Required Skills.
- **Saved Jobs:** Bookmark jobs to apply later.

### 📋 1.4 Live Application Tracking
- **Application Board:** A personal Kanban board showing the status of all applications:
  - `Applied` → `Reviewed` → `Shortlisted` → `Interviewing` → `Offered` / `Archived` (Rejected/Withdrawn).
- **Activity Log:** Chronological history of actions on an application (e.g., *"Employer viewed your resume on June 28"*, *"Status updated to Interviewing"*).
- **Withdraw Application:** Cancel an active application.

### 🔔 1.5 Notifications & Settings
- **Notification Center:** In-app center and email notifications for:
  - Application status updates.
  - Direct messages from employers.
  - Tailored job recommendations.
- **Account Settings:** Update email, change password, delete account.

---

## 2. Employer Features

### 🏢 2.1 Company Onboarding & Verification
- **Company Setup:** Register with business email, company name, website, industry, size, logo, and description.
- **Verification Request:** Submit business details for admin approval (automated check on domain matching + manual admin review).

### 💼 2.2 Job Management
- **Job Creator:** Form to post jobs with Markdown description, department, salary range (required), job type, work model, and required skills (tags).
- **Job Statuses:** Draft, Published, Closed, Archived.
- **Applicant Counter:** Quick view of total, unread, and shortlisted applicants per job.

### 🗂️ 2.3 Applicant Tracking System (ATS)
- **Kanban Pipeline:** Drag-and-drop interface to move candidates through recruitment stages.
- **Candidate Detail Modal:** Side-drawer opening to show:
  - Candidate profile and parsed details.
  - Embedded PDF resume viewer (no download required).
  - Internal team notes and ratings (1–5 stars).
- **Action Bar:** Quick buttons to Shortlist, Schedule Interview, Message, or Reject.
- **Rejection Templates:** Select a reason (e.g., "Skills Mismatch", "Experience") to auto-generate a polite rejection message.

### 💬 2.4 Messaging & Scheduling
- **Direct Chat:** Real-time chat thread with candidates who have applied.
- **Interview Scheduler:** Integration with Calendar (or manual input of dates/times) to propose interview slots.

### 📈 2.5 Team & Analytics
- **Team Management:** Invite colleagues as Recruiter or Reviewer.
- **Analytics Dashboard:** Metrics on job views, click-through rates, application volume, and average time-to-hire.

---

## 3. Super Admin Features

### 🖥️ 3.1 Admin Dashboard
- **System Overview:** Live metrics for total candidates, verified employers, active job listings, daily applications, and subscription revenue.

### 🛡️ 3.2 Verification & Moderation
- **Employer Verification Queue:** Review pending company registrations, verify domains, and approve/reject.
- **Job Moderation:** Review flagged job postings for spam, scam, or incorrect details.

### 👥 3.3 User & Company Management
- **User Directory:** Search and filter all candidates and employers.
- **Action Panel:** Ability to suspend/ban users, reset passwords, or update roles.
- **Company Directory:** View all registered companies, edit verification status, and manage active jobs.

### ⚙️ 3.4 Platform Configuration
- **Taxonomy Manager:** Manage pre-defined skills, job categories, cities, and states.
- **Subscription Plans:** Create and edit pricing plans, limits (e.g., active job posts allowed), and feature access.
- **System Logs:** View application logs, security events, and audit trails.
