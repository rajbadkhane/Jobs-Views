import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Team Management | Jobs View Employer", description: "Invite team members, assign permissions and review activity logs." };

export default function Page() {
  return <EmployerPortal view="team" />;
}
