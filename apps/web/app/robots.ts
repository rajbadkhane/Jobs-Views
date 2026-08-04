import type { MetadataRoute } from "next";

import { appConfig } from "@career-os/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/profile",
          "/resume",
          "/applications",
          "/saved-jobs",
          "/messages",
          "/notifications",
          "/settings",
          "/job-alerts",
          "/recommended-jobs",
          "/api/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/session-expired",
          "/account-pending",
          "/employer-pending",
          "/employer-rejected",
          "/employer-suspended"
        ]
      },
      {
        userAgent: "GPTBot",
        disallow: "/"
      },
      {
        userAgent: "OAI-SearchBot",
        allow: ["/", "/jobs", "/companies", "/salary", "/skills", "/career", "/career-guides", "/career-roadmaps", "/interview", "/interview-hub", "/learning-center", "/llms.txt"],
        disallow: ["/dashboard", "/profile", "/resume", "/applications", "/saved-jobs", "/messages", "/notifications", "/settings", "/api/", "/login", "/register"]
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/jobs", "/companies", "/salary", "/skills", "/career", "/career-guides", "/career-roadmaps", "/interview", "/interview-hub", "/learning-center", "/llms.txt"],
        disallow: ["/dashboard", "/profile", "/resume", "/applications", "/saved-jobs", "/messages", "/notifications", "/settings", "/api/"]
      }
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`
  };
}
