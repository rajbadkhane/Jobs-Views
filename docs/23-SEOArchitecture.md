# 🔍 Jobs View - Technical SEO Architecture

This document specifies the routing patterns, metadata configurations, and structured data schemas required to maximize organic search engine visibility for Jobs View.

---

## 1. URL Routing Patterns

To capture high-intent organic traffic (e.g., candidates searching for specific roles in specific cities), Jobs View uses a hierarchical, human-readable URL structure.

| Page Type | URL Pattern | Example |
| :--- | :--- | :--- |
| **All Jobs** | `/jobs` | `/jobs` |
| **Role Search** | `/jobs/{role-slug}` | `/jobs/react-developer` |
| **Local Role Search** | `/jobs/{role-slug}-{city-slug}` | `/jobs/react-developer-bhopal` |
| **Company Page** | `/company/{company-slug}` | `/company/acme-corp` |
| **Career Path Guide** | `/career/{role-slug}` | `/career/frontend-developer` |
| **Salary Guide** | `/salary/{role-slug}-{country-slug}` | `/salary/react-developer-india` |

### 1.1 Next.js Dynamic Route Mapping
These routes are mapped in Next.js using dynamic catch-all segments:
- `/jobs/[...slug]`: Handles both `/jobs/react-developer` and `/jobs/react-developer-bhopal` by parsing the parameters inside the server component.
- `/company/[slug]`: Renders company profiles.
- `/salary/[slug]`: Parses role and location to render targeted salary calculators.

---

## 2. Dynamic Metadata Generation

We use the Next.js `Metadata` API to generate tags dynamically on the server side.

### 2.1 Meta Tags Matrix

#### Localized Job Search (`/jobs/react-developer-bhopal`)
- **Title:** `React Developer Jobs in Bhopal | Active Openings | Jobs View`
- **Description:** `Apply to the best React Developer jobs in Bhopal. Filter by salary, remote options, and experience. Direct updates on your application status—no ghosting.`
- **Canonical:** `https://Jobs View.com/jobs/react-developer-bhopal`

#### Salary Guide (`/salary/react-developer-india`)
- **Title:** `React Developer Salary in India | Average Income & Ranges | Jobs View`
- **Description:** `What is the average salary of a React Developer in India? Explore salary ranges, percentile distributions, and top-paying cities.`

---

## 3. Structured Data (JSON-LD)

### 3.1 Google Jobs Schema (`JobPosting`)
Embedded as a `<script type="application/ld+json">` on every job detail page.

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "React Developer",
  "description": "<p>We are seeking a skilled React Developer to join our team in Bhopal...</p>",
  "datePosted": "2026-06-27T12:00:00Z",
  "validThrough": "2026-09-27T12:00:00Z",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Tech Solutions",
    "sameAs": "https://techsolutions.example.com",
    "logo": "https://r2.Jobs View.com/logos/tech-solutions.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bhopal",
      "addressRegion": "MP",
      "postalCode": "462001",
      "addressCountry": "IN"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "INR",
    "value": {
      "@type": "QuantitativeValue",
      "value": 800000,
      "minValue": 600000,
      "maxValue": 1000000,
      "unitText": "YEAR"
    }
  }
}
```

### 3.2 BreadcrumbList Schema
Enables breadcrumb trails in search result snippets.
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
      "name": "React Developer in Bhopal",
      "item": "https://Jobs View.com/jobs/react-developer-bhopal"
    }
  ]
}
```
---

## 4. Crawling & Indexing Configuration

- **`robots.txt`:** Directs search engines to crawl public paths while explicitly blocking private dashboard and admin routes.
  ```text
  User-agent: *
  Allow: /
  Allow: /jobs/*
  Allow: /company/*
  Allow: /career/*
  Allow: /salary/*
  Disallow: /candidate/
  Disallow: /employer/
  Disallow: /admin/
  Disallow: /api/
  
  Sitemap: https://Jobs View.com/sitemap.xml
  ```
- **Sitemap Indexing:** Main `sitemap.xml` references sub-sitemaps (e.g., `sitemap-jobs.xml`, `sitemap-companies.xml`) which are dynamically updated via cron jobs on the Go backend.
