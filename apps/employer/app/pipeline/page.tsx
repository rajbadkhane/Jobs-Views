import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Candidate Pipeline | Jobs View Employer", description: "Kanban ATS pipeline with drag-and-drop readiness and candidate timeline." };

export default function Page() {
  return <EmployerPortal view="pipeline" />;
}
