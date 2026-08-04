import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "My Profile | Jobs View",
  description: "Manage personal details, education, experience, skills, languages, projects, certifications and social links."
};

export default function Page() {
  return <CandidatePlatform view="profile" />;
}
