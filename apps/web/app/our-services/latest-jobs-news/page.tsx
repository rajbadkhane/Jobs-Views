import React from "react";
import type { Metadata } from "next";
import { articleSchema, buildMetadata } from "@career-os/shared";
import { LatestJobsNewsClient } from "./client";

export const metadata: Metadata = buildMetadata(
  "Latest Jobs News & Market Intelligence | Jobs View",
  "Stay ahead with real-time Indian recruitment journalism, salary shifts, AI skill demand heatmaps, and breaking government job updates.",
  "/our-services/latest-jobs-news"
);

export default function LatestJobsNewsPage() {
  const schemas = [
    articleSchema(
      "Latest Jobs News & Market Intelligence | Jobs View",
      "Stay ahead with real-time Indian recruitment journalism, salary shifts, AI skill demand heatmaps, and breaking government job updates.",
      "/our-services/latest-jobs-news"
    )
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <LatestJobsNewsClient />
    </>
  );
}
