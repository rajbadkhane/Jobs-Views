import { Button, EmptyState } from "@career-os/ui";

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)]">
      <EmptyState
        title="Employer page not found"
        description="The workspace page may have moved or your team may not have access."
        action={<a href="/dashboard"><Button>Back to dashboard</Button></a>}
      />
    </main>
  );
}
