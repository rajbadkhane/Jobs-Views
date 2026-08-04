# 💻 Jobs View - Technology Decisions & Rationale

This document details the tech stack choices for Jobs View, comparing alternatives and outlining the reasoning behind our selections.

---

## 1. Frontend Decisions

### 1.1 Next.js vs. Single Page App (SPA) React
- **Decision:** **Next.js (v14+ App Router)**
- **Comparison:**
  - *SPA React (Vite):* Client-side rendering only. Excellent for authenticated dashboards, but poor for SEO because search engine bots see blank HTML before JS executes.
  - *Next.js:* Supports Server-Side Rendering (SSR) and Static Site Generation (SSG).
- **Rationale:** Since job boards and company profiles rely heavily on search engines for organic traffic, SSR is a hard requirement. Next.js gives us SEO benefits for public pages while supporting interactive React components for the dashboard.

### 1.2 Tailwind CSS + Custom CSS vs. Component Libraries (MUI/Chakra)
- **Decision:** **Tailwind CSS + Custom CSS (integrated via shadcn/ui)**
- **Rationale:** MUI and Chakra are heavy and inject inline styles, leading to larger bundle sizes and slower render speeds. Tailwind CSS provides utility classes that compile to tiny, static CSS files. Coupled with custom CSS for glassmorphism and animations, it yields a lightweight, highly custom, premium interface.

---

## 2. Backend Decisions

### 2.1 Go (Fiber) vs. Node.js (Express/NestJS) vs. Python (FastAPI)
- **Decision:** **Go (Fiber)**
- **Comparison:**
  - *Node.js/NestJS:* Good, but single-threaded event loop can bottleneck on heavy operations (e.g., PDF parsing, image processing). Larger memory usage.
  - *Python/FastAPI:* Fast to write, but slow to execute. High resource consumption under heavy concurrent loads.
  - *Go (Fiber):* Compiled language. Extremely fast execution speed. Built-in concurrency via Goroutines. Fasthttp engine handles hundreds of thousands of concurrent requests with minimal memory usage (~20MB RAM idle).
- **Rationale:** We require a backend that can scale on minimal hardware (VPS), respond under 50ms, and easily handle parallel tasks (e.g., processing multiple PDF resume uploads).

### 2.2 PostgreSQL vs. MongoDB
- **Decision:** **PostgreSQL**
- **Rationale:** Jobs View is highly relational: users have profiles, profiles have resumes and applications, applications belong to jobs, jobs belong to companies. PostgreSQL ensures referential integrity (foreign keys) and ACID compliance. It also supports JSONB columns, giving us the flexibility of a document store (for parsed resume schemas) within a relational database.

---

## 3. Infrastructure & Services

### 3.1 Cloudflare R2 vs. AWS S3
- **Decision:** **Cloudflare R2**
- **Rationale:** AWS S3 charges heavy data egress fees when users download files. Cloudflare R2 offers **zero egress fees**, charging only for storage and operations. Since candidates frequently upload/view resumes and employers view them, R2 drastically reduces bandwidth costs.

### 3.2 Meilisearch (Future Phase)
- **Decision:** **Planned for Phase 2**
- **Rationale:** While PostgreSQL full-text search is sufficient for the initial launch, Meilisearch will be introduced to handle typo-tolerance, facets, and instant, as-you-type search results for hundreds of thousands of jobs.
