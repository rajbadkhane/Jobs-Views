import React from "react";
import type { Metadata } from "next";

import { buildMetadata } from "@career-os/shared";

import { CandidateResourceAccess } from "../components/candidate-resource-access";

export const metadata: Metadata = buildMetadata(
  "Learning Center | Jobs View",
  "Courses, books, videos, blogs, communities, certifications, progress and bookmarks.",
  "/learning-center"
);

export default function Page() {
  return <CandidateResourceAccess
    view="learning"
    title="Learn skills that lead to work"
    description="Explore practical learning paths for first jobs, vocational roles, office work, and professional careers."
    memberHref="/learning-center"
    samples={[
      { title: "Workplace basics", description: "Communication, documents, attendance, safety, and interview readiness for your first job." },
      { title: "Role-based skills", description: "Understand the core skills employers expect in operations, sales, service, ITI, and office roles." },
      { title: "Plan your next step", description: "Choose a focused learning path based on the jobs you want to apply for." }
    ]}
  />;
}
