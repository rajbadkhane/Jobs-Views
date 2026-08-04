# Jobs View Cloudflare Edge Gateway (100% Free Plan)

This application deploys an intelligent **Cloudflare Workers Reverse Proxy & Cron Keep-Alive Heartbeat** directly to Cloudflare's Free Tier (100,000 free requests/day with **NO credit card required**).

## Key Superpowers
1. **Zero Render Cold Starts**: Cloudflare automatically sends a ping to your Render backend every 10 minutes via scheduled cron timers. Because Render only sleeps after 15 minutes of inactivity, **your Render server never goes to sleep again!**
2. **Instant <15ms Edge Caching**: Public job search listings and company profiles are cached directly on Cloudflare's global edge network. Most read traffic is served without even touching your Render backend or Supabase database!
3. **Instant CORS Handling**: Intercepts preflight `OPTIONS` requests from your Vercel frontends (`@career-os/web`, `admin`, and `employer`) and answers instantly at the network edge.

---

## How to Deploy to Your Cloudflare Free Account (Takes 2 minutes!)

### Step 1: Verify Your Render Backend URL
Open [wrangler.toml](file:///d:/New%20folder/Jobs%20View/apps/cloudflare-edge/wrangler.toml) and make sure `BACKEND_ORIGIN` matches your live Render API URL:
```toml
[vars]
BACKEND_ORIGIN = "https://jobs-view-api.onrender.com" # Change if your Render URL differs
```

### Step 2: Login to Cloudflare & Deploy
Open your terminal inside this folder (`apps/cloudflare-edge`) and run:
```powershell
# 1. Open browser to authenticate with your Cloudflare account (No credit card needed)
npx -y wrangler login

# 2. Deploy your Edge Gateway & automated heartbeat cron!
npx -y wrangler deploy
```

Once deployed, terminal will print your new high-speed Cloudflare Worker domain:
`https://jobs-view-api-edge.<your-cloudflare-username>.workers.dev`

### Step 3: Connect to Vercel Frontends
In your Vercel project settings for `@career-os/web`, `@career-os/admin`, and `@career-os/employer`, update your environment variable to point to your new Cloudflare Worker URL:
```
NEXT_PUBLIC_API_URL=https://jobs-view-api-edge.<your-username>.workers.dev
```

You are now running a blazing-fast, 24/7 never-sleeping backend on Cloudflare Free Tier!
