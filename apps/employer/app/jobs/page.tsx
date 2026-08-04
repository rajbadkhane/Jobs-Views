import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Job Management | Jobs View Employer", description: "Create, edit, duplicate, archive, pause, close and preview employer jobs." };

export default function Page() {
  return <EmployerPortal view="jobs" />;
}
