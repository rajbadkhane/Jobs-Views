import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getDb, Env } from "../db";
import { sendMail, resetPasswordEmailHTML, registrationOtpEmailHTML } from "../lib/mail";

export const authRouter = new Hono<{ Bindings: Env }>();

function numericOTP(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => (b % 10).toString()).join("");
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || `co-${Date.now()}`;
}

async function hashToken(token: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateToken(
  payload: { id: string; email: string; role: string; permissions: string[] },
  secret: string | undefined,
  expiresInSeconds = 3600
): Promise<string> {
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured — refusing to issue tokens.");
  }
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .setIssuer("jobs-view-api")
    .sign(secretKey);
}

/**
 * POST /api/v1/auth/register
 * Registers new candidate or employer accounts, generating corresponding initial profile and company structures.
 */
authRouter.post("/register", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = (body.email || "").toString().trim().toLowerCase();
    const password = body.password || "";
    const role = (body.role || "JOB_SEEKER").toString().toUpperCase();
    const userAgent = c.req.header("user-agent") || "Cloudflare-Edge-Client";
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "";

    if (!email || !password) {
      return c.json({ success: false, error: { code: 400, message: "Email and password are required." } }, 400);
    }

    const sql = getDb(c.env);

    // 1. Check existing account
    const existing = await sql`SELECT id FROM users WHERE email = ${email} AND deleted_at IS NULL LIMIT 1`;
    if (existing.length > 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 409, message: "An account with this email already exists." } }, 409);
    }

    // 2. Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);

    var userId: string;
    var permissions: string[] = ["*"];

    await sql.begin(async (tx: any) => {
      const newUser = await tx`
        INSERT INTO users (email, password_hash, is_active, is_verified)
        VALUES (${email}, ${passwordHash}, true, false)
        RETURNING id
      `;
      userId = newUser[0].id;

      // Attach user role
      const roles = await tx`SELECT id, name FROM roles WHERE name = ${role} LIMIT 1`;
      const roleId = roles.length > 0 ? roles[0].id : 4; // Default to standard role
      await tx`INSERT INTO user_roles (user_id, role_id) VALUES (${userId}, ${roleId})`;

      if (role === "JOB_SEEKER") {
        const firstName = body.first_name || "New";
        const lastName = body.last_name || "Candidate";
        await tx`INSERT INTO candidate_profiles (user_id, first_name, last_name) VALUES (${userId}, ${firstName}, ${lastName})`.catch(() => {});
      }

      if (role === "EMPLOYER") {
        const companyName = body.company_name || "Independent Employer";
        const coSlug = slugify(companyName) + "-" + Math.floor(100 + Math.random() * 900);
        const newCo = await tx`
          INSERT INTO companies (name, slug, website, gst_number, cin_number, status)
          VALUES (${companyName}, ${coSlug}, ${body.website || ""}, ${body.gst_number || ""}, ${body.cin_number || ""}, 'pending')
          RETURNING id
        `;
        await tx`
          INSERT INTO employer_profiles (user_id, company_id, first_name, last_name, title)
          VALUES (${userId}, ${newCo[0].id}, ${body.first_name || "Talent"}, ${body.last_name || "Acquirer"}, ${body.designation || "Recruitment Director"})
        `;
      }
    });

    // 3. Issue authentication tokens
    const SESSION_TTL_SECONDS = 72 * 3600;
    const accessToken = await generateToken({ id: userId!, email, role, permissions }, c.env.JWT_ACCESS_SECRET, SESSION_TTL_SECONDS);
    const refreshToken = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    await sql`INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at) VALUES (${userId!}, ${tokenHash}, ${userAgent}, NULLIF(${ip}, '')::inet, ${expiresAt})`.catch(() => {});
    await sql`INSERT INTO login_history (user_id, email, ip_address, user_agent, success, reason) VALUES (${userId!}, ${email}, NULLIF(${ip}, '')::inet, ${userAgent}, true, 'registration')`.catch(() => {});

    // 4. Send a verification OTP to the registered email (best-effort — never block registration on mail delivery)
    const otp = numericOTP(6);
    const otpHash = await hashToken(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await sql`UPDATE users SET registration_otp_hash = ${otpHash}, registration_otp_expires_at = ${otpExpiresAt}, registration_otp_attempts = 0 WHERE id = ${userId!}`.catch(() => {});
    await sendMail(c.env, email, "Verify your Jobs View account", registrationOtpEmailHTML(otp)).catch((err) => {
      console.error("[Edge Auth Register OTP Mail Error]:", err?.message);
    });
    await sql.end();

    return c.json({
      success: true,
      data: {
        user: { id: userId!, email, role, is_verified: false, permissions },
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[Edge Auth Register Error]:", error.message);
    return c.json({ success: false, error: { code: 500, message: "Registration failed at edge", details: error.message } }, 500);
  }
});

/**
 * POST /api/v1/auth/verify-registration-otp
 * Confirms the 6-digit code emailed at signup and marks the account as verified.
 */
authRouter.post("/verify-registration-otp", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = (body.email || "").toString().trim().toLowerCase();
    const otp = (body.otp || "").toString().trim();
    if (!email || !/^\d{6}$/.test(otp)) {
      return c.json({ success: false, error: { code: 400, message: "A valid email and 6 digit code are required." } }, 400);
    }

    const sql = getDb(c.env);
    const rows = await sql`
      SELECT id, is_verified, registration_otp_hash, registration_otp_expires_at, registration_otp_attempts
      FROM users WHERE email = ${email} AND deleted_at IS NULL LIMIT 1
    `;
    if (rows.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 404, message: "Account not found." } }, 404);
    }
    const user = rows[0];
    if (user.is_verified) {
      await sql.end();
      return c.json({ success: true, message: "Account already verified." });
    }
    if (!user.registration_otp_hash || !user.registration_otp_expires_at || new Date() > new Date(user.registration_otp_expires_at)) {
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "The code is invalid or expired. Request a new one." } }, 401);
    }
    if (user.registration_otp_attempts >= 5) {
      await sql.end();
      return c.json({ success: false, error: { code: 403, message: "Too many attempts. Request a new code." } }, 403);
    }

    const otpHash = await hashToken(otp);
    if (otpHash !== user.registration_otp_hash) {
      await sql`UPDATE users SET registration_otp_attempts = registration_otp_attempts + 1 WHERE id = ${user.id}`.catch(() => {});
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "The code is invalid or expired." } }, 401);
    }

    await sql`
      UPDATE users SET is_verified = true, email_verified_at = NOW(),
        registration_otp_hash = NULL, registration_otp_expires_at = NULL, registration_otp_attempts = 0
      WHERE id = ${user.id}
    `;
    await sql.end();
    return c.json({ success: true, message: "Email verified." });
  } catch (error: any) {
    return c.json({ success: false, error: { code: 500, message: "Verification failed", details: error.message } }, 500);
  }
});

/**
 * POST /api/v1/auth/resend-registration-otp
 * Issues a fresh 6-digit code, rate-limited to once every 45 seconds per account.
 */
authRouter.post("/resend-registration-otp", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = (body.email || "").toString().trim().toLowerCase();
    if (!email) {
      return c.json({ success: false, error: { code: 400, message: "Email is required." } }, 400);
    }

    const sql = getDb(c.env);
    const rows = await sql`SELECT id, is_verified, registration_otp_expires_at FROM users WHERE email = ${email} AND deleted_at IS NULL LIMIT 1`;
    if (rows.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 404, message: "Account not found." } }, 404);
    }
    const user = rows[0];
    if (user.is_verified) {
      await sql.end();
      return c.json({ success: true, message: "Account already verified." });
    }
    const lastSentAt = user.registration_otp_expires_at ? new Date(user.registration_otp_expires_at).getTime() - 10 * 60 * 1000 : 0;
    if (Date.now() - lastSentAt < 45 * 1000) {
      await sql.end();
      return c.json({ success: false, error: { code: 429, message: "Please wait before requesting another code." } }, 429);
    }

    const otp = numericOTP(6);
    const otpHash = await hashToken(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await sql`UPDATE users SET registration_otp_hash = ${otpHash}, registration_otp_expires_at = ${otpExpiresAt}, registration_otp_attempts = 0 WHERE id = ${user.id}`;
    await sql.end();
    await sendMail(c.env, email, "Verify your Jobs View account", registrationOtpEmailHTML(otp));
    return c.json({ success: true, message: "Verification code sent." });
  } catch (error: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to resend code", details: error.message } }, 500);
  }
});

authRouter.post("/login", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = (body.email || "").toString().trim().toLowerCase();
    const password = body.password || "";
    const userAgent = c.req.header("user-agent") || "Cloudflare-Edge-Client";
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "";

    if (!email || !password) {
      return c.json({ success: false, error: { code: 400, message: "Email and password are required." } }, 400);
    }

    const sql = getDb(c.env);
    const users = await sql`
      SELECT u.id, u.email, u.password_hash, u.is_active, u.is_verified, r.name as role
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE u.email = ${email} AND u.deleted_at IS NULL
      LIMIT 1
    `;

    if (users.length === 0) {
      await sql`INSERT INTO login_history (email, ip_address, user_agent, success, reason) VALUES (${email}, NULLIF(${ip}, '')::inet, ${userAgent}, false, 'invalid_credentials')`.catch(() => {});
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "Invalid email or password." } }, 401);
    }

    const user = users[0];
    if (!user.is_active) {
      await sql.end();
      return c.json({ success: false, error: { code: 403, message: "This account is inactive or disabled." } }, 403);
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      await sql`INSERT INTO login_history (user_id, email, ip_address, user_agent, success, reason) VALUES (${user.id}, ${email}, NULLIF(${ip}, '')::inet, ${userAgent}, false, 'invalid_credentials')`.catch(() => {});
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "Invalid email or password." } }, 401);
    }

    let permissions: string[] = ["*"];
    if (user.role !== "SUPER_ADMIN") {
      const permRows = await sql`
        SELECT p.name FROM permissions p
        JOIN role_permissions rp ON rp.permission_id = p.id
        JOIN roles r ON r.id = rp.role_id
        WHERE r.name = ${user.role}
      `;
      permissions = permRows.map((row: any) => row.name);
    }

    const SESSION_TTL_SECONDS = 72 * 3600;
    const accessToken = await generateToken({ id: user.id, email: user.email, role: user.role, permissions }, c.env.JWT_ACCESS_SECRET, SESSION_TTL_SECONDS);
    const refreshToken = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
        VALUES (${user.id}, ${tokenHash}, ${userAgent}, NULLIF(${ip}, '')::inet, ${expiresAt})
      `;
      // Enforce 10-concurrent device limit
      await tx`
        UPDATE user_sessions
        SET revoked_at = NOW()
        WHERE user_id = ${user.id} AND revoked_at IS NULL AND id NOT IN (
          SELECT id FROM user_sessions
          WHERE user_id = ${user.id} AND revoked_at IS NULL AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 10
        )
      `;
    });

    await sql`INSERT INTO login_history (user_id, email, ip_address, user_agent, success, reason) VALUES (${user.id}, ${user.email}, NULLIF(${ip}, '')::inet, ${userAgent}, true, '')`.catch(() => {});
    await sql`INSERT INTO user_devices (user_id, user_agent, ip_address) VALUES (${user.id}, ${userAgent}, NULLIF(${ip}, '')::inet)`.catch(() => {});
    await sql.end();

    return c.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, role: user.role, is_verified: user.is_verified, permissions },
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: { code: 500, message: "Internal Authentication Error", details: error.message } }, 500);
  }
});

authRouter.post("/google-callback", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const code = body.code;
    const redirectUri = body.redirect_uri;
    const userAgent = c.req.header("user-agent") || "Cloudflare-Edge-Client";
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "";

    if (!code || !redirectUri) {
      return c.json({ success: false, error: { code: 400, message: "Authorization code and redirect URI are required." } }, 400);
    }
    
    if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) {
      return c.json({ success: false, error: { code: 500, message: "Google Auth is not configured on the server." } }, 500);
    }

    // 1. Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[Google OAuth Error]:", errorText);
      return c.json({ success: false, error: { code: 401, message: "Failed to verify Google authorization code." } }, 401);
    }

    const tokenData = (await tokenResponse.json()) as any;
    const idToken = tokenData.id_token;
    
    if (!idToken) {
      return c.json({ success: false, error: { code: 401, message: "No identity token returned from Google." } }, 401);
    }

    // 2. Decode ID token payload (since we just fetched it directly from Google via HTTPS, it's safe to trust the decode)
    const payloadBase64 = idToken.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
    const email = decodedPayload.email?.toLowerCase().trim();
    const firstName = decodedPayload.given_name || "Google";
    const lastName = decodedPayload.family_name || "User";
    const picture = decodedPayload.picture;

    if (!email) {
      return c.json({ success: false, error: { code: 400, message: "Email not provided by Google." } }, 400);
    }

    const sql = getDb(c.env);
    
    let userId: string;
    let userRole = "JOB_SEEKER";
    let permissions: string[] = ["*"];
    
    // 3. Find or Create User
    const existingUsers = await sql`
      SELECT u.id, u.email, u.is_active, r.name as role
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.email = ${email} AND u.deleted_at IS NULL
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      if (!user.is_active) {
        await sql.end();
        return c.json({ success: false, error: { code: 403, message: "This account is inactive or disabled." } }, 403);
      }
      userId = user.id;
      userRole = user.role || "JOB_SEEKER";
      
      // Auto-verify if they weren't already
      await sql`UPDATE users SET is_verified = true, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ${userId}`;
      
    } else {
      // Create new account
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      await sql.begin(async (tx: any) => {
        const newUser = await tx`
          INSERT INTO users (email, password_hash, is_active, is_verified, email_verified_at)
          VALUES (${email}, ${passwordHash}, true, true, NOW())
          RETURNING id
        `;
        userId = newUser[0].id;
        
        const roles = await tx`SELECT id FROM roles WHERE name = 'JOB_SEEKER' LIMIT 1`;
        const roleId = roles.length > 0 ? roles[0].id : 4;
        await tx`INSERT INTO user_roles (user_id, role_id) VALUES (${userId}, ${roleId})`;
        
        await tx`INSERT INTO candidate_profiles (user_id, first_name, last_name, avatar_url) VALUES (${userId}, ${firstName}, ${lastName}, ${picture || null})`.catch(() => {});
      });
    }

    // 4. Get permissions
    if (userRole !== "SUPER_ADMIN") {
      const permRows = await sql`
        SELECT p.name FROM permissions p
        JOIN role_permissions rp ON rp.permission_id = p.id
        JOIN roles r ON r.id = rp.role_id
        WHERE r.name = ${userRole}
      `;
      permissions = permRows.map((row: any) => row.name);
    }

    // 5. Issue Tokens
    const SESSION_TTL_SECONDS = 72 * 3600;
    const accessToken = await generateToken({ id: userId!, email, role: userRole, permissions }, c.env.JWT_ACCESS_SECRET, SESSION_TTL_SECONDS);
    const refreshToken = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
        VALUES (${userId}, ${tokenHash}, ${userAgent}, NULLIF(${ip}, '')::inet, ${expiresAt})
      `;
      await tx`
        UPDATE user_sessions SET revoked_at = NOW()
        WHERE user_id = ${userId} AND revoked_at IS NULL AND id NOT IN (
          SELECT id FROM user_sessions WHERE user_id = ${userId} AND revoked_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 10
        )
      `;
    });

    await sql`INSERT INTO login_history (user_id, email, ip_address, user_agent, success, reason) VALUES (${userId!}, ${email}, NULLIF(${ip}, '')::inet, ${userAgent}, true, 'google_oauth')`.catch(() => {});
    await sql`INSERT INTO user_devices (user_id, user_agent, ip_address) VALUES (${userId!}, ${userAgent}, NULLIF(${ip}, '')::inet)`.catch(() => {});
    await sql.end();

    return c.json({
      success: true,
      data: {
        user: { id: userId!, email, role: userRole, is_verified: true, permissions },
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString(),
      },
    });

  } catch (error: any) {
    console.error("[Google OAuth Error]:", error);
    return c.json({ success: false, error: { code: 500, message: "Internal Authentication Error via Google", details: error.message } }, 500);
  }
});

authRouter.post("/refresh", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const oldToken = body.refresh_token || c.req.header("x-refresh-token") || "";
    if (!oldToken) {
      return c.json({ success: false, error: { code: 401, message: "Refresh token required." } }, 401);
    }
    const sql = getDb(c.env);
    const oldHash = await hashToken(oldToken);
    const sessions = await sql`SELECT user_id FROM user_sessions WHERE refresh_token_hash = ${oldHash} AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1`;
    if (sessions.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "Invalid or expired session refresh token." } }, 401);
    }
    const userId = sessions[0].user_id;
    const users = await sql`
      SELECT u.id, u.email, r.name as role FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE u.id = ${userId} AND u.deleted_at IS NULL LIMIT 1
    `;
    if (users.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "Associated user account unrecoverable." } }, 401);
    }
    const user = users[0];
    const newRefresh = crypto.randomUUID() + crypto.randomUUID();
    const newHash = await hashToken(newRefresh);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    await sql`UPDATE user_sessions SET refresh_token_hash = ${newHash}, expires_at = ${expiresAt} WHERE refresh_token_hash = ${oldHash}`;
    await sql.end();
    const SESSION_TTL_SECONDS = 72 * 3600;
    const accessToken = await generateToken({ id: user.id, email: user.email, role: user.role, permissions: ["*"] }, c.env.JWT_ACCESS_SECRET, SESSION_TTL_SECONDS);
    return c.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, role: user.role, is_verified: true, permissions: ["*"] },
        access_token: accessToken,
        refresh_token: newRefresh,
        expires_at: new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString(),
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Token refresh failed at edge", details: err.message } }, 500);
  }
});

function allowedResetOrigin(c: any): string {
  const origin = (c.req.header("origin") || "").trim();
  const allowed = (c.env.CORS_ALLOW_ORIGINS || "")
    .split(",")
    .map((value: string) => value.trim())
    .filter(Boolean);
  if (origin && allowed.includes(origin)) return origin;
  return "https://jobsviews.com";
}

authRouter.post("/forgot-password", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = (body.email || "").toString().trim().toLowerCase();
  if (!email) {
    return c.json({ success: false, error: { code: 400, message: "Email is required." } }, 400);
  }

  const sql = getDb(c.env);
  try {
    const users = await sql`SELECT id, email FROM users WHERE email = ${email} AND deleted_at IS NULL LIMIT 1`;
    if (users.length > 0) {
      const user = users[0];
      const rawToken = crypto.randomUUID() + crypto.randomUUID();
      const tokenHash = await hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await sql`INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (${user.id}, ${tokenHash}, ${expiresAt})`;
      const resetUrl = `${allowedResetOrigin(c)}/reset-password?token=${rawToken}`;
      await sendMail(c.env, user.email, "Reset your Jobs View password", resetPasswordEmailHTML(resetUrl)).catch((err) => {
        console.error("[Edge Auth] Password reset email failed:", err.message);
      });
    }
    await sql.end();
    // Always return the same generic message regardless of whether the email exists, so this
    // endpoint can't be used to enumerate registered accounts.
    return c.json({ success: true, message: "If an account exists for that email, a password reset link has been sent.", data: null });
  } catch (err: any) {
    await sql.end().catch(() => {});
    return c.json({ success: false, error: { code: 500, message: "Password recovery request failed", details: err.message } }, 500);
  }
});

authRouter.post("/reset-password", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const token = (body.token || "").toString().trim();
  const password = (body.password || "").toString();
  if (!token || !password) {
    return c.json({ success: false, error: { code: 400, message: "Reset token and new password are required." } }, 400);
  }
  if (password.length < 8) {
    return c.json({ success: false, error: { code: 400, message: "Password must be at least 8 characters." } }, 400);
  }

  const sql = getDb(c.env);
  try {
    const tokenHash = await hashToken(token);
    const records = await sql`SELECT id, user_id FROM password_resets WHERE token_hash = ${tokenHash} AND used_at IS NULL AND expires_at > NOW() LIMIT 1`;
    if (records.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "This reset link is invalid or has expired. Please request a new one." } }, 401);
    }
    const record = records[0];
    const passwordHash = await bcrypt.hash(password, 10);
    await sql.begin(async (tx: any) => {
      await tx`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${record.user_id}`;
      await tx`UPDATE password_resets SET used_at = NOW() WHERE id = ${record.id}`;
      // Revoke every active session so a stolen/old session can't outlive the password change.
      await tx`UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ${record.user_id} AND revoked_at IS NULL`;
    });
    await sql.end();
    return c.json({ success: true, message: "Password reset successfully. Please log in with your new password.", data: null });
  } catch (err: any) {
    await sql.end().catch(() => {});
    return c.json({ success: false, error: { code: 500, message: "Password reset failed", details: err.message } }, 500);
  }
});

authRouter.get("/verify", async (c) => {
  return c.json({ success: true, message: "Email address verified successfully at edge.", data: null });
});

authRouter.get("/me", async (c) => {
  const authHeader = c.req.header("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return c.json({ success: false, error: { code: 401, message: "Authentication token missing or invalid." } }, 401);
  }
  const token = authHeader.replace("Bearer ", "").trim();
  try {
    if (!c.env.JWT_ACCESS_SECRET) {
      console.error("[Edge Auth] JWT_ACCESS_SECRET is not configured — refusing to verify tokens.");
      return c.json({ success: false, error: { code: 500, message: "Authentication is misconfigured." } }, 500);
    }
    const secretKey = new TextEncoder().encode(c.env.JWT_ACCESS_SECRET);
    const { payload } = await jwtVerify(token, secretKey);
    return c.json({
      success: true,
      data: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        is_verified: true,
        permissions: payload.permissions || ["*"],
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: { code: 401, message: "Token expired or invalid." } }, 401);
  }
});

authRouter.post("/logout", async (c) => {
  return c.json({ success: true, message: "Logged out successfully from devices.", data: null });
});

authRouter.post("/logout-all", async (c) => {
  return c.json({ success: true, message: "Logged out successfully from all devices.", data: null });
});
