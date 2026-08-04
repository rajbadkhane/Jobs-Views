# 🔌 Jobs View - API Standards & Specifications

This document outlines the design standards, naming conventions, status codes, and response structures for all Jobs View RESTful APIs.

---

## 1. Routing & Versioning

- **Prefix:** All API endpoints must be prefixed with `/api/v1`.
- **Naming:** URL paths must be lowercase and use plural nouns for collections, followed by IDs or actions (e.g., `/api/v1/jobs`, `/api/v1/jobs/:id/apply`).
- **Trailing Slashes:** Endpoints must not end with a trailing slash (e.g., `/api/v1/jobs`, NOT `/api/v1/jobs/`).

---

## 2. Standard JSON Response Shapes

Every response from the Jobs View API must conform to one of the three structures below.

### 2.1 Success Response (Single Resource / Action)
- **HTTP Status:** `200 OK` or `201 Created`
- **Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": "e4b33d01-e2e1-4564-9be8-ecf36e4b33d0",
      "title": "React Developer",
      "created_at": "2026-06-27T12:00:00Z"
    }
  }
  ```

### 2.2 Paginated List Response
- **HTTP Status:** `200 OK`
- **Body:**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "e4b33d01-e2e1-4564-9be8-ecf36e4b33d0",
          "title": "React Developer"
        }
      ],
      "pagination": {
        "total_items": 45,
        "total_pages": 3,
        "current_page": 1,
        "limit": 20
      }
    }
  }
  ```

### 2.3 Error Response
- **HTTP Status:** `4xx` or `5xx`
- **Body:**
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "The request payload contains validation errors.",
      "details": {
        "email": "Must be a valid business email address",
        "salary_min": "Must be a positive number"
      }
    }
  }
  ```

---

## 3. HTTP Methods & Status Codes

We adhere strictly to semantic HTTP methods:

- **`GET`:** Used to retrieve resources.
  - `200 OK` - Success.
  - `404 Not Found` - Resource does not exist.
- **`POST`:** Used to create new resources.
  - `201 Created` - Resource created successfully.
  - `400 Bad Request` - Malformed JSON body.
  - `422 Unprocessable Entity` - Validation failed.
- **`PUT`:** Used to replace an entire resource.
  - `200 OK` - Resource updated successfully.
- **`PATCH`:** Used to partially update a resource (e.g., changing application status).
  - `200 OK` - Resource updated successfully.
- **`DELETE`:** Used to soft-delete or remove a resource.
  - `200 OK` or `204 No Content` - Success.

---

## 4. Standardized Error Codes

To simplify error handling on the frontend, the API returns specific error codes:

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT access token. |
| `FORBIDDEN` | 403 | User does not have the required RBAC permissions. |
| `NOT_FOUND` | 404 | The requested resource could not be found. |
| `VALIDATION_FAILED`| 422 | Input validation failed (errors returned in `details`). |
| `RATE_LIMIT_EXCEEDED`| 429 | Too many requests from this IP. |
| `INTERNAL_ERROR` | 500 | Unexpected server error. |
