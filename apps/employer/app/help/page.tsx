import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Help Center | Jobs View Employer", description: "Support, tickets, documentation, knowledge base, release notes and contact support." };

export default function Page() {
  return <EmployerPortal view="help" />;
}
