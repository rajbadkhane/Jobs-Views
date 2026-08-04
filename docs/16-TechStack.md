# 💻 Jobs View - Tech Stack & Architecture Rationale

This document details the selected technologies for the Jobs View platform and explains why they were chosen to meet our requirements of high speed, reliability, and modern user experience.

---

## 1. Technical Stack Overview

### 1.1 Frontend (Web & Admin)
- **Framework:** **Next.js (v14+)** using the App Router.
  - *Rationale:* Offers Server-Side Rendering (SSR) and Static Site Generation (SSG) out-of-the-box, which is critical for indexing job postings and company pages on search engines (SEO).
- **Language:** **TypeScript**
  - *Rationale:* Ensures type safety across the monorepos, reducing runtime errors and improving developer productivity.
- **Styling:** **Vanilla CSS & Tailwind CSS**
  - *Rationale:* Vanilla CSS provides total control over premium animations, gradients, and custom glassmorphism effects, while Tailwind CSS accelerates utility layouts.
- **UI Components:** **shadcn/ui**
  - *Rationale:* Built on Radix UI (accessible, unstyled primitives), allowing us to apply our custom design tokens and HSL color scheme easily.
- **Data Fetching:** **TanStack Query (React Query)**
  - *Rationale:* Manages server state, caching, background refetching, and pagination smoothly.
- **Form Management:** **React Hook Form** + **Zod**
  - *Rationale:* Lightweight, high-performance form handling with type-safe schema validation.

### 1.2 Backend (API)
- **Language:** **Go (Golang v1.21+)**
  - *Rationale:* Highly concurrent, compiles to a single binary, and offers near-instant start times with a tiny memory footprint.
- **Framework:** **Fiber**
  - *Rationale:* An Express-like web framework built on top of Fasthttp, the fastest HTTP engine for Go. Extremely fast routing and middleware integration.
- **Database Driver/ORM:** **pgx** + **SQLc** (or raw SQL)
  - *Rationale:* SQLc generates type-safe Go code from raw SQL queries. We avoid heavy ORMs (like Gorm) to maintain maximum query performance and control.

### 1.3 Database & Storage
- **Primary Database:** **PostgreSQL (v15+)**
  - *Rationale:* Relational database with excellent JSONB support, transaction safety, and powerful indexing capabilities (GIN, Trigrams) for job searches.
- **Cache & Message Broker:** **Redis**
  - *Rationale:* Ultra-fast key-value store for session caching, API rate-limiting, and managing active WebSocket connections.
- **Object Storage:** **Cloudflare R2**
  - *Rationale:* Zero egress fee S3-compatible object storage. Ideal for storing candidate resumes (PDFs) and company logos cost-effectively.

---

## 2. Infrastructure & Deployment

- **Containerization:** **Docker & Docker Compose**
  - *Rationale:* Simplifies local development setup and ensures consistency between development and production environments.
- **Frontend Hosting:** **Vercel**
  - *Rationale:* The optimal platform for Next.js, providing global edge hosting, instant deployments, and automatic image optimization.
- **Backend Hosting:** **Virtual Private Server (VPS) / Cloud Provider (e.g., AWS, DigitalOcean)**
  - *Rationale:* Dockerized Go API runs behind an Nginx reverse proxy with SSL termination via Let's Encrypt.
- **DNS & CDN:** **Cloudflare**
  - *Rationale:* Provides DDoS protection, global DNS routing, SSL/TLS certificates, and caching layers to speed up page loads worldwide.
