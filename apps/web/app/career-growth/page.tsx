import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Career Growth | Jobs View",
  description: "Salary insights, learning recommendations, interview tips and career guides."
};

export default function Page() {
  return <CandidatePlatform view="growth" />;
}
