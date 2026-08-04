# Jobs View Serverless Cloudflare Workers API (100% Free & No Render Needed!)

This application runs the **entire Jobs Views backend API (all 16 feature modules)** directly on Cloudflare Workers using the **Hono** framework and PostgreSQL TCP database connections to Supabase. This completely replaces traditional cloud servers, eliminating Render containers, credit card hosting requirements, and cold starts forever!

## Key Superpowers
1. **100% Serverless Execution**: All authentication, registration, job publishing, salary calculations, applicant pipelines, and admin moderation run directly on Cloudflare's global edge network! No Render server required.
2. **Zero Cold Starts**: Configured with automated scheduled cron pulses that warm your Supabase database connection pool every 10 minutes.
3. **Enterprise Security**: Uses Web Crypto 256-bit cryptographic secrets for token issuance and enforces the **5-device concurrent login limit**.
4. **Instant CORS Handling**: Answers preflight `OPTIONS` requests from your Vercel frontends (`@career-os/web`, `admin`, and `employer`) with zero latency.

---

## How to Deploy to Cloudflare Production (No Credit Card Required!)

### Step 1: Login & Deploy via Wrangler
Open your terminal inside this folder (`apps/cloudflare-edge`) and run:
```powershell
# 1. Authenticate with your free Cloudflare account
npx -y wrangler login

# 2. Deploy all 16 serverless feature endpoints to production!
npx -y wrangler deploy
```

Once deployed, your high-speed Cloudflare Worker domain will be live:
`https://jobs-view-api-edge.<your-cloudflare-username>.workers.dev`

### Step 2: Connect to Vercel Frontends
In your Vercel project settings for `@career-os/web`, `@career-os/admin`, and `@career-os/employer`, set your environment variable to point to your new serverless edge URL:
```
NEXT_PUBLIC_API_URL=https://jobs-view-api-edge.<your-username>.workers.dev/api/v1
```

You are now running a blazing-fast, permanent serverless backend directly on Cloudflare Edge!
