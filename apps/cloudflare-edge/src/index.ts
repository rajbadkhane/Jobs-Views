export interface Env {
  BACKEND_ORIGIN: string;
  EDGE_CACHE_TTL: string;
  APP_ENV?: string;
  CORS_ALLOW_ORIGINS?: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  JWT_ACCESS_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  JWT_ISSUER?: string;
  MAIL_PROVIDER?: string;
  MAIL_FROM?: string;
  RESEND_API_KEY?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  RAZORPAY_API_BASE_URL?: string;
  RATE_LIMIT_MAX?: string;
  SERVER_HOST?: string;
  STORAGE_PROVIDER?: string;
  STORAGE_BUCKET?: string;
}

/**
 * Jobs View Cloudflare Edge Gateway & Keep-Alive Heartbeat Engine
 * - Prevents Render Free Tier cold starts via automated cron timers
 * - Serves public searches directly from Cloudflare Edge cache in <15ms
 * - Handles CORS preflight requests instantaneously without server CPU load
 * - Fully synchronized with Render production environment variables
 */

const ALLOWED_HEADERS = "Content-Type, Authorization, X-Requested-With, X-Release-Candidate, Accept";
const EXPOSED_HEADERS = "X-Cloudflare-Edge-Cache, X-Response-Time, Content-Length";

function resolveAllowedOrigin(request: Request, env: Env): string {
  const reqOrigin = request.headers.get("Origin");
  if (!reqOrigin) return "*";

  const allowedList = env.CORS_ALLOW_ORIGINS
    ? env.CORS_ALLOW_ORIGINS.split(",").map((o) => o.trim())
    : ["https://jobsviews.com", "https://www.jobsviews.com"];

  // Allow if exact match, or if running local dev / preview subdomain
  if (allowedList.includes(reqOrigin) || reqOrigin.includes("localhost:") || reqOrigin.endsWith(".vercel.app")) {
    return reqOrigin;
  }

  // Fallback to primary production domain if untrusted origin
  return "https://jobsviews.com";
}

export default {
  /**
   * Free Cron Trigger Handler: Runs every 10 minutes (configured in wrangler.toml)
   * Sends a lightweight probe to Render to prevent the server from falling asleep after 15 minutes of inactivity.
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      const originBase = env.BACKEND_ORIGIN ? env.BACKEND_ORIGIN.replace(/\/$/, "") : "https://jobs-view-api.onrender.com";
      const healthUrl = `${originBase}/ready`;
      const res = await fetch(healthUrl, {
        method: "GET",
        headers: { "User-Agent": "Cloudflare-Worker-KeepAlive-Heartbeat/1.0" },
      });
      console.log(`[Heartbeat] Pinged ${healthUrl} -> Status: ${res.status}`);
    } catch (error: any) {
      console.error(`[Heartbeat] Failed to ping Render origin:`, error.message);
    }
  },

  /**
   * Main HTTP Edge Reverse Proxy Handler
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsOrigin = resolveAllowedOrigin(request, env);

    // 1. Handle CORS Preflight (OPTIONS) requests instantly at the Edge
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": ALLOWED_HEADERS,
          "Access-Control-Expose-Headers": EXPOSED_HEADERS,
          "Access-Control-Max-Age": "86400",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    const url = new URL(request.url);
    const originBase = env.BACKEND_ORIGIN ? env.BACKEND_ORIGIN.replace(/\/$/, "") : "https://jobs-view-api.onrender.com";
    const targetUrl = `${originBase}${url.pathname}${url.search}`;

    // 2. Determine if this request qualifies for Cloudflare Edge Caching
    // Cache only read-only GET requests on public catalog endpoints without authentication cookies or tokens
    const isGet = request.method === "GET";
    const hasAuth = request.headers.has("Authorization") || request.headers.has("Cookie");
    const isPublicRoute = 
      url.pathname.startsWith("/v1/jobs") ||
      url.pathname.startsWith("/v1/companies") ||
      url.pathname.startsWith("/v1/news") ||
      url.pathname.startsWith("/v1/public");

    const shouldCache = isGet && !hasAuth && isPublicRoute;

    if (shouldCache) {
      const cache = (caches as any).default;
      const cacheKey = new Request(targetUrl, { method: "GET" });
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        const hitResponse = new Response(cachedResponse.body, cachedResponse);
        hitResponse.headers.set("X-Cloudflare-Edge-Cache", "HIT");
        hitResponse.headers.set("Access-Control-Allow-Origin", corsOrigin);
        hitResponse.headers.set("Access-Control-Allow-Credentials", "true");
        return hitResponse;
      }

      const upstreamReq = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        redirect: "follow",
      });

      const upstreamRes = await fetch(upstreamReq);

      if (upstreamRes.ok && upstreamRes.status === 200) {
        const ttl = Number(env.EDGE_CACHE_TTL || "180");
        const cacheableHeaders = new Headers(upstreamRes.headers);
        cacheableHeaders.set("Cache-Control", `public, max-age=${ttl}, s-maxage=${ttl}`);
        cacheableHeaders.delete("Set-Cookie");

        const cacheableResponse = new Response(upstreamRes.clone().body, {
          status: upstreamRes.status,
          statusText: upstreamRes.statusText,
          headers: cacheableHeaders,
        });

        ctx.waitUntil(cache.put(cacheKey, cacheableResponse));

        const missResponse = new Response(upstreamRes.body, upstreamRes);
        missResponse.headers.set("X-Cloudflare-Edge-Cache", "MISS");
        missResponse.headers.set("Access-Control-Allow-Origin", corsOrigin);
        missResponse.headers.set("Access-Control-Allow-Credentials", "true");
        return missResponse;
      }

      return enhanceCors(upstreamRes, corsOrigin);
    }

    // 3. Non-cacheable mutations or authenticated user requests (Proxy cleanly to Render)
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "follow",
    });

    const backendResponse = await fetch(proxyRequest);
    const finalResponse = enhanceCors(backendResponse, corsOrigin);
    finalResponse.headers.set("X-Cloudflare-Edge-Cache", "BYPASS");
    return finalResponse;
  },
};

/**
 * Helper to ensure consistent CORS headers on upstream responses
 */
function enhanceCors(response: Response, origin: string): Response {
  const enhanced = new Response(response.body, response);
  enhanced.headers.set("Access-Control-Allow-Origin", origin);
  enhanced.headers.set("Access-Control-Allow-Credentials", "true");
  enhanced.headers.set("Access-Control-Expose-Headers", EXPOSED_HEADERS);
  return enhanced;
}
