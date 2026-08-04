import React from "react";
import type { Metadata } from "next";

import { buildMetadata } from "@career-os/shared";

import { CareerIntelligencePlatform } from "../components/career-intelligence-platform";

export const metadata: Metadata = buildMetadata(
  "Career Roadmaps | Jobs View",
  "Role roadmaps for frontend, backend, full stack, DevOps, AI, cloud, cybersecurity, data and more.",
  "/career-roadmaps"
);

export default function Page() {
  return <CareerIntelligencePlatform view="roadmaps" />;
}
