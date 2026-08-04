import { app } from "./router";
import { Env } from "./db";

export default {
  /**
   * Main HTTP Serverless Handler execution via Hono Edge Router
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  /**
   * Free Cron Trigger Handler: Runs every 10 minutes (configured in wrangler.toml)
   * Sends a heartbeat pulse to legacy Render fallback services to eliminate cold start delays during gradual transition.
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      const originBase = env.BACKEND_ORIGIN ? env.BACKEND_ORIGIN.replace(/\/$/, "") : "https://jobs-view-api.onrender.com";
      const healthUrl = `${originBase}/ready`;
      const res = await fetch(healthUrl, {
        method: "GET",
        headers: { "User-Agent": "Cloudflare-Worker-KeepAlive-Heartbeat/2.0" },
      });
      console.log(`[Heartbeat] Pinged ${healthUrl} -> Status: ${res.status}`);
    } catch (error: any) {
      console.error(`[Heartbeat] Failed to ping Render fallback origin:`, error.message);
    }
  },
};
