# ⚡ Jobs View - Core Web Vitals Optimization

This document specifies the technical implementations required to meet and maintain our production Core Web Vitals (CWV) targets.

---

## 1. Largest Contentful Paint (LCP)
- **Target:** `< 2.0 seconds` (measures perceived loading speed).

### Optimization Checklist
1. **Preload Hero Images:** For job detail and company pages, preload the company logo or banner image:
   ```html
   <link rel="preload" as="image" href="https://r2.Jobs View.com/logos/company.webp" fetchpriority="high" />
   ```
2. **Eliminate Render-Blocking resources:** Defer all non-essential JavaScript. Ensure critical CSS is inline or loaded instantly, preventing the browser from pausing HTML parsing.
3. **Optimized Font Rendering:** Use `font-display: swap` in `@font-face` declarations to show fallback system fonts while Inter/Outfit are loading, preventing blank text flashes.
4. **Server-Side Rendered (SSR) HTML:** Send the complete HTML skeleton with content from the server so the browser can paint the primary text before downloading the JS bundles.

---

## 2. Cumulative Layout Shift (CLS)
- **Target:** `< 0.05` (measures visual stability).

### Optimization Checklist
1. **Explicit Aspect Ratios:** Always specify `width` and `height` attributes on images, avatars, and iframe elements. If using responsive images, wrap them in a aspect-ratio-controlled container (e.g., `aspect-video`).
2. **Skeleton Loaders:** Use skeleton placeholders for dynamically loaded content (e.g., job lists, user notifications) that match the exact height of the loaded state.
3. **No Dynamic Content Injection Above Fold:** Never inject dynamic banners, alerts, or ads at the top of the viewport after the page has painted, unless triggered by direct user interaction.

---

## 3. Interaction to Next Paint (INP)
- **Target:** `< 100ms` (measures user interaction responsiveness).

### Optimization Checklist
1. **Debounce Inputs:** Debounce the search input on the `/jobs` page by `150ms` to prevent the UI from locking up on every keystroke.
2. **Yield to Main Thread:** Break up long-running JavaScript tasks using `setTimeout` or `requestIdleCallback` to allow the browser to paint updates between calculations.
3. **Lightweight DOM:** Keep total DOM nodes below **1,500** per page. Avoid rendering massive, un-paginated lists of jobs; enforce pagination or infinite scroll with windowed lists (virtualization).

---

## 4. Time to First Byte (TTFB)
- **Target:** `< 200ms` (measures server response latency).

### Optimization Checklist
- **Redis Cache:** Cache database-heavy reads (e.g., categories, active job counts, featured jobs) in Redis.
- **SQL Optimization:** Index all join columns and run database connection pooling via Go’s `pgxpool`.
- **Cloudflare Edge Caching:** Enable Cloudflare Edge Cache TTL for static public routes to serve pages from the nearest CDN node.
