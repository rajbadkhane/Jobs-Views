import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Job Alerts | Jobs View",
  description: "Create job alerts by keyword, location, salary, frequency and channels."
};

export default function Page() {
  return <CandidatePlatform view="alerts" />;
}
