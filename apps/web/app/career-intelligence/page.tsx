import React from "react";
import type { Metadata } from "next";

import { CareerIntelligencePlatform } from "../components/career-intelligence-platform";

export const metadata: Metadata = {
  title: "Career Intelligence | Jobs View",
  description: "AI-ready career health, resume, salary, skills, roadmaps, interviews, learning and recommendations."
};

export default function Page() {
  return <CareerIntelligencePlatform view="dashboard" />;
}
