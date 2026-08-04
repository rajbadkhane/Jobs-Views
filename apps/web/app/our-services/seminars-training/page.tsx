import React from "react";
import type { Metadata } from "next";
import { buildMetadata, courseSchema } from "@career-os/shared";
import { SeminarsTrainingClient } from "./client";

export const metadata: Metadata = buildMetadata(
  "Seminars & Training Programs | Jobs View Upskilling",
  "Elevate your recruitment leadership and candidates through expert-led bootcamps, system design workshops, POSH labor law compliance, and AI sourcing masterclasses.",
  "/our-services/seminars-training"
);

export default function SeminarsTrainingPage() {
  const schemas = [
    courseSchema(
      "Mastering AI-Driven Recruitment & Automated Sourcing 2026",
      "Elevate your recruitment leadership through expert-led bootcamps, system design workshops, POSH labor law compliance, and AI sourcing masterclasses.",
      "/our-services/seminars-training"
    )
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <SeminarsTrainingClient />
    </>
  );
}
