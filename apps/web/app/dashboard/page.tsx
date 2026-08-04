import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Candidate Dashboard | Jobs View",
  description: "Recommended jobs, application status, profile strength, resume score and interview updates."
};

export default function DashboardPage() {
  return <CandidatePlatform view="dashboard" />;
}
