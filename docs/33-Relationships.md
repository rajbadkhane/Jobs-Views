# 🔗 Jobs View - Table Relationships & Referential Integrity

This document details the database relationships in Jobs View, including cardinality, foreign keys, and cascading delete actions.

---

## 1. One-to-One Relationships

### 1.1 `users` ↔ `candidate_profiles`
- **Foreign Key:** `candidate_profiles.user_id` references `users.id`.
- **Constraint:** `UNIQUE` constraint on `candidate_profiles.user_id` enforces the one-to-one relationship.
- **Integrity Rule:** `ON DELETE CASCADE`. If a user deletes their account, their candidate profile is automatically deleted.

### 1.2 `users` ↔ `companies`
- **Foreign Key:** `companies.user_id` references `users.id`.
- **Constraint:** `UNIQUE` constraint on `companies.user_id` is NOT used, as an employer user could theoretically own multiple companies in the future. However, the application layer currently enforces a 1:1 mapping for standard employers.
- **Integrity Rule:** `ON DELETE RESTRICT`. A user account cannot be deleted if it is the owner of an active company profile. The company must be deleted first or ownership transferred.

---

## 2. One-to-Many Relationships

### 2.1 `companies` ↔ `jobs`
- **Foreign Key:** `jobs.company_id` references `companies.id`.
- **Integrity Rule:** `ON DELETE CASCADE`. If a company profile is deleted, all of its posted job listings are deleted.

### 2.2 `jobs` ↔ `applications`
- **Foreign Key:** `applications.job_id` references `jobs.id`.
- **Integrity Rule:** `ON DELETE CASCADE`. Deleting a job listing automatically deletes all applications associated with it.

### 2.3 `candidate_profiles` ↔ `applications`
- **Foreign Key:** `applications.candidate_profile_id` references `candidate_profiles.id`.
- **Integrity Rule:** `ON DELETE CASCADE`. Deleting a candidate profile deletes all of their job applications.

### 2.4 `candidate_profiles` ↔ `resumes`
- **Foreign Key:** `resumes.candidate_profile_id` references `candidate_profiles.id`.
- **Integrity Rule:** `ON DELETE CASCADE`. Deleting a candidate profile deletes all of their uploaded resumes.

---

## 3. Many-to-Many Relationships

Many-to-many relationships are resolved using join tables containing composite primary keys.

### 3.1 `jobs` ↔ `skills` (via `job_skills`)
- **Join Table:** `job_skills`
- **Columns:**
  - `job_id` UUID REFERENCES `jobs(id)` ON DELETE CASCADE
  - `skill_id` INT REFERENCES `skills(id)` ON DELETE CASCADE
- **Primary Key:** Composite `(job_id, skill_id)`

### 3.2 `candidate_profiles` ↔ `skills` (via `candidate_skills`)
- **Join Table:** `candidate_skills`
- **Columns:**
  - `candidate_profile_id` UUID REFERENCES `candidate_profiles(id)` ON DELETE CASCADE
  - `skill_id` INT REFERENCES `skills(id)` ON DELETE CASCADE
- **Primary Key:** Composite `(candidate_profile_id, skill_id)`

### 3.3 `roles` ↔ `permissions` (via `role_permissions`)
- **Join Table:** `role_permissions`
- **Columns:**
  - `role_id` INT REFERENCES `roles(id)` ON DELETE CASCADE
  - `permission_id` INT REFERENCES `permissions(id)` ON DELETE CASCADE
- **Primary Key:** Composite `(role_id, permission_id)`
 Cassandra
