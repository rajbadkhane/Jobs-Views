# 🏗️ Jobs View - Backend Architecture & Directory Structure

This document details the architecture, directory structure, and data flow layers for the Go (Fiber) backend API of Jobs View.

---

## 1. Go Project Directory Layout

We follow a structured, domain-agnostic layout within `apps/api` to separate concerns and support Clean Architecture.

```text
apps/api/
├── cmd/
│   └── api/
│       └── main.go             # Application entrypoint (initializes DB, Redis, Server)
│
├── internal/
│   ├── config/
│   │   └── config.go           # Environment variable loader and validation
│   │
│   ├── server/
│   │   ├── server.go           # Fiber server initialization
│   │   └── routes.go           # API route registrations
│   │
│   ├── handler/
│   │   ├── auth.go             # Authentication handlers (Login, Register)
│   │   ├── job.go              # Job handlers (Create, List, Search)
│   │   └── application.go      # Application pipeline handlers
│   │
│   ├── service/
│   │   ├── auth_service.go     # Business logic for auth (JWT, password comparison)
│   │   ├── resume_service.go   # PDF parsing & Cloudflare R2 uploads
│   │   └── stripe_service.go   # Stripe billing and webhook processing
│   │
│   ├── repository/
│   │   ├── postgres/           # SQLc-generated queries & manual database methods
│   │   │   ├── db.go
│   │   │   ├── models.go
│   │   │   └── query.sql.go
│   │   └── redis/              # Cache read/write methods
│   │
│   ├── model/
│   │   └── dto.go              # Request/Response Data Transfer Objects
│   │
│   └── middleware/
│       ├── jwt.go              # Authentication middleware
│       ├── rate_limiter.go     # Redis-based rate limiting
│       └── logger.go           # Structured logging middleware
│
├── pkg/
│   ├── logger/
│   │   └── logger.go           # Shared structured logging utility (using slog)
│   └── validator/
│       └── validator.go        # Custom structs validation utility
│
├── migrations/                 # PostgreSQL migration SQL files (Up/Down)
├── docs/                       # OpenAPI/Swagger documentation files
├── go.mod
└── go.sum
```

---

## 2. Architectural Layers

We decouple the database, business logic, and transport layers to make the code testable and maintainable.

### 2.1 Handler Layer (Transport)
- **Responsibility:** Receives HTTP requests, parses query parameters/JSON bodies, validates inputs using `pkg/validator`, and sends standard JSON responses.
- **Rule:** Handlers must contain **no business logic** and **no direct database queries**. They delegate to the Service layer.

### 2.2 Service Layer (Business Logic)
- **Responsibility:** Contains the core business rules of the application (e.g., matching a candidate's skills, calculating profile completion, calling the LLM API for resume parsing, communicating with Stripe).
- **Rule:** Decoupled from HTTP frameworks. Can be unit-tested independently of Fiber.

### 2.3 Repository Layer (Data Access)
- **Responsibility:** Executes database queries. Uses SQLc-generated Go code for PostgreSQL interactions and custom structures for Redis caching.
- **Rule:** Decoupled from business logic. Simply inputs parameters, executes queries, and returns raw models or errors.

---

## 3. Request Data Flow & Dependency Injection

### 3.1 Data Flow Diagram
```text
[Client Request]
       │
       ▼
[Fiber Router] ──► [Middleware (JWT / Limiter)]
       │
       ▼
[Handler] (Parse JSON & Validate)
       │
       ▼
[Service] (Execute Business Logic)
       │
       ▼
[Repository] (SQLc Query Execution) ──► [PostgreSQL / Redis]
```

### 3.2 Dependency Injection (DI)
Dependencies are instantiated in `main.go` and injected downwards via constructor functions. This facilitates mocking dependencies during unit testing.

*Example (`main.go` snippet):*
```go
// 1. Initialize DB
dbPool, _ := pgxpool.Connect(ctx, cfg.DatabaseURL)

// 2. Instantiate Repositories
userRepo := repository.NewPostgresUserRepo(dbPool)
redisRepo := repository.NewRedisCache(redisClient)

// 3. Instantiate Services (Inject Repositories)
authService := service.NewAuthService(userRepo, redisRepo, cfg)

// 4. Instantiate Handlers (Inject Services)
authHandler := handler.NewAuthHandler(authService)

// 5. Register Routes & Start Server
server := server.New(authHandler, middleware)
server.Start(cfg.Port)
```
