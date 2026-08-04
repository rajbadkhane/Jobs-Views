# 🔌 Jobs View - API Specifications

This document outlines the RESTful API endpoints for the Jobs View platform, using `/api/v1/` as the base path. All requests and responses are in JSON format.

---

## 1. Global Standards

### 1.1 Headers
- `Content-Type: application/json`
- `Authorization: Bearer <JWT_TOKEN>` (for protected endpoints)

### 1.2 Response Formats

#### Success Response (200 OK, 201 Created)
```json
{
  "success": true,
  "data": { ... }
}
```

#### Error Response (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided email is already registered.",
    "details": {
      "email": "Must be a unique business email"
    }
  }
}
```

---

## 2. Authentication Endpoints

### `POST /api/v1/auth/register`
Registers a new user (Candidate or Employer).
- **Request Body:**
  ```json
  {
    "email": "candidate@example.com",
    "password": "SecurePassword123!",
    "role": "candidate" 
  }
  ```
  *(Note: For employers, `role` is `employer`)*
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "user_id": "c37b3f47-b352-4751-be4f-ec036c0a0c0e",
      "email": "candidate@example.com",
      "role": "candidate",
      "created_at": "2026-06-27T16:30:00Z"
    }
  }
  ```

### `POST /api/v1/auth/login`
Authenticates a user and returns a JWT access token.
- **Request Body:**
  ```json
  {
    "email": "candidate@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "c37b3f47-b352-4751-be4f-ec036c0a0c0e",
        "email": "candidate@example.com",
        "role": "candidate"
      }
    }
  }
  ```

### `POST /api/v1/auth/logout`
*(Protected)* Invalidates the active JWT session.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Successfully logged out."
  }
  ```

---

## 3. Jobs Endpoints

### `GET /api/v1/jobs`
Lists job postings with filtering, sorting, and pagination.
- **Query Parameters:**
  - `search` (string) - Keyword search
  - `category` (string) - Category slug
  - `type` (string) - Job type name
  - `city` (string) - City name
  - `salary_min` (number) - Minimum salary
  - `skills` (string) - Comma-separated skill slugs (e.g., `go,react`)
  - `page` (number) - Default: 1
  - `limit` (number) - Default: 20
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "jobs": [
        {
          "id": "a98816c7-3e0e-436f-b258-299f182ea29b",
          "title": "Senior Go Engineer",
          "slug": "senior-go-engineer-acme-3",
          "company": {
            "name": "Acme Corp",
            "logo_url": "https://r2.Jobs View.com/logos/acme.png"
          },
          "location": "New York, NY",
          "job_type": "Full-time",
          "salary_min": 120000.00,
          "salary_max": 150000.00,
          "created_at": "2026-06-27T10:00:00Z"
        }
      ],
      "pagination": {
        "total_items": 124,
        "total_pages": 7,
        "current_page": 1,
        "limit": 20
      }
    }
  }
  ```

### `GET /api/v1/jobs/{slug}`
Retrieves details for a specific job posting.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "a98816c7-3e0e-436f-b258-299f182ea29b",
      "title": "Senior Go Engineer",
      "slug": "senior-go-engineer-acme-3",
      "description": "### Role Overview...",
      "requirements": "- 5+ years Go experience...",
      "benefits": "- Fully remote, health insurance...",
      "salary_min": 120000.00,
      "salary_max": 150000.00,
      "skills": ["Go", "PostgreSQL", "Docker"],
      "company": {
        "name": "Acme Corp",
        "website": "https://acme.com",
        "logo_url": "https://r2.Jobs View.com/logos/acme.png"
      }
    }
  }
  ```

### `POST /api/v1/jobs`
*(Protected: Employer Only)* Creates a new job posting (saves as draft or publishes).
- **Request Body:**
  ```json
  {
    "title": "Senior Go Engineer",
    "description": "Role details...",
    "requirements": "Requirements details...",
    "benefits": "Benefits details...",
    "job_type_id": 1,
    "category_id": 2,
    "city_id": 5,
    "state_id": 1,
    "salary_min": 120000.00,
    "salary_max": 150000.00,
    "skills": ["Go", "PostgreSQL"],
    "status": "published"
  }
  ```
- **Response (21 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "a98816c7-3e0e-436f-b258-299f182ea29b",
      "slug": "senior-go-engineer-acme-3",
      "status": "published"
    }
  }
  ```

---

## 4. Applications Endpoints

### `POST /api/v1/applications`
*(Protected: Candidate Only)* Submits an application for a job.
- **Request Body:**
  ```json
  {
    "job_id": "a98816c7-3e0e-436f-b258-299f182ea29b",
    "resume_id": "8e3bfa2e-836e-473d-82d2-8f9d0c6f2a2e",
    "cover_letter": "I am excited to apply..."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "application_id": "df5e5f3c-5ebc-4b68-b78f-ef81e4c76a5e",
      "status": "applied"
    }
  }
  ```

### `GET /api/v1/applications`
*(Protected)* Lists applications.
- **Behavior:**
  - If **Candidate:** Returns their own job applications.
  - If **Employer:** Returns applications submitted to their job postings.
- **Query Parameters:** `job_id` (optional, for employers to filter by job), `status` (optional).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "df5e5f3c-5ebc-4b68-b78f-ef81e4c76a5e",
        "status": "applied",
        "applied_at": "2026-06-27T16:30:00Z",
        "job": {
          "title": "Senior Go Engineer",
          "company_name": "Acme Corp"
        }
      }
    ]
  }
  ```

### `PATCH /api/v1/applications/{id}/status`
*(Protected: Employer Only)* Updates the recruitment stage of an application.
- **Request Body:**
  ```json
  {
    "status": "interviewing"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "df5e5f3c-5ebc-4b68-b78f-ef81e4c76a5e",
      "status": "interviewing",
      "updated_at": "2026-06-27T16:35:00Z"
    }
  }
  ```

---

## 5. Candidate Profile Endpoints

### `GET /api/v1/profile`
*(Protected: Candidate Only)* Retrieves the current candidate's profile.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "first_name": "Jane",
      "last_name": "Doe",
      "title": "Senior Frontend Engineer",
      "bio": "Passionate about React and UX.",
      "skills": ["React", "TypeScript", "TailwindCSS"],
      "resumes": [
        {
          "id": "8e3bfa2e-836e-473d-82d2-8f9d0c6f2a2e",
          "file_name": "Jane_Doe_Resume.pdf",
          "is_primary": true
        }
      ]
    }
  }
  ```

### `PUT /api/v1/profile`
*(Protected: Candidate Only)* Updates profile information.
- **Request Body:**
  ```json
  {
    "first_name": "Jane",
    "last_name": "Doe",
    "title": "Lead Frontend Engineer",
    "bio": "Updated bio...",
    "skills": ["React", "TypeScript", "Next.js"]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Profile updated successfully."
    }
  }
  ```

### `POST /api/v1/profile/resume`
*(Protected: Candidate Only)* Uploads a PDF resume, saves it to R2, and initiates AI parsing.
- **Request Body:** Multi-part form-data with a `file` field (PDF).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "resume_id": "8e3bfa2e-836e-473d-82d2-8f9d0c6f2a2e",
      "file_url": "https://r2.Jobs View.com/resumes/8e3bfa2e.pdf",
      "parsed_data": {
        "first_name": "Jane",
        "last_name": "Doe",
        "skills": ["React", "TypeScript"],
        "experience": [
          {
            "company": "PrevCorp",
            "title": "Software Engineer",
            "start_date": "2024-01-01",
            "end_date": "2026-05-01"
          }
        ]
      }
    }
  }
  ```
