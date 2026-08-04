import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Company Workspace | Jobs View Employer", description: "Manage company overview, media, branches, departments, benefits, documents, gallery and verification." };

export default function Page() {
  return <EmployerPortal view="company" />;
}
