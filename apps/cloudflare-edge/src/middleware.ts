import { Context, Next } from "hono";
import { jwtVerify } from "jose";
import { Env } from "./db";

export interface AuthContext {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AppEnv {
  Bindings: Env;
  Variables: {
    user: AuthContext;
  };
}

/**
 * Edge JWT authentication middleware.
 * Verifies Bearer tokens via Web Crypto and populates active session metadata into Hono request variables.
 */
export const authenticate = () => async (c: Context<AppEnv>, next: Next) => {
  const authHeader = c.req.header("authorization") || c.req.header("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return c.json({ success: false, error: { code: 401, message: "Authentication required. Bearer token missing." } }, 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    if (!c.env.JWT_ACCESS_SECRET) {
      console.error("[Edge Auth] JWT_ACCESS_SECRET is not configured — refusing to verify tokens.");
      return c.json({ success: false, error: { code: 500, message: "Authentication is misconfigured." } }, 500);
    }
    const secretKey = new TextEncoder().encode(c.env.JWT_ACCESS_SECRET);
    const { payload } = await jwtVerify(token, secretKey);
    const user: AuthContext = {
      id: (payload.id || "").toString(),
      email: (payload.email || "").toString(),
      role: (payload.role || "").toString(),
      permissions: Array.isArray(payload.permissions) ? (payload.permissions as string[]) : ["*"],
    };
    c.set("user", user);
    await next();
  } catch (error: any) {
    return c.json({ success: false, error: { code: 401, message: "Session token invalid or expired." } }, 401);
  }
};

/**
 * Edge RBAC authorization middleware.
 * Grants immediate passage to Super Admins and verifies specific functional claims for standard roles.
 */
export const requirePermission = (permission: string) => async (c: Context<AppEnv>, next: Next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ success: false, error: { code: 401, message: "User identity unconfirmed." } }, 401);
  }
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.permissions.includes("*") || user.permissions.includes(permission)) {
    return next();
  }
  return c.json({ success: false, error: { code: 403, message: `Access denied. Requires permission claim: ${permission}` } }, 403);
};

/**
 * Helper to retrieve currently authenticated user id from Hono context
 */
export function getCurrentUser(c: Context<AppEnv>): AuthContext {
  return c.get("user") || { id: "", email: "", role: "JOB_SEEKER", permissions: [] };
}
