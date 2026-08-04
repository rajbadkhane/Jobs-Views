import { Button, EmptyState } from "@career-os/ui";

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)]">
      <EmptyState
        title="Admin page not found"
        description="The control-center page may have moved or require a different permission."
        action={<a href="/dashboard"><Button>Back to dashboard</Button></a>}
      />
    </main>
  );
}
