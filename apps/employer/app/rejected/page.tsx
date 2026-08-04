import React from "react";
import type { Metadata } from "next";

import { Badge, Card } from "@career-os/ui";

export const metadata: Metadata = {
  title: "Company Rejected | Jobs View Employer",
  description: "Your company registration was rejected."
};

export default function RejectedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="max-w-lg rounded-[20px] p-6 text-center">
        <Badge tone="danger">Rejected</Badge>
        <h1 className="mt-4 text-2xl font-semibold">Company Rejected</h1>
        <p className="mt-2 text-sm text-slate-500">Your company verification was rejected. Contact support or resubmit corrected business details.</p>
      </Card>
    </main>
  );
}
