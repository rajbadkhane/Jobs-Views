import { PageSkeleton } from "@career-os/ui";

export default function Loading() {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)] sm:p-6 lg:p-8">
      <PageSkeleton variant="grid" cards={6} className="mx-auto max-w-[1440px]" />
    </main>
  );
}
