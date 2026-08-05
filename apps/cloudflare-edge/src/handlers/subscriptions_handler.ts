import { Hono } from "hono";
import { getDb, Env } from "../db";
import { authenticate, getCurrentUser, AppEnv } from "../middleware";
import * as razorpay from "../lib/razorpay";
import { sendMail, otpEmailHTML } from "../lib/mail";

export const subscriptionsRouter = new Hono<AppEnv>();
export const checkoutRouter = new Hono<AppEnv>();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const defaultPlans = [
  {
    id: 1,
    name: "Basic",
    slug: "basic",
    price_paise: 60000,
    currency: "INR",
    duration_days: 30,
    application_limit: 10,
    entitlements: {
      saved_jobs: true,
      application_tracking: true,
      career_guidance: "standard",
      education: "standard",
      resume_builder: "basic",
      support: "standard",
      salary_insights: false,
      interview_prep: false
    }
  },
  {
    id: 2,
    name: "Premium",
    slug: "premium",
    price_paise: 120000,
    currency: "INR",
    duration_days: 30,
    application_limit: null,
    entitlements: {
      saved_jobs: true,
      application_tracking: true,
      career_guidance: "advanced",
      education: "advanced",
      resume_builder: "complete",
      resume_checks: true,
      support: "priority",
      salary_insights: true,
      interview_prep: true
    }
  }
];

async function hashOTP(value: string): Promise<string> {
  const buf = new TextEncoder().encode(value.trim());
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function numericOTP(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => (b % 10).toString()).join("");
}

function safeNext(value?: string): string {
  const next = (value || "").trim();
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function maskEmail(value: string): string {
  const parts = value.trim().split("@");
  if (parts.length !== 2 || parts[0].length < 2) return value;
  return parts[0][0] + "*".repeat(parts[0].length - 1) + "@" + parts[1];
}

function requireCandidate(c: any): { ok: true } | { ok: false; res: Response } {
  const user = getCurrentUser(c);
  if (user.role !== "JOB_SEEKER") {
    return { ok: false, res: c.json({ success: false, error: { code: 403, message: "A candidate account is required for this subscription." } }, 403) };
  }
  return { ok: true };
}

function checkoutResponse(order: any, keyId: string) {
  return {
    checkout_id: order.id,
    razorpay_order_id: order.provider_order_id || "",
    razorpay_key_id: keyId,
    amount_paise: order.amount_paise,
    currency: order.currency,
    plan_slug: order.plan_slug,
    plan_name: order.plan_name,
    email: order.email,
    next: order.next_path,
  };
}

const ORDER_SELECT = `
  SELECT o.id, o.user_id, p.id as plan_id, p.name as plan_name, p.slug as plan_slug, o.email, o.next_path,
    o.status, o.amount_paise, o.currency, o.duration_days, o.application_limit, o.entitlements,
    o.otp_hash, o.otp_expires_at, o.otp_attempts, o.otp_verified_at,
    COALESCE(o.provider_order_id, '') as provider_order_id, COALESCE(o.provider_payment_id, '') as provider_payment_id,
    o.created_at
  FROM candidate_subscription_orders o
  JOIN candidate_subscription_plans p ON p.id = o.plan_id
`;

function statusFromActive(item: any) {
  let remaining: number | null = null;
  if (item.application_limit != null) {
    remaining = Math.max(0, item.application_limit - item.applications_used);
  }
  return {
    active: true,
    status: item.status,
    plan: {
      id: item.plan_id,
      name: item.plan_name,
      slug: item.plan_slug,
      price_paise: item.price_paise,
      currency: item.currency,
      duration_days: Math.round((new Date(item.ends_at).getTime() - new Date(item.starts_at).getTime()) / 86400000),
      application_limit: item.application_limit,
      entitlements: item.entitlements,
    },
    starts_at: item.starts_at,
    ends_at: item.ends_at,
    entitlements: item.entitlements,
    applications_used: item.applications_used,
    applications_remaining: remaining,
  };
}

async function currentActiveSubscription(sql: any, userId: string) {
  const rows = await sql`
    SELECT s.id, s.user_id, p.id as plan_id, p.name as plan_name, p.slug as plan_slug, s.status,
      s.price_paise, s.currency, s.application_limit, s.entitlements, s.starts_at, s.ends_at,
      (SELECT count(*) FROM applications a WHERE a.candidate_user_id = s.user_id AND a.deleted_at IS NULL AND a.created_at >= s.starts_at AND a.created_at < s.ends_at) as applications_used
    FROM candidate_subscriptions s
    JOIN candidate_subscription_plans p ON p.id = s.plan_id
    WHERE s.user_id = ${userId} AND s.status = 'active' AND s.ends_at > NOW()
    ORDER BY s.created_at DESC LIMIT 1
  `;
  return rows[0] || null;
}

/**
 * Activates a paid subscription for an order. Idempotent: replays (webhook + client verify racing,
 * or webhook firing twice) are safe because an already-'paid' order short-circuits to the current subscription.
 */
async function activateOrder(sql: any, providerOrderId: string, providerPaymentId: string) {
  return sql.begin(async (tx: any) => {
    const orders = await tx.unsafe(ORDER_SELECT + ` WHERE o.provider_order_id = $1 FOR UPDATE`, [providerOrderId]);
    if (orders.length === 0) return null;
    const order = orders[0];

    if (order.status === "paid") {
      return currentActiveSubscription(tx, order.user_id);
    }
    if (order.status !== "payment_pending") {
      return null;
    }

    await tx`
      UPDATE candidate_subscriptions SET status = CASE WHEN ends_at <= NOW() THEN 'expired' ELSE 'cancelled' END
      WHERE user_id = ${order.user_id} AND status = 'active'
    `;
    await tx`
      UPDATE candidate_subscription_orders SET status = 'paid', provider_payment_id = ${providerPaymentId}, paid_at = NOW()
      WHERE id = ${order.id}
    `;
    await tx`
      INSERT INTO candidate_subscriptions (user_id, plan_id, order_id, price_paise, currency, application_limit, entitlements, starts_at, ends_at)
      VALUES (${order.user_id}, ${order.plan_id}, ${order.id}, ${order.amount_paise}, ${order.currency}, ${order.application_limit}, ${JSON.stringify(order.entitlements)}::jsonb, NOW(), NOW() + make_interval(days => ${order.duration_days}))
    `;
    return currentActiveSubscription(tx, order.user_id);
  });
}

/**
 * Public candidate subscription tiers listing
 */
subscriptionsRouter.get("/plans", async (c) => {
  try {
    const sql = getDb(c.env);
    let plans: any[] = [];
    try {
      plans = await sql`
        SELECT id, name, slug, price_paise, currency, duration_days, application_limit, entitlements
        FROM candidate_subscription_plans
        WHERE is_active = true
        ORDER BY price_paise ASC
      `;
    } catch (dbErr) {
      plans = defaultPlans;
    }
    await sql.end();
    if (!plans || plans.length === 0) plans = defaultPlans;
    return c.json({ success: true, data: { items: plans } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: defaultPlans } });
  }
});

subscriptionsRouter.post("/otp/start", authenticate(), async (c) => {
  const gate = requireCandidate(c);
  if (!gate.ok) return gate.res;
  const auth = getCurrentUser(c);
  const body = await c.req.json().catch(() => ({}));
  const planSlug = (body.plan_slug || "").toString().trim().toLowerCase();
  if (!["basic", "premium"].includes(planSlug)) {
    return c.json({ success: false, error: { code: 400, message: "A valid plan_slug (basic or premium) is required." } }, 400);
  }
  const next = safeNext(body.next);

  const sql = getDb(c.env);
  try {
    const plans = await sql`SELECT id, name, slug, price_paise, currency, duration_days, application_limit, entitlements FROM candidate_subscription_plans WHERE slug = ${planSlug} AND is_active = true LIMIT 1`;
    if (plans.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 404, message: "The selected candidate plan is unavailable." } }, 404);
    }
    const plan = plans[0];

    const recent = await sql`SELECT count(*)::int as count FROM candidate_subscription_orders WHERE user_id = ${auth.id} AND created_at >= NOW() - INTERVAL '15 minutes'`;
    if (recent[0].count >= 3) {
      await sql.end();
      return c.json({ success: false, error: { code: 429, message: "Too many OTP requests. Try again in 15 minutes." } }, 429);
    }

    const otp = numericOTP(6);
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const email = auth.email.toLowerCase();

    const inserted = await sql`
      INSERT INTO candidate_subscription_orders
        (user_id, plan_id, email, next_path, amount_paise, currency, duration_days, application_limit, entitlements, otp_hash, otp_expires_at)
      VALUES (${auth.id}, ${plan.id}, ${email}, ${next}, ${plan.price_paise}, ${plan.currency}, ${plan.duration_days}, ${plan.application_limit}, ${JSON.stringify(plan.entitlements)}::jsonb, ${otpHash}, ${expiresAt.toISOString()})
      RETURNING id
    `;
    const orderId = inserted[0].id;

    try {
      await sendMail(c.env, email, "Your Jobs View payment OTP", otpEmailHTML(otp, plan.name));
    } catch (mailErr: any) {
      await sql`UPDATE candidate_subscription_orders SET status = 'failed', failure_code = 'mail_delivery_failed' WHERE id = ${orderId} AND status <> 'paid'`.catch(() => {});
      await sql.end();
      return c.json({ success: false, error: { code: 503, message: "We could not send the verification email. Please try again." } }, 503);
    }

    await sql.end();
    return c.json({
      success: true,
      message: "Subscription OTP sent.",
      data: { checkout_id: orderId, email_masked: maskEmail(email), plan_slug: plan.slug, expires_at: expiresAt.toISOString() },
    });
  } catch (err: any) {
    await sql.end().catch(() => {});
    return c.json({ success: false, error: { code: 500, message: "Failed to start OTP checkout", details: err.message } }, 500);
  }
});

subscriptionsRouter.post("/otp/verify", authenticate(), async (c) => {
  const gate = requireCandidate(c);
  if (!gate.ok) return gate.res;
  const auth = getCurrentUser(c);
  const body = await c.req.json().catch(() => ({}));
  const checkoutId = (body.checkout_id || "").toString();
  const otp = (body.otp || "").toString();
  if (!UUID_RE.test(checkoutId) || !/^\d{6}$/.test(otp)) {
    return c.json({ success: false, error: { code: 400, message: "A valid checkout_id and 6 digit otp are required." } }, 400);
  }

  const sql = getDb(c.env);
  try {
    const orders = await sql.unsafe(ORDER_SELECT + ` WHERE o.id = $1 AND o.user_id = $2`, [checkoutId, auth.id]);
    if (orders.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 404, message: "Checkout not found." } }, 404);
    }
    const order = orders[0];

    if (order.status === "payment_pending" && order.provider_order_id) {
      await sql.end();
      return c.json({ success: true, message: "Subscription OTP verified.", data: checkoutResponse(order, razorpay.keyId(c.env)) });
    }
    if (order.status !== "otp_pending" || new Date() > new Date(order.otp_expires_at)) {
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "The OTP is invalid or expired." } }, 401);
    }
    if (order.otp_attempts >= 5) {
      await sql.end();
      return c.json({ success: false, error: { code: 403, message: "Too many OTP attempts. Request a new code." } }, 403);
    }
    const otpHash = await hashOTP(otp);
    if (otpHash !== order.otp_hash) {
      await sql`UPDATE candidate_subscription_orders SET otp_attempts = otp_attempts + 1 WHERE id = ${order.id}`.catch(() => {});
      await sql.end();
      return c.json({ success: false, error: { code: 401, message: "The OTP is invalid or expired." } }, 401);
    }

    let providerOrderId: string;
    try {
      providerOrderId = await razorpay.createOrder(c.env, order.amount_paise, order.currency, order.id, {
        checkout_id: order.id,
        plan: order.plan_slug,
        user_id: order.user_id,
      });
    } catch (payErr: any) {
      await sql.end();
      if (payErr.message === razorpay.PAYMENT_UNAVAILABLE) {
        return c.json({ success: false, error: { code: 503, message: "Payment checkout is not configured yet." } }, 503);
      }
      return c.json({ success: false, error: { code: 502, message: "The payment order could not be created. Please retry." } }, 502);
    }

    await sql`UPDATE candidate_subscription_orders SET status = 'payment_pending', otp_verified_at = NOW(), provider_order_id = ${providerOrderId} WHERE id = ${order.id} AND status = 'otp_pending'`;
    order.status = "payment_pending";
    order.provider_order_id = providerOrderId;
    await sql.end();
    return c.json({ success: true, message: "Subscription OTP verified.", data: checkoutResponse(order, razorpay.keyId(c.env)) });
  } catch (err: any) {
    await sql.end().catch(() => {});
    return c.json({ success: false, error: { code: 500, message: "OTP verification failed", details: err.message } }, 500);
  }
});

subscriptionsRouter.post("/payment/verify", authenticate(), async (c) => {
  const gate = requireCandidate(c);
  if (!gate.ok) return gate.res;
  const auth = getCurrentUser(c);
  const body = await c.req.json().catch(() => ({}));
  const checkoutId = (body.checkout_id || "").toString();
  const providerOrderId = (body.razorpay_order_id || "").toString();
  const providerPaymentId = (body.razorpay_payment_id || "").toString();
  const signature = (body.razorpay_signature || "").toString();
  if (!UUID_RE.test(checkoutId) || !providerOrderId || !providerPaymentId || !signature) {
    return c.json({ success: false, error: { code: 400, message: "checkout_id, razorpay_order_id, razorpay_payment_id and razorpay_signature are required." } }, 400);
  }

  const sql = getDb(c.env);
  try {
    const orders = await sql.unsafe(ORDER_SELECT + ` WHERE o.id = $1 AND o.user_id = $2`, [checkoutId, auth.id]);
    if (orders.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 404, message: "Checkout not found." } }, 404);
    }
    const order = orders[0];

    if (order.provider_order_id !== providerOrderId) {
      await sql.end();
      return c.json({ success: false, error: { code: 409, message: "The payment does not match this checkout." } }, 409);
    }

    if (order.status === "paid") {
      const sub = await currentActiveSubscription(sql, auth.id);
      await sql.end();
      if (!sub) return c.json({ success: false, error: { code: 500, message: "Subscription record missing after activation." } }, 500);
      return c.json({ success: true, message: "Candidate subscription activated.", data: { status: "active", next: order.next_path, subscription: statusFromActive(sub) } });
    }
    if (order.status !== "payment_pending") {
      await sql.end();
      return c.json({ success: false, error: { code: 409, message: "The payment does not match this checkout." } }, 409);
    }

    const sigOk = await razorpay.verifySignature(c.env, providerOrderId, providerPaymentId, signature);
    if (!sigOk) {
      await sql.end();
      return c.json({ success: false, error: { code: 402, message: "Payment could not be confirmed." } }, 402);
    }
    try {
      const payment = await razorpay.getPayment(c.env, providerPaymentId);
      const matches = payment.id === providerPaymentId && payment.order_id === providerOrderId && payment.status === "captured" && payment.amount === order.amount_paise && payment.currency.toUpperCase() === order.currency.toUpperCase();
      if (!matches) {
        await sql.end();
        return c.json({ success: false, error: { code: 402, message: "Payment could not be confirmed." } }, 402);
      }
    } catch (payErr: any) {
      await sql.end();
      return c.json({ success: false, error: { code: 402, message: "Payment could not be confirmed." } }, 402);
    }

    const sub = await activateOrder(sql, providerOrderId, providerPaymentId);
    await sql.end();
    if (!sub) return c.json({ success: false, error: { code: 500, message: "Subscription activation failed." } }, 500);
    return c.json({ success: true, message: "Candidate subscription activated.", data: { status: "active", next: order.next_path, subscription: statusFromActive(sub) } });
  } catch (err: any) {
    await sql.end().catch(() => {});
    return c.json({ success: false, error: { code: 500, message: "Payment verification failed", details: err.message } }, 500);
  }
});

subscriptionsRouter.get("/orders/:id", authenticate(), async (c) => {
  const gate = requireCandidate(c);
  if (!gate.ok) return gate.res;
  const auth = getCurrentUser(c);
  const id = c.req.param("id") || "";
  if (!UUID_RE.test(id)) {
    return c.json({ success: false, error: { code: 400, message: "id must be a valid UUID" } }, 400);
  }
  const sql = getDb(c.env);
  try {
    const orders = await sql.unsafe(ORDER_SELECT + ` WHERE o.id = $1 AND o.user_id = $2`, [id, auth.id]);
    await sql.end();
    if (orders.length === 0) {
      return c.json({ success: false, error: { code: 404, message: "Checkout not found." } }, 404);
    }
    const order = orders[0];
    return c.json({ success: true, data: { checkout_id: order.id, status: order.status, next: order.next_path } });
  } catch (err: any) {
    await sql.end().catch(() => {});
    return c.json({ success: false, error: { code: 500, message: "Checkout status lookup failed" } }, 500);
  }
});

subscriptionsRouter.post("/support", authenticate(), async (c) => {
  const gate = requireCandidate(c);
  if (!gate.ok) return gate.res;
  const auth = getCurrentUser(c);
  const body = await c.req.json().catch(() => ({}));
  const subject = (body.subject || "").toString().trim();
  const message = (body.message || "").toString().trim();
  if (subject.length < 3 || subject.length > 255 || message.length < 10 || message.length > 4000) {
    return c.json({ success: false, error: { code: 400, message: "A subject (3-255 chars) and message (10-4000 chars) are required." } }, 400);
  }

  const sql = getDb(c.env);
  try {
    const current = await currentActiveSubscription(sql, auth.id);
    const priority = current?.plan_slug === "premium" ? "high" : "normal";
    const planSlug = current?.plan_slug || "none";
    const metadata = JSON.stringify({ candidate_plan: planSlug });
    const inserted = await sql`
      INSERT INTO support_tickets (requester_user_id, email, ticket_type, subject, message, status, priority, metadata)
      VALUES (${auth.id}, ${auth.email}, 'ticket', ${subject}, ${message}, 'open', ${priority}, ${metadata}::jsonb)
      RETURNING id, status, priority
    `;
    await sql.end();
    return c.json({ success: true, message: "Support request created.", data: inserted[0] }, 201);
  } catch (err: any) {
    await sql.end().catch(() => {});
    return c.json({ success: false, error: { code: 500, message: "Support ticket registration failed", details: err.message } }, 500);
  }
});

subscriptionsRouter.get("/me", authenticate(), async (c) => {
  const auth = getCurrentUser(c);
  const sql = getDb(c.env);
  try {
    await sql`UPDATE candidate_subscriptions SET status = 'expired' WHERE user_id = ${auth.id} AND status = 'active' AND ends_at <= NOW()`.catch(() => {});
    const sub = await currentActiveSubscription(sql, auth.id);
    if (!sub) {
      const latest = await sql`SELECT status FROM candidate_subscriptions WHERE user_id = ${auth.id} ORDER BY created_at DESC LIMIT 1`;
      await sql.end();
      return c.json({ success: true, data: { active: false, status: latest[0]?.status || "none", entitlements: {}, applications_used: 0, applications_remaining: null } });
    }
    await sql.end();
    return c.json({ success: true, data: statusFromActive(sub) });
  } catch (err: any) {
    await sql.end().catch(() => {});
    return c.json({ success: true, data: { active: false, status: "none", entitlements: {}, applications_used: 0, applications_remaining: null } });
  }
});

/**
 * Razorpay server-to-server webhook. Authenticated by HMAC signature (X-Razorpay-Signature), not a bearer token.
 * Kept idempotent via the candidate_payment_events unique provider_event_id so retried deliveries are safe.
 */
subscriptionsRouter.post("/webhooks/razorpay", async (c) => {
  const signature = c.req.header("x-razorpay-signature") || "";
  const rawBody = await c.req.text();

  const valid = await razorpay.verifyWebhookSignature(c.env, rawBody, signature);
  if (!valid) {
    return c.json({ success: false, error: { code: 401, message: "Webhook signature is invalid." } }, 401);
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return c.json({ success: false, error: { code: 400, message: "Webhook body must be valid JSON." } }, 400);
  }

  let eventId = c.req.header("x-razorpay-event-id") || "";
  if (!eventId) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawBody));
    eventId = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const providerOrderId: string = event?.payload?.payment?.entity?.order_id || event?.payload?.order?.entity?.id || "";
  const providerPaymentId: string = event?.payload?.payment?.entity?.id || event?.payload?.refund?.entity?.payment_id || "";

  const sql = getDb(c.env);
  try {
    const inserted = await sql`
      INSERT INTO candidate_payment_events (provider_event_id, event_type, payload)
      VALUES (${eventId}, ${event.event || "unknown"}, ${rawBody}::jsonb)
      ON CONFLICT (provider_event_id) DO NOTHING
      RETURNING id
    `;
    if (inserted.length === 0) {
      await sql.end();
      return c.json({ success: true, message: "Webhook accepted." });
    }

    let status = "processed";
    let message = "";
    switch (event.event) {
      case "payment.captured":
      case "order.paid":
        if (!providerOrderId || !providerPaymentId) {
          status = "ignored";
          message = "payment references are missing";
        } else {
          const sub = await activateOrder(sql, providerOrderId, providerPaymentId);
          if (!sub) {
            status = "failed";
            message = "order not found for activation";
          }
        }
        break;
      case "payment.failed":
        if (providerOrderId) {
          await sql`UPDATE candidate_subscription_orders SET status = 'failed', failure_code = 'payment_failed' WHERE provider_order_id = ${providerOrderId} AND status <> 'paid'`;
        }
        break;
      case "refund.processed":
        if (providerPaymentId) {
          const orders = await sql`SELECT id, provider_order_id FROM candidate_subscription_orders WHERE provider_payment_id = ${providerPaymentId} LIMIT 1`;
          if (orders.length > 0) {
            await sql`UPDATE candidate_subscription_orders SET status = 'refunded' WHERE id = ${orders[0].id}`;
            await sql`UPDATE candidate_subscriptions SET status = 'refunded' WHERE order_id = ${orders[0].id} AND status = 'active'`;
          }
        }
        break;
      default:
        status = "ignored";
    }

    await sql`UPDATE candidate_payment_events SET status = ${status}, error_message = NULLIF(${message}, ''), processed_at = NOW() WHERE provider_event_id = ${eventId}`.catch(() => {});
    await sql.end();

    if (status === "failed") {
      return c.json({ success: false, error: { code: 500, message } }, 500);
    }
    return c.json({ success: true, message: "Webhook accepted." });
  } catch (err: any) {
    await sql.end().catch(() => {});
    return c.json({ success: false, error: { code: 500, message: "Webhook processing failed", details: err.message } }, 500);
  }
});

// Razorpay Checkout Compatibility Routes (generic, not tied to candidate subscription plans)
checkoutRouter.post("/create-order", authenticate(), async (c) => {
  const auth = getCurrentUser(c);
  const body = await c.req.json().catch(() => ({}));
  const amount = Number(body.amount) || 0;
  if (amount < 100) {
    return c.json({ success: false, error: { code: 400, message: "amount must be at least 100 paise" } }, 400);
  }
  let currency = (body.currency || "INR").toString().toUpperCase().trim();
  if (currency.length !== 3) currency = "INR";
  const receipt = (body.receipt || "").toString().trim() || `jobsview_${auth.id.slice(0, 8)}_${Date.now()}`;

  try {
    const orderId = await razorpay.createOrder(c.env, amount, currency, receipt);
    return c.json({ success: true, message: "Razorpay order created.", data: { order_id: orderId, amount, currency } });
  } catch (err: any) {
    if (err.message === razorpay.PAYMENT_UNAVAILABLE) {
      return c.json({ success: false, error: { code: 503, message: "Payment checkout is not configured yet." } }, 503);
    }
    if (err instanceof razorpay.RazorpayError && err.status === 401) {
      return c.json({ success: false, error: { code: 401, message: "Razorpay authentication failed. Check server credentials." } }, 401);
    }
    return c.json({ success: false, error: { code: 502, message: "The payment order could not be created. Please retry.", details: err.message } }, 502);
  }
});

checkoutRouter.post("/verify-payment", authenticate(), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return c.json({ success: false, error: { code: 400, message: "Missing Razorpay transaction credentials." } }, 400);
  }

  const ok = await razorpay.verifySignature(c.env, razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!ok) {
    return c.json({ success: false, error: { code: 400, message: "Payment signature verification failed." } }, 400);
  }

  return c.json({
    success: true,
    message: "Razorpay payment verified successfully on Cloudflare Edge!",
    data: { verified: true, razorpay_order_id, razorpay_payment_id },
  });
});
