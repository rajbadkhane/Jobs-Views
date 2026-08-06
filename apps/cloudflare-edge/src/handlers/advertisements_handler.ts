import { Hono } from "hono";
import { getDb, Env } from "../db";
import { authenticate, getCurrentUser, AppEnv } from "../middleware";

export const advertisementsRouter = new Hono<AppEnv>();
export const publicAdvertisementsRouter = new Hono<AppEnv>();

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const STORAGE_BUCKET = "advertisements";

advertisementsRouter.use("/*", authenticate());

let bucketEnsured = false;

/**
 * Lazily creates the public "advertisements" bucket in Supabase Storage the first time
 * this Worker instance handles an upload. Cheap no-op once the bucket already exists.
 */
async function ensureBucket(env: Env) {
  if (bucketEnsured) return;
  const base = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!base || !key) return;
  await fetch(`${base}/storage/v1/bucket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ id: STORAGE_BUCKET, name: STORAGE_BUCKET, public: true, file_size_limit: MAX_IMAGE_BYTES }),
  }).catch(() => {});
  bucketEnsured = true;
}

/**
 * GET /api/v1/admin/advertisements
 * Lists every banner (active and inactive) for the admin management screen.
 */
advertisementsRouter.get("/", async (c) => {
  try {
    const sql = getDb(c.env);
    const items = await sql`
      SELECT a.*, u.email as created_by_email
      FROM advertisements a
      LEFT JOIN users u ON u.id = a.created_by
      ORDER BY a.sort_order ASC, a.created_at DESC
    `;
    await sql.end();
    return c.json({ success: true, data: { items, total: items.length } });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to load advertisements", details: err.message } }, 500);
  }
});

/**
 * POST /api/v1/admin/advertisements
 * Uploads a banner image to Supabase Storage and creates the advertisement record. Expects
 * multipart/form-data with an `image` file field plus title/link_url/alt_text/placement/sort_order fields.
 */
advertisementsRouter.post("/", async (c) => {
  const auth = getCurrentUser(c);
  const supabaseUrl = (c.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = c.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) {
    return c.json({ success: false, error: { code: 503, message: "Image storage is not configured yet. Ask an engineer to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." } }, 503);
  }

  let form: FormData;
  try {
    form = await c.req.formData();
  } catch {
    return c.json({ success: false, error: { code: 400, message: "Expected multipart/form-data with an image file." } }, 400);
  }

  const rawFile = form.get("image") as File | null;
  const title = (form.get("title") || "").toString().trim();
  const linkUrl = (form.get("link_url") || "").toString().trim();
  const altText = (form.get("alt_text") || "").toString().trim();
  const placement = (form.get("placement") || "homepage_hero").toString().trim();
  const sortOrder = Number(form.get("sort_order")) || 0;

  if (!rawFile || typeof rawFile.arrayBuffer !== "function") {
    return c.json({ success: false, error: { code: 400, message: "An image file is required." } }, 400);
  }
  const file = rawFile;
  if (!title) {
    return c.json({ success: false, error: { code: 400, message: "A title is required." } }, 400);
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return c.json({ success: false, error: { code: 400, message: "Image must be PNG, JPEG, WEBP, or GIF." } }, 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return c.json({ success: false, error: { code: 400, message: "Image must be smaller than 5MB." } }, 400);
  }

  try {
    await ensureBucket(c.env);

    const extension = file.type.split("/")[1] || "png";
    const key = `${crypto.randomUUID()}.${extension}`;
    const bytes = await file.arrayBuffer();

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: bytes,
    });
    if (!uploadRes.ok) {
      const detail = await uploadRes.text().catch(() => "");
      return c.json({ success: false, error: { code: 502, message: "Failed to upload image to storage.", details: detail } }, 502);
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${key}`;

    const sql = getDb(c.env);
    const inserted = await sql`
      INSERT INTO advertisements (title, image_url, link_url, alt_text, placement, sort_order, created_by)
      VALUES (${title}, ${imageUrl}, ${linkUrl || null}, ${altText || title}, ${placement}, ${sortOrder}, ${auth.id})
      RETURNING *
    `;
    await sql.end();
    return c.json({ success: true, message: "Advertisement banner uploaded.", data: inserted[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to upload advertisement", details: err.message } }, 500);
  }
});

/**
 * PATCH /api/v1/admin/advertisements/:id
 * Updates banner fields (commonly used to toggle is_active, or edit link/title).
 */
advertisementsRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  try {
    const sql = getDb(c.env);
    const updated = await sql`
      UPDATE advertisements SET
        title = COALESCE(${body.title ?? null}, title),
        link_url = ${body.link_url !== undefined ? body.link_url || null : sql`link_url`},
        alt_text = COALESCE(${body.alt_text ?? null}, alt_text),
        placement = COALESCE(${body.placement ?? null}, placement),
        is_active = COALESCE(${typeof body.is_active === "boolean" ? body.is_active : null}, is_active),
        sort_order = COALESCE(${typeof body.sort_order === "number" ? body.sort_order : null}, sort_order),
        starts_at = ${body.starts_at !== undefined ? body.starts_at || null : sql`starts_at`},
        ends_at = ${body.ends_at !== undefined ? body.ends_at || null : sql`ends_at`}
      WHERE id = ${id}
      RETURNING *
    `;
    await sql.end();
    if (updated.length === 0) {
      return c.json({ success: false, error: { code: 404, message: "Advertisement not found." } }, 404);
    }
    return c.json({ success: true, message: "Advertisement updated.", data: updated[0] });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to update advertisement", details: err.message } }, 500);
  }
});

/**
 * DELETE /api/v1/admin/advertisements/:id
 * Removes the DB record and the underlying Supabase Storage object.
 */
advertisementsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const sql = getDb(c.env);
    const rows = await sql`DELETE FROM advertisements WHERE id = ${id} RETURNING image_url`;
    await sql.end();
    if (rows.length === 0) {
      return c.json({ success: false, error: { code: 404, message: "Advertisement not found." } }, 404);
    }
    const supabaseUrl = (c.env.SUPABASE_URL || "").replace(/\/$/, "");
    const serviceKey = c.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const imageUrl: string = rows[0].image_url || "";
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    if (supabaseUrl && serviceKey && imageUrl.includes(marker)) {
      const key = imageUrl.slice(imageUrl.indexOf(marker) + marker.length);
      await fetch(`${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${key}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
      }).catch(() => {});
    }
    return c.json({ success: true, message: "Advertisement removed." });
  } catch (err: any) {
    return c.json({ success: false, error: { code: 500, message: "Failed to delete advertisement", details: err.message } }, 500);
  }
});

/**
 * GET /api/v1/content/advertisements?placement=homepage_hero
 * Public endpoint: returns currently active, in-schedule banners for a placement slot.
 */
publicAdvertisementsRouter.get("/advertisements", async (c) => {
  const placement = c.req.query("placement") || "homepage_hero";
  try {
    const sql = getDb(c.env);
    const items = await sql`
      SELECT id, title, image_url, link_url, alt_text, sort_order
      FROM advertisements
      WHERE placement = ${placement}
        AND is_active = true
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (ends_at IS NULL OR ends_at >= NOW())
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 5
    `.catch(() => []);
    await sql.end();
    return c.json({ success: true, data: { items } });
  } catch (err: any) {
    return c.json({ success: true, data: { items: [] } });
  }
});
