import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Saved Jobs | Jobs View",
  description: "Organize saved jobs by collections, notes and archives."
};

export default function Page() {
  return <CandidatePlatform view="saved" />;
}
