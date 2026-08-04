"use client";

import { ErrorState } from "@career-os/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)]">
      <ErrorState
        error={error}
        title="Something went wrong"
        description="The page could not finish loading. Your session and data are safe."
        onRetry={reset}
        backHref="/"
        backLabel="Go home"
      />
    </main>
  );
}
