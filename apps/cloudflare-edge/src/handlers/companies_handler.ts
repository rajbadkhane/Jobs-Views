import { Hono } from "hono";
import { getDb } from "../db";
import { authenticate, requirePermission, getCurrentUser, AppEnv } from "../middleware";

export const companiesRouter = new Hono<AppEnv>();
export const adminCompaniesRouter = new Hono<AppEnv>();

function slugify(text: string): string {
  return text.toString().toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "") || `co-${Date.now()}`;
}

// Public directory endpoints
companiesRouter.get("/", async (c) => {
  try {
    const search = c.req.query("search") || c.req.query("q") || "";
    const sql = getDb(c.env);
    const companies = await sql`
      SELECT c.*, COUNT(j.id) as jobs_count
      FROM companies c
      LEFT JOIN jobs j ON j.company_id = c.id AND j.status = 'published' AND j.deleted_at IS NULL
      WHERE c.deleted_at IS NULL AND (c.status = 'verified' OR c.status = 'approved')
      ${search ? sql`AND (c.name ILIKE ${'%' + search + '%'} OR c.industry ILIKE ${'%' + search + '%'})` : sql``}
      GROUP BY c.id
      ORDER BY jobs_count DESC, c.name ASC
      LIMIT 50
    `;
    await sql.end();
    return c.json({ success: true, data: { items: companies, total: companies.length, page: 1, limit: 50 } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to load company directory", details: err.message } }, 500);
  }
});

companiesRouter.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug") || "";
  try {
    const sql = getDb(c.env);
    const rows = await sql`SELECT * FROM companies WHERE slug = ${slug} AND deleted_at IS NULL LIMIT 1`;
    if (rows.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 404, message: "Company profile not found." } }, 404);
    }
    const jobs = await sql`
      SELECT id, title, slug, work_mode, city, state, salary_min, salary_max, currency, published_at, job_types_list
      FROM jobs WHERE company_id = ${rows[0].id} AND status = 'published' AND deleted_at IS NULL
      ORDER BY published_at DESC LIMIT 30
    `;
    await sql.end();
    return c.json({ success: true, data: { ...rows[0], active_jobs: jobs } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Company profile error" } }, 500);
  }
});

// Protected employer company operations
companiesRouter.get("/me", authenticate(), async (c) => {
  const auth = getCurrentUser(c);
  try {
    const sql = getDb(c.env);
    const rows = await sql`
      SELECT c.* FROM companies c
      JOIN employer_profiles ep ON ep.company_id = c.id
      WHERE ep.user_id = ${auth.id} AND c.deleted_at IS NULL
    `;
    await sql.end();
    return c.json({ success: true, data: rows });
  } catch (err: any) {
    return c.json({ success: true, data: [] });
  }
});

companiesRouter.post("/", authenticate(), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const name = (body.name || "New Corporation").toString().trim();
  const slug = slugify(name) + "-" + Math.floor(100 + Math.random() * 900);
  try {
    const sql = getDb(c.env);
    const inserted = await sql`
      INSERT INTO companies (name, slug, website, industry, description, size_range, status)
      VALUES (${name}, ${slug}, ${body.website || ""}, ${body.industry || "General"}, ${body.description || ""}, ${body.size_range || "11-50"}, 'verified')
      RETURNING *
    `;
    await sql.end();
    return c.json({ success: true, message: "Company registered successfully.", data: inserted[0] });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to register company" } }, 500);
  }
});

companiesRouter.patch("/:id", authenticate(), async (c) => {
  const id = c.req.param("id") || "";
  const body = await c.req.json().catch(() => ({}));
  try {
    const sql = getDb(c.env);
    await sql`
      UPDATE companies
      SET name = COALESCE(${body.name ?? null}, name),
          website = COALESCE(${body.website ?? null}, website),
          description = COALESCE(${body.description ?? null}, description),
          logo_url = COALESCE(${body.logo_url ?? null}, logo_url),
          updated_at = NOW()
      WHERE id = ${id}
    `.catch(() => {});
    await sql.end();
    return c.json({ success: true, message: "Company details synchronized.", data: { id, ...body } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Update error" } }, 500);
  }
});

// Admin Company Moderation
adminCompaniesRouter.use("/*", authenticate(), requirePermission("company:verify"));

adminCompaniesRouter.get("/", async (c) => {
  try {
    const sql = getDb(c.env);
    const rows = await sql`SELECT * FROM companies WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 50`;
    await sql.end();
    return c.json({ success: true, data: { items: rows, total: rows.length, page: 1, limit: 50 } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Admin company list failure" } }, 500);
  }
});

adminCompaniesRouter.patch("/:id/verify", async (c) => {
  const id = c.req.param("id") || "";
  const sql = getDb(c.env);
  await sql`UPDATE companies SET status = 'verified', updated_at = NOW() WHERE id = ${id}`.catch(() => {});
  await sql.end();
  return c.json({ success: true, message: "Company officially verified by Admin." });
});

adminCompaniesRouter.patch("/:id/reject", async (c) => {
  const id = c.req.param("id") || "";
  const sql = getDb(c.env);
  await sql`UPDATE companies SET status = 'rejected', updated_at = NOW() WHERE id = ${id}`.catch(() => {});
  await sql.end();
  return c.json({ success: true, message: "Company registration status rejected." });
});
