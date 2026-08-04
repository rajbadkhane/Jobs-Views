# 🔗 Jobs View - Canonicalization Strategy

This document defines the rules for canonical URL implementation across Jobs View to prevent duplicate content penalties and consolidate search engine link equity.

---

## 1. Core Canonical Rules

Every public-facing page must include a `<link rel="canonical" href="..." />` tag in the HTML `<head>`.

### 1.1 Self-Referencing Canonical URLs
By default, a page's canonical URL must point to its clean, primary URL.
- *If the user visits:* `https://Jobs View.com/jobs/react-developer-bhopal?utm_source=linkedin&ref=social`
- *The canonical tag must be:* `<link rel="canonical" href="https://Jobs View.com/jobs/react-developer-bhopal" />`

### 1.2 URL Normalization Rules
To ensure consistency, the canonical URL generator must:
1. **Force Lowercase:** Convert all slugs and paths to lowercase.
2. **Remove Trailing Slashes:** Enforce no trailing slash (e.g., `/jobs`, NOT `/jobs/`).
3. **Strip Tracking Parameters:** Remove all query parameters except essential functional parameters (like `page` for paginated pages).

---

## 2. Special Canonical Cases

### 2.1 Paginated Lists
- **Rule:** Each paginated page must have a self-referencing canonical URL containing the page number.
- **Example (Page 2):**
  - *URL:* `https://Jobs View.com/jobs?page=2`
  - *Canonical:* `<link rel="canonical" href="https://Jobs View.com/jobs?page=2" />`
  - *Why:* Prevents search engines from treating page 2 as a duplicate of page 1.

### 2.2 Cross-Domain Canonical (Imported Jobs)
If an employer syncs a job posting from an external ATS (e.g., Greenhouse) and wants the original post to remain the primary version:
- **Rule:** The job creator can optionally specify an `external_url`. If provided, the canonical tag on Jobs View points directly to that external source.
- **Example:**
  - *Jobs View URL:* `https://Jobs View.com/jobs/senior-engineer-acme-a988`
  - *Canonical:* `<link rel="canonical" href="https://acme.com/careers/jobs/102" />`
- **Benefits:** Respects the employer’s SEO requirements while allowing the job to be searchable on Jobs View.
  - *Default:* If no `external_url` is provided, it defaults to the Jobs View URL.
  }
