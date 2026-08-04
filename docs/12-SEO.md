# 🔍 Jobs View - SEO Strategy & Specifications

SEO is the primary organic acquisition channel for Jobs View. This document defines the URL structures, metadata standards, and structured data schemas required to rank highly on search engines and integrate with Google Jobs.

---

## 1. URL Structure & Canonicalization

All public routes must be clean, lowercase, and use hyphens as separators.

- **Job Postings:** `/jobs/{title-slug}-{company-name-slug}-{job-id}`
  - *Example:* `/jobs/senior-go-engineer-acme-corp-a98816c7`
- **Company Profiles:** `/companies/{company-name-slug}`
  - *Example:* `/companies/acme-corp`
- **Canonical URLs:** Every page must include a `<link rel="canonical" href="https://Jobs View.com/..." />` tag to prevent duplicate content indexing (especially for search pages with multiple query parameters).

---

## 2. Metadata Standards

Next.js App Router dynamically generates metadata using the `generateMetadata` function.

### 2.1 Title & Meta Description Templates

#### Home Page
- **Title:** `Jobs View | The Transparent Recruitment & Job Tracking Platform`
- **Meta Description:** `Find verified jobs, track your applications in real-time, and connect directly with hiring teams. Experience a faster, spam-free job search on Jobs View.`

#### Job Detail Page (Dynamic)
- **Title:** `{Job Title} at {Company Name} | Jobs View`
  - *Example:* `Senior Go Engineer at Acme Corp | Jobs View`
- **Meta Description:** `Apply for the {Job Title} position at {Company Name} in {Location}. {Salary Range}. Learn more about the role, requirements, and benefits.`

#### Company Profile Page (Dynamic)
- **Title:** `Careers at {Company Name} | Open Jobs | Jobs View`
- **Meta Description:** `Explore active job openings at {Company Name}. Read about their mission, company size, and view their application responsiveness score.`

---

## 3. Open Graph (OG) & Twitter Cards

To ensure premium presentation when links are shared on LinkedIn, Twitter, and Slack, the following tags are generated:

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://Jobs View.com/jobs/senior-go-engineer-acme-corp-a98816c7" />
<meta property="og:title" content="Senior Go Engineer at Acme Corp" />
<meta property="og:description" content="Apply now. Salary: $120k - $150k. Location: New York, NY (Hybrid). Tech Stack: Go, PostgreSQL, Docker." />
<meta property="og:image" content="https://Jobs View.com/api/v1/og/jobs/a98816c7" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Senior Go Engineer at Acme Corp" />
<meta name="twitter:description" content="Apply now. Salary: $120k - $150k. Location: New York, NY (Hybrid)." />
<meta name="twitter:image" content="https://Jobs View.com/api/v1/og/jobs/a98816c7" />
```
*(Note: `/api/v1/og/jobs/{id}` is a dynamic API route that generates a beautiful, branded image containing the job title, company logo, salary, and tags using `@vercel/og`)*

---

## 4. Structured Data (Schema.org)

### 4.1 BreadcrumbList Schema
Placed on job and company pages to improve search engine results page (SERP) snippets.
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://Jobs View.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Jobs",
      "item": "https://Jobs View.com/jobs"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Senior Go Engineer",
      "item": "https://Jobs View.com/jobs/senior-go-engineer-acme-corp-a98816c7"
    }
  ]
}
```

### 4.2 Google Jobs Schema (`JobPosting`)
This is critical. Adding this schema to job detail pages allows Google to index and display our listings directly in Google Jobs search results.

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Go Engineer",
  "description": "<p>We are looking for a Senior Go Engineer...</p>",
  "datePosted": "2026-06-27T10:00:00Z",
  "validThrough": "2026-08-27T10:00:00Z",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Acme Corp",
    "sameAs": "https://acme.com",
    "logo": "https://r2.Jobs View.com/logos/acme.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "New York",
      "addressRegion": "NY",
      "addressCountry": "US"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": {
      "@type": "QuantitativeValue",
      "value": 135000,
      "minValue": 120000,
      "maxValue": 150000,
      "unitText": "YEAR"
    }
  }
}
```

---

## 5. Sitemaps & Robots.txt

- **`robots.txt`:**
  - Allows search engines to crawl all public job and company pages.
  - Disallows crawling of `/candidate/*`, `/employer/*`, and `/admin/*`.
  - Points directly to the XML sitemap index.
- **`sitemap.xml`:**
  - A dynamic sitemap index containing static routes (`/`, `/about`, `/contact`) and dynamic links.
  - Dynamic sitemaps are paginated (e.g., `/sitemap-jobs-1.xml`) to support up to 50,000 URLs per file, automatically updating as new jobs are published.
