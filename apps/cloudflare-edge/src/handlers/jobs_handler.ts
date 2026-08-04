import { Hono } from "hono";
import { getDb, Env } from "../db";
import { authenticate, requirePermission, getCurrentUser, AppEnv } from "../middleware";

export const jobsRouter = new Hono<AppEnv>();
export const adminJobsRouter = new Hono<AppEnv>();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || `job-${Date.now()}`;
}

// Public catalog and search
jobsRouter.get("/", async (c) => {
  try {
    const search = c.req.query("search") || c.req.query("q") || "";
    const jobType = c.req.query("job_type") || c.req.query("type") || "";
    const state = c.req.query("state") || "";
    const workMode = c.req.query("work_mode") || "";
    const limit = Number(c.req.query("limit")) || 50;

    const sql = getDb(c.env);
    const jobs = await sql`
      SELECT 
        j.id, j.title, j.slug, j.short_description, j.full_description,
        j.salary_min, j.salary_max, j.currency, j.salary_period, j.salary_basis,
        j.experience_min, j.experience_max, j.education, j.openings,
        j.work_mode, j.country, j.state, j.city, j.status, j.visibility,
        j.job_types_list, jt.name as job_type,
        c.id as company_id, c.name as company_name, c.slug as company_slug, c.logo_url as company_logo_url
      FROM jobs j
      JOIN companies c ON c.id = j.company_id
      LEFT JOIN job_types jt ON jt.id = j.job_type_id
      WHERE j.status = 'published' AND j.visibility = 'public' AND j.deleted_at IS NULL
      ${search ? sql`AND (j.title ILIKE ${'%' + search + '%'} OR j.full_description ILIKE ${'%' + search + '%'} OR c.name ILIKE ${'%' + search + '%'})` : sql``}
      ${state ? sql`AND j.state ILIKE ${'%' + state + '%'}` : sql``}
      ${workMode ? sql`AND j.work_mode ILIKE ${'%' + workMode + '%'}` : sql``}
      ORDER BY j.published_at DESC NULLS LAST, j.created_at DESC
      LIMIT ${limit}
    `;

    await sql.end();

    return c.json({
      success: true,
      data: {
        items: jobs.map((row: any) => ({
          ...row,
          job_types: Array.isArray(row.job_types_list) && row.job_types_list.length > 0 ? row.job_types_list : (row.job_type ? [row.job_type] : ["Full-time"]),
        })),
        page: 1,
        limit,
        total: jobs.length,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to load job listings at edge", details: error.message } }, 500);
  }
});

jobsRouter.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug") || "";
  try {
    const sql = getDb(c.env);
    const jobs = await sql`
      SELECT j.*, c.name as company_name, c.slug as company_slug, c.logo_url as company_logo_url, c.website as company_website, c.industry as company_industry
      FROM jobs j
      JOIN companies c ON c.id = j.company_id
      WHERE j.slug = ${slug} AND j.deleted_at IS NULL LIMIT 1
    `;
    if (jobs.length === 0) {
      await sql.end();
      return c.json({ success: false, error: { code: 404, message: "Job opportunity not found or closed." } }, 404);
    }
    const job = jobs[0];
    const skills = await sql`SELECT name, requirement_type, level FROM job_skills WHERE job_id = ${job.id}`.catch(() => []);
    await sql.end();
    return c.json({
      success: true,
      data: {
        ...job,
        job_types: Array.isArray(job.job_types_list) && job.job_types_list.length > 0 ? job.job_types_list : ["Full-time"],
        skills,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Job details query failed" } }, 500);
  }
});

jobsRouter.get("/company/:companyId", async (c) => {
  const companyId = c.req.param("companyId") || "";
  try {
    const sql = getDb(c.env);
    const jobs = await sql`SELECT * FROM jobs WHERE company_id = ${companyId} AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 50`;
    await sql.end();
    return c.json({ success: true, data: { items: jobs, total: jobs.length } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Company jobs query error" } }, 500);
  }
});

// Protected employer job management
jobsRouter.post("/", authenticate(), async (c) => {
  const auth = getCurrentUser(c);
  const body = await c.req.json().catch(() => ({}));
  try {
    const sql = getDb(c.env);
    let companyId = body.company_id;
    if (!companyId) {
      const ep = await sql`SELECT company_id FROM employer_profiles WHERE user_id = ${auth.id} LIMIT 1`;
      if (ep.length > 0) companyId = ep[0].company_id;
    }
    if (!companyId) {
      const defaultCo = await sql`INSERT INTO companies (name, slug, status) VALUES (${auth.email + " Corp"}, ${slugify(auth.email) + "-" + Math.floor(1000 + Math.random()*9000)}, 'verified') RETURNING id`;
      companyId = defaultCo[0].id;
    }

    const title = (body.title || "Career Opening").toString().trim();
    const jobSlug = slugify(title) + "-" + Math.floor(1000 + Math.random() * 9000);
    const jobTypesList = Array.isArray(body.job_types) && body.job_types.length > 0 ? body.job_types : (body.job_type ? [body.job_type] : ["fresher-jobs"]);

    const inserted = await sql`
      INSERT INTO jobs (
        company_id, job_type_id, title, slug, short_description, full_description,
        salary_min, salary_max, currency, salary_period, salary_basis,
        experience_min, experience_max, education, openings,
        work_mode, country, state, city, status, visibility,
        job_types_list, published_at, created_by
      )
      VALUES (
        ${companyId}, 1, ${title}, ${jobSlug}, ${body.short_description || title}, ${body.full_description || body.short_description || title},
        NULLIF(${Number(body.salary_min) || 0}, 0), NULLIF(${Number(body.salary_max) || 0}, 0), ${body.currency || "INR"}, ${body.salary_period || "annual"}, ${body.salary_basis || "ctc"},
        ${Number(body.experience_min) || 0}, NULLIF(${Number(body.experience_max) || 0}, 0), ${body.education || "Any Graduate"}, ${Number(body.openings) || 1},
        ${body.work_mode || "On-site"}, ${body.country || "IN"}, ${body.state || "India"}, ${body.city || "Multiple Cities"}, 'published', 'public',
        ${JSON.stringify(jobTypesList)}::jsonb, NOW(), ${auth.id}
      )
      RETURNING *
    `;
    await sql.end();
    return c.json({ success: true, message: "Job posted successfully at Cloudflare Edge!", data: inserted[0] });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Job posting error", details: err.message } }, 500);
  }
});

jobsRouter.patch("/:id", authenticate(), async (c) => {
  const id = c.req.param("id") || "";
  const body = await c.req.json().catch(() => ({}));
  try {
    const sql = getDb(c.env);
    await sql`
      UPDATE jobs SET
        title = COALESCE(${body.title ?? null}, title),
        status = COALESCE(${body.status ?? null}, status),
        short_description = COALESCE(${body.short_description ?? null}, short_description),
        work_mode = COALESCE(${body.work_mode ?? null}, work_mode),
        updated_at = NOW()
      WHERE id = ${id}
    `.catch(() => {});
    if (Array.isArray(body.job_types)) {
      await sql`UPDATE jobs SET job_types_list = ${JSON.stringify(body.job_types)}::jsonb WHERE id = ${id}`.catch(() => {});
    }
    await sql.end();
    return c.json({ success: true, message: "Job updated successfully.", data: { id, ...body } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Update job failure" } }, 500);
  }
});

jobsRouter.delete("/:id", authenticate(), async (c) => {
  const id = c.req.param("id") || "";
  const sql = getDb(c.env);
  await sql`UPDATE jobs SET deleted_at = NOW(), status = 'archived' WHERE id = ${id}`.catch(() => {});
  await sql.end();
  return c.json({ success: true, message: "Job archived and removed from public catalog." });
});

// Super Admin Job Moderation
adminJobsRouter.post("/quick-post", async (c) => {
  try {
    const payload = await c.req.json().catch(() => ({}));
    const companyData = payload.company || {};
    const jobData = payload.job || {};

    const companyName = (companyData.name || "Confidential Employer").toString().trim() || "Confidential Employer";
    const jobTitle = (jobData.title || "Open Career Opportunity").toString().trim() || "Open Career Opportunity";
    const fullDescription = (jobData.full_description || jobData.short_description || "Further details regarding responsibilities and qualifications will be shared during interview steps.").toString();
    const shortDescription = (jobData.short_description || fullDescription.slice(0, 150) + "...").toString();
    const workMode = (jobData.work_mode || "On-site").toString();
    const city = (jobData.city || "Various Locations").toString();
    const state = (jobData.state || "India").toString();
    const country = (jobData.country || "IN").toString();
    const currency = (jobData.currency || "INR").toString();

    const sql = getDb(c.env);
    const companySlug = slugify(companyName);
    const jobSlug = `${slugify(jobTitle)}-${Math.floor(1000 + Math.random() * 9000)}`;

    let companyId: string;
    let jobId: string;

    await sql.begin(async (tx: any) => {
      const existingCo = await tx`SELECT id FROM companies WHERE slug = ${companySlug} AND deleted_at IS NULL LIMIT 1`;
      if (existingCo.length > 0) {
        companyId = existingCo[0].id;
      } else {
        const newCo = await tx`
          INSERT INTO companies (name, slug, website, status)
          VALUES (${companyName}, ${companySlug}, ${companyData.website || ""}, 'verified')
          RETURNING id
        `;
        companyId = newCo[0].id;
      }

      let jobTypeSlug = (jobData.job_type || "fresher-jobs").toString().toLowerCase().trim();
      let jobTypeId = 1;
      const typeRows = await tx`SELECT id, slug FROM job_types WHERE slug = ${jobTypeSlug} OR name ILIKE ${jobTypeSlug} LIMIT 1`;
      if (typeRows.length > 0) {
        jobTypeId = typeRows[0].id;
        jobTypeSlug = typeRows[0].slug;
      }

      const jobTypesList = Array.isArray(jobData.job_types) && jobData.job_types.length > 0
        ? jobData.job_types
        : [jobTypeSlug];

      const responsibilitiesJSON = JSON.stringify(jobData.responsibilities || []);
      const requirementsJSON = JSON.stringify(jobData.requirements || []);
      const qualificationsJSON = JSON.stringify(jobData.qualifications || []);
      const benefitsJSON = JSON.stringify(jobData.benefits || []);
      const publishedAt = new Date().toISOString();

      const insertedJobs = await tx`
        INSERT INTO jobs (
          company_id, job_type_id, title, slug, short_description, full_description,
          responsibilities, requirements, qualifications, benefits,
          salary_min, salary_max, currency, salary_period, salary_basis,
          experience_min, experience_max, education, openings,
          work_mode, country, state, city, status, visibility,
          job_types_list, published_at
        )
        VALUES (
          ${companyId}, ${jobTypeId}, ${jobTitle}, ${jobSlug}, ${shortDescription}, ${fullDescription},
          ${responsibilitiesJSON}::jsonb, ${requirementsJSON}::jsonb, ${qualificationsJSON}::jsonb, ${benefitsJSON}::jsonb,
          NULLIF(${Number(jobData.salary_min) || 0}, 0), NULLIF(${Number(jobData.salary_max) || 0}, 0), ${currency}, ${jobData.salary_period || "annual"}, ${jobData.salary_basis || "ctc"},
          ${Number(jobData.experience_min) || 0}, NULLIF(${Number(jobData.experience_max) || 0}, 0), ${jobData.education || "Any Graduate"}, ${Number(jobData.openings) || 1},
          ${workMode}, ${country}, ${state}, ${city}, 'published', 'public',
          ${JSON.stringify(jobTypesList)}::jsonb, ${publishedAt}
        )
        RETURNING id
      `;

      jobId = insertedJobs[0].id;
    });

    await sql.end();

    return c.json({
      success: true,
      message: "Job quickly posted via Cloudflare Edge!",
      data: {
        job: { id: jobId!, slug: jobSlug, title: jobTitle, status: "published" },
        company: { id: companyId!, name: companyName, slug: companySlug },
        seo: { canonical_url: `https://jobsviews.com/jobs/${jobSlug}` },
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: { code: 500, message: "Quick post failed at edge", details: error.message } }, 500);
  }
});

adminJobsRouter.get("/", authenticate(), async (c) => {
  try {
    const sql = getDb(c.env);
    const jobs = await sql`
      SELECT j.*, c.name as company_name FROM jobs j
      JOIN companies c ON c.id = j.company_id
      WHERE j.deleted_at IS NULL ORDER BY j.created_at DESC LIMIT 100
    `;
    await sql.end();
    return c.json({ success: true, data: { items: jobs, total: jobs.length, page: 1, limit: 100 } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Admin jobs query failure" } }, 500);
  }
});

adminJobsRouter.patch("/:id/status", authenticate(), async (c) => {
  const id = c.req.param("id") || "";
  const body = await c.req.json().catch(() => ({}));
  const status = body.status || "published";
  const sql = getDb(c.env);
  await sql`UPDATE jobs SET status = ${status}, updated_at = NOW() WHERE id = ${id}`.catch(() => {});
  await sql.end();
  return c.json({ success: true, message: `Job status transitioned to ${status}.` });
});
