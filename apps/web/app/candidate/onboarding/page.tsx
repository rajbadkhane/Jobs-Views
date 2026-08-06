import type { Metadata } from "next";

import { profileBuilderSteps } from "@career-os/shared";

export const metadata: Metadata = {
  title: "Profile Onboarding | Jobs View",
  description: "Guided Jobs View profile builder with resume upload support and completion progress.",
  robots: { index: false, follow: false }
};

export default function Page() {
  const totalMinutes = profileBuilderSteps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto grid min-h-screen max-w-5xl gap-8 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--cos-primary)]">Candidate</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Guided Profile Builder</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Build a complete Jobs View profile step by step. Each step opens your profile editor, saves when you submit, and supports resume upload at any point.
        </p>
        <a href="/candidate/profile" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-career-button)] bg-[var(--cos-primary)] px-6 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)]">
          Start building your profile
        </a>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <Metric label="Steps" value={String(profileBuilderSteps.length)} />
        <Metric label="Estimated Time" value={`${totalMinutes} min`} />
      </section>
      <section className="grid gap-3">
        {profileBuilderSteps.map((step, index) => (
          <a key={step.key} href={`/candidate/profile/${step.key}`} className="rounded-md border border-slate-200 bg-white p-5 transition hover:-translate-y-px hover:border-[var(--cos-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)] dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Step {index + 1}</p>
                <h2 className="mt-1 text-xl font-semibold">{step.title}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-900">{step.estimatedMinutes} min</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {step.fields.map((field) => (
                <span key={field} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300">{field}</span>
              ))}
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
