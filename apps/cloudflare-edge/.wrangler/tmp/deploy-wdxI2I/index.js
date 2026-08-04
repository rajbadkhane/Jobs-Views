var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var ALLOWED_HEADERS = "Content-Type, Authorization, X-Requested-With, X-Release-Candidate, Accept";
var EXPOSED_HEADERS = "X-Cloudflare-Edge-Cache, X-Response-Time, Content-Length";
var index_default = {
  /**
   * Free Cron Trigger Handler: Runs every 10 minutes (configured in wrangler.toml)
   * Sends a lightweight probe to Render to prevent the server from falling asleep after 15 minutes of inactivity.
   */
  async scheduled(event, env, ctx) {
    try {
      const healthUrl = `${env.BACKEND_ORIGIN.replace(/\/$/, "")}/ready`;
      const res = await fetch(healthUrl, {
        method: "GET",
        headers: { "User-Agent": "Cloudflare-Worker-KeepAlive-Heartbeat/1.0" }
      });
      console.log(`[Heartbeat] Pinged ${healthUrl} -> Status: ${res.status}`);
    } catch (error) {
      console.error(`[Heartbeat] Failed to ping Render origin:`, error.message);
    }
  },
  /**
   * Main HTTP Edge Reverse Proxy Handler
   */
  async fetch(request, env, ctx) {
    const originHeader = request.headers.get("Origin") || "*";
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": originHeader,
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": ALLOWED_HEADERS,
          "Access-Control-Expose-Headers": EXPOSED_HEADERS,
          "Access-Control-Max-Age": "86400",
          "Access-Control-Allow-Credentials": "true"
        }
      });
    }
    const url = new URL(request.url);
    const originBase = env.BACKEND_ORIGIN ? env.BACKEND_ORIGIN.replace(/\/$/, "") : "https://jobs-view-api.onrender.com";
    const targetUrl = `${originBase}${url.pathname}${url.search}`;
    const isGet = request.method === "GET";
    const hasAuth = request.headers.has("Authorization") || request.headers.has("Cookie");
    const isPublicRoute = url.pathname.startsWith("/v1/jobs") || url.pathname.startsWith("/v1/companies") || url.pathname.startsWith("/v1/news") || url.pathname.startsWith("/v1/public");
    const shouldCache = isGet && !hasAuth && isPublicRoute;
    if (shouldCache) {
      const cache = caches.default;
      const cacheKey = new Request(targetUrl, { method: "GET" });
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const hitResponse = new Response(cachedResponse.body, cachedResponse);
        hitResponse.headers.set("X-Cloudflare-Edge-Cache", "HIT");
        hitResponse.headers.set("Access-Control-Allow-Origin", originHeader);
        hitResponse.headers.set("Access-Control-Allow-Credentials", "true");
        return hitResponse;
      }
      const upstreamReq = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        redirect: "follow"
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
          headers: cacheableHeaders
        });
        ctx.waitUntil(cache.put(cacheKey, cacheableResponse));
        const missResponse = new Response(upstreamRes.body, upstreamRes);
        missResponse.headers.set("X-Cloudflare-Edge-Cache", "MISS");
        missResponse.headers.set("Access-Control-Allow-Origin", originHeader);
        missResponse.headers.set("Access-Control-Allow-Credentials", "true");
        return missResponse;
      }
      return enhanceCors(upstreamRes, originHeader);
    }
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: ["GET", "HEAD"].includes(request.method) ? void 0 : request.body,
      redirect: "follow"
    });
    const backendResponse = await fetch(proxyRequest);
    const finalResponse = enhanceCors(backendResponse, originHeader);
    finalResponse.headers.set("X-Cloudflare-Edge-Cache", "BYPASS");
    return finalResponse;
  }
};
function enhanceCors(response, origin) {
  const enhanced = new Response(response.body, response);
  enhanced.headers.set("Access-Control-Allow-Origin", origin);
  enhanced.headers.set("Access-Control-Allow-Credentials", "true");
  enhanced.headers.set("Access-Control-Expose-Headers", EXPOSED_HEADERS);
  return enhanced;
}
__name(enhanceCors, "enhanceCors");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
