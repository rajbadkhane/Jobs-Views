import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Notifications | Jobs View Employer", description: "Configure email, SMS, push and in-app recruitment, verification and subscription alerts." };

export default function Page() {
  return <EmployerPortal view="notifications" />;
}
