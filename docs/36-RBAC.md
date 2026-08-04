# 🛡️ Jobs View - Role-Based Access Control (RBAC) Specification

This document defines the roles, permissions, and database-to-middleware implementation details for authorization in Jobs View.

---

## 1. Roles & Permission Mapping

We define four primary roles, each mapped to a set of granular permissions.

### 1.1 Core Roles
1. **`SUPER_ADMIN`:** Full system access, including billing configurations, system logs, and admin management.
2. **`ADMIN`:** Platform moderation role. Can manage users, verify companies, and moderate job posts.
3. **`EMPLOYER`:** Company hiring manager or recruiter. Can post jobs, view applications, and manage company details.
4. **`JOB_SEEKER`:** Job applicant. Can build profiles, upload resumes, search jobs, and apply.

### 1.2 Permissions List
- **Jobs:** `job:create`, `job:edit`, `job:delete`, `job:approve`, `job:view_draft`
- **Applications:** `application:apply`, `application:view_all`, `application:update_status`
- **Users:** `user:view_all`, `user:suspend`, `user:delete`
- **Companies:** `company:create`, `company:edit`, `company:verify`
- **Settings:** `settings:view_logs`, `settings:configure`

### 1.3 Role-to-Permission Mapping Matrix

| Role | Permissions |
| :--- | :--- |
| **`SUPER_ADMIN`** | *All permissions* (`*`) |
| **`ADMIN`** | `job:approve`, `job:view_draft`, `application:view_all`, `user:view_all`, `user:suspend`, `company:verify` |
| **`EMPLOYER`** | `job:create`, `job:edit`, `job:delete`, `company:create`, `company:edit`, `application:view_all`, `application:update_status` |
| **`JOB_SEEKER`**| `application:apply` |

---

## 2. Database Schema for RBAC

The mapping is stored in three tables: `roles`, `permissions`, and the join table `role_permissions`.

```sql
-- Seed Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'SUPER_ADMIN', 'System owner with unrestricted access'),
(2, 'ADMIN', 'Platform moderator'),
(3, 'EMPLOYER', 'Company recruiter or hiring manager'),
(4, 'JOB_SEEKER', 'Candidate looking for opportunities');

-- Seed Permissions (Examples)
INSERT INTO permissions (id, name, description) VALUES
(1, 'job:create', 'Allow creating new job postings'),
(2, 'job:approve', 'Allow approving draft jobs for publication'),
(3, 'application:apply', 'Allow applying to active jobs');
```

---

## 3. Go Authorization Middleware Design

To minimize database queries on every API request, roles and permissions are validated using a caching strategy.

### 3.1 Flow
1. **Token Parsing:** The JWT middleware extracts the `role_id` and `user_id` from the token claims.
2. **Permission Check:** The authorization middleware checks if the user's role possesses the required permission.
3. **Caching:** The Go API caches the `role_permissions` mapping in Redis. If a cache miss occurs, it queries the database and populates Redis.

### 3.2 Go Middleware Code Signature
```go
package middleware

import (
	"github.com/gofiber/fiber/v2"
)

// RequirePermission restricts access to users with the specified permission.
func RequirePermission(permission string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// 1. Get user role from context (set by JWT middleware)
		roleName := c.Locals("user_role").(string)

		// 2. Super Admins bypass all permission checks
		if roleName == "SUPER_ADMIN" {
			return c.Next()
		}

		// 3. Check permissions (query cached map in Redis or DB)
		hasPermission := checkRolePermission(roleName, permission)
		if !hasPermission {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"error":   "You do not have permission to perform this action",
			})
		}

		return c.Next()
	}
}
```
*Usage in Go Router:*
```go
jobsGroup := api.Group("/jobs")
jobsGroup.Post("/", middleware.RequirePermission("job:create"), handler.CreateJob)
jobsGroup.Patch("/:id/approve", middleware.RequirePermission("job:approve"), handler.ApproveJob)
```
