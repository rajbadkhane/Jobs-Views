# 📊 Jobs View - Logging & Monitoring Specification

This document defines the structured logging standards, request tracing, audit logging, and health monitoring protocols for the Jobs View backend.

---

## 1. Structured Logging (Go `slog`)

All application logs must be written in **JSON format** to standard output (`stdout`) to allow easy ingestion by log aggregators (e.g., Loki, Datadog, or Elastic). We use Go’s native `slog` package.

### 1.1 Log Levels
- **`DEBUG`:** Verbose information for development (disabled in production).
- **`INFO`:** Key application milestones (e.g., server start, successful database migrations).
- **`WARN`:** Recoverable anomalies (e.g., failed login attempts, slow database queries > 500ms).
- **`ERROR`:** Non-recoverable failures that require developer attention (e.g., database connection losses, failed external API calls).

### 1.2 JSON Log Schema
Every log entry must contain the following keys:
```json
{
  "time": "2026-06-27T12:00:00.123Z",
  "level": "ERROR",
  "msg": "Failed to parse resume PDF",
  "error": "pdfreader: corrupted file structure",
  "trace_id": "c37b3f47-b352-4751-be4f-ec036c0a0c0e",
  "user_id": "8e3bfa2e-836e-473d-82d2-8f9d0c6f2a2e",
  "component": "resume_parser"
}
```

---

## 2. HTTP Request Logging Middleware

Every incoming HTTP request is intercepted and logged by a custom Fiber middleware.

- **Logged Fields:** Method, Path, HTTP Status Code, Latency (in milliseconds), Client IP, User Agent, and Trace ID.
- **Example Log Output:**
  ```json
  {
    "time": "2026-06-27T12:00:05Z",
    "level": "INFO",
    "msg": "HTTP Request Completed",
    "method": "POST",
    "path": "/api/v1/jobs",
    "status": 201,
    "latency_ms": 42.5,
    "ip": "192.168.1.1",
    "trace_id": "a98816c7-3e0e-436f-b258-299f182ea29b"
  }
  ```

---

## 3. Health Checks & Metrics

### 3.1 Health Check Endpoint (`GET /healthz`)
Used by orchestrators (Docker, Kubernetes) and uptime monitors to verify service availability. Returns a `200 OK` if all services are healthy, or `503 Service Unavailable` if a core dependency is down.

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "status": "healthy",
    "services": {
      "database": "connected",
      "redis": "connected",
      "r2": "accessible"
    }
  }
  ```

### 3.2 Metrics (Prometheus Integration)
The Go API exposes a protected `/metrics` endpoint in Prometheus format to track performance:
- `http_requests_total{method, path, status}`: Counter of all HTTP requests.
- `http_request_duration_seconds{method, path}`: Histogram of request latencies.
- `go_goroutines`: Current number of active Goroutines.
- `db_pool_connections_active`: Active PostgreSQL database connections.
