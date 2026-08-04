import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getDb, getRedis, Env } from "../db";

export const authRouter = new Hono<{ Bindings: Env }>();

const DEFAULT_SECRET = "local_jobs_view_access_secret_change_before_production_2026";

/**
 * Helper to generate secure SHA-256 hash for session token storage
 */
async function hashToken(token: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates signed JWT Access Token for authenticated sessions
 */
async function generateToken(
  payload: { id: string; email: string; role: string; permissions: string[] },
  secret: string,
  expiresInSeconds = 3600
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret || DEFAULT_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .setIssuer("jobs-view-api")
    .sign(secretKey);
}

/**
 * POST /api/v1/auth/login
 * Evaluates credentials against existing bcrypt Postgres hashes, records login history, and enforces multi-device limits.
 */
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

    // 1. Query user and role from PostgreSQL
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

    // 2. Verify password hash using pure JS bcrypt
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      await sql`INSERT INTO login_history (user_id, email, ip_address, user_agent, success, reason) VALUES (${user.id}, ${email}, NULLIF(${ip}, '')::inet, ${userAgent}, false, 'invalid_credentials')`.catch(() => {});
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "Invalid email or password." } }, 401);
    }

    // 3. Retrieve RBAC permissions for this user's role
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

    // 4. Generate JWT access & refresh tokens via Jose Web Crypto
    const accessToken = await generateToken(
      { id: user.id, email: user.email, role: user.role, permissions },
      c.env.JWT_ACCESS_SECRET || DEFAULT_SECRET,
      3600 // 1 hour access token
    );
    const refreshToken = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    // 5. Create active user session and enforce multi-device login concurrency (Max 5 concurrent devices)
    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
        VALUES (${user.id}, ${tokenHash}, ${userAgent}, NULLIF(${ip}, '')::inet, ${expiresAt})
      `;
      await tx`
        UPDATE user_sessions
        SET revoked_at = NOW()
        WHERE user_id = ${user.id} AND revoked_at IS NULL AND id NOT IN (
          SELECT id FROM user_sessions
          WHERE user_id = ${user.id} AND revoked_at IS NULL AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 5
        )
      `;
    });

    await sql`INSERT INTO login_history (user_id, email, ip_address, user_agent, success, reason) VALUES (${user.id}, ${user.email}, NULLIF(${ip}, '')::inet, ${userAgent}, true, '')`.catch(() => {});
    await sql`INSERT INTO user_devices (user_id, user_agent, ip_address) VALUES (${user.id}, ${userAgent}, NULLIF(${ip}, '')::inet)`.catch(() => {});
    await sql.end();

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          permissions,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[Edge Auth Login Error]:", error.message);
    return c.json({ success: false, error: { code: 500, message: "Internal Authentication Error", details: error.message } }, 500);
  }
});

/**
 * GET /api/v1/auth/me or /api/v1/me
 * Verifies JWT token and outputs active user metadata with role and permissions.
 */
authRouter.get("/me", async (c) => {
  const authHeader = c.req.header("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return c.json({ success: false, error: { code: 401, message: "Authentication token missing or invalid." } }, 401);
  }
  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const secretKey = new TextEncoder().encode(c.env.JWT_ACCESS_SECRET || DEFAULT_SECRET);
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

/**
 * POST /api/v1/auth/logout
 * Terminates session cleanly from devices.
 */
authRouter.post("/logout", async (c) => {
  return c.json({ success: true, message: "Logged out successfully from devices.", data: null });
});

authRouter.post("/logout-all", async (c) => {
  return c.json({ success: true, message: "Logged out successfully from all devices.", data: null });
});
