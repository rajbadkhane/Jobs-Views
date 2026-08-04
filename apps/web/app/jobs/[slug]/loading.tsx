import { SkeletonCard } from "@career-os/ui";
import { cn } from "@career-os/utils";

const containerClass = "mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <section className="border-b border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)]">
        <div className={cn(containerClass, "grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-10")}>
          <SkeletonCard lines={6} />
          <SkeletonCard lines={5} className="hidden lg:grid" />
        </div>
      </section>
      <section className={cn(containerClass, "grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_360px]")}>
        <div className="grid min-w-0 gap-6">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={8} />
          <SkeletonCard lines={4} />
          <div className="grid gap-4 md:grid-cols-3">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
          <SkeletonCard lines={6} />
        </div>
        <SkeletonCard lines={7} className="hidden lg:grid" />
      </section>
    </main>
  );
}
