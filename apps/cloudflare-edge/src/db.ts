import postgres from "postgres";
import { Redis } from "@upstash/redis";

export interface Env {
  DATABASE_URL: string;
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
}

/**
 * Creates an edge-resilient Postgres SQL client for Supabase pooler connections.
 * Disables prepared statements (`prepare: false`) for seamless transaction pooling compatibility.
 */
export function getDb(env: Env) {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is missing");
  }
  return postgres(env.DATABASE_URL, {
    ssl: "require",
    max: 1, // Keep connection footprint minimal per lightweight edge invocation
    fetch_types: false,
    prepare: false,
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
