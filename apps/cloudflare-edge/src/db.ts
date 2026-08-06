import postgres from "postgres";
import { Redis } from "@upstash/redis";

export interface Env {
  DATABASE_URL: string;
  HYPERDRIVE?: {
    connectionString: string;
  };
  REDIS_URL?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  JWT_ACCESS_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  JWT_ISSUER?: string;
  CORS_ALLOW_ORIGINS?: string;
  BACKEND_ORIGIN?: string;
  EDGE_CACHE_TTL?: string;
  APP_ENV?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  RAZORPAY_API_BASE_URL?: string;
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/**
 * Creates an edge-resilient Postgres SQL client using Cloudflare Hyperdrive native connection pooler.
 * Created freshly per request invocation to conform to Cloudflare Worker I/O stream isolation rules while benefiting from instant edge pooling.
 */
export function getDb(env: Env): ReturnType<typeof postgres> {
  // Prioritize native Cloudflare Hyperdrive connection pooler string, fallback to direct Postgres URL
  const rawUrl = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL or HYPERDRIVE connection environment variable is missing");
  }

  // If using fallback DATABASE_URL without Hyperdrive, ensure port 5432 is used instead of 6543
  const targetUrl = env.HYPERDRIVE?.connectionString ? rawUrl : rawUrl.replace(":6543/", ":5432/");

  return postgres(targetUrl, {
    ssl: env.HYPERDRIVE?.connectionString ? false : "require", // Hyperdrive internally wraps SSL to origin
    max: 1, // Minimal local stream footprint per request, pooled globally by Cloudflare Hyperdrive
    fetch_types: false,
    prepare: false,
    onnotice: () => {},
  });
}

/**
 * Creates a lightweight HTTP client for Upstash Redis caching without TCP latency.
 */
export function getRedis(env: Env): Redis | null {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}
