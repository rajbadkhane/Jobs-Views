import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Calculator, FileSearch } from "lucide-react";

import { buildMetadata } from "@career-os/shared";

export const metadata: Metadata = buildMetadata(
  "India Salary Intelligence | Jobs View",
  "Explore evidence-based salary estimates for Indian roles and cities, with transparent sources, confidence, and methodology.",
  "/salary"
);

const resources = [
  {
    icon: Calculator,
    title: "Salary calculator",
    description: "Estimate a reviewed market range by role, city, experience, and work mode.",
    href: "/salary/calculator",
    action: "Calculate salary"
  },
  {
    icon: FileSearch,
    title: "Methodology and sources",
    description: "See normalization rules, evidence fallback, confidence thresholds, and source disclosures.",
    href: "/salary/methodology",
    action: "Review methodology"
  },
  {
    icon: BarChart3,
    title: "India salary report 2026",
    description: "Read the current evidence review and what the available data can and cannot support.",
    href: "/salary/india-report-2026",
    action: "Read report"
  }
];

export default function SalaryPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold text-[var(--cos-primary)]">Salary intelligence</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-extrabold sm:text-5xl">Understand salary with evidence, not guesswork</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--cos-on-surface-variant)]">
        Jobs View reports salary estimates only when reviewed evidence is available. Every result includes its geography, effective date, sample size when known, confidence, and source.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {resources.map(({ icon: Icon, ...resource }) => (
          <article key={resource.href} className="flex h-full flex-col rounded-md border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-6 shadow-sm">
            <Icon className="size-6 text-[var(--cos-primary)]" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-bold">{resource.title}</h2>
            <p className="mt-2 flex-1 leading-7 text-[var(--cos-on-surface-variant)]">{resource.description}</p>
            <Link href={resource.href} className="mt-6 font-bold text-[var(--cos-primary)] hover:underline">
              {resource.action}
            </Link>
          </article>
        ))}
      </div>
      <aside className="mt-10 rounded-md border-l-4 border-[var(--cos-accent)] bg-[var(--cos-surface-container)] p-5">
        Salary estimates are market references, not guaranteed offers, take-home pay, or placement promises.
      </aside>
    </main>
  );
}
