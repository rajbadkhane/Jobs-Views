# 🔐 Jobs View - Authentication & Session Architecture

This document defines the implementation details for user authentication, session tracking, email verification, password reset, and rate limiting in Jobs View.

---

## 1. Authentication Flow (JWT & Secure Cookies)

We use a dual-token system (short-lived access tokens and long-lived refresh tokens) to balance security and user experience.

### 1.1 Token Specifications
- **Access Token:**
  - **Type:** JSON Web Token (JWT)
  - **Lifetime:** 15 minutes
  - **Payload (Claims):**
    ```json
    {
      "sub": "user_uuid_here",
      "email": "user@example.com",
      "role": "EMPLOYER",
      "permissions": ["job:create", "job:edit"],
      "exp": 1782655200
    }
    ```
- **Refresh Token:**
  - **Type:** Cryptographically secure random string (32 bytes, hex-encoded).
  - **Lifetime:** 7 days.
  - **Database Storage:** Stored hashed (SHA-256) in the `user_sessions` table.

### 1.2 Cookie Configurations
Both tokens are set by the Go API using `Set-Cookie` HTTP headers:
- `access_token`: `httpOnly=true`, `secure=true`, `sameSite=Strict`, `path=/`, `maxAge=900` (15 mins).
- `refresh_token`: `httpOnly=true`, `secure=true`, `sameSite=Strict`, `path=/api/v1/auth/refresh`, `maxAge=604800` (7 days).
  - *Note:* The refresh token cookie path is restricted to the refresh endpoint to prevent it from being sent on every standard API request.

---

## 2. Session Management & Token Rotation

To mitigate the risk of stolen refresh tokens, we implement **Automatic Token Rotation (RTR)**.

### 2.1 Refresh Token Rotation Flow
1. When the client's access token expires, they call `POST /api/v1/auth/refresh`, sending their current `refresh_token` cookie.
2. The server:
   - Validates the refresh token against the database.
   - Generates a **new access token** and a **new refresh token**.
   - Replaces the old refresh token in the database with the new one (single-use tokens).
   - Returns both new tokens in `Set-Cookie` headers.
3. **Breach Detection:** If the server receives an *already used* refresh token, it assumes a theft has occurred. The server immediately invalidates the entire session chain (all sessions associated with that user), forcing a full re-login.

### 2.2 Logout Options
- **Single Logout (`POST /api/v1/auth/logout`):** Deletes the current session row from the database and clears the cookies in the user's browser.
- **Global Logout (`POST /api/v1/auth/logout?global=true`):** Deletes all active session rows for the user's ID in the database, invalidating sessions on all devices.

---

## 3. Account Recovery & Verification

### 3.1 Email Verification Flow
1. **Trigger:** On registration, the user’s account is created with `is_verified = false`.
2. **Token Generation:** The server generates a random 64-character token, hashes it, saves it to a `verification_tokens` table (expires in 24 hours), and sends a verification link via email.
3. **Verification:** When the user clicks the link (`GET /api/v1/auth/verify?token=...`), the server marks `is_verified = true` in the `users` table and deletes the token.

### 3.2 Password Reset Flow
1. **Request:** The user submits their email at `/forgot-password`.
2. **Token Generation:** If the email exists, the server generates a cryptographically secure reset token, saves the hash to a `password_resets` table (expires in 1 hour), and emails a link: `https://Jobs View.com/reset-password?token=...`.
3. **Reset:** The user submits a new password. The server validates the token, hashes the new password, updates the `users` table, and invalidates all active sessions.

---

## 4. Rate Limiting (Redis Token Bucket)

To protect against brute-force attacks and resource exhaustion:
- **Algorithm:** Token Bucket, implemented in Go using Redis.
- **Login/Register Routes:** Max 5 attempts per 5 minutes per IP address.
- **Password Reset Request:** Max 3 requests per hour per email address.
- **General API Routes:** Max 60 requests per minute per IP address.
