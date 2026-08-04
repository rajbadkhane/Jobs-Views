import React from "react";
import type { Metadata } from "next";

import { CareerIntelligencePlatform } from "../components/career-intelligence-platform";

export const metadata: Metadata = {
  title: "Career Recommendations | Jobs View",
  description: "AI-ready recommendations for jobs, companies, skills, courses, roadmaps, interview questions and articles."
};

export default function Page() {
  return <CareerIntelligencePlatform view="recommendations" />;
}
