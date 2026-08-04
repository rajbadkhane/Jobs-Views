# 📅 Jobs View - Short-Term Sprint Plan (Days 3 - 5)

This document provides a detailed breakdown of the tasks, dependencies, and deliverables for the next three days of development (Days 3, 4, and 5).

---

## 🚀 Day 3: Database Design & Migrations

### Objective
Establish the relational database schema, relationships, indexes, and initial migrations.

### Tasks
1. **Schema Definition:** Translate the [Database Schema](file:///d:/New%20folder/Jobs%20View/docs/09-Database.md) into raw SQL migration files (e.g., `000001_init.up.sql`).
2. **Relationships & Constraints:** Add explicit foreign key constraints, cascade rules, and check constraints (e.g., `salary_min <= salary_max`).
3. **Enums & Types:** Define database enums for application status (`applied`, `interviewing`, etc.) and job status (`draft`, `published`, `closed`).
4. **Index Strategy:** Implement indexes for:
   - Faceted searches (`jobs.status`, `jobs.category_id`).
   - Text search (`jobs.title` using trigram index).
   - Foreign keys to optimize joins.
5. **Migration Tool Setup:** Integrate a migration runner (e.g., `golang-migrate`) in the Go project to run migrations on startup or via CLI.

### Deliverables
- `migrations/` folder containing SQL up/down scripts.
- Configured database migration runner in the Go backend.

---

## 🔌 Day 4: API Design & Validation

### Objective
Define the API endpoints, generate request/response types, and set up input validation.

### Tasks
1. **API Routing Table:** Set up the Go Fiber router group for `/api/v1`.
2. **Schema Validation (Zod & Go):**
   - Write Zod schemas in `packages/types` for frontend form validation.
   - Write Go structs with `validate` tags using the `go-playground/validator` library for backend input validation.
3. **Common Response Handlers:** Build helper functions in Go to return standardized JSON responses (e.g., `SendSuccess`, `SendError`).
4. **Auth Middleware Setup:** Write the JWT parsing and claims verification middleware in Go.

### Deliverables
- Go Fiber router file (`routes.go`) with placeholder handlers.
- Input validation models for Auth, Jobs, and Profiles.
- Shared TypeScript types package (`packages/types`) populated with API request/response shapes.

---

## ⚙️ Day 5: Repository Setup & Dockerization

### Objective
Initialize the monorepo, configure the local development environment, and establish basic boilerplates.

### Tasks
1. **Monorepo Config:** Configure `package.json` workspaces and `turbo.json` for caching builds.
2. **Docker Compose:** Write `docker-compose.yml` to spin up local instances of PostgreSQL (v15) and Redis.
3. **Next.js Boilerplate:** Initialize the `apps/web` project, configure `tsconfig.json`, and set up the basic layout.
4. **Go Fiber Boilerplate:** Structure the Go API using **Clean Architecture** (Handlers -> Services -> Repositories).
5. **Environment Validation:** Write config loaders in Go and Next.js to validate required environment variables on startup (e.g., database connection string, JWT secret).

### Deliverables
- Functional monorepo root with `apps/web`, `apps/api`, and `packages/ui`.
- `docker-compose.yml` file.
- Working "Hello World" endpoints for both Next.js and Go Fiber.
