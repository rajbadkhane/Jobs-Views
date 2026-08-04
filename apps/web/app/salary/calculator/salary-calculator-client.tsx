"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { AlertTriangle, BarChart3, Calculator, ExternalLink, RefreshCw, Search } from "lucide-react";

import { apiErrorMessage, salaryApi, type SalaryEstimateRequest } from "@career-os/shared";
import { Badge, Button, Card, Input, Skeleton } from "@career-os/ui";

const educationOptions = ["", "10th Pass", "12th Pass", "ITI", "Diploma", "Graduate", "Post Graduate"];
const shiftOptions = ["", "Day Shift", "Night Shift", "Rotational Shift", "Flexible"];

export function SalaryCalculatorClient() {
  const options = useQuery({ queryKey: ["salary", "options"], queryFn: salaryApi.options, staleTime: 24 * 60 * 60_000 });
  const [form, setForm] = useState<SalaryEstimateRequest>({ role: "", city: "", experience: 0, work_mode: "", education: "", shift: "", skills: [], display: "monthly" });
  const [skillText, setSkillText] = useState("");
  const [submitted, setSubmitted] = useState<SalaryEstimateRequest | null>(null);

  useEffect(() => {
    if (form.role || !options.data?.roles.length) return;
    setForm((current) => ({ ...current, role: options.data.roles[0]?.slug ?? "", city: options.data.locations[0]?.name ?? "India" }));
  }, [form.role, options.data]);

  const estimate = useQuery({
    queryKey: ["salary", "estimate", submitted],
    queryFn: () => salaryApi.estimate(submitted as SalaryEstimateRequest),
    enabled: Boolean(submitted?.role && submitted?.city),
    staleTime: 6 * 60 * 60_000,
    retry: 1
  });

  function calculate() {
    setSubmitted({ ...form, skills: skillText.split(",").map((value) => value.trim()).filter(Boolean) });
  }

  return (
    <main className="bg-[var(--cos-surface)] px-4 pb-14 text-[var(--cos-on-surface)] sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.92fr_1.08fr]" aria-labelledby="salary-calculator-title">
        <Card className="self-start border border-[var(--cos-primary)]">
          <Badge tone="premium"><Calculator size={13} /> Market salary calculator</Badge>
          <h1 id="salary-calculator-title" className="mt-4 text-2xl font-extrabold">Estimate salary from reviewed market evidence</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cos-on-surface-variant)]">Choose a role and location. Results show their source, effective date, sample size, and confidence instead of guaranteed compensation.</p>
          {options.isPending ? <FormSkeleton /> : options.isError ? <InlineError message={apiErrorMessage(options.error)} retry={() => void options.refetch()} /> : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FieldSelect label="Role" value={form.role} onChange={(role) => setForm({ ...form, role })} options={(options.data?.roles ?? []).map((item) => ({ label: item.name, value: item.slug }))} />
              <FieldSelect label="City or market" value={form.city} onChange={(city) => setForm({ ...form, city })} options={(options.data?.locations ?? []).map((item) => ({ label: item.name, value: item.name }))} />
              <label className="grid gap-1 text-sm font-semibold">Experience in years<input className={fieldClass} type="number" min={0} max={50} step={0.5} value={form.experience} onChange={(event) => setForm({ ...form, experience: Math.max(0, Number(event.target.value)) })} /></label>
              <FieldSelect label="Work mode" value={form.work_mode ?? ""} onChange={(work_mode) => setForm({ ...form, work_mode: work_mode as SalaryEstimateRequest["work_mode"] })} options={[{ label: "Any work mode", value: "" }, ...(options.data?.work_modes ?? []).map((item) => ({ label: item.name, value: item.slug }))]} />
              <FieldSelect label="Education" value={form.education ?? ""} onChange={(education) => setForm({ ...form, education })} options={educationOptions.map((value) => ({ label: value || "Any education", value }))} />
              <FieldSelect label="Shift" value={form.shift ?? ""} onChange={(shift) => setForm({ ...form, shift })} options={shiftOptions.map((value) => ({ label: value || "Any shift", value }))} />
              <div className="sm:col-span-2"><Input label="Skills (optional)" value={skillText} placeholder="React, forklift operation, route knowledge" onChange={(event) => setSkillText(event.target.value)} /></div>
              <div className="flex gap-2 sm:col-span-2" role="group" aria-label="Salary display period">
                {(["monthly", "annual"] as const).map((display) => <Button key={display} type="button" variant={form.display === display ? "primary" : "secondary"} onClick={() => setForm({ ...form, display })}>{display === "monthly" ? "Monthly" : "Annual"}</Button>)}
              </div>
              <Button type="button" className="sm:col-span-2" onClick={calculate} disabled={!form.role || !form.city || estimate.isFetching} loading={estimate.isFetching}><Search size={16} /> Calculate market estimate</Button>
            </div>
          )}
        </Card>
        <ResultPanel query={estimate} display={submitted?.display ?? "monthly"} />
      </section>
    </main>
  );
}

function ResultPanel({ query, display }: { query: UseQueryResult<Awaited<ReturnType<typeof salaryApi.estimate>>, Error>; display: "monthly" | "annual" }) {
  if (!query.data && !query.isPending && !query.isError) return <Card className="flex min-h-80 items-center justify-center text-center"><div><BarChart3 className="mx-auto text-[var(--cos-primary)]" size={36} /><h2 className="mt-4 text-xl font-bold">Choose a role and city</h2><p className="mt-2 max-w-md text-sm text-[var(--cos-on-surface-variant)]">We will use the most specific reviewed benchmark available and disclose when evidence is limited.</p></div></Card>;
  if (query.isPending) return <Card aria-live="polite" aria-label="Loading salary estimate"><Skeleton className="h-28" /><div className="mt-4 grid gap-3 sm:grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div></Card>;
  if (query.isError) return <Card><InlineError message={apiErrorMessage(query.error)} retry={() => void query.refetch()} /></Card>;
  const result = query.data;
  if (!result?.available || !result.benchmark) return <Card className="flex min-h-80 items-center justify-center text-center"><div><AlertTriangle className="mx-auto text-[var(--cos-warning)]" size={34} /><h2 className="mt-4 text-xl font-bold">Not enough market evidence</h2><p className="mt-2 max-w-md text-sm text-[var(--cos-on-surface-variant)]">{result?.message}</p><a className="mt-5 inline-flex font-semibold text-[var(--cos-primary)] hover:underline" href="/salary/methodology">How salary evidence is reviewed</a></div></Card>;
  const benchmark = result.benchmark;
  const factor = display === "monthly" ? 12 : 1;
  const suffix = display === "monthly" ? "/month" : "/year";
  const central = benchmark.median_annual ?? benchmark.mean_annual;
  return <Card>
    <div className="rounded-[var(--radius-career-card)] bg-[var(--cos-primary)] p-5 text-white">
      <div className="text-sm font-semibold opacity-90">{benchmark.median_annual ? "Estimated market median" : "Reported market average"}</div>
      <div className="mt-2 text-3xl font-extrabold sm:text-4xl">{central ? `${money(central / factor)}${suffix}` : "Range only"}</div>
      <div className="mt-2 text-sm opacity-90">{benchmark.role} · {benchmark.geography} · {benchmark.salary_basis.replace("_", " ")}</div>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <Metric label="25th percentile" value={benchmark.p25_annual ? `${money(benchmark.p25_annual / factor)}${suffix}` : "Not reported"} />
      <Metric label="50th percentile" value={benchmark.median_annual ? `${money(benchmark.median_annual / factor)}${suffix}` : "Not reported"} />
      <Metric label="75th percentile" value={benchmark.p75_annual ? `${money(benchmark.p75_annual / factor)}${suffix}` : "Not reported"} />
    </div>
    {result.stale ? <div className="mt-4 rounded-md border border-[var(--cos-warning)] p-3 text-sm"><strong>Older evidence:</strong> this benchmark is more than 13 months old. Review the effective date before relying on it.</div> : null}
    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
      <Fact label="Confidence" value={benchmark.confidence} /><Fact label="Sample size" value={benchmark.sample_size ? benchmark.sample_size.toLocaleString("en-IN") : "Not disclosed"} /><Fact label="Geography level" value={benchmark.geography_level} /><Fact label="Effective date" value={new Date(benchmark.effective_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
    </dl>
    <div className="mt-5 rounded-md border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-4">
      <div className="font-bold">Source</div><div className="mt-1 text-sm">{benchmark.source.publisher} · {benchmark.source.name}</div><p className="mt-2 text-sm text-[var(--cos-on-surface-variant)]">{benchmark.source.methodology}</p>
      <a className="mt-3 inline-flex items-center gap-1 font-semibold text-[var(--cos-primary)] hover:underline" href={benchmark.source.url} target="_blank" rel="noreferrer">Open source <ExternalLink size={14} /></a>
    </div>
    <div className="mt-5 flex flex-wrap gap-3"><a className="font-semibold text-[var(--cos-primary)] hover:underline" href="/salary/methodology">Read methodology</a><a className="font-semibold text-[var(--cos-primary)] hover:underline" href={`/jobs?q=${encodeURIComponent(benchmark.role)}&location=${encodeURIComponent(benchmark.geography)}`}>View relevant live jobs</a></div>
  </Card>;
}

const fieldClass = "h-11 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] px-3 outline-none focus:border-[var(--cos-primary)] focus:ring-2 focus:ring-[var(--cos-primary)]/20";
function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { label: string; value: string }[] }) { return <label className="grid gap-1 text-sm font-semibold">{label}<select className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={`${option.value}-${option.label}`} value={option.value}>{option.label}</option>)}</select></label>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-[var(--cos-outline-variant)] p-4"><div className="text-xs font-semibold text-[var(--cos-on-surface-variant)]">{label}</div><div className="mt-2 font-extrabold">{value}</div></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="text-[var(--cos-on-surface-variant)]">{label}</dt><dd className="mt-1 font-semibold capitalize">{value}</dd></div>; }
function InlineError({ message, retry }: { message: string; retry: () => void }) { return <div role="alert" className="rounded-md border border-[var(--cos-error)] p-4"><strong>Salary data could not be loaded</strong><p className="mt-1 text-sm">{message}</p><Button className="mt-3" variant="secondary" onClick={retry}><RefreshCw size={15} /> Retry</Button></div>; }
function FormSkeleton() { return <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="Loading calculator options"><Skeleton className="h-11" /><Skeleton className="h-11" /><Skeleton className="h-11" /><Skeleton className="h-11" /></div>; }
function money(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(value)); }
