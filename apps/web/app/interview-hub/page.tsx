import React from "react";
import type { Metadata } from "next";

import { buildMetadata } from "@career-os/shared";

import { CareerIntelligencePlatform } from "../components/career-intelligence-platform";

export const metadata: Metadata = buildMetadata(
  "Interview Hub | Jobs View",
  "Interview questions, coding questions, HR questions, company questions and mock interview placeholders.",
  "/interview-hub"
);

export default function Page() {
  return <CareerIntelligencePlatform view="interview" />;
}
