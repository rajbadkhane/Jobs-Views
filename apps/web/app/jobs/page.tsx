import React from "react";
import type { Metadata } from "next";

import { breadcrumbSchema, buildMetadata, collectionPageSchema, faqSchema } from "@career-os/shared";

import { JobSearchExperience } from "../components/job-search-experience";

export const metadata: Metadata = buildMetadata(
  "Search Jobs in India | Jobs View",
  "Search verified jobs by role, skill, company, salary, experience, work mode and location on Jobs View.",
  "/jobs"
);

export default function JobsPage() {
  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Jobs", path: "/jobs" }
    ]),
    collectionPageSchema(
      "Search Jobs in India",
      "Search verified jobs by role, skill, company, salary, experience, work mode and location on Jobs View.",
      "/jobs",
      [
        { name: "Frontend developer jobs", path: "/jobs/frontend-developer-bengaluru" },
        { name: "Backend developer jobs", path: "/jobs/backend-developer-hyderabad" },
        { name: "DevOps engineer jobs", path: "/jobs/devops-engineer-remote" }
      ]
    ),
    faqSchema([
      { question: "How can I search jobs on Jobs View?", answer: "Use the Jobs View jobs page to search by keyword, location, salary, experience, remote preference, company, and skill." },
      { question: "Are Jobs View job pages structured for Google Jobs?", answer: "Jobs View job pages include canonical metadata, breadcrumbs, and JobPosting structured data for eligible public jobs." }
    ])
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <JobSearchExperience />
    </>
  );
}
