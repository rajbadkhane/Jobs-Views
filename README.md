# 🚀 Jobs View - Monorepo

Welcome to the **Jobs View** monorepo—the unified platform managing candidates, employers, and admin services.

---

## 📦 Project Structure

```text
├── apps/
│   ├── web/                    # Next.js (Candidate & Employer frontend)
│   ├── admin/                  # Next.js (Super Admin dashboard)
│   └── api/                    # Go (Fiber) Backend API
├── packages/
│   ├── ui/                     # Shared React + Vanilla CSS Component Library
│   ├── types/                  # Shared TypeScript API contracts
│   └── config/                 # Shared ESLint, Prettier, and TS configs
├── docs/                       # Platform blueprint & architecture docs
└── docker-compose.yml          # Local Postgres & Redis services
```

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js:** v18+ (npm v9+)
- **Go:** v1.21+
- **Docker & Docker Compose**

### 1. Start Local Databases
Spin up local PostgreSQL and Redis instances:
```bash
npm run docker:up
```

### 2. Install Dependencies
Install all package dependencies across the monorepo:
```bash
npm install
```

### 3. Start Development Servers
Run the Go API and Next.js applications concurrently:
```bash
npm run dev
```

---

## ⚙️ Coding & Formatting Standards

- **Go Code:** Formatted via `gofmt` and imports organized via `goimports`.
- **TypeScript & CSS:** Formatted via Prettier and linted via ESLint.
- **Git Commits:** Follow [Conventional Commits](file:///d:/New%20folder/Jobs%20View/docs/26-ProjectStandards.md#L32) (e.g., `feat(auth): add google login`).

---

## 🚀 Release Strategy
- **Continuous Integration (CI):** Every Pull Request to `develop` triggers automated linting, formatting, and unit test suites.
- **Staging:** Merges to `develop` are automatically deployed to the staging environment for verification.
- **Production:** The Go API deploys to Render from `render.yaml`, PostgreSQL runs on Supabase, and the web, employer, and admin Next.js apps deploy to Vercel.

Deployment setup is documented in [docs/DeploymentTargets.md](docs/DeploymentTargets.md).

---

## ✅ Definition of Done (DoD)
Before any task/PR is marked as complete, it must satisfy:
1. **Linting & Formatting:** 100% clean check. No ESLint warnings; formatted with Prettier/Gofmt.
2. **Type Safety:** Zero TypeScript compilation errors.
3. **Tests:** All unit tests pass.
4. **Documentation:** Any new API endpoints or database changes are documented in the [docs/](file:///d:/New%20folder/Jobs%20View/docs) directory.
5. **Code Review:** Approved by at least one peer.
