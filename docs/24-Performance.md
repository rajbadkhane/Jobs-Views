# ⚡ Jobs View - Performance Specification

This document details the performance targets and optimization strategies to ensure Jobs View delivers an instantaneous, desktop-app-like user experience.

---

## 1. Core Web Vitals Targets

To achieve a premium feel and maximize SEO ranking, we target the following metrics on production builds:

| Metric | Target | Description |
| :--- | :--- | :--- |
| **Lighthouse Score** | `95+` | Score across Performance, Accessibility, Best Practices, and SEO. |
| **LCP (Largest Contentful Paint)** | `< 2.0s` | Measures loading performance (aiming for "Good"). |
| **CLS (Cumulative Layout Shift)**| `< 0.05` | Measures visual stability (preventing content jumps). |
| **INP (Interaction to Next Paint)**| `< 100ms` | Measures user interaction responsiveness (replaces FID). |
| **TTFB (Time to First Byte)** | `< 200ms` | Measures server response latency. |

---

## 2. Frontend Optimization (Next.js)

### 2.1 Image Optimization
- All images must use the Next.js `next/image` component to auto-generate responsive sizes and serve next-gen formats (AVIF/WebP).
- Company logos uploaded to Cloudflare R2 are processed via a worker to resize them to a max of `512px` and convert them to WebP before saving.
- Layout shifting is prevented by declaring explicit `width` and `height` aspect ratios or using `fill`.

### 2.2 Lazy Loading & Code Splitting
- Below-the-fold components (e.g., footer, testimonials, detailed statistics) are lazy-loaded using `next/dynamic`.
- Import only required icons from `lucide-react` using tree-shakable imports to avoid bloating the bundle size.
- Font files (Inter, Outfit) are self-hosted via `next/font` to eliminate external Google Fonts API requests during page loads.

---

## 3. Backend & Database Optimization (Go & PostgreSQL)

### 3.1 Redis Caching Layer
We use Redis to cache frequent, read-heavy operations:
- **Landing Page Stats:** Cached for 1 hour.
- **Job Search Results:** Cached using keys based on search parameters (e.g., `jobs:search:go-remote-ny`). Cached for 10 minutes, invalidated when a new job matching those parameters is published.
- **Session Cache:** Active user roles and permissions are cached in Redis to avoid hitting PostgreSQL on every authorized request.

### 3.2 Database Connection & Query Tuning
- **Connection Pooling:** Go uses `pgxpool` with a maximum connection limit tailored to the server CPU cores (typically `2 * Cores + 1`).
- **N+1 Query Prevention:** Always write explicit SQL joins instead of issuing separate queries for related entities (e.g., getting a job's skills).
- **Index Tuning:** Analyze query plans using `EXPLAIN ANALYZE` during development to ensure indexes (B-Tree, GIN, Trigram) are correctly utilized.

---

## 4. Network & CDN Optimization (Cloudflare)

- **Brotli Compression:** Enforce Brotli compression on the Nginx/Cloudflare level for all text assets (HTML, CSS, JS, JSON responses).
- **Edge Caching:** Cache static assets (JS, CSS, SVGs) at Cloudflare's edge with a long cache-control header (`Cache-Control: public, max-age=31536000, immutable`).
- **HTTP/3:** Enable HTTP/3 on Cloudflare to minimize connection negotiation latency over mobile networks.
- **Early Hints:** Enable Cloudflare Early Hints to preconnect to R2 assets and Google Fonts before the HTML is fully parsed.
