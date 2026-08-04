DROP TRIGGER IF EXISTS trg_company_settings_updated_at ON company_settings;
DROP TRIGGER IF EXISTS trg_company_departments_updated_at ON company_departments;
DROP TRIGGER IF EXISTS trg_company_branches_updated_at ON company_branches;
DROP TRIGGER IF EXISTS trg_company_verifications_updated_at ON company_verifications;

DROP TABLE IF EXISTS company_analytics;
DROP TABLE IF EXISTS company_media;
DROP TABLE IF EXISTS company_settings;
DROP TABLE IF EXISTS company_departments;
DROP TABLE IF EXISTS company_branches;
DROP TABLE IF EXISTS company_verifications;
DROP TABLE IF EXISTS company_invites;

ALTER TABLE company_users
    DROP COLUMN IF EXISTS accepted_at,
    DROP COLUMN IF EXISTS invited_by,
    DROP COLUMN IF EXISTS permissions;

ALTER TABLE companies
    DROP COLUMN IF EXISTS suspended_at,
    DROP COLUMN IF EXISTS rejected_at,
    DROP COLUMN IF EXISTS approved_at,
    DROP COLUMN IF EXISTS verification_notes,
    DROP COLUMN IF EXISTS verified_badge,
    DROP COLUMN IF EXISTS gallery,
    DROP COLUMN IF EXISTS benefits,
    DROP COLUMN IF EXISTS social_links,
    DROP COLUMN IF EXISTS cin_number,
    DROP COLUMN IF EXISTS gst_number,
    DROP COLUMN IF EXISTS headquarters,
    DROP COLUMN IF EXISTS founded_year,
    DROP COLUMN IF EXISTS culture,
    DROP COLUMN IF EXISTS vision,
    DROP COLUMN IF EXISTS mission,
    DROP COLUMN IF EXISTS about,
    DROP COLUMN IF EXISTS banner_url,
    DROP COLUMN IF EXISTS status;
