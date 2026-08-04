import { PageSkeleton } from "@career-os/ui";

export default function Loading() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)] sm:p-6">
      <PageSkeleton variant="dashboard" cards={8} className="mx-auto max-w-[1440px]" />
    </main>
  );
}
