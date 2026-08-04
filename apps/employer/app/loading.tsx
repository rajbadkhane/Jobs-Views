import { SkeletonCard } from "@career-os/ui";

export default function Loading() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)] sm:p-6">
      <div className="mx-auto grid max-w-[1440px] gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}
      </div>
    </main>
  );
}
