import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = {
  title: "Employer Dashboard | Jobs View",
  description: "Employer ATS dashboard with jobs, applications, interviews, offers, hires and hiring analytics."
};

export default function DashboardPage() {
  return <EmployerPortal view="dashboard" />;
}
