import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Recommended Jobs | Jobs View",
  description: "AI-ready recommendations, recent searches, matching skills and trending jobs."
};

export default function Page() {
  return <CandidatePlatform view="recommended" />;
}
