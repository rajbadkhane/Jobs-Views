import { Hono } from "hono";
import { getDb, Env } from "../db";

export const healthRouter = new Hono<{ Bindings: Env }>();

healthRouter.get("/live", (c) => {
  return c.json({
    success: true,
    message: "Cloudflare Edge Serverless API is completely live!",
    data: { status: "ok", runtime: "cloudflare_workers", zero_card_required: true },
  });
});

healthRouter.get("/health", async (c) => {
  let dbStatus = "ok";
  try {
    const sql = getDb(c.env);
    await sql`SELECT 1`;
    await sql.end();
  } catch (err: any) {
    dbStatus = `degraded: ${err.message}`;
  }
  return c.json({
    success: true,
    data: {
      status: dbStatus === "ok" ? "ok" : "degraded",
      database: dbStatus,
      edge_cache: "ok",
      serverless: "active",
    },
  });
});

healthRouter.get("/ready", async (c) => {
  return c.json({
    success: true,
    data: { status: "ok", edge: "ready" },
  });
});
