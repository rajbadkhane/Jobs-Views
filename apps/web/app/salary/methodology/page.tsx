import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata, jsonLd } from "@career-os/shared";

export const metadata: Metadata = buildMetadata(
  "Salary Methodology and Sources | Jobs View",
  "How Jobs View normalizes Indian salary data, selects geographic evidence, reports confidence, and avoids unsupported estimates.",
  "/salary/methodology"
);

const sources = [
  { name: "Periodic Labour Force Survey 2025", publisher: "MoSPI, Government of India", href: "https://mospi.gov.in/uploads/publications_reports/publications_reports1780040415321_0624fb13-fb47-40bc-b470-7c7e9635c3ef_PLFS_2025_F_REV_29052026.pdf", use: "Broad employment and earnings context, not role-city compensation." },
  { name: "Occupational Wage Survey", publisher: "Labour Bureau, Government of India", href: "https://labourbureau.gov.in/occupation-wages", use: "Reviewed occupational observations for covered industries and survey periods." },
  { name: "Jobs and Salaries Primer FY25-26", publisher: "TeamLease Services", href: "https://group.teamlease.com/insights/jobs-and-salaries-primer-2025/", use: "Reviewed city and industry trends where numeric reuse is permitted." },
  { name: "Salary Trends Report 2025-26", publisher: "Randstad India", href: "https://info.randstad.in/download-salary-trends-report-2025-2026", use: "Reviewed professional salary trends where numeric reuse is permitted." },
  { name: "Jobs View published jobs", publisher: "Jobs View", href: "/jobs", use: "Aggregated disclosed INR ranges from active public jobs with valid pay periods." }
];

export default function SalaryMethodologyPage() {
  const schema = jsonLd("Dataset", {
    name: "Jobs View India salary benchmarks",
    description: "Reviewed Indian salary observations normalized to monthly and annual INR equivalents.",
    url: "/salary/methodology",
    spatialCoverage: { "@type": "Country", name: "India" },
    variableMeasured: ["25th percentile salary", "median salary", "75th percentile salary", "sample size", "confidence"],
    measurementTechnique: "Source review, pay-period normalization, validation, deduplication, and geographic fallback",
    isBasedOn: sources.map((source) => source.href)
  });
  return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <p className="text-sm font-bold text-[var(--cos-primary)]">Salary intelligence</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">How Jobs View estimates market salary</h1>
    <p className="mt-4 max-w-3xl leading-7 text-[var(--cos-on-surface-variant)]">Salary results are evidence-based estimates, not job offers or guaranteed earnings. Every published result must retain a source, effective date, geography, and confidence level.</p>
    <section className="mt-10" aria-labelledby="selection"><h2 id="selection" className="text-2xl font-bold">Evidence selection</h2><ol className="mt-4 grid gap-3 sm:grid-cols-2"><Step number="1" title="Exact market" text="Role, city, experience, and work-mode evidence is preferred." /><Step number="2" title="Wider geography" text="State or national evidence is used only when its broader scope is disclosed." /><Step number="3" title="First-party jobs" text="At least three valid active postings are required before a Jobs View aggregate is shown." /><Step number="4" title="Unavailable is valid" text="When evidence is too weak, the calculator returns no estimate rather than inventing a city multiplier." /></ol></section>
    <section className="mt-10" aria-labelledby="normalization"><h2 id="normalization" className="text-2xl font-bold">Normalization and quality checks</h2><ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-[var(--cos-on-surface-variant)]"><li>Hourly values use 8 hours per day and 26 paid days per month; daily values use 26 days per month; monthly values use 12 months.</li><li>Currency must be INR for public aggregates. Invalid ranges, duplicates, unsupported periods, and obvious annualized outliers are rejected.</li><li>Gross, take-home, and annual CTC remain separate evidence dimensions and are never silently treated as identical.</li><li>Percentiles are shown only when the source provides them or the first-party sample supports calculation. A mean is never labelled as a median.</li><li>Benchmarks older than 13 months display a stale-data warning.</li></ul></section>
    <section className="mt-10" aria-labelledby="sources"><h2 id="sources" className="text-2xl font-bold">Sources and permitted use</h2><div className="mt-4 grid gap-3">{sources.map((source) => <article key={source.name} className="rounded-md border border-[var(--cos-outline-variant)] p-4"><h3 className="font-bold">{source.name}</h3><p className="mt-1 text-sm">{source.publisher}</p><p className="mt-2 text-sm text-[var(--cos-on-surface-variant)]">{source.use}</p>{source.href.startsWith("/") ? <Link className="mt-3 inline-block font-semibold text-[var(--cos-primary)] hover:underline" href={source.href}>View source</Link> : <a className="mt-3 inline-block font-semibold text-[var(--cos-primary)] hover:underline" href={source.href} target="_blank" rel="noreferrer">Open source</a>}</article>)}</div></section>
    <div className="mt-10 flex flex-wrap gap-4"><Link href="/salary/calculator" className="rounded-md bg-[var(--cos-primary)] px-5 py-3 font-bold text-white">Open salary calculator</Link><Link href="/jobs" className="rounded-md border border-[var(--cos-outline-variant)] px-5 py-3 font-bold">Browse jobs with disclosed salary</Link></div>
  </main>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) { return <li className="list-none rounded-md border border-[var(--cos-outline-variant)] p-4"><span className="text-sm font-bold text-[var(--cos-accent)]">{number.padStart(2, "0")}</span><h3 className="mt-2 font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-[var(--cos-on-surface-variant)]">{text}</p></li>; }
