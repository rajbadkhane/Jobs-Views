export interface MailEnv {
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
}

export const MAIL_UNAVAILABLE = "MAIL_UNAVAILABLE";

/**
 * Sends transactional email via the Resend REST API (no SDK, keeps the Worker bundle small).
 */
export async function sendMail(env: MailEnv, to: string, subject: string, html: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    throw new Error(MAIL_UNAVAILABLE);
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.MAIL_FROM || "Jobs View <support@jobsviews.com>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MAIL_DELIVERY_FAILED: ${text}`);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function otpEmailHTML(otp: string, planName: string): string {
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a"><h2>Confirm your Jobs View checkout</h2><p>Use this code to continue with the <strong>${escapeHtml(
    planName
  )}</strong> plan.</p><p style="font-size:28px;font-weight:800;letter-spacing:6px;color:#0A3A7A">${escapeHtml(
    otp
  )}</p><p>This code expires in 10 minutes. Jobs View never asks for this code by phone.</p></div>`;
}
