export interface RazorpayEnv {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  RAZORPAY_API_BASE_URL?: string;
}

export class RazorpayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const PAYMENT_UNAVAILABLE = "PAYMENT_UNAVAILABLE";

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function request(env: RazorpayEnv, method: string, path: string, payload?: unknown): Promise<any> {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error(PAYMENT_UNAVAILABLE);
  }
  const base = (env.RAZORPAY_API_BASE_URL || "https://api.razorpay.com/v1").replace(/\/$/, "");
  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const res = await fetch(base + path, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }
  if (!res.ok) {
    throw new RazorpayError(res.status, json?.error?.description || text || "Razorpay request failed");
  }
  return json;
}

/**
 * Creates a live Razorpay order via the Orders API. Amount is in paise.
 */
export async function createOrder(
  env: RazorpayEnv,
  amountPaise: number,
  currency: string,
  receipt: string,
  notes?: Record<string, string>
): Promise<string> {
  const json = await request(env, "POST", "/orders", { amount: amountPaise, currency, receipt, notes });
  if (!json.id) throw new Error("Razorpay returned an empty order id");
  return json.id as string;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
}

export async function getPayment(env: RazorpayEnv, paymentId: string): Promise<RazorpayPayment> {
  return request(env, "GET", `/payments/${encodeURIComponent(paymentId)}`);
}

/**
 * Verifies the HMAC-SHA256 signature Razorpay Checkout returns after a successful payment.
 */
export async function verifySignature(env: RazorpayEnv, orderId: string, paymentId: string, signature: string): Promise<boolean> {
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, `${orderId.trim()}|${paymentId.trim()}`);
  return timingSafeEqual(expected, signature.trim().toLowerCase());
}

/**
 * Verifies the HMAC-SHA256 signature Razorpay sends on webhook deliveries (X-Razorpay-Signature).
 */
export async function verifyWebhookSignature(env: RazorpayEnv, rawBody: string, signature: string): Promise<boolean> {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = await hmacSha256Hex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  return timingSafeEqual(expected, signature.trim().toLowerCase());
}

export function keyId(env: RazorpayEnv): string {
  return env.RAZORPAY_KEY_ID || "";
}
