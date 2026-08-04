# 🚀 Jobs View - Programmatic SEO Strategy

This document outlines the database-driven generation of thousands of landing pages on Jobs View, designed to capture long-tail search queries (role + location combinations).

---

## 1. Programmatic URL Architecture

We programmatically generate landing pages by combining **Roles**, **Locations (Cities/States/Countries)**, and **Calculators**.

- **Faceted Job Search:** `/jobs/{role-slug}-{city-slug}`
  - *Examples:* `/jobs/react-developer-bhopal`, `/jobs/go-engineer-delhi`
- **Salary Guides:** `/salary/{role-slug}-{country-slug}`
  - *Example:* `/salary/react-developer-india`
- **Career Guides:** `/career/{role-slug}`
  - *Example:* `/career/frontend-developer`

---

## 2. Preventing "Thin Content" Penalties

Search engines penalize programmatically generated pages if they lack unique value. To prevent this, every dynamic landing page must be generated using a rich content template containing real-time data:

### 2.1 Dynamic Content Template for `/jobs/{role}-{city}`
1. **Dynamic H1 & Introduction:** Custom paragraph containing the exact role, city, and active jobs count (e.g., *"There are currently 12 active React Developer jobs in Bhopal."*).
2. **Filtered Jobs Feed:** List of active, verified job cards matching the filter. If no jobs are active, display a curated list of similar roles or remote options to prevent empty-state indexation.
3. **Salary Snippet:** Embed a small salary overview card for that role and city (e.g., *"The average salary for a React Developer in Bhopal is ₹6,50,000."*).
4. **Top Employers in {City}:** List of verified companies hiring for that role in the target location.
5. **Local FAQ Section:** 3-4 Q&As generated using local database statistics.

---

## 3. Indexation Guardrails

- **Fallback to Noindex:** If a programmatic page has **zero** active jobs and **zero** historical salary data, the page must automatically output a `<meta name="robots" content="noindex, follow" />` tag. This prevents search engines from crawling and indexing low-value, empty pages.
- **Sitemap Inclusion:** Only programmatic pages with at least 3 active listings or verified salary metrics are added to `sitemap.xml`.
- **Slug Normalization:** Standardize slugs using lowercase letters, removing special characters, and converting spaces to hyphens (e.g., "Node.js Developer" becomes `node-js-developer`).
