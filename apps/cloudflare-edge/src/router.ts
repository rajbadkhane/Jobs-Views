import { Hono } from "hono";
import { cors } from "hono/cors";
import { AppEnv } from "./middleware";
import { authRouter } from "./handlers/auth_handler";
import { usersRouter, adminUsersRouter } from "./handlers/users_handler";
import { profilesRouter } from "./handlers/profiles_handler";
import { companiesRouter, adminCompaniesRouter } from "./handlers/companies_handler";
import { jobsRouter, adminJobsRouter } from "./handlers/jobs_handler";
import { applicationsRouter, savedJobsRouter } from "./handlers/applications_handler";
import { salaryRouter, adminSalaryRouter } from "./handlers/salary_handler";
import { adminRouter } from "./handlers/admin_handler";
import { subscriptionsRouter, checkoutRouter } from "./handlers/subscriptions_handler";
import { contentRouter } from "./handlers/content_handler";
import { advertisementsRouter, publicAdvertisementsRouter } from "./handlers/advertisements_handler";
import { healthRouter } from "./handlers/health_handler";
import { supportRouter } from "./handlers/support_handler";

export const app = new Hono<AppEnv>();

/**
 * Global CORS protection allowing Jobs Views web domains, admin portal, Vercel previews, and localhost environments
 */
app.use("*", cors({
  origin: (origin, c) => {
    if (!origin) return "https://jobsviews.com";
    const allowedList = c.env.CORS_ALLOW_ORIGINS
      ? c.env.CORS_ALLOW_ORIGINS.split(",").map((o: string) => o.trim())
      : [
          "https://jobsviews.com",
          "https://www.jobsviews.com",
          "https://admin.jobsviews.com",
        ];
    if (allowedList.includes(origin) || origin.includes("localhost:") || origin.endsWith(".vercel.app")) {
      return origin;
    }
    return "https://jobsviews.com";
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: [
    "Origin",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Request-ID",
    "X-Refresh-Token",
    "X-Requested-With",
    "X-Release-Candidate",
    "CF-Connecting-IP",
    "X-Forwarded-For",
  ],
  exposeHeaders: [
    "X-Cloudflare-Edge-Cache",
    "X-Response-Time",
    "Content-Length",
    "X-Request-ID",
  ],
  maxAge: 86400,
}));

// 1. Authentication & Tokens
app.route("/api/v1/auth", authRouter);
app.route("/auth", authRouter);

// 2. Users & Admin User Moderation
app.route("/api/v1/users", usersRouter);
app.route("/users", usersRouter);
app.route("/api/v1/admin/users", adminUsersRouter);
app.route("/admin/users", adminUsersRouter);

// 3. Profiles (Candidate, Employer, Admin & Skills)
app.route("/api/v1/profiles", profilesRouter);
app.route("/profiles", profilesRouter);

// 4. Companies & Admin Company Moderation
app.route("/api/v1/companies", companiesRouter);
app.route("/companies", companiesRouter);
app.route("/api/v1/admin/companies", adminCompaniesRouter);
app.route("/admin/companies", adminCompaniesRouter);

// 5. Jobs & Admin Job Moderation
app.route("/api/v1/jobs", jobsRouter);
app.route("/jobs", jobsRouter);
app.route("/api/v1/admin/jobs", adminJobsRouter);
app.route("/admin/jobs", adminJobsRouter);

// 6. Job Applications Pipeline & Saved Jobs
app.route("/api/v1/applications", applicationsRouter);
app.route("/applications", applicationsRouter);
app.route("/api/v1/saved-jobs", savedJobsRouter);
app.route("/saved-jobs", savedJobsRouter);

// 7. Salary Benchmarking & Imports
app.route("/api/v1/salary", salaryRouter);
app.route("/salary", salaryRouter);
app.route("/api/v1/admin/salary", adminSalaryRouter);
app.route("/admin/salary", adminSalaryRouter);

// 8. Super Admin Analytics, CMS & Settings
app.route("/api/v1/admin", adminRouter);
app.route("/admin", adminRouter);
app.route("/api/v1/admin/advertisements", advertisementsRouter);
app.route("/admin/advertisements", advertisementsRouter);

// 8b. Public support ticket intake
app.route("/api/v1/support", supportRouter);
app.route("/support", supportRouter);

// 9. Subscriptions & Razorpay Checkout
app.route("/api/v1/subscriptions", subscriptionsRouter);
app.route("/subscriptions", subscriptionsRouter);
app.route("/api/v1", checkoutRouter);
app.route("/", checkoutRouter);

// 10. Content & Programmatic SEO
app.route("/api/v1/content", contentRouter);
app.route("/content", contentRouter);
app.route("/api/v1/content", publicAdvertisementsRouter);
app.route("/content", publicAdvertisementsRouter);

// 11. Edge Probes & Health Checks
app.route("/api/v1", healthRouter);
app.route("/", healthRouter);

/**
 * Native serverless 404 handler for unmapped routes
 */
app.all("*", (c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 404,
        message: "API endpoint not found. Jobs Views is completely running on Cloudflare Workers serverless edge architecture.",
        available_endpoints: [
          "/api/v1/auth",
          "/api/v1/users",
          "/api/v1/profiles",
          "/api/v1/companies",
          "/api/v1/jobs",
          "/api/v1/applications",
          "/api/v1/salary",
          "/api/v1/subscriptions",
          "/api/v1/content",
          "/api/v1/admin",
          "/api/v1/ready",
        ],
      },
    },
    404
  );
});
