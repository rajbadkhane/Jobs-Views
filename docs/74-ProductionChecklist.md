# 🚀 Jobs View - Production Readiness Checklist

This document defines the final verification checklist that must be passed before Jobs View is deployed to the production environment.

---

## 1. Security Verification

- [ ] **SSL/TLS:** Enforce HTTPS via Cloudflare HSTS. Disable legacy TLS versions (allow only TLS 1.2 and 1.3).
- [ ] **Secure Headers:** Enforce security headers in Nginx/Go Fiber (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- [ ] **CORS Configuration:** Restrict CORS origins on the Go API to the production frontend domain (`https://Jobs View.com`).
- [ ] **Auth Cookies:** Verify that JWT cookies are set to `httpOnly`, `Secure`, and `SameSite=Strict`.
- [ ] **Rate Limiting:** Ensure Redis-based rate limits are active on `/login`, `/register`, and `/forgot-password`.

---

## 2. Database & Storage Reliability

- [ ] **Database Backups:** Configure automated daily logical backups (`pg_dump`) and write them to a separate, secure Cloudflare R2 bucket. Retain backups for 30 days.
- [ ] **Connection Limits:** Verify that pgxpool maximum connections are set correctly for production server capacity.
- [ ] **Database Indexes:** Verify that all foreign keys, search columns, and slug columns have active indexes.
- [ ] **R2 CORS:** Configure R2 bucket CORS policies to allow uploads only from the production frontend origin.

---

## 3. SEO & Frontend Performance

- [ ] **Performance Metrics:** Verify Lighthouse scores are `95+` on key public landing pages.
- [ ] **Robots & Sitemaps:** Ensure `robots.txt` is accessible and points to `sitemap.xml`. Verify that the sitemap index generates correctly.
- [ ] **Google Jobs Schema:** Test job detail pages using Google’s Rich Results Test tool to confirm zero schema errors.
- [ ] **Canonical Tags:** Confirm that self-referencing canonical tags are present and correctly normalized (lowercase, no trailing slash).

---

## 4. Monitoring & Operations

- [ ] **Structured Logging:** Confirm that the Go API writes logs in JSON format to `stdout`.
- [ ] **Log Aggregation:** Verify that logs are ingested by the log management service (e.g., Loki).
- [ ] **Health Check:** Confirm `/healthz` returns `200 OK` and correctly validates database and Redis connections.
- [ ] **Uptime Alerting:** Set up external ping alerts (e.g., BetterUptime) to notify the team if the API or frontend goes down.
