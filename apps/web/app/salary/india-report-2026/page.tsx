import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata, jsonLd } from "@career-os/shared";

export const metadata: Metadata = buildMetadata(
  "India Salary Evidence Report 2026 | Jobs View",
  "A cited review of Indian salary evidence, data limitations, and the Jobs View approach to role and city benchmarks.",
  "/salary/india-report-2026"
);

const evidence = [
  {
    title: "Periodic Labour Force Survey 2025",
    publisher: "MoSPI, Government of India",
    href: "https://mospi.gov.in/uploads/publications_reports/publications_reports1780040415321_0624fb13-fb47-40bc-b470-7c7e9635c3ef_PLFS_2025_F_REV_29052026.pdf",
    scope: "National and broad workforce context. It is not treated as an exact role-city salary table."
  },
  {
    title: "Occupational Wage Survey",
    publisher: "Labour Bureau, Government of India",
    href: "https://labourbureau.gov.in/occupation-wages",
    scope: "Occupational and industry wage observations for the survey rounds and coverage disclosed by the source."
  },
  {
    title: "Jobs and Salaries Primer FY25-26",
    publisher: "TeamLease Services",
    href: "https://group.teamlease.com/insights/jobs-and-salaries-primer-2025/",
    scope: "City, industry, and function trends. Numeric reuse requires source-rights review before import."
  },
  {
    title: "Salary Trends Report 2025-26",
    publisher: "Randstad India",
    href: "https://info.randstad.in/download-salary-trends-report-2025-2026",
    scope: "Professional salary trends. Numeric reuse requires source-rights review before import."
  }
];

export default function IndiaSalaryReportPage() {
  const schema = jsonLd("Report", {
    name: "Jobs View India Salary Evidence Report 2026",
    description: "A source review and coverage statement for Indian salary intelligence.",
    datePublished: "2026-07-23",
    dateModified: "2026-07-23",
    spatialCoverage: { "@type": "Country", name: "India" },
    isBasedOn: evidence.map((item) => item.href)
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <p className="text-sm font-bold text-[var(--cos-primary)]">Research report | Reviewed 23 July 2026</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">India salary evidence report 2026</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--cos-on-surface-variant)]">
        This report documents the evidence Jobs View can responsibly use today. It intentionally does not publish a made-up national salary table: India&apos;s pay market varies by role, location, experience, work arrangement, and whether a figure represents gross pay, take-home pay, or annual CTC.
      </p>

      <section className="mt-10" aria-labelledby="findings">
        <h2 id="findings" className="text-2xl font-bold">What the evidence supports</h2>
        <ul className="mt-4 space-y-3 leading-7 text-[var(--cos-on-surface-variant)]">
          <li>Government surveys provide essential national and occupational context, but their coverage and survey period must remain visible.</li>
          <li>Commercial reports can add city and function detail only after their reuse terms and methodology have been reviewed.</li>
          <li>Current Jobs View postings can support a first-party benchmark only when at least three valid public INR ranges share a defensible role and geography.</li>
          <li>Where evidence is insufficient, the correct result is &quot;unavailable&quot;, not a hidden city multiplier.</li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="coverage">
        <h2 id="coverage" className="text-2xl font-bold">Current evidence register</h2>
        <div className="mt-4 divide-y divide-[var(--cos-outline-variant)] rounded-md border border-[var(--cos-outline-variant)]">
          {evidence.map((item) => (
            <article key={item.href} className="p-5">
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-1 text-sm">{item.publisher}</p>
              <p className="mt-2 leading-7 text-[var(--cos-on-surface-variant)]">{item.scope}</p>
              <a href={item.href} target="_blank" rel="noreferrer" className="mt-3 inline-block font-bold text-[var(--cos-primary)] hover:underline">
                Open primary source
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-md bg-[var(--cos-surface-container)] p-6" aria-labelledby="publication-rule">
        <h2 id="publication-rule" className="text-2xl font-bold">Publication rule</h2>
        <p className="mt-3 leading-7 text-[var(--cos-on-surface-variant)]">
          A role-city page is published only when it has a current benchmark, provenance, a meaningful explanation, and sufficient evidence. Thin combinations remain unavailable or noindex.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/salary/calculator" className="rounded-md bg-[var(--cos-primary)] px-5 py-3 font-bold text-white">Use salary calculator</Link>
        <Link href="/salary/methodology" className="rounded-md border border-[var(--cos-outline-variant)] px-5 py-3 font-bold">Read full methodology</Link>
      </div>
    </main>
  );
}
