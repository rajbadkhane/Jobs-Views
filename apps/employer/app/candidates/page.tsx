import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Candidate Workspace | Jobs View Employer", description: "Review candidate resumes, skills, experience, notes, tags, ratings and interview history." };

export default function Page() {
  return <EmployerPortal view="candidates" />;
}
