import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Interview Center | Jobs View Employer", description: "Calendar, interviews, feedback, meeting links, interviewers and availability." };

export default function Page() {
  return <EmployerPortal view="interviews" />;
}
