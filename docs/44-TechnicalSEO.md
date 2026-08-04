# ⚙️ Jobs View - Technical SEO Specification

This document details the rendering choices, canonicalization rules, sitemap generation, and indexing configurations for Jobs View.

---

## 1. Page Rendering Strategy (Next.js)

To optimize load speed and search crawling, we use a hybrid rendering approach:

- **Server-Side Rendering (SSR):** Used for `/jobs` and dynamic search pages. This ensures that when search crawlers request a list of jobs, they receive a fully populated HTML document matching the latest database state.
- **Incremental Static Regeneration (ISR):** Used for company profiles (`/company/[slug]`) and salary guides (`/salary/[slug]`). These pages are pre-rendered at build time and updated in the background every **30 minutes** as data changes.
- **Static Site Generation (SSG):** Used for static landing pages (`/about`, `/contact`, `/career`). These are compiled once at build time for instant loading.

---

## 2. Dynamic Pagination
- Job search pagination must use query parameters (e.g., `/jobs?page=2`).
- To prevent search engines from crawling infinite empty pages, we add:
  - `<link rel="prev" href="..." />` and `<link rel="next" href="..." />` tags.
  - An automatic `noindex` tag if the page exceeds the total available pages.

---

## 3. Dynamic Sitemap & Robots.txt
- **Sitemap Index:** `/sitemap.xml` redirects to regional and category-specific sub-sitemaps (e.g., `sitemap-jobs.xml`, `sitemap-companies.xml`).
- **Update Frequency:** Job sitemaps are rebuilt dynamically every hour via Go background workers, while static pages are cached permanently.
- **Robots.txt:** Explicitly blocks crawlers from accessing `/candidate/*`, `/employer/*`, `/admin/*`, and internal `/api/*` endpoints.
