"use client";

import { ErrorState } from "@career-os/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)]">
      <ErrorState
        error={error}
        title="Admin control center could not load"
        description="Retry the view. No platform action was submitted."
        onRetry={reset}
        backHref="/admin/login"
        backLabel="Back to admin login"
      />
    </main>
  );
}
