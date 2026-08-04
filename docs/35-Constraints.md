# 🛡️ Jobs View - Constraints & Data Validation

This document outlines the database-level constraints and validation rules implemented in Jobs View to guarantee data integrity, consistency, and safety.

---

## 1. Domain & CHECK Constraints

CHECK constraints validate column values before they are written to a table, preventing invalid data from entering the database.

### 1.1 `jobs` Table Constraints
- **Salary Check:** Ensures the minimum salary does not exceed the maximum salary, and both are positive.
  ```sql
  CONSTRAINT check_salary_range CHECK (
      (salary_min IS NULL OR salary_min >= 0) AND
      (salary_max IS NULL OR salary_max >= 0) AND
      (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
  );
  ```
- **Job Status Validation:** Enforces valid state transitions.
  ```sql
  CONSTRAINT check_job_status CHECK (
      status IN ('draft', 'published', 'closed', 'archived')
  );
  ```

### 1.2 `candidate_profiles` Table Constraints
- **Profile Completion Score:** Enforces a valid percentage range (0 to 100).
  ```sql
  CONSTRAINT check_completion_score CHECK (
      completed_score BETWEEN 0 AND 100
  );
  ```
- **Visibility Settings:** Restricts profile visibility options.
  ```sql
  CONSTRAINT check_visibility CHECK (
      visibility IN ('public', 'private')
  );
  ```

### 1.3 `plans` Table Constraints
- **Price Check:** Enforces non-negative pricing.
  ```sql
  CONSTRAINT check_price_positive CHECK (
      price >= 0
  );
  ```

---

## 2. Uniqueness & Composite Constraints

To prevent duplicate data and protect platform mechanics.

### 2.1 Prevent Double Application (`applications` table)
A candidate is allowed to apply to a job posting only once. This is enforced via a composite unique constraint:
```sql
CONSTRAINT unique_job_candidate UNIQUE (job_id, candidate_profile_id);
```

### 2.2 Active-Record Uniqueness (Partial Unique Indexes)
We use partial unique indexes rather than standard unique constraints on soft-deleted tables to allow users to sign up again with the same email if their previous account was soft-deleted:
```sql
CREATE UNIQUE INDEX users_email_active_idx ON users(email) 
WHERE deleted_at IS NULL;
```

---

## 3. Referential Integrity (Foreign Key Constraints)

Foreign keys enforce valid relationships between tables, specifying actions to take when parent records are updated or deleted.

| Child Table | Foreign Key Column | Parent Table | On Delete Action | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `candidate_profiles` | `user_id` | `users` | **`CASCADE`** | If a candidate deletes their user account, their profile is deleted. |
| `companies` | `user_id` | `users` | **`RESTRICT`** | An employer user cannot delete their account while their company profile is active. |
| `jobs` | `company_id` | `companies` | **`CASCADE`** | Deleting a company profile automatically deletes all of its job posts. |
| `applications` | `job_id` | `jobs` | **`CASCADE`** | Deleting a job post deletes all candidate applications for that job. |
| `applications` | `resume_id` | `resumes` | **`RESTRICT`** | A candidate cannot delete a resume if it is linked to an active job application. |
