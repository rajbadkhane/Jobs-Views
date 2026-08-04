# 🤖 Jobs View - Robots & Crawling Strategy

This document defines the crawl control policies, `robots.txt` rules, and meta-robots directives for Jobs View.

---

## 1. The `robots.txt` Specification

The `robots.txt` file is hosted at the root of the site (`https://Jobs View.com/robots.txt`) and directs search engine crawlers.

```text
# User-agent rules for all web crawlers
User-agent: *

# Block access to private directories
Disallow: /candidate/
Disallow: /employer/
Disallow: /admin/

# Block access to internal API and authentication routes
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password

# Block crawling of internal search parameter variations to save crawl budget
Disallow: /jobs/*?*sort=
Disallow: /jobs/*?*salary_min=
Disallow: /jobs/*?*skills=

# Allow crawling of all public hubs and pages
Allow: /
Allow: /jobs
Allow: /jobs/*
Allow: /company/
Allow: /company/*
Allow: /career/
Allow: /career/*
Allow: /salary/
Allow: /salary/*

# Link to the primary sitemap index
Sitemap: https://Jobs View.com/sitemap.xml
```

---

## 2. Meta-Robots Directives (`noindex` / `nofollow`)

While `robots.txt` prevents crawlers from *accessing* pages, meta-robots tags tell them how to *index* and *link* on specific pages. We inject these tags using Next.js head components.

### 2.1 `noindex, follow` Pages
Used when we want search engines to crawl links on a page but not display the page itself in search results:
- **Empty Programmatic Pages:** `/jobs/react-developer-bhopal` when there are zero active jobs.
- **Search Result Pages:** Internal keyword searches (e.g., `/jobs?search=react`) to prevent indexing duplicate, low-quality lists.
- **Dynamic Filter Pages:** Page 3 and beyond of paginated job searches.

### 2.2 `noindex, nofollow` Pages
Used for highly private or transient pages:
- **Candidate Profiles (Private Mode):** Prevents profiles from appearing in search results.
- **Email Verification / Password Reset Confirmation Pages:** Transient utility pages.
- **Unverified Company Profiles:** Prevents companies from gaining SEO authority before they are verified by an admin.
