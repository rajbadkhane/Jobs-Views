import React from "react";
import type { Metadata } from "next";

import { buildMetadata } from "@career-os/shared";

import { CareerIntelligencePlatform } from "../components/career-intelligence-platform";

export const metadata: Metadata = buildMetadata(
  "Skill Intelligence | Jobs View",
  "Trending skills, hot technologies, demand graph, skill gaps, roadmaps and certification suggestions.",
  "/skill-intelligence"
);

export default function Page() {
  return <CareerIntelligencePlatform view="skills" />;
}
