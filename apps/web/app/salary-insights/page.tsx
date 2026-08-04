import React from "react";
import type { Metadata } from "next";

import { buildMetadata } from "@career-os/shared";

import { CareerIntelligencePlatform } from "../components/career-intelligence-platform";

export const metadata: Metadata = buildMetadata(
  "Salary Insights | Jobs View",
  "Market salary, city comparison, skill premium, industry comparison and future salary projection.",
  "/salary-insights"
);

export default function Page() {
  return <CareerIntelligencePlatform view="salary" />;
}
