"use client";

import { Button, EmptyState } from "@career-os/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)]">
      <EmptyState
        title="Employer workspace could not load"
        description="Refresh the workspace or try again. No hiring data was changed."
        action={<Button onClick={reset}>Retry</Button>}
      />
    </main>
  );
}
