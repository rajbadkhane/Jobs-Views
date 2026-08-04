import React from "react";
import type { Metadata } from "next";

import { CareerIntelligencePlatform } from "../components/career-intelligence-platform";

export const metadata: Metadata = {
  title: "Career Analytics | Jobs View",
  description: "Applications, interviews, offers, response rate, acceptance rate, salary growth and recruiter views."
};

export default function Page() {
  return <CareerIntelligencePlatform view="analytics" />;
}
