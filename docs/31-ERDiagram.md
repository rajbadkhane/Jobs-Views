# 📊 Jobs View - Entity Relationship (ER) Diagram

This document maps the complete database structure of Jobs View, illustrating how the 20 core entities connect and behave.

---

## 1. Complete ER Diagram

```mermaid
erDiagram
    %% Auth & User Management
    users ||--|| roles : "has one"
    roles ||--o{ role_permissions : "maps"
    permissions ||--o{ role_permissions : "maps"
    users ||--o{ notifications : "receives"
    
    %% Profiles & Resumes
    users ||--o| candidate_profiles : "owns"
    candidate_profiles ||--o{ resumes : "uploads"
    candidate_profiles ||--o{ candidate_skills : "possesses"
    skills ||--o{ candidate_skills : "maps"
    
    %% Companies & Subscriptions
    users ||--o| companies : "manages"
    companies ||--o| subscriptions : "has active"
    plans ||--o{ subscriptions : "defines limits"
    
    %% Locations
    countries ||--o{ states : "contains"
    states ||--o{ cities : "contains"
    
    %% Jobs & Taxonomy
    companies ||--o{ jobs : "posts"
    categories ||--o{ jobs : "categorizes"
    job_types ||--o{ jobs : "categorizes"
    employment_types ||--o{ jobs : "defines contract"
    cities ||--o{ jobs : "located in"
    
    %% Job Connections
    jobs ||--o{ job_skills : "requires"
    skills ||--o{ job_skills : "maps"
    
    %% Applications & Interactions
    candidate_profiles ||--o{ applications : "submits"
    jobs ||--o{ applications : "receives"
    applications ||--|| resumes : "references"
    
    candidate_profiles ||--o{ saved_jobs : "bookmarks"
    jobs ||--o{ saved_jobs : "bookmarked by"
```

---

## 2. Cardinality & Relationship Breakdown

### 2.1 User & Profile Associations (One-to-One)
- **`users` ↔ `candidate_profiles` (1:0..1):** A user account of role `JOB_SEEKER` has exactly one candidate profile. Admin or Employer accounts do not have candidate profiles.
- **`users` ↔ `companies` (1:0..1):** A user account of role `EMPLOYER` manages exactly one company.

### 2.2 Core Recruitment Flow (One-to-Many)
- **`companies` ↔ `jobs` (1:N):** A verified company can post multiple job listings. Each job belongs to one company.
- **`jobs` ↔ `applications` (1:N):** A job listing receives multiple applications. Each application belongs to a single job.
- **`candidate_profiles` ↔ `applications` (1:N):** A candidate can submit multiple applications, but only one application per job.
- **`candidate_profiles` ↔ `resumes` (1:N):** A candidate can upload multiple resume versions (e.g., for different roles), but one is flagged as `is_primary`.

### 2.3 Taxonomy & Metadata (Many-to-Many via Joins)
- **`jobs` ↔ `skills` (M:N via `job_skills`):** A job can require multiple skills, and a skill can be required by multiple jobs.
- **`candidate_profiles` ↔ `skills` (M:N via `candidate_skills`):** A candidate can possess multiple skills, and a skill can be possessed by multiple candidates.
- **`roles` ↔ `permissions` (M:N via `role_permissions`):** Roles contain multiple permissions, and permissions can be shared across roles.
