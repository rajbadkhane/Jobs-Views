import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env } from "./db";
import { authRouter } from "./handlers/auth_handler";
import { jobsRouter, adminJobsRouter } from "./handlers/jobs_handler";
import { healthRouter } from "./handlers/health_handler";

export const app = new Hono<{ Bindings: Env }>();

/**
 * Configure comprehensive CORS handling for production domains, Vercel preview subdomains, and local dev environments
 */
app.use("*", cors({
  origin: (origin, c) => {
    if (!origin) return "https://jobsviews.com";
    const allowedList = c.env.CORS_ALLOW_ORIGINS
      ? c.env.CORS_ALLOW_ORIGINS.split(",").map((o: string) => o.trim())
      : [
          "https://jobsviews.com",
          "https://www.jobsviews.com",
          "https://admin.jobsviews.com",
        ];
    if (allowedList.includes(origin) || origin.includes("localhost:") || origin.endsWith(".vercel.app")) {
      return origin;
    }
    return "https://jobsviews.com";
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: [
    "Origin",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Request-ID",
    "X-Refresh-Token",
    "X-Requested-With",
    "X-Release-Candidate",
    "CF-Connecting-IP",
    "X-Forwarded-For",
  ],
  exposeHeaders: [
    "X-Cloudflare-Edge-Cache",
    "X-Response-Time",
    "Content-Length",
    "X-Request-ID",
  ],
  maxAge: 86400,
}));

// Mount native Cloudflare Edge Serverless Routes
app.route("/api/v1/auth", authRouter);
app.route("/auth", authRouter);

app.route("/api/v1/jobs", jobsRouter);
app.route("/jobs", jobsRouter);

app.route("/api/v1/admin/jobs", adminJobsRouter);
app.route("/admin/jobs", adminJobsRouter);

app.route("/api/v1", healthRouter);
app.route("/", healthRouter);

/**
 * Progressive migration fallback proxy:
 * Forward any un-migrated complex endpoints (e.g. bulk salary import, razorpay webhooks) seamlessly to legacy Render backend
 */
app.all("*", async (c) => {
  try {
    const url = new URL(c.req.url);
    const originBase = c.env.BACKEND_ORIGIN
      ? c.env.BACKEND_ORIGIN.replace(/\/$/, "")
      : "https://jobs-view-api.onrender.com";
    const targetUrl = `${originBase}${url.pathname}${url.search}`;

    const proxyRequest = new Request(targetUrl, {
      method: c.req.method,
      headers: c.req.header(),
      body: ["GET", "HEAD"].includes(c.req.method) ? undefined : await c.req.blob(),
      redirect: "follow",
    });

    const backendRes = await fetch(proxyRequest);
    const proxyRes = new Response(backendRes.body, backendRes);
    proxyRes.headers.set("X-Cloudflare-Edge-Cache", "FALLBACK_PROXY");
    return proxyRes;
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: {
          code: 503,
          message: "Legacy backend service is currently sleeping or suspended. Native edge routes remain 100% operational.",
          details: error.message,
        },
      },
      503
    );
  }
});
