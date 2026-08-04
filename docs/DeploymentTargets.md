# Jobs View Deployment Targets

Jobs View production is split across three managed platforms:

- Backend API: Render web service
- Database: Supabase PostgreSQL
- Frontend apps: Vercel projects for web, employer, and admin

Do not commit real secrets. Configure all secrets in the Render, Supabase, and Vercel dashboards.

## 1. Supabase PostgreSQL

Create a Supabase project and copy the PostgreSQL connection string.

Use the Supabase direct connection string or transaction pooler connection string in Render. For the transaction pooler, use:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<url-encoded-password>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
```

Required notes:

- Keep `sslmode=require`.
- URL-encode special characters in the database password.
- Run `apps/api/migrations/*.up.sql` before opening public traffic.
- Run seed files only for intended baseline data.
- Enable backups in Supabase before production launch.

## 2. Render Backend

The root `render.yaml` defines the `jobs-view-api` web service.

Render settings:

```text
Service type: Web Service
Runtime: Go
Root directory: apps/api
Build command: go build -o jobs-view-api ./cmd/api
Start command: ./jobs-view-api
Health check path: /ready
```

Render injects `PORT`; do not set `SERVER_PORT` manually unless you know the value Render expects. The API config reads `PORT` when `SERVER_PORT` is absent.

Required Render environment variables:

```env
APP_ENV=production
SERVER_HOST=0.0.0.0
DATABASE_URL=postgresql://postgres.<project-ref>:<url-encoded-password>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
REDIS_URL=rediss://default:<password>@<upstash-host>:6379
JWT_ACCESS_SECRET=<32+ character secret>
JWT_REFRESH_SECRET=<32+ character secret>
JWT_ISSUER=jobs-view-api
CORS_ALLOW_ORIGINS=https://<web-domain>,https://<admin-domain>,https://<employer-domain>
MAIL_PROVIDER=resend
MAIL_FROM=Jobs View <no-reply@your-domain.com>
RESEND_API_KEY=<resend-api-key>
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
RAZORPAY_WEBHOOK_SECRET=<razorpay-webhook-secret>
RAZORPAY_API_BASE_URL=https://api.razorpay.com/v1
STORAGE_PROVIDER=local
STORAGE_BUCKET=jobs-view-assets
STORAGE_BASE_URL=https://<render-api-domain>/assets
RESUME_BUILDER_TEST_EMAILS=
```

Production validation will fail if:

- JWT secrets are shorter than 32 characters.
- `CORS_ALLOW_ORIGINS` contains localhost or `*`.
- `MAIL_PROVIDER=resend` but `RESEND_API_KEY` is missing.
- Razorpay secrets are missing.
- `RESUME_BUILDER_TEST_EMAILS` is set in production.

## 3. Vercel Frontend Apps

Create three Vercel projects from the same GitHub repo. Keep each project root as the repository root so workspace packages remain available.

### Web App

```text
Framework: Next.js
Root directory: .
Install command: npm install
Build command: npm run build -w @career-os/web
Output directory: apps/web/.next
```

Environment variables:

```env
NEXT_PUBLIC_API_URL=https://<render-api-domain>/api/v1
NEXT_PUBLIC_SITE_URL=https://<web-domain>
NEXT_PUBLIC_EMPLOYER_URL=https://<employer-domain>
NEXT_PUBLIC_ADMIN_URL=https://<admin-domain>
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_RELEASE=production
NEXT_PUBLIC_RAZORPAY_KEY_ID=<razorpay-key-id>
```

### Employer App

```text
Framework: Next.js
Root directory: .
Install command: npm install
Build command: npm run build -w @career-os/employer
Output directory: apps/employer/.next
```

Environment variables:

```env
NEXT_PUBLIC_API_URL=https://<render-api-domain>/api/v1
NEXT_PUBLIC_SITE_URL=https://<web-domain>
NEXT_PUBLIC_EMPLOYER_URL=https://<employer-domain>
NEXT_PUBLIC_ADMIN_URL=https://<admin-domain>
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_RELEASE=production
NEXT_PUBLIC_RAZORPAY_KEY_ID=<razorpay-key-id>
```

### Admin App

```text
Framework: Next.js
Root directory: .
Install command: npm install
Build command: npm run build -w @career-os/admin
Output directory: apps/admin/.next
```

Environment variables:

```env
NEXT_PUBLIC_API_URL=https://<render-api-domain>/api/v1
NEXT_PUBLIC_SITE_URL=https://<web-domain>
NEXT_PUBLIC_EMPLOYER_URL=https://<employer-domain>
NEXT_PUBLIC_ADMIN_URL=https://<admin-domain>
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_RELEASE=production
NEXT_PUBLIC_RAZORPAY_KEY_ID=<razorpay-key-id>
```

## 4. Deployment Order

1. Create Supabase project.
2. Run migrations and required seed SQL.
3. Create Redis service and copy `REDIS_URL`.
4. Create Render web service from GitHub using `render.yaml`.
5. Set Render secrets and deploy API.
6. Confirm `https://<render-api-domain>/ready` returns healthy.
7. Create the three Vercel projects from the same GitHub repo.
8. Set Vercel environment variables.
9. Deploy web, employer, and admin.
10. Update Render `CORS_ALLOW_ORIGINS` with the final Vercel/custom domains.
11. Redeploy Render after final CORS changes.

## 5. Smoke Test

Use these checks after deploy:

```text
GET https://<render-api-domain>/health
GET https://<render-api-domain>/ready
GET https://<render-api-domain>/api/v1/jobs
Open https://<web-domain>
Open https://<employer-domain>/employer/login
Open https://<admin-domain>/admin/login
```

If browser requests fail while the API health endpoint works, check `CORS_ALLOW_ORIGINS` first.
