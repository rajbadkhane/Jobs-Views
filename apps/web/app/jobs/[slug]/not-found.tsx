import { Briefcase } from "lucide-react";

import { Button, EmptyState } from "@career-os/ui";

export default function JobNotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)]">
      <EmptyState
        title="Job Not Found"
        description="This job may have expired, been removed, or the link may be incorrect."
        action={<a href="/jobs"><Button><Briefcase size={16} /> Browse Jobs</Button></a>}
      />
    </main>
  );
}
