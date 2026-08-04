# 💾 Jobs View - Storage & Caching Strategy

This document outlines the data storage layers of Jobs View, detailing how and where different types of data are stored, cached, and retrieved.

---

## 1. Storage Architecture Overview

Jobs View uses a multi-tiered storage architecture to balance performance, cost, and data integrity.

| Storage Layer | Technology | Primary Purpose | Lifecycle / Retention |
| :--- | :--- | :--- | :--- |
| **Relational DB** | PostgreSQL 15 | Users, profiles, jobs, applications, payments | Permanent (Soft deleted) |
| **In-Memory Cache**| Redis | Session states, API rate limits, hot job listings | Transient (TTL-based) |
| **Object Storage** | Cloudflare R2 | PDF resumes, company logos, profile images | Permanent |
| **Search Index** | Meilisearch (Future) | Typo-tolerant job and company search | Rebuilt from Postgres |
| **Task Queue** | Redis Streams | Email queues, background AI resume parsing | Cleared on completion |

---

## 2. Relational Database (PostgreSQL)
PostgreSQL is the single source of truth (SSOT).
- **Transactions:** Enforced for all application creations, registration steps, and billing events to guarantee ACID compliance.
- **Unstructured Data (`JSONB`):** Used in `resumes.parsed_json` to store parsed resume histories (jobs, education) and `plans.features_json` to store plan feature toggles. This allows us to modify schema requirements without running database migrations.

---

## 3. Caching & Rate Limiting (Redis)
Redis operates as a high-speed volatile cache.
- **Session Cache:** Active user tokens are cached. If a user is suspended, the admin service deletes their session key in Redis, instantly logging them out.
- **Cache Eviction Policy:** `allkeys-lru` (Least Recently Used is evicted when memory limits are reached).
- **Key Namespaces:**
  - `session:{user_id}`: Value: JSON string of active session details. (TTL: 15 mins).
  - `rate:{ip_address}`: Value: Integer count of requests. (TTL: 1 minute).
  - `jobs:featured`: Value: Serialized JSON list of featured jobs. (TTL: 1 hour).

---

## 4. Object Storage (Cloudflare R2)
All binary files are stored in Cloudflare R2, an S3-compatible object store.

### 4.1 Secure Upload Flow (Presigned URLs)
To avoid routing large file uploads through our Go API (which would consume server bandwidth and memory):
1. **Request:** The frontend requests an upload slot: `POST /api/v1/profile/resume/upload-url`.
2. **Generation:** The Go API validates the user session and generates a **presigned PUT URL** using the R2 SDK, valid for 5 minutes, restricted to a specific object key (e.g., `resumes/{resume_uuid}.pdf`) and content-length (max 5MB).
3. **Upload:** The frontend uploads the PDF directly to R2 using the presigned URL.
4. **Callback/Verification:** The frontend notifies the Go API of successful upload. The Go API verifies the file exists in R2 and triggers the background resume parser.

### 4.2 Access Control
- **Logos & Profile Pictures:** Stored in a public bucket (`public-assets`), served via Cloudflare CDN.
- **Resumes:** Stored in a private bucket (`private-resumes`). Resumes are **never** publicly accessible. When an employer clicks "View Resume", the Go API generates a temporary (15-minute) presigned GET URL to render the PDF in the employer's browser.
