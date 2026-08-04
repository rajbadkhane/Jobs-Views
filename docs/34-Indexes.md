# ⚡ Jobs View - Database Indexing Strategy

This document specifies the indexing strategy for the Jobs View PostgreSQL database, ensuring sub-second response times for search, filtering, and authorization queries.

---

## 1. B-Tree Indexes (Standard Lookups & Joins)

B-Tree indexes are used for exact matches, range queries, sorting, and foreign key joins.

### 1.1 Unique Partial Indexes
To support soft deletion, unique constraints are applied only to active (non-deleted) records:

```sql
-- Unique active email lookup
CREATE UNIQUE INDEX users_email_active_idx ON users(email) 
WHERE deleted_at IS NULL;

-- Unique active company slug lookup
CREATE UNIQUE INDEX companies_slug_active_idx ON companies(slug) 
WHERE deleted_at IS NULL;

-- Unique active job slug lookup
CREATE UNIQUE INDEX jobs_slug_active_idx ON jobs(slug) 
WHERE deleted_at IS NULL;
```

### 1.2 Foreign Key & Join Indexes
Every foreign key column must have an index to optimize join performance during queries:

```sql
-- Optimize candidate dashboard
CREATE INDEX applications_candidate_profile_id_idx ON applications(candidate_profile_id);

-- Optimize company job listings
CREATE INDEX jobs_company_id_idx ON jobs(company_id);

-- Optimize resume lookups
CREATE INDEX resumes_candidate_profile_id_idx ON resumes(candidate_profile_id);
```

### 1.3 Composite Filtering Indexes
To speed up the job search page which uses multiple filters (facets):

```sql
-- Composite index for faceted job search
CREATE INDEX jobs_filter_idx ON jobs(status, category_id, job_type_id, employment_type_id, city_id) 
WHERE deleted_at IS NULL AND status = 'published';
```

---

## 2. Full-Text & Fuzzy Search Indexes

For high-speed keyword searching and autocomplete inputs.

### 2.1 Full-Text Search (GIN Index)
We use PostgreSQL’s native full-text search with a stored generated column to index job titles and descriptions:

```sql
-- 1. Add search vector column
ALTER TABLE jobs ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
) STORED;

-- 2. Create GIN index on the vector
CREATE INDEX jobs_search_vector_idx ON jobs USING gin(search_vector);
```
*Query Example:*
```sql
SELECT * FROM jobs 
WHERE search_vector @@ plainto_tsquery('english', 'Go React Developer') 
AND deleted_at IS NULL;
```

### 2.2 Autocomplete & Fuzzy Search (Trigram Index)
To support partial word matching (e.g., typing "Rea" and showing "React") and typo tolerance:

```sql
-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN trigram index on job title
CREATE INDEX jobs_title_trgm_idx ON jobs USING gin(title gin_trgm_ops);

-- Create GIN trigram index on company name
CREATE INDEX companies_name_trgm_idx ON companies USING gin(name gin_trgm_ops);
```
