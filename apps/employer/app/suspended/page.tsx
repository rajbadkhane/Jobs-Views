import React from "react";
import type { Metadata } from "next";

import { Badge, Card } from "@career-os/ui";

export const metadata: Metadata = {
  title: "Company Suspended | Jobs View Employer",
  description: "Your employer workspace is suspended."
};

export default function SuspendedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="max-w-lg rounded-[20px] p-6 text-center">
        <Badge tone="danger">Suspended</Badge>
        <h1 className="mt-4 text-2xl font-semibold">Company Suspended</h1>
        <p className="mt-2 text-sm text-slate-500">Your employer workspace is suspended. Admin review is required before dashboard access can resume.</p>
      </Card>
    </main>
  );
}
