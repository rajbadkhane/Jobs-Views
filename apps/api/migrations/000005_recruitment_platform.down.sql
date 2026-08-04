DROP TRIGGER IF EXISTS trg_application_offers_updated_at ON application_offers;
DROP TRIGGER IF EXISTS trg_application_interviews_updated_at ON application_interviews;
DROP TRIGGER IF EXISTS trg_application_notes_updated_at ON application_notes;
DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;

DROP TABLE IF EXISTS recruitment_notifications;
DROP TABLE IF EXISTS application_offers;
DROP TABLE IF EXISTS application_interviews;
DROP TABLE IF EXISTS application_notes;
DROP TABLE IF EXISTS application_timeline;
DROP TABLE IF EXISTS applications;

ALTER TABLE saved_jobs
    DROP COLUMN IF EXISTS updated_at,
    DROP COLUMN IF EXISTS collection,
    DROP COLUMN IF EXISTS notes;
