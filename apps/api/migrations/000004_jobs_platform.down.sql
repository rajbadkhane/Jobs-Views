DROP TRIGGER IF EXISTS trg_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS trg_job_taxonomies_updated_at ON job_taxonomies;

DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS job_analytics;
DROP TABLE IF EXISTS job_skills;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS job_types;
DROP TABLE IF EXISTS job_taxonomies;
