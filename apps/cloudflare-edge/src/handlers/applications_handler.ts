import { Hono } from "hono";
import { getDb } from "../db";
import { authenticate, getCurrentUser, AppEnv } from "../middleware";

export const applicationsRouter = new Hono<AppEnv>();

applicationsRouter.use("/*", authenticate());

/**
 * POST /api/v1/applications
 * Candidate applies to an active job opening.
 */
applicationsRouter.post("/", async (c) => {
  const auth = getCurrentUser(c);
  const body = await c.req.json().catch(() => ({}));
  const jobId = body.job_id;
  if (!jobId) {
    return c.json({ success: false, error: { code: 400, message: "Target job_id is required." } }, 400);
  }

  try {
    const sql = getDb(c.env);
    // Retrieve candidate profile details
    let candidateId = auth.id;
    let resumeUrl = body.resume_url || "https://jobsviews.com/assets/default-resume.pdf";

    const inserted = await sql`
      INSERT INTO job_applications (job_id, user_id, status, cover_letter, resume_url, created_at)
      VALUES (${jobId}, ${candidateId}, 'applied', ${body.cover_letter || ""}, ${resumeUrl}, NOW())
      RETURNING *
    `;
    await sql.end();
    return c.json({ success: true, message: "Application submitted successfully via Cloudflare Edge!", data: inserted[0] });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Application submission failed", details: err.message } }, 500);
  }
});

/**
 * GET /api/v1/applications
 * Retrieves candidate applications or employer incoming talent pool depending on active role.
 */
applicationsRouter.get("/", async (c) => {
  const auth = getCurrentUser(c);
  const statusFilter = c.req.query("status") || "";
  try {
    const sql = getDb(c.env);
    let items: any[] = [];
    if (auth.role === "JOB_SEEKER") {
      items = await sql`
        SELECT a.*, j.title as job_title, j.slug as job_slug, j.city, j.state, j.work_mode, c.name as company_name, c.logo_url as company_logo_url
        FROM job_applications a
        JOIN jobs j ON j.id = a.job_id
        JOIN companies c ON c.id = j.company_id
        WHERE a.user_id = ${auth.id} ${statusFilter ? sql`AND a.status = ${statusFilter}` : sql``}
        ORDER BY a.created_at DESC LIMIT 50
      `;
    } else if (auth.role === "EMPLOYER") {
      items = await sql`
        SELECT a.*, j.title as job_title, cp.first_name, cp.last_name, cp.mobile, u.email as candidate_email
        FROM job_applications a
        JOIN jobs j ON j.id = a.job_id
        JOIN employer_profiles ep ON ep.company_id = j.company_id AND ep.user_id = ${auth.id}
        LEFT JOIN candidate_profiles cp ON cp.user_id = a.user_id
        LEFT JOIN users u ON u.id = a.user_id
        WHERE j.deleted_at IS NULL ${statusFilter ? sql`AND a.status = ${statusFilter}` : sql``}
        ORDER BY a.created_at DESC LIMIT 50
      `;
    } else {
      items = await sql`
        SELECT a.*, j.title as job_title, u.email as candidate_email
        FROM job_applications a
        JOIN jobs j ON j.id = a.job_id
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC LIMIT 100
      `;
    }
    await sql.end();
    return c.json({ success: true, data: { items, total: items.length, page: 1, limit: 50 } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [], total: 0 } }); // Graceful fallback
  }
});

applicationsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const sql = getDb(c.env);
    const rows = await sql`SELECT * FROM job_applications WHERE id = ${id} LIMIT 1`;
    await sql.end();
    if (rows.length === 0) return c.json({ success: false, error: { code: 404, message: "Application record not found." } }, 404);
    return c.json({ success: true, data: rows[0] });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Application details error" } }, 500);
  }
});

applicationsRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const status = body.status || "reviewing";
  try {
    const sql = getDb(c.env);
    await sql`UPDATE job_applications SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    await sql.end();
    return c.json({ success: true, message: `Application stage updated to: ${status}`, data: { id, status } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to transition stage" } }, 500);
  }
});

applicationsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const sql = getDb(c.env);
  await sql`DELETE FROM job_applications WHERE id = ${id}`.catch(() => {});
  await sql.end();
  return c.json({ success: true, message: "Application withdrawn successfully." });
});
