import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Employer Settings | Jobs View Employer", description: "Manage brand, security, password, 2FA placeholder, API keys and webhooks." };

export default function Page() {
  return <EmployerPortal view="settings" />;
}
