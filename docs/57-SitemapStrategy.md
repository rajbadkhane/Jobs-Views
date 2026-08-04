# 🗺️ Jobs View - Dynamic Sitemap Strategy

This document specifies the sitemap architecture, file division, update frequency, and caching rules for Jobs View.

---

## 1. Sitemap Index Architecture

To manage indexation at scale and stay within search engine limits (max 50,000 URLs or 50MB uncompressed per file), we implement a **Sitemap Index** at `/sitemap.xml` which references specialized sub-sitemaps.

```text
sitemap.xml (Index)
├── sitemap-static.xml      - Static pages (/, /about, /contact)
├── sitemap-jobs.xml        - Live job postings (paginated if >50k)
├── sitemap-companies.xml   - Verified company profiles
├── sitemap-career.xml      - Career path guides
├── sitemap-education.xml   - Course pages
├── sitemap-salary.xml      - Salary insights pages
└── sitemap-blog.xml        - Blog posts and news
```

---

## 2. Sub-Sitemap Specifications

| Sitemap File | Content Source | Update Frequency | Changefreq | Priority |
| :--- | :--- | :--- | :--- | :---: |
| `sitemap-static.xml` | Codebase | On deploy | `monthly` | `0.5` |
| `sitemap-jobs.xml` | Database (`jobs`) | Hourly (dynamic) | `hourly` | `1.0` |
| `sitemap-companies.xml`| Database (`companies`)| Daily (dynamic) | `daily` | `0.8` |
| `sitemap-career.xml` | CMS / Database | Weekly (dynamic) | `weekly` | `0.7` |
| `sitemap-education.xml`| Database (`courses`) | Weekly (dynamic) | `weekly` | `0.6` |
| `sitemap-salary.xml` | Database (`salaries`) | Weekly (dynamic) | `weekly` | `0.7` |
| `sitemap-blog.xml` | CMS / Database | Daily (dynamic) | `daily` | `0.6` |

---

## 3. Dynamic Generation & Caching (Go Backend)

To prevent sitemap requests from overloading the database, sitemaps are generated dynamically and cached:

1. **Caching:** The Go API generates sitemaps and caches them in Redis with a Time-to-Live (TTL) matching their update frequency (e.g., `sitemap-jobs.xml` cached for 1 hour).
2. **Streaming:** Large sitemaps are streamed directly from the database using cursor-based pagination to keep memory usage minimal.
3. **Noindex Guard:** Programmatic pages marked as `noindex` (due to zero active listings) are automatically excluded from sitemap generation.
