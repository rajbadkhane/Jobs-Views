# 🔍 Jobs View - Google Jobs Integration

This document defines the structured data specifications required to index Jobs View job postings directly into Google Jobs.

---

## 1. Schema.org `JobPosting` Requirements

Every public job detail page must inject a JSON-LD structured data block in the HTML `<head>`.

### Required Fields
- **`title`:** The official job title (avoid keyword stuffing, e.g., use "React Developer", NOT "React Developer - URGENT HIRE!!!").
- **`description`:** The complete job description in clean HTML (supports `<p>`, `<ul>`, `<li>`, `<strong>`, `<em>`).
- **`datePosted`:** ISO 8601 format of when the job was published.
- **`validThrough`:** Expiration date. If not specified, default to 60 days from publication.
- **`hiringOrganization`:** Name, website, and logo URL of the company.
- **`jobLocation`:** City, state, country, and postal code. If remote, set `jobLocationType` to `TELECOMMUTE`.
- **`baseSalary`:** Numeric value, currency, and billing frequency (e.g., `YEAR`, `MONTH`).
- **`employmentType`:** Must match Google's standard values: `FULL_TIME`, `PART_TIME`, `CONTRACTOR`, `INTERN`.
- **`directApply`:** Boolean flag set to `true` to indicate that candidates can complete the application directly on our page.

---

## 2. JSON-LD Template Example

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Backend Engineer",
  "description": "<p>Join our team to build the future of career tech...</p>",
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
      "addressLocality": "Bhopal",
      "addressRegion": "MP",
      "addressCountry": "IN"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "INR",
    "value": {
      "@type": "QuantitativeValue",
      "value": 1200000,
      "unitText": "YEAR"
    }
  },
  "directApply": true
}
</script>
```
---

## 3. Crawl & Indexing Optimizations
- **Indexing API:** Integrate with Google's Indexing API in the Go backend. When a new job is published or closed, send an immediate notification to Google to prompt re-crawling within minutes.
- **Error Prevention:** If a job is archived, return a `410 Gone` status code or redirect to the `/jobs` search page with a message, helping Google remove expired listings quickly.
