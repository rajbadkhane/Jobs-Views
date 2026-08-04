import React from "react";
import type { Metadata } from "next";

import { breadcrumbSchema, buildMetadata, collectionPageSchema, faqSchema } from "@career-os/shared";

import { CandidateResourceAccess } from "../components/candidate-resource-access";

export const metadata: Metadata = buildMetadata(
  "Public Career Guides | Jobs View",
  "CMS-driven SEO career pages, salary pages, skill pages, interview pages, roadmaps and learning guides.",
  "/career-guides"
);

export default function Page() {
  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Career Guides", path: "/career-guides" }
    ]),
    collectionPageSchema("Public Career Guides", "Jobs View career guides connect roadmaps, salaries, skills, interviews, and learning resources.", "/career-guides"),
    faqSchema([
      { question: "What are Jobs View career guides?", answer: "Jobs View career guides explain career paths, required skills, salary signals, interview preparation, and learning resources." },
      { question: "Are Jobs View career guides structured for answer engines?", answer: "Yes. Jobs View career guide pages use semantic headings, FAQ content, canonical URLs, and structured data." }
    ])
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <CandidateResourceAccess
        view="guides"
        title="Career guidance for every stage"
        description="Start with practical guidance for choosing roles, preparing applications, and planning the next step in your career."
        memberHref="/career-guides"
        samples={[
          { title: "Choose a suitable role", description: "Compare work type, education requirements, skills, and growth before applying." },
          { title: "Prepare a stronger application", description: "Use a clear resume, check required documents, and tailor your application to the role." },
          { title: "Get ready for interviews", description: "Review the role, practise common questions, and prepare concise examples from your experience." }
        ]}
      />
    </>
  );
}
