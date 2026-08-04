import { Context, Next } from "hono";
import { jwtVerify } from "jose";
import { Env } from "./db";

const DEFAULT_SECRET = "jv_prod_jwt_access_8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e";

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
    const secretKey = new TextEncoder().encode(c.env.JWT_ACCESS_SECRET || DEFAULT_SECRET);
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
