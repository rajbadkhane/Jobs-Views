# 🚀 Jobs View - Future Scalability & Architecture

This document outlines the architectural blueprint to scale Jobs View from its initial launch to serving millions of active users, along with plans for future feature modules.

---

## 1. Scaling the Infrastructure

As traffic grows, the single-server monolith architecture will be scaled horizontally using the following strategies:

### 1.1 Database Scaling (Read Replicas & Connection Pooling)
- **Read/Write Split:** Introduce a primary database for write operations and multiple **Read Replicas** to handle search and listing traffic. The Go repository layer will route queries dynamically:
  - `Insert/Update/Delete` → Primary Database
  - `Select` → Read Replicas (load-balanced)
- **pgBouncer:** Deploy pgBouncer as a database connection pooler to manage tens of thousands of concurrent client connections with minimal memory overhead.

### 1.2 Message Queues for Asynchronous Work
To prevent heavy tasks (email campaigns, PDF parsing, webhook processing) from blocking the main API thread, we will transition from in-memory Goroutines to a distributed task queue:
- **Technology:** **RabbitMQ** or **Apache Kafka**.
- **Worker Nodes:** Decouple background workers into independent microservices that consume tasks from the queue. If resume uploads spike, we can scale the `resume-parser-worker` service independently.

### 1.3 AI Semantic Search (`pgvector`)
- **Upgrade:** Add the `pgvector` extension to PostgreSQL.
- **Mechanism:** Convert candidate resumes and job descriptions into vector embeddings using an LLM embedding model.
- **Search:** Instead of keyword matching, perform cosine similarity searches (`<=>` operator in pgvector) to connect candidates with jobs based on semantic meaning and skills compatibility.

---

## 2. Future Feature Modules

### 2.1 AI-Powered Resume Builder
- **Features:** Interactive step-by-step builder, real-time AI suggestions for bullet points, and automated formatting to export clean, ATS-compliant PDFs.
- **Architecture:** Integrates with our R2 storage and automatically updates the candidate’s structured `candidate_profiles` database record.

### 2.2 Salary Insights Hub
- **Features:** Aggregated, anonymized salary data categorized by job title, location, experience, and industry.
- **Architecture:** Dynamically calculated using map-reduce jobs on the `applications` and `jobs` tables, cached in Redis, and exposed via SEO-friendly `/salary/*` landing pages.

### 2.3 Mobile Applications
- **Features:** Native iOS and Android apps for candidates to browse jobs, receive push notifications for application status changes, and chat with recruiters.
- **Architecture:** Built using **React Native** or **Flutter**, reusing the same `/api/v1` RESTful Go API endpoints and utilizing WebSockets for real-time messaging.

### 2.4 Public Developer API
- **Features:** Allows external ATS systems (e.g., Greenhouse, Workday) to sync job posts to Jobs View and pull applicant profiles.
- **Architecture:** Standard API keys, OAuth2 client credential flows, and webhook endpoints for event notifications (e.g., `application.created`).
