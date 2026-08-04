import React from "react";
import type { Metadata } from "next";

import { EmployerPortal } from "../components/employer-portal";

export const metadata: Metadata = { title: "Billing | Jobs View Employer", description: "Manage current plan, usage, invoices, payments, upgrade, coupons and billing history." };

export default function Page() {
  return <EmployerPortal view="billing" />;
}
