# 🗂️ Jobs View - Entity Strategy & Taxonomy

This document defines the entity classification, extraction rules, and metadata tagging standards for the core entities in Jobs View.

---

## 1. Core Entity Directory

We classify eight core entities to build our semantic career graph:

1. **`User`:** The human actor (Candidate, Employer, Admin).
2. **`Company`:** The hiring organization (verified via business domain).
3. **`Job`:** The active or draft employment opportunity.
4. **`Skill`:** A specific capability (e.g., "Go", "React", "Project Management").
5. **`City` / `State` / `Country`:** The physical or virtual location entities.
6. **`Category`:** The functional department (e.g., "Software Development", "Marketing").
7. **`Industry`:** The business vertical (e.g., "Fintech", "Edtech", "SaaS").

---

## 2. Entity Extraction & Tagging Rules

To maintain clean data, entities must be standardized on creation:

### 2.1 Skill Normalization
- When a user enters a skill or a job post lists requirements, the Go API processes the text:
  - **Lowercasing & Trimming:** E.g., " React.js " → `react-js`.
  - **Synonym Mapping:** Map variations to a single parent skill:
    - `golang`, `go programming` → **`Go`**
    - `react`, `reactjs`, `react.js` → **`React`**
- **Taxonomy Table:** Governed by the `skills` table. If a skill is not found, it is queued for admin review before being added to the global taxonomy.

### 2.2 Location Normalization
- All locations must map to verified `cities`, `states`, and `countries` tables.
- Free-text location inputs are disallowed. Users must select from an autocomplete dropdown populated by our location database, preventing duplicates (e.g., "New York", "NY", "NYC" all resolve to `New York City, NY, US`).

---

## 3. Entity Interlinking
- **SQL Representation:** Many-to-many join tables (`job_skills`, `candidate_skills`) link skills to jobs and candidates.
- **Benefits:** Enables instant skill-gap analysis (e.g., comparing a candidate's skills to a job's required skills) and powers the semantic search engine.
