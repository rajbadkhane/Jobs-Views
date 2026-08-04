# 📊 Jobs View - Structured Data & Schemas

This document defines the JSON-LD schemas embedded across Jobs View to enable rich snippets in search engine results pages (SERPs).

---

## 1. Schema Mapping by Page Type

| Page Type | Schemas Implemented | Purpose |
| :--- | :--- | :--- |
| **Homepage** | `WebSite`, `Organization`, `SearchAction` | Defines the brand and enables the Sitelinks Searchbox in Google. |
| **Job Details** | `JobPosting`, `BreadcrumbList` | Enables Google Jobs listing and breadcrumb trails. |
| **Company Profile** | `Organization`, `Review`, `BreadcrumbList` | Displays company ratings, logo, and social profiles. |
| **Career Guides** | `Article`, `FAQPage`, `BreadcrumbList` | Optimizes guides for news, articles, and collapsible Q&A snippets. |
| **Education Hub** | `Course`, `BreadcrumbList` | Lists courses with provider details, price, and duration. |
| **Candidate Profile**| `Person` | Establishes candidate entity profiles (unindexed, for internal LLM crawl). |

---

## 2. Key Schema Implementations

### 2.1 WebSite & SearchAction (Homepage)
Enables users to search Jobs View jobs directly from the Google search results page.
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Jobs View",
  "url": "https://Jobs View.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://Jobs View.com/jobs?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### 2.2 Course Schema (Education Page)
Enables rich course snippets in search results.
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Introduction to Go Backend Development",
  "description": "Learn to build high-performance APIs using Go and Fiber.",
  "provider": {
    "@type": "Organization",
    "name": "Jobs View Academy",
    "sameAs": "https://Jobs View.com"
  }
}
```

### 2.3 Organization Schema (Company Profile)
Provides Google with verified details about hiring companies.
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "url": "https://acme.com",
  "logo": "https://r2.Jobs View.com/logos/acme.png",
  "sameAs": [
    "https://twitter.com/acmecorp",
    "https://linkedin.com/company/acmecorp"
  ]
}
```
---

## 3. Implementation Validation
- **CI/CD Validation:** Run schema validation tests during local builds using `zod` schemas modeled on Schema.org specifications.
- **Testing Tools:** Verify output using Google's Rich Results Test tool before deploying schema modifications.
