import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Applications | Jobs View",
  description: "Track application pipeline, status, timelines, interviews and offers."
};

export default function Page() {
  return <CandidatePlatform view="applications" />;
}
