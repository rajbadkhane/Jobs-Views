# 🗄️ Jobs View - Database Strategy

This document defines the database standards, conventions, and operational strategies for the Jobs View PostgreSQL database.

---

## 1. Core Database Standards

### 1.1 PostgreSQL Version
- **Selected Version:** **PostgreSQL 15+**
- **Reasoning:** Version 15 introduces significant performance improvements for sorting, faster `JSONB` operations, support for the standard `MERGE` SQL statement, and improved logical replication.

### 1.2 UUID Strategy
- **Primary Keys:** All tables representing core entities must use **UUID v4** as their primary keys instead of auto-incrementing integers (`SERIAL`).
- **Implementation:** Enabled via the native PostgreSQL function `gen_random_uuid()` (built-in from PostgreSQL 13+).
- **Benefits:** 
  - Prevents ID enumeration attacks (e.g., a competitor scraping jobs by iterating `/api/v1/jobs/1`, `/api/v1/jobs/2`).
  - Enables secure offline ID generation on the client or application server before writing to the database.
  - Simplifies future database sharding, replication, and data merging across environments.

### 1.3 Naming Conventions
- **Table Names:** Plural and `snake_case` (e.g., `users`, `candidate_profiles`, `jobs`).
- **Column Names:** Singular and `snake_case` (e.g., `first_name`, `salary_min`, `company_id`).
- **Foreign Keys:** Named using the pattern `{target_singular_table_name}_id` (e.g., `company_id` referencing `companies.id`).
- **Indexes:** Named using `{table_name}_{column_names_joined}_idx` (e.g., `jobs_status_category_idx`).
- **Constraints:** Named using `{table_name}_{column_name}_{constraint_type}` (e.g., `users_email_key` or `jobs_salary_check`).

---

## 2. Audit & Temporal Strategy

### 2.1 Timestamp Strategy
- All temporal columns must use **`TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`)**.
- Storing time zones prevents timezone-shifting bugs when servers, databases, or users are in different geographic locations. All application servers write timestamps in **UTC**.

### 2.2 Standard Audit Columns
Every table must include the following audit fields to track record lifecycles:

```sql
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
deleted_at TIMESTAMPTZ
```

- **`created_at`:** Set automatically on row insertion. Never updated.
- **`updated_at`:** Updated automatically via a database trigger on row modification.
- **Trigger Example:**
  ```sql
  CREATE OR REPLACE FUNCTION update_modified_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

---

## 3. Soft Delete Strategy

To preserve historical data, maintain audit trails, and prevent accidental data loss, Jobs View implements a **Soft Delete** strategy.

### 3.1 Mechanism
- When a user deletes a record (e.g., deleting a job post or profile), the system executes an `UPDATE` query:
  ```sql
  UPDATE jobs SET deleted_at = NOW() WHERE id = $1;
  ```
- **Active Record Queries:** All queries fetching active records must filter out soft-deleted rows:
  ```sql
  SELECT * FROM jobs WHERE deleted_at IS NULL;
  ```
- **Uniqueness Constraints:** To allow users to re-register or reuse unique fields after soft deletion, unique indexes must be partial:
  ```sql
  CREATE UNIQUE INDEX users_email_active_idx ON users(email) WHERE deleted_at IS NULL;
  ```
- **Hard Deletes:** Reserved only for GDPR/privacy compliance requests (e.g., "Right to be Forgotten"), executed by an admin script that purges the user and cascades to all child tables.
