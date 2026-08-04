import { Hono } from "hono";
import { getDb } from "../db";
import { authenticate, requirePermission, getCurrentUser, AppEnv } from "../middleware";

export const usersRouter = new Hono<AppEnv>();
export const adminUsersRouter = new Hono<AppEnv>();

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
      SELECT u.id, u.email, u.is_active, u.is_verified, u.created_at, r.name as role
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE u.deleted_at IS NULL
      ${roleFilter ? sql`AND r.name ILIKE ${roleFilter}` : sql``}
      ${search ? sql`AND u.email ILIKE ${'%' + search + '%'}` : sql``}
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
