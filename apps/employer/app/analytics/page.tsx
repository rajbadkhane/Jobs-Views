import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Analytics | Jobs View Employer", description: "Hiring funnel, time to hire, conversion, job performance, recruiter and source analytics." };

export default function Page() {
  return <EmployerPortal view="analytics" />;
}
