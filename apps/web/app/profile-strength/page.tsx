import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Profile Strength | Jobs View",
  description: "Completion percentage, missing fields, suggestions and verification."
};

export default function Page() {
  return <CandidatePlatform view="strength" />;
}
