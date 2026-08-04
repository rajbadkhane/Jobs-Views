# 🔒 Jobs View - Security Architecture

This document defines the security protocols, authentication mechanisms, authorization models (RBAC), and threat mitigation strategies for the Jobs View platform.

---

## 1. Authentication & Session Management

### 1.1 JWT & Refresh Token Flow
We use a stateless-access / stateful-refresh token mechanism:
1. **Access Token (JWT):** Short-lived (15 minutes). Contains `user_id`, `role`, and `permissions` claims. Used to authorize API requests.
2. **Refresh Token:** Long-lived (7 days). Stored in the database under a `user_sessions` table (containing `token_hash`, `expires_at`, and `is_revoked`). Used to request new access tokens.

### 1.2 Secure Cookie Storage
Tokens are stored in the user's browser using secure cookies to prevent access by malicious client-side scripts:
- **`httpOnly`:** True (prevents JavaScript from reading the cookie, mitigating XSS).
- **`Secure`:** True (enforces transmission only over HTTPS).
- **`SameSite`:** `Strict` (mitigates Cross-Site Request Forgery - CSRF).
- **`Path`:** `/api/v1/auth` (restricts cookie transmission to the auth endpoints).

---

## 2. Authorization & RBAC

Jobs View utilizes a **Role-Based Access Control (RBAC)** model. Roles are mapped to granular permissions.

### 2.1 Permission Matrix

| Permission | Guest | Candidate | Employer: Reviewer | Employer: Recruiter/Owner | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `job:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `job:create/edit` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `job:delete` | ❌ | ❌ | ❌ | ✅ (Owner only) | ✅ |
| `profile:edit` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `application:apply` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `application:view` | ❌ | ✅ (Own) | ✅ | ✅ | ✅ |
| `application:status`| ❌ | ❌ | ✅ | ✅ | ✅ |
| `company:edit` | ❌ | ❌ | ❌ | ✅ (Owner only) | ✅ |
| `company:verify` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `user:suspend` | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Threat Mitigation & Security Controls

### 3.1 SQL Injection Protection
- **Rule:** No raw SQL string concatenation is permitted.
- **Implementation:** All database interactions are written using parameterized queries, enforced by compiling schemas through **SQLc** in the Go backend.

### 3.2 Cross-Site Scripting (XSS) Mitigation
- **Frontend:** Next.js automatically escapes values rendered in JSX.
- **Markdown Sanitization:** Job descriptions and candidate bios are written in Markdown. When rendering this content, the HTML is sanitized in the Go backend using the `bluemonday` library before being sent to the client.
- **Content Security Policy (CSP):** Configured via HTTP headers to restrict script, style, and image sources.

### 3.3 Rate Limiting
- Managed via the Go API using **Redis** to store request counters.
- **Auth Routes (`/login`, `/register`):** Max 5 requests per minute per IP address.
- **Public API Routes (`/jobs`):** Max 60 requests per minute per IP address.
- **File Upload (`/profile/resume`):** Max 3 uploads per hour per user.

### 3.4 Audit Logging
Every sensitive mutation is logged in an `audit_logs` table:
- **Logged Actions:** `user.suspend`, `company.verify`, `job.delete`, `role.change`, `billing.refund`.
- **Schema:** `id`, `actor_id` (Admin/User), `action`, `target_id`, `ip_address`, `payload_diff` (JSONB), `created_at`.
