import { Hono } from "hono";
import { getDb, Env } from "../db";

export const supportRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /api/v1/support/tickets
 * Public ticket intake for candidates/employers/visitors - no auth required,
 * since someone locked out of their account still needs to be able to reach
 * support. Lands in the same support_tickets table the admin queue reads.
 */
supportRouter.post("/tickets", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = (body.email || "").toString().trim().toLowerCase();
  const subject = (body.subject || "").toString().trim();
  const message = (body.message || "").toString().trim();
  if (!email || !subject || !message) {
    return c.json({ success: false, error: { code: 400, message: "Email, subject, and message are required." } }, 400);
  }
  try {
    const sql = getDb(c.env);
    const ticketType = ["ticket", "feedback", "contact", "bug", "feature"].includes(body.ticket_type) ? body.ticket_type : "contact";
    const inserted = await sql`
      INSERT INTO support_tickets (email, ticket_type, subject, message)
      VALUES (${email}, ${ticketType}, ${subject}, ${message})
      RETURNING id, status, created_at
    `;
    await sql.end();
    return c.json({ success: true, message: "Support ticket submitted. Our team will follow up by email.", data: inserted[0] });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to submit support ticket", details: err.message } }, 500);
  }
});
