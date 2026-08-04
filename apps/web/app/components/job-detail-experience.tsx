"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flag,
  GraduationCap,
  HeartPulse,
  IndianRupee,
  MapPin,
  MessageCircle,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Zap
} from "lucide-react";

import { useCandidateActions, useCandidateSubscription, useJobBySlug, useSession } from "@career-os/hooks";
import { apiErrorMessage, type PublicJob } from "@career-os/shared";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CompanyCard,
  EmptyState,
  EnterpriseCard,
  SkeletonCard
} from "@career-os/ui";
import { cn } from "@career-os/utils";

import { rememberRecentJob } from "./candidate-recent-jobs";

const containerClass = "mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8";
const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cos-surface)]";

function sectionMotion(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.22, ease: "easeOut", delay }
  } as const;
}

function openPlans(slug: string) {
  const next = `/jobs/${slug}`;
  window.location.href = `/plans?job=${encodeURIComponent(slug)}&next=${encodeURIComponent(next)}`;
}

function openLoginForPlans(slug: string) {
  const plans = `/plans?job=${encodeURIComponent(slug)}&next=${encodeURIComponent(`/jobs/${slug}`)}`;
  window.location.href = `/login?next=${encodeURIComponent(plans)}`;
}

export function JobDetailExperience({ slug, initialJob }: { slug: string; initialJob?: PublicJob }) {
  const query = useJobBySlug(slug, initialJob);
  const session = useSession();
  const subscription = useCandidateSubscription(session.data?.role === "JOB_SEEKER");
  const actions = useCandidateActions();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (query.data) rememberRecentJob(query.data);
  }, [query.data]);

  if (query.isPending) return <JobDetailLoading />;
  if (query.isError && errorStatus(query.error) === 404) return <JobNotFoundState />;
  if (query.isError || !query.data) {
    return <JobDetailError error={query.error} retry={() => void query.refetch()} retrying={query.isFetching} />;
  }

  const job = query.data;
  const subscribed = subscription.data?.active === true;
  function apply() {
    if (!session.data) {
      openLoginForPlans(job.slug);
      return;
    }
    if (session.data.role !== "JOB_SEEKER" || !subscribed) {
      openPlans(job.slug);
      return;
    }
    actions.apply.mutate({ job_id: job.id, source: "job_detail" });
  }

  return (
    <main id="main-content" tabIndex={-1} data-job-slug={job.slug} className="min-h-screen bg-[var(--cos-surface)] pb-32 text-[var(--cos-on-surface)] lg:pb-0">
      <Hero job={job} saved={saved} setSaved={setSaved} subscribed={subscribed} applying={actions.apply.isPending} onApply={apply} />
      <section className={cn(containerClass, "grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_360px]") }>
        <div className="grid min-w-0 gap-6">
          <JobOverview job={job} />
          <FreeRequirements job={job} />
          <FreeBenefits job={job} />
          <CompanyPreview job={job} />
          <SubscriberDetails job={job} />
          {!subscribed ? <SubscribeGate slug={job.slug} /> : null}
        </div>
        <StickyActionCard job={job} saved={saved} setSaved={setSaved} subscribed={subscribed} applying={actions.apply.isPending} onApply={apply} />
      </section>
      <MobileApplyBar job={job} saved={saved} setSaved={setSaved} subscribed={subscribed} applying={actions.apply.isPending} onApply={apply} />
    </main>
  );
}

function Hero({ job, saved, setSaved, subscribed, applying, onApply }: { job: PublicJob; saved: boolean; setSaved: (value: boolean) => void; subscribed: boolean; applying: boolean; onApply: () => void }) {
  const description = job.short_description?.trim() || job.full_description?.trim();
  const badges = [
    job.status ? titleCase(job.status) : "",
    job.is_featured ? "Featured" : "",
    job.is_urgent ? "Urgent" : ""
  ].filter(Boolean);
  return (
    <section className="border-b border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)]">
      <div className={cn(containerClass, "grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-10") }>
        <motion.div {...sectionMotion()}>
          {badges.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {badges.map((badge, index) => <Badge key={badge} tone={index === 0 ? "success" : "featured"}>{badge}</Badge>)}
            </div>
          ) : null}
          <div className="mt-5 flex items-start gap-4">
            <Avatar name={job.company_name} src={job.company_logo_url} shape="company" className="h-14 w-14" />
            <div className="min-w-0">
              <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{job.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--cos-on-surface-variant)]">
                <span className="inline-flex items-center gap-2"><Building2 size={16} /> {job.company_name}</span>
                {job.published_at || job.created_at ? <span>Posted {formatDate(job.published_at || job.created_at)}</span> : null}
                {job.updated_at ? <span>Updated {formatDate(job.updated_at)}</span> : null}
              </div>
            </div>
          </div>
          {description ? <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-7 text-[var(--cos-on-surface-variant)]">{description}</p> : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact icon={IndianRupee} label="Salary" value={salary(job)} />
            <Fact icon={MapPin} label="Location" value={location(job)} />
            <Fact icon={Briefcase} label="Experience" value={experience(job)} />
            <Fact icon={Clock} label="Type" value={job.job_type ? titleCase(job.job_type) : "Not specified"} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={onApply} loading={applying} disabled={applying}><Zap size={17} /> {subscribed ? "Apply now" : "Unlock application"}</Button>
            <a href="#job-details"><Button variant="secondary" size="lg">See full details</Button></a>
            <Button variant="outline" size="lg" onClick={() => setSaved(!saved)}><Bookmark size={17} className={saved ? "fill-amber-400 text-amber-400" : undefined} /> Save</Button>
            <Button variant="outline" size="lg" onClick={() => shareJob(job)}><Share2 size={17} /> Share</Button>
            <Button variant="ghost" size="lg" onClick={() => { window.location.href = `/report-issue?job=${encodeURIComponent(job.slug)}`; }}><Flag size={17} /> Report</Button>
          </div>
        </motion.div>
        <motion.div {...sectionMotion(0.04)} className="hidden lg:block">
          <EnterpriseCard title="Above the fold snapshot" description="Key facts supplied with this listing." icon={<Sparkles size={18} />}>
            <div className="grid gap-3">
              {snapshot(job).map((item) => (
                <div key={item} className="rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] p-3 text-sm font-medium">{item}</div>
              ))}
            </div>
          </EnterpriseCard>
        </motion.div>
      </div>
    </section>
  );
}

function StickyActionCard({ job, saved, setSaved, subscribed, applying, onApply }: { job: PublicJob; saved: boolean; setSaved: (value: boolean) => void; subscribed: boolean; applying: boolean; onApply: () => void }) {
  return (
    <aside className="hidden lg:block">
      <Card className="sticky top-20 grid gap-4">
        <div>
          {job.is_featured ? <Badge tone="featured">Featured role</Badge> : null}
          <h2 className="mt-3 text-xl font-bold">{job.title}</h2>
          <p className="text-sm text-[var(--cos-on-surface-variant)]">{job.company_name}</p>
        </div>
        <Button size="lg" fullWidth onClick={onApply} loading={applying} disabled={applying}><Zap size={17} /> {subscribed ? "Apply now" : "Unlock application"}</Button>
        {!subscribed ? <Button variant="secondary" fullWidth onClick={() => openPlans(job.slug)}>View plans</Button> : null}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setSaved(!saved)}><Bookmark size={16} /> Save</Button>
          <Button variant="outline" onClick={() => shareJob(job)}><Share2 size={16} /> Share</Button>
        </div>
        <div className="rounded-[var(--radius-career-button)] border border-dashed border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3 text-sm">
          <div className="font-semibold">{subscribed ? "Subscription active" : "Candidate subscription"}</div>
          <div className="mt-1 text-[var(--cos-on-surface-variant)]">{subscribed ? "Your application and member tools are unlocked." : "Subscribe to unlock applications and candidate tools."}</div>
        </div>
        {!subscribed ? <Button variant="ghost" fullWidth onClick={() => openPlans(job.slug)}><MessageCircle size={16} /> Compare plans</Button> : null}
      </Card>
    </aside>
  );
}

function JobOverview({ job }: { job: PublicJob }) {
  const items = [
    ["Salary", salary(job)],
    ["Experience", experience(job)],
    ["Openings", job.openings ? String(job.openings) : "Not specified"],
    ["Employment", job.job_type ? titleCase(job.job_type) : "Not specified"],
    ["Education", job.education?.trim() || "Not specified"],
    ["Work mode", job.work_mode ? titleCase(job.work_mode) : "Not specified"],
    ["Location", location(job)],
    ["Application deadline", job.expiry_date ? formatDate(job.expiry_date) : "Not specified"]
  ];
  const skills = (job.skills ?? []).map((skill) => skill.name).filter(Boolean);
  return (
    <SectionCard title="Job overview" subtitle="Key information at a glance." icon={<Target size={18} />}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3">
            <div className="text-xs font-semibold text-[var(--cos-on-surface-variant)]">{label}</div>
            <div className="mt-1 font-semibold">{value}</div>
          </div>
        ))}
      </div>
      {skills.length ? (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Job skills">
          {skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
        </div>
      ) : null}
    </SectionCard>
  );
}

function FreeRequirements({ job }: { job: PublicJob }) {
  const items = [...(job.requirements ?? []), ...(job.qualifications ?? [])].map((item) => item.trim()).filter(Boolean);
  return (
    <SectionCard title="Requirements" subtitle="Qualifications and experience supplied by the employer." icon={<GraduationCap size={18} />}>
      {items.length ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-4">
              <CheckCircle2 size={18} className="text-[var(--cos-primary)]" />
              <div className="mt-3 text-sm font-semibold">{item}</div>
            </div>
          ))}
        </div>
      ) : <MissingListingField label="The employer has not provided requirements for this job." />}
    </SectionCard>
  );
}

function FreeBenefits({ job }: { job: PublicJob }) {
  const items = (job.benefits ?? []).map((item) => item.trim()).filter(Boolean);
  return (
    <SectionCard title="Benefits" subtitle="Benefits disclosed for this job." icon={<HeartPulse size={18} />}>
      {items.length ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-4">
              <HeartPulse size={18} className="text-[var(--cos-primary)]" />
              <div className="mt-3 font-semibold">{item}</div>
            </div>
          ))}
        </div>
      ) : <MissingListingField label="The employer has not provided benefits for this job." />}
    </SectionCard>
  );
}

function CompanyPreview({ job }: { job: PublicJob }) {
  return (
    <SectionCard title="Company preview" subtitle="Employer information attached to this listing." icon={<Building2 size={18} />}>
      <CompanyCard
        name={job.company_name}
        location={[job.city, job.state, job.country].filter(Boolean).join(", ") || undefined}
        logo={job.company_logo_url}
        href={`/companies/${job.company_slug || job.company_id}`}
      />
    </SectionCard>
  );
}

function SubscribeGate({ slug }: { slug: string }) {
  return (
    <SectionCard
      title="Subscribe to apply and use candidate tools"
      subtitle="The complete job facts are public. A candidate plan unlocks applications, recruiter contact, resume tools, and advanced insights."
      icon={<ShieldCheck size={18} />}
      action={<Button onClick={() => openPlans(slug)}><Zap size={16} /> Subscribe for more</Button>}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {["Job application and tracking", "Recruiter contact and timeline", "Resume, interview, and salary tools"].map((item) => (
          <button key={item} type="button" onClick={() => openPlans(slug)} className={cn("rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-4 text-left text-sm font-semibold transition hover:-translate-y-px hover:border-[var(--cos-primary-container)]", focusClass)}>
            <Sparkles size={18} className="mb-3 text-[var(--cos-primary)]" />
            {item}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

function SubscriberDetails({ job }: { job: PublicJob }) {
  const description = job.full_description?.trim();
  const responsibilities = (job.responsibilities ?? []).map((item) => item.trim()).filter(Boolean);
  const sections = [
    { title: "Full job description", values: description ? [description] : [] },
    { title: "Responsibilities", values: responsibilities }
  ].filter((section) => section.values.length);
  return (
    <div id="job-details"><SectionCard title="Complete job details" subtitle="Public information supplied by the employer." icon={<ShieldCheck size={18} />}>
      {sections.length ? <div className="grid gap-6">{sections.map((section) => (
        <section key={section.title}>
          <h3 className="font-bold">{section.title}</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--cos-on-surface-variant)]">
            {section.values.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[var(--cos-primary)]" /><span className="whitespace-pre-line">{item}</span></li>)}
          </ul>
        </section>
      ))}</div> : <MissingListingField label="The employer has not supplied additional details for this listing." />}
    </SectionCard></div>
  );
}

function MobileApplyBar({ job, saved, setSaved, subscribed, applying, onApply }: { job: PublicJob; saved: boolean; setSaved: (value: boolean) => void; subscribed: boolean; applying: boolean; onApply: () => void }) {
  return (
    <div className="fixed inset-x-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-40 grid grid-cols-[1fr_auto_auto] gap-2 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[color-mix(in_srgb,var(--cos-surface-container-lowest)_94%,transparent)] p-2 shadow-career-floating backdrop-blur-xl sm:inset-x-3 lg:hidden">
      <div className="col-span-3 grid grid-cols-[auto_1fr] items-center gap-2 rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] px-3 py-2">
        <span className="text-xs font-semibold text-[var(--cos-on-surface-variant)]">Salary</span>
        <span className="truncate text-right text-sm font-bold text-[var(--cos-on-surface)]">{salary(job)}</span>
      </div>
      <Button onClick={onApply} loading={applying} disabled={applying}>{subscribed ? "Apply" : "Unlock"}</Button>
      <Button variant="outline" size="icon" aria-label="Save job" onClick={() => setSaved(!saved)}><Bookmark size={16} className={saved ? "fill-amber-400 text-amber-400" : undefined} /></Button>
      <Button variant="outline" size="icon" aria-label="Share job" onClick={() => shareJob(job)}><Share2 size={16} /></Button>
    </div>
  );
}

function JobDetailLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]" aria-busy="true" aria-label="Loading job details">
      <section className="border-b border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)]">
        <div className={cn(containerClass, "grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_320px]") }><SkeletonCard lines={7} /><SkeletonCard lines={5} className="hidden lg:grid" /></div>
      </section>
      <section className={cn(containerClass, "grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_360px]") }>
        <div className="grid gap-6"><SkeletonCard lines={5} /><SkeletonCard lines={4} /><SkeletonCard lines={4} /><SkeletonCard lines={3} /></div>
        <SkeletonCard lines={7} className="hidden lg:grid" />
      </section>
    </main>
  );
}

function JobDetailError({ error, retry, retrying }: { error: unknown; retry: () => void; retrying: boolean }) {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)]">
      <EmptyState
        title="Unable to load this job"
        description={apiErrorMessage(error) || "The job service is temporarily unavailable. Please try again."}
        action={<div className="flex flex-wrap justify-center gap-3"><Button onClick={retry} disabled={retrying}><RefreshCw size={16} /> {retrying ? "Retrying..." : "Retry"}</Button><a href="/jobs" className={cn("inline-flex", focusClass)}><Button variant="outline"><Briefcase size={16} /> Back to Jobs</Button></a></div>}
      />
    </main>
  );
}

function JobNotFoundState() {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[var(--cos-surface)] p-4 text-[var(--cos-on-surface)]">
      <EmptyState title="Job Not Found" description="This job may have expired, been removed, or the link may be incorrect." action={<a href="/jobs" className={cn("inline-flex", focusClass)}><Button><Briefcase size={16} /> Browse Jobs</Button></a>} />
    </main>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-4">
      <Icon size={17} className="text-[var(--cos-primary)]" />
      <div className="mt-3 text-xs font-semibold text-[var(--cos-on-surface-variant)]">{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

function MissingListingField({ label }: { label: string }) {
  return <div className="rounded-[var(--radius-career-button)] border border-dashed border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-4 text-sm text-[var(--cos-on-surface-variant)]">{label}</div>;
}

function SectionCard({ title, subtitle, icon, action, children }: { title: string; subtitle?: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return <motion.section {...sectionMotion()} className="scroll-mt-24"><EnterpriseCard title={title} description={subtitle} icon={icon} actions={action}>{children}</EnterpriseCard></motion.section>;
}

function snapshot(job: PublicJob) {
  return [
    job.openings ? `${job.openings} opening${job.openings === 1 ? "" : "s"}` : "",
    job.education?.trim() ? `Education: ${job.education.trim()}` : "",
    job.work_mode ? `Work mode: ${titleCase(job.work_mode)}` : "",
    job.expiry_date ? `Apply by ${formatDate(job.expiry_date)}` : ""
  ].filter(Boolean);
}

function salary(job: PublicJob) {
  if (!job.salary_min && !job.salary_max) return "Salary not disclosed";
  const format = (value: number) => job.currency
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: job.currency, maximumFractionDigits: 0 }).format(value)
    : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
  const period = job.salary_period ? ` per ${job.salary_period.replace("ly", "")}` : "";
  if (job.salary_min && job.salary_max) return `${format(job.salary_min)} - ${format(job.salary_max)}${period}`;
  if (job.salary_min) return `From ${format(job.salary_min)}${period}`;
  return `Up to ${format(job.salary_max as number)}${period}`;
}

function location(job: PublicJob) {
  const place = [job.city, job.state, job.country].filter(Boolean).join(", ");
  if (job.work_mode === "remote") return place ? `Remote - ${place}` : "Remote";
  return place || "Location not specified";
}

function experience(job: PublicJob) {
  const min = job.experience_min ?? 0;
  const max = job.experience_max ?? 0;
  if (!min && !max) return "Experience not specified";
  if (min && max) return `${min}-${max} years`;
  if (min) return `${min}+ years`;
  return `Up to ${max} years`;
}

function titleCase(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) return undefined;
  return (error as { response?: { status?: number } }).response?.status;
}

async function shareJob(job: PublicJob) {
  const url = window.location.href;
  if (navigator.share) {
    await navigator.share({ title: `${job.title} at ${job.company_name}`, url }).catch(() => undefined);
    return;
  }
  await navigator.clipboard?.writeText(url).catch(() => undefined);
}
