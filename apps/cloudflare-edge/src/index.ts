import { app } from "./router";
import { getDb, Env } from "./db";

export default {
  /**
   * Main HTTP Serverless Handler execution via Hono Edge Router
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  /**
   * Free Cron Trigger Handler: Runs every 10 minutes (configured in wrangler.toml)
   * Executes a lightweight heartbeat directly against Supabase database pooler to keep Postgres connections warm and eliminate cold starts!
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      const sql = getDb(env);
      await sql`SELECT 1 as heartbeat`;
      await sql.end();
      console.log(`[Edge Heartbeat] Successfully warmed database connection pool at ${new Date().toISOString()}`);
    } catch (error: any) {
      console.error(`[Edge Heartbeat] Database warming pulse encountered an issue:`, error.message);
    }
  },
};
