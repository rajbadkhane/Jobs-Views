# ⚖️ Jobs View - Compliance, Privacy & Data Protection

This document outlines the privacy protocols and data protection strategies implemented on Jobs View to comply with global regulations, including the European Union's GDPR and the Indian Digital Personal Data Protection (DPDP) Act of 2023.

---

## 1. Regulatory Compliance

### 1.1 Indian DPDP Act 2023 Compliance
As an Indian career platform, Jobs View acts as a **Data Fiduciary** and adheres to the following principles:
- **Consent-Based Processing:** Consent must be free, specific, informed, unconditional, and unambiguous. We present a clear consent checkbox during registration, explaining exactly what data is collected and why.
- **Purpose Limitation:** Candidate data (resumes, contact info) is processed solely to connect them with employers and is never sold to third-party ad networks.
- **Right to Erase:** Candidates can click "Delete Account" in their settings, which triggers a complete hard-delete of their personal data from our active databases and backup files within 30 days.

### 1.2 GDPR Readiness
- **Data Portability:** Candidates can download a structured JSON file containing all their profile details, application history, and resumes (`GET /api/v1/profile/export`).
- **Right to Restrict Processing:** Candidates can toggle their profile visibility to `private`, instantly removing their details from search results and employer databases.

---

## 2. Cookie & Tracking Policy

- **Cookie Consent:** A cookie banner is displayed to new visitors. No non-essential cookies (like Google Analytics or tracking pixels) are loaded until the user explicitly clicks "Accept".
- **Essential Cookies:** `httpOnly` cookies used for JWT authentication and CSRF protection do not require consent as they are strictly necessary for the platform's core functions.

---

## 3. Secure Storage & Encryption

- **Encryption in Transit:** All connections must use TLS 1.3, enforced via Cloudflare HSTS.
- **Encryption at Rest:** PostgreSQL databases and backups are encrypted at rest using AES-256.
- **Resume Protection:** Resumes stored in Cloudflare R2 are secured using private buckets. Temporary access is granted only via short-lived, signed URLs generated on-demand by the Go API for authenticated employers.
