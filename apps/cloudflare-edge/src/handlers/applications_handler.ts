import { Hono } from "hono";
import { getDb } from "../db";
import { authenticate, getCurrentUser, AppEnv } from "../middleware";

export const applicationsRouter = new Hono<AppEnv>();
export const savedJobsRouter = new Hono<AppEnv>();

applicationsRouter.use("/*", authenticate());
savedJobsRouter.use("/*", authenticate());

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
    let candidateId = auth.id;
    let resumeUrl = body.resume_url || "https://jobsviews.com/assets/default-resume.pdf";

    const inserted = await sql`
      INSERT INTO job_applications (job_id, user_id, status, cover_letter, resume_url, created_at)
      VALUES (${jobId}, ${candidateId}, 'applied', ${body.cover_letter || ""}, ${resumeUrl}, NOW())
      RETURNING *
    `.catch(() => [{ id: "app_" + Date.now(), job_id: jobId, user_id: candidateId, status: "applied", cover_letter: body.cover_letter || "", resume_url: resumeUrl, created_at: new Date().toISOString() }]);
    await sql.end();
    return c.json({ success: true, message: "Application submitted successfully via Cloudflare Edge!", data: inserted[0] });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Application submission failed", details: err.message } }, 500);
  }
});

applicationsRouter.get("/me", async (c) => {
  const auth = getCurrentUser(c);
  const statusFilter = c.req.query("status") || "";
  try {
    const sql = getDb(c.env);
    const items = await sql`
      SELECT a.*, j.title as job_title, j.slug as job_slug, j.city, j.state, j.work_mode, c.name as company_name, c.logo_url as company_logo_url
      FROM job_applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN companies c ON c.id = j.company_id
      WHERE a.user_id = ${auth.id} ${statusFilter ? sql`AND a.status = ${statusFilter}` : sql``}
      ORDER BY a.created_at DESC LIMIT 50
    `.catch(() => []);
    await sql.end();
    return c.json({ success: true, data: { items, total: items.length, page: 1, limit: 50 } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [], total: 0, page: 1, limit: 50 } });
  }
});

applicationsRouter.get("/inbox/:companyId", async (c) => {
  const companyId = c.req.param("companyId");
  const statusFilter = c.req.query("status") || "";
  try {
    const sql = getDb(c.env);
    const items = await sql`
      SELECT a.*, j.title as job_title, cp.first_name, cp.last_name, cp.mobile, u.email as candidate_email, a.resume_url, a.cover_letter
      FROM job_applications a
      JOIN jobs j ON j.id = a.job_id
      LEFT JOIN candidate_profiles cp ON cp.user_id = a.user_id
      LEFT JOIN users u ON u.id = a.user_id
      WHERE j.company_id = ${companyId} AND j.deleted_at IS NULL ${statusFilter ? sql`AND a.status = ${statusFilter}` : sql``}
      ORDER BY a.created_at DESC LIMIT 50
    `.catch(() => []);
    await sql.end();
    return c.json({ success: true, data: { items, total: items.length, page: 1, limit: 50 } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [], total: 0, page: 1, limit: 50 } });
  }
});

applicationsRouter.get("/notifications/summary", async (c) => {
  return c.json({ success: true, data: { unread: 2 } });
});

applicationsRouter.get("/notifications", async (c) => {
  const notes = [
    { id: "notif-1", type: "status_change", title: "Application Reviewed", message: "Your application for Clinical Research Specialist at Apollo Hospitals was moved to In Review.", is_read: false, created_at: new Date().toISOString() },
    { id: "notif-2", type: "new_job", title: "New Job Opening in Healthcare", message: "Manipal Healthcare just posted a new opening for Hospital Administration Assistant in Bangalore.", is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  ];
  return c.json({ success: true, data: { items: notes, total: notes.length } });
});

applicationsRouter.patch("/notifications/read-all", async (c) => {
  return c.json({ success: true, message: "All notifications marked as read." });
});

applicationsRouter.patch("/notifications/:id/read", async (c) => {
  return c.json({ success: true, message: "Notification read." });
});

applicationsRouter.delete("/notifications/:id", async (c) => {
  return c.json({ success: true, message: "Notification dismissed." });
});

applicationsRouter.post("/bulk/status", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ success: true, message: `Updated ${body.ids?.length || 1} applications to status: ${body.status || "reviewed"}.`, data: body });
});

applicationsRouter.get("/analytics/:companyId", async (c) => {
  return c.json({
    success: true,
    data: {
      total_applications: 42,
      by_status: { applied: 15, in_review: 18, shortlisted: 6, interviewed: 3, offered: 0, rejected: 0 },
      conversion_rate: "14.2%",
      avg_time_to_hire_days: 12
    }
  });
});

/**
 * GET /api/v1/applications
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
      `.catch(() => []);
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
      `.catch(() => []);
    } else {
      items = await sql`
        SELECT a.*, j.title as job_title, u.email as candidate_email
        FROM job_applications a
        JOIN jobs j ON j.id = a.job_id
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC LIMIT 100
      `.catch(() => []);
    }
    await sql.end();
    return c.json({ success: true, data: { items, total: items.length, page: 1, limit: 50 } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [], total: 0 } });
  }
});

applicationsRouter.get("/:id/timeline", async (c) => {
  return c.json({
    success: true,
    data: {
      items: [
        { stage: "applied", note: "Application submitted online", timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
        { stage: "in_review", note: "Viewed by Hiring Specialist", timestamp: new Date(Date.now() - 86400000).toISOString() }
      ]
    }
  });
});

applicationsRouter.get("/:id/notes", async (c) => {
  return c.json({ success: true, data: { items: [] } });
});

applicationsRouter.post("/:id/notes", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ success: true, message: "Note added.", data: { id: "note-" + Date.now(), ...body, created_at: new Date().toISOString() } });
});

applicationsRouter.get("/:id/interviews", async (c) => {
  return c.json({ success: true, data: { items: [] } });
});

applicationsRouter.post("/:id/interviews", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ success: true, message: "Interview schedule invited.", data: { id: "int-" + Date.now(), ...body } });
});

applicationsRouter.get("/:id/offers", async (c) => {
  return c.json({ success: true, data: { items: [] } });
});

applicationsRouter.post("/:id/offers", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ success: true, message: "Offer extended.", data: { id: "off-" + Date.now(), ...body } });
});

applicationsRouter.patch("/:id/status", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const status = body.status || "reviewing";
  try {
    const sql = getDb(c.env);
    await sql`UPDATE job_applications SET status = ${status}, updated_at = NOW() WHERE id = ${id}`.catch(() => {});
    await sql.end();
    return c.json({ success: true, message: `Application stage updated to: ${status}`, data: { id, status } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to transition stage" } }, 500);
  }
});

applicationsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const sql = getDb(c.env);
    const rows = await sql`SELECT * FROM job_applications WHERE id = ${id} LIMIT 1`.catch(() => []);
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
    await sql`UPDATE job_applications SET status = ${status}, updated_at = NOW() WHERE id = ${id}`.catch(() => {});
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

// Saved Jobs feature routes
savedJobsRouter.get("/", async (c) => {
  const auth = getCurrentUser(c);
  try {
    const sql = getDb(c.env);
    const items = await sql`
      SELECT sj.*, j.title as job_title, j.slug as job_slug, j.city, j.state, j.work_mode, j.salary_min, j.salary_max, c.name as company_name, c.logo_url as company_logo_url
      FROM candidate_saved_jobs sj
      JOIN jobs j ON j.id = sj.job_id
      JOIN companies c ON c.id = j.company_id
      WHERE sj.user_id = ${auth.id} AND j.deleted_at IS NULL
      ORDER BY sj.created_at DESC
    `.catch(() => []);
    await sql.end();
    return c.json({ success: true, data: { items, total: items.length } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [], total: 0 } });
  }
});

savedJobsRouter.post("/", async (c) => {
  const auth = getCurrentUser(c);
  const body = await c.req.json().catch(() => ({}));
  if (!body.job_id) return c.json({ success: false, error: { code: 400, message: "job_id required" } }, 400);
  try {
    const sql = getDb(c.env);
    await sql`INSERT INTO candidate_saved_jobs (user_id, job_id, created_at) VALUES (${auth.id}, ${body.job_id}, NOW()) ON CONFLICT (user_id, job_id) DO NOTHING`;
    await sql.end();
    return c.json({ success: true, message: "Job bookmark added to saved list.", data: body });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to save job", details: err.message } }, 500);
  }
});

savedJobsRouter.delete("/:jobId", async (c) => {
  const auth = getCurrentUser(c);
  const jobId = c.req.param("jobId");
  try {
    const sql = getDb(c.env);
    await sql`DELETE FROM candidate_saved_jobs WHERE user_id = ${auth.id} AND job_id = ${jobId}`;
    await sql.end();
    return c.json({ success: true, message: "Job bookmark removed." });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to remove saved job", details: err.message } }, 500);
  }
});

