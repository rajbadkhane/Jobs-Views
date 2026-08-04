# Jobs View Render + Supabase Readiness

This project is ready to run the Go API on Render with Supabase PostgreSQL when the environment below is configured. Do not commit real secrets.

## Render API Service

- Runtime: Go
- Root directory: `apps/api`
- Build command: `go build -o jobs-view-api ./cmd/api`
- Start command: `./jobs-view-api`
- Health check path: `/ready`
- Blueprint: `render.yaml` at the repository root

## Required Environment

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
STORAGE_BASE_URL=https://<api-domain>/assets
```

Render injects `PORT`; do not set `SERVER_PORT` unless Render support or the service dashboard explicitly requires it.

## Supabase Notes

- Use the Supabase pooled or direct PostgreSQL connection string with `sslmode=require`.
- URL-encode special characters in the database password.
- Supabase transaction pooler connections commonly use port `6543`.
- Run migrations before public traffic reaches the API.
- Keep database backups enabled in Supabase.
- Ensure `gen_random_uuid()` is available. Supabase supports it through `pgcrypto`.

## Candidate Subscription Flow

- Candidate plan prices are stored in paise and snapshotted on every checkout order.
- Subscription OTP emails are sent through Resend to the authenticated account email.
- OTP values are hashed in PostgreSQL, expire after 10 minutes, and allow 5 attempts.
- Razorpay orders are created by the API after OTP verification.
- Payment signatures and captured payment details are verified server-side before activation.
- Configure the Razorpay webhook URL as `https://<api-domain>/api/v1/subscriptions/webhooks/razorpay` and subscribe to `payment.captured`, `payment.failed`, `order.paid`, and `refund.processed`.
- Webhook processing is idempotent through the `candidate_payment_events` table.
- Candidate subscriptions last 30 days and do not auto-renew.
