import React from "react";
import type { Metadata } from "next";

import { Badge, Card } from "@career-os/ui";

export const metadata: Metadata = {
  title: "Company Pending Approval | Jobs View Employer",
  description: "Your company registration is pending admin review."
};

export default function PendingPage() {
  return <StatusPage title="Company Pending Approval" tone="warning" description="Your employer workspace is locked until the admin team approves your company verification." />;
}

function StatusPage({ title, description, tone }: { title: string; description: string; tone: "warning" | "danger" }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="max-w-lg rounded-[20px] p-6 text-center">
        <Badge tone={tone}>Employer access paused</Badge>
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </Card>
    </main>
  );
}
