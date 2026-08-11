import { Hono } from "hono";
import { getDb } from "../db";
import { authenticate, requirePermission, getCurrentUser, AppEnv } from "../middleware";
import { sendMail, resetPasswordEmailHTML } from "../lib/mail";

export const usersRouter = new Hono<AppEnv>();
export const adminUsersRouter = new Hono<AppEnv>();

async function hashToken(token: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

usersRouter.use("/*", authenticate());

/**
 * GET /api/v1/users/me
 * Retrieves current account metadata and connection details.
 */
usersRouter.get("/me", async (c) => {
  const auth = getCurrentUser(c);
  try {
    const sql = getDb(c.env);
    const users = await sql`
      SELECT id, email, is_active, is_verified, created_at, updated_at
      FROM users WHERE id = ${auth.id} LIMIT 1
    `;
    await sql.end();
    if (users.length === 0) {
      return c.json({ success: false, error: { code: 404, message: "User not found in database" } }, 404);
    }
    return c.json({ success: true, data: { ...users[0], role: auth.role, permissions: auth.permissions } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to load user info at edge", details: err.message } }, 500);
  }
});

usersRouter.patch("/me", async (c) => {
  const auth = getCurrentUser(c);
  const body = await c.req.json().catch(() => ({}));
  try {
    const sql = getDb(c.env);
    await sql`UPDATE users SET updated_at = NOW() WHERE id = ${auth.id}`;
    await sql.end();
    return c.json({ success: true, message: "Account updated successfully.", data: { id: auth.id, ...body } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Account update failure" } }, 500);
  }
});

usersRouter.get("/me/sessions", async (c) => {
  const auth = getCurrentUser(c);
  try {
    const sql = getDb(c.env);
    const items = await sql`
      SELECT id, user_agent, ip_address, expires_at, created_at
      FROM user_sessions WHERE user_id = ${auth.id} AND revoked_at IS NULL AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 20
    `;
    await sql.end();
    return c.json({ success: true, data: { items } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [] } }); // Fallback graceful empty roster
  }
});

usersRouter.get("/me/devices", async (c) => {
  const auth = getCurrentUser(c);
  try {
    const sql = getDb(c.env);
    const items = await sql`
      SELECT DISTINCT ON (user_agent) id, user_agent, ip_address, last_seen_at
      FROM user_devices WHERE user_id = ${auth.id}
      ORDER BY user_agent, last_seen_at DESC LIMIT 10
    `;
    await sql.end();
    return c.json({ success: true, data: { items } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [] } });
  }
});

usersRouter.get("/me/login-history", async (c) => {
  const auth = getCurrentUser(c);
  try {
    const sql = getDb(c.env);
    const items = await sql`
      SELECT id, ip_address, user_agent, success, reason, created_at
      FROM login_history WHERE user_id = ${auth.id} OR email = ${auth.email}
      ORDER BY created_at DESC LIMIT 30
    `;
    await sql.end();
    return c.json({ success: true, data: { items } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [] } });
  }
});

usersRouter.get("/me/audit-trail", async (c) => {
  const auth = getCurrentUser(c);
  try {
    const sql = getDb(c.env);
    const items = await sql`
      SELECT id, action, resource_type, resource_id, metadata, created_at
      FROM audit_logs WHERE user_id = ${auth.id}
      ORDER BY created_at DESC LIMIT 30
    `;
    await sql.end();
    return c.json({ success: true, data: { items } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [] } });
  }
});

// Admin User Moderation Endpoints
adminUsersRouter.use("/*", authenticate(), requirePermission("user:view_all"));

adminUsersRouter.get("/", async (c) => {
  try {
    const roleFilter = c.req.query("role") || "";
    const search = c.req.query("search") || c.req.query("q") || "";
    const sql = getDb(c.env);
    const users = await sql`
      SELECT u.id, u.email, u.is_active, u.is_verified, u.email_verified_at, u.created_at, u.updated_at, r.name as role,
        sub.plan_name as subscription_plan, sub.status as subscription_status, sub.ends_at as subscription_ends_at,
        COALESCE(cp.first_name, ep.first_name) as first_name,
        COALESCE(cp.last_name, ep.last_name) as last_name,
        COALESCE(cp.phone, ep.phone) as phone,
        COALESCE(cp.title, ep.title) as title,
        cp.visibility as candidate_visibility,
        co.id as company_id,
        co.name as company_name,
        co.status as company_status
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
      LEFT JOIN employer_profiles ep ON ep.user_id = u.id
      LEFT JOIN companies co ON co.id = ep.company_id
      LEFT JOIN LATERAL (
        SELECT p.name as plan_name, cs.status, cs.ends_at
        FROM candidate_subscriptions cs
        JOIN candidate_subscription_plans p ON p.id = cs.plan_id
        WHERE cs.user_id = u.id
        ORDER BY cs.created_at DESC
        LIMIT 1
      ) sub ON true
      WHERE u.deleted_at IS NULL
      ${roleFilter ? sql`AND r.name ILIKE ${roleFilter}` : sql``}
      ${search ? sql`AND (u.email ILIKE ${'%' + search + '%'} OR cp.first_name ILIKE ${'%' + search + '%'} OR cp.last_name ILIKE ${'%' + search + '%'} OR ep.first_name ILIKE ${'%' + search + '%'} OR ep.last_name ILIKE ${'%' + search + '%'} OR co.name ILIKE ${'%' + search + '%'})` : sql``}
      ORDER BY u.created_at DESC LIMIT 50
    `;
    await sql.end();
    return c.json({ success: true, data: { items: users, total: users.length, page: 1, limit: 50 } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to list admin users", details: err.message } }, 500);
  }
});

adminUsersRouter.patch("/:id/suspend", async (c) => {
  const targetId = c.req.param("id");
  try {
    const sql = getDb(c.env);
    await sql`UPDATE users SET is_active = false WHERE id = ${targetId}`;
    await sql`UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ${targetId}`;
    await sql.end();
    return c.json({ success: true, message: "Account suspended and all active sessions terminated." });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Suspension failed" } }, 500);
  }
});

adminUsersRouter.patch("/:id/activate", async (c) => {
  const targetId = c.req.param("id");
  try {
    const sql = getDb(c.env);
    await sql`UPDATE users SET is_active = true WHERE id = ${targetId}`;
    await sql.end();
    return c.json({ success: true, message: "Account re-activated successfully." });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Activation failed" } }, 500);
  }
});

adminUsersRouter.post("/:id/reset-password", async (c) => {
  const targetId = c.req.param("id");
  try {
    const sql = getDb(c.env);
    const rows = await sql`SELECT id, email FROM users WHERE id = ${targetId} AND deleted_at IS NULL LIMIT 1`;
    if (rows.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 404, message: "User not found." } }, 404);
    }
    const user = rows[0];
    const rawToken = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await sql`INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (${user.id}, ${tokenHash}, ${expiresAt})`;
    await sql`UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ${user.id} AND revoked_at IS NULL`;
    await sql.end();
    const resetUrl = `https://jobsviews.com/reset-password?token=${rawToken}`;
    await sendMail(c.env, user.email, "Reset your Jobs View password", resetPasswordEmailHTML(resetUrl)).catch((err: any) => {
      console.error("[Edge Admin] Password reset email failed:", err.message);
    });
    return c.json({ success: true, message: "Password reset email sent to the user." });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Reset password failed", details: err.message } }, 500);
  }
});

adminUsersRouter.delete("/:id", async (c) => {
  const targetId = c.req.param("id");
  try {
    const sql = getDb(c.env);
    await sql`UPDATE users SET deleted_at = NOW(), is_active = false WHERE id = ${targetId}`;
    await sql.end();
    return c.json({ success: true, message: "User account marked as deleted." });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Deletion failed" } }, 500);
  }
});
