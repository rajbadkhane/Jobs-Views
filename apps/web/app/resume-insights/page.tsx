import React from "react";
import type { Metadata } from "next";

import { CareerIntelligencePlatform } from "../components/career-intelligence-platform";

export const metadata: Metadata = {
  title: "Resume Insights | Jobs View",
  description: "ATS score, formatting, keywords, missing skills, sections, strengths, weaknesses and version history."
};

export default function Page() {
  return <CareerIntelligencePlatform view="resume" />;
}
