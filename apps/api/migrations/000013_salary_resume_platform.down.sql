DROP TABLE IF EXISTS resume_document_versions;
DROP TABLE IF EXISTS resume_documents;
DROP TABLE IF EXISTS salary_benchmarks;
DROP TABLE IF EXISTS salary_imports;
DROP TABLE IF EXISTS salary_locations;
DROP TABLE IF EXISTS salary_role_aliases;
DROP TABLE IF EXISTS salary_sources;
ALTER TABLE jobs DROP COLUMN IF EXISTS salary_basis;
ALTER TABLE jobs DROP COLUMN IF EXISTS salary_period;
