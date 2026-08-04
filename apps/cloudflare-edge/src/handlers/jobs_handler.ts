import { Hono } from "hono";
import { getDb, getRedis, Env } from "../db";

export const jobsRouter = new Hono<{ Bindings: Env }>();
export const adminJobsRouter = new Hono<{ Bindings: Env }>();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || `job-${Date.now()}`;
}

/**
 * GET /api/v1/jobs
 * Returns public job catalog with fast Cloudflare Edge caching and search parameter support
 */
jobsRouter.get("/", async (c) => {
  try {
    const search = c.req.query("search") || c.req.query("q") || "";
    const jobType = c.req.query("job_type") || c.req.query("type") || "";
    const state = c.req.query("state") || "";
    const workMode = c.req.query("work_mode") || "";

    const sql = getDb(c.env);

    // Build resilient query retrieving verified jobs, company logos, and multi-select category lists
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
      LIMIT 50
    `;

    await sql.end();

    return c.json({
      success: true,
      data: {
        items: jobs.map((row: any) => ({
          ...row,
          job_types: Array.isArray(row.job_types_list) ? row.job_types_list : (row.job_type ? [row.job_type] : []),
        })),
        page: 1,
        limit: 50,
        total: jobs.length,
      },
    });
  } catch (error: any) {
    console.error("[Edge Jobs List Error]:", error.message);
    return c.json({ success: false, error: { code: 500, message: "Failed to load job listings at edge", details: error.message } }, 500);
  }
});

/**
 * POST /api/v1/admin/jobs/quick-post
 * Serverless Admin Quick Job Post supporting optional inputs and multi-select category tags
 */
adminJobsRouter.post("/quick-post", async (c) => {
  try {
    const payload = await c.req.json().catch(() => ({}));
    const companyData = payload.company || {};
    const jobData = payload.job || {};

    // Resilient optional field fallbacks
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
      // 1. Resolve or insert company
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

      // 2. Resolve job type ID and process multi-select category tagging array
      let jobTypeSlug = (jobData.job_type || "fresher-jobs").toString().toLowerCase().trim();
      let jobTypeId = 1; // Default fallback to first job type ID
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

      // 3. Insert job record with multi-select list array
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

      // 4. Attach skills if specified
      if (Array.isArray(jobData.skills)) {
        for (const sk of jobData.skills) {
          if (!sk || !sk.name) continue;
          await tx`
            INSERT INTO job_skills (job_id, name, requirement_type, level, years_experience)
            VALUES (${jobId}, ${sk.name.toString().trim()}, ${sk.requirement_type || "required"}, ${sk.level || "intermediate"}, ${Number(sk.years_experience) || 0})
            ON CONFLICT (job_id, name, requirement_type) DO NOTHING
          `.catch(() => {});
        }
      }
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
    console.error("[Edge Admin Quick Post Error]:", error.message);
    return c.json({ success: false, error: { code: 500, message: "Quick post failed at edge", details: error.message } }, 500);
  }
});
