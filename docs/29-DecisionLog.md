# 📓 Jobs View - Architectural Decision Log (ADR)

This log records the key architectural decisions made for the Jobs View platform, outlining the context, alternatives considered, and rationale.

---

## ADR 01: Backend Framework (Go Fiber)
- **Status:** Approved
- **Context:** We need a high-performance backend capable of fast response times (under 50ms) and handling concurrent tasks (file uploads, parsing, messaging) with low resource consumption.
- **Alternatives:** Node.js (Express), Python (FastAPI).
- **Decision:** **Go (Fiber)**.
- **Rationale:** Go compiles to a single binary and has a lightweight footprint. Fiber provides an Express-like routing API on top of `fasthttp`, making it familiar to write while delivering superior throughput and minimal RAM usage.

---

## ADR 02: Primary Database (PostgreSQL)
- **Status:** Approved
- **Context:** The application data (users, profiles, jobs, applications) is highly structured and relational.
- **Alternatives:** MongoDB, DynamoDB.
- **Decision:** **PostgreSQL**.
- **Rationale:** Relational integrity, foreign key constraints, and transaction safety are critical for application tracking and billing. PostgreSQL's robust support for `JSONB` allows us to store unstructured parsed resume data while keeping the rest of our database strictly relational.

---

## ADR 03: Frontend Framework (Next.js App Router)
- **Status:** Approved
- **Context:** Public job listings and company profiles must be indexed by search engines to drive organic traffic, while candidate and employer dashboards require highly interactive, stateful interfaces.
- **Alternatives:** React SPA (Vite) + Separate SSR server.
- **Decision:** **Next.js (App Router)**.
- **Rationale:** Next.js merges Server-Side Rendering (SSR) for SEO-sensitive public pages with React client-side rendering for dashboards in a single unified codebase, eliminating the need to manage separate frontend servers.

---

## ADR 04: Styling Strategy (Tailwind CSS & Vanilla CSS)
- **Status:** Approved
- **Context:** We need a highly customized, premium UI (incorporating glassmorphic elements and micro-animations) without sacrificing page speed.
- **Alternatives:** Material UI (MUI), styled-components.
- **Decision:** **Tailwind CSS + Vanilla CSS**.
- **Rationale:** Component libraries like MUI bloat the JavaScript bundle and slow down rendering. Tailwind CSS generates static utility classes, and custom Vanilla CSS allows us to build premium animations and glassmorphic designs with zero runtime overhead.

---

## ADR 05: Caching & Session Store (Redis)
- **Status:** Approved
- **Context:** We need to offload reads from PostgreSQL, store active sessions, and implement API rate-limiting.
- **Alternatives:** In-memory maps, Database tables.
- **Decision:** **Redis**.
- **Rationale:** Redis is an ultra-fast, in-memory key-value store. It provides built-in TTL (Time-to-Live) for caching, supports atomic operations for rate-limiting, and shares session state across multiple instances of the Go API.

---

## ADR 06: Access Control Model (RBAC)
- **Status:** Approved
- **Context:** We need to restrict API and page access based on user roles (Candidate, Employer, Admin).
- **Alternatives:** Attribute-Based Access Control (ABAC).
- **Decision:** **Role-Based Access Control (RBAC)**.
- **Rationale:** The user roles in Jobs View have a clear, distinct hierarchy. RBAC is simple to implement, has low computational overhead, and is fully sufficient to secure the platform.
