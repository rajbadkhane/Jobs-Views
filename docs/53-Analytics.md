# 📈 Jobs View - Analytics & Event Tracking Strategy

This document defines the key performance indicators (KPIs), event tracking schemas, and analytics tools used to monitor user behavior and traffic growth on Jobs View.

---

## 1. Core Metrics & KPIs

We track three main categories of metrics:

### 1.1 Traffic & Acquisition
- **Organic Sessions:** Traffic originating from search engines (Google, Bing, Perplexity).
- **Search Queries:** Keywords driving traffic (sourced via Search Console integrations).
- **Bounce Rate / Engagement Rate:** Percentage of users who engage with job details rather than immediately exiting.

### 1.2 Conversion & Engagement
- **CTR (Click-Through Rate):** Percentage of users who click a job card after seeing it in search results.
- **Job View to Apply Rate (Conversion):** Percentage of job viewers who click "Apply" and submit their resume.
- **Resume Upload Success Rate:** Percentage of started onboarding flows that successfully upload and parse a resume.

### 1.3 Retention & Platform Health
- **Employer Response Latency:** Time elapsed between application submission and employer status update.
- **Ghosting Rate:** Percentage of applications left unreviewed after 14 days.

---

## 2. Event Tracking Schema

We use custom events to track the candidate conversion funnel:

| Event Name | Trigger | Properties Tracked |
| :--- | :--- | :--- |
| `job_search` | User performs a query on `/jobs` | `query_string`, `filters_applied`, `results_count` |
| `job_view` | User opens a job details drawer/page | `job_id`, `company_id`, `category`, `salary_range` |
| `apply_click` | User clicks the "Apply Now" button | `job_id`, `company_id`, `is_logged_in` |
| `apply_submit` | User submits the application form | `job_id`, `company_id`, `resume_id`, `cover_letter_length` |
| `resume_upload` | User uploads a PDF resume | `file_size`, `parsing_duration_ms`, `skills_extracted_count` |

---

## 3. Analytics Stack & Privacy
- **Privacy-First Analytics:** We use **Plausible Analytics** or a self-hosted **Umami** instance for general pageview tracking. These tools do not use cookies, do not collect personally identifiable information (PII), and comply fully with GDPR and DPDP regulations.
- **Google Analytics 4 (GA4):** Loaded via Google Tag Manager (GTM) only after the user consents via our cookie consent banner. Used for tracking attribution and Google Ads conversion campaigns.
