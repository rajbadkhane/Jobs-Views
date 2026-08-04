"use client";

import { motion } from "framer-motion";
import {
  Archive,
  BadgeCheck,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileText,
  Gauge,
  HelpCircle,
  Mail,
  MessageSquare,
  Pause,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  Webhook,
  Zap
} from "lucide-react";
import React from "react";

import { navigation } from "@career-os/config";
import { useEmployerActions, useEmployerData } from "@career-os/hooks";
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Chart,
  ChartShell,
  DashboardCard,
  EmptyState,
  EnterpriseCard,
  SearchBar,
  Table,
  Timeline
} from "@career-os/ui";
import { cn } from "@career-os/utils";

import { employer } from "../../content/employer";

export type EmployerView =
  | "dashboard"
  | "company"
  | "jobs"
  | "pipeline"
  | "candidates"
  | "interviews"
  | "team"
  | "analytics"
  | "billing"
  | "notifications"
  | "settings"
  | "help";

type CompanyItem = {
  id?: string;
  name?: string;
  industry?: string;
  headquarters?: string;
  status?: string;
  is_verified?: boolean;
  about?: string;
  mission?: string;
  vision?: string;
  size_range?: string;
  logo_url?: string;
  banner_url?: string;
  gallery?: string[];
  benefits?: string[];
  website?: string;
  gst_number?: string;
  cin_number?: string;
};

type JobItem = {
  id?: string;
  title?: string;
  status?: string;
  job_type?: string;
  type?: string;
  city?: string;
  location?: string;
  views?: number;
  applications?: number;
  seo?: number;
  location_type?: string;
};

type ApplicationItem = {
  id?: string;
  candidate_name?: string;
  candidate_email?: string;
  job_title?: string;
  status?: string;
  rating?: number;
  tags?: string[];
};

type TeamItem = { email?: string; role?: string; permissions?: string[]; accepted_at?: string };
type BranchItem = { name?: string; city?: string; state?: string; country?: string };
type DepartmentItem = { name?: string; description?: string };
type NotificationItem = { id?: string; title?: string; message?: string; channel?: string; is_read?: boolean };
type AnalyticsData = { total_applications?: number; interviews?: number; offers?: number; hires?: number; conversion_rate?: number };
type EmployerLive = { company?: CompanyItem; data: ReturnType<typeof useEmployerData>; actions: ReturnType<typeof useEmployerActions> };

const titles: Record<EmployerView, string> = {
  dashboard: "Employer Dashboard",
  company: "Company Workspace",
  jobs: "Job Management",
  pipeline: "Candidate Pipeline",
  candidates: "Candidate Workspace",
  interviews: "Interview Center",
  team: "Team Management",
  analytics: "Analytics",
  billing: "Billing",
  notifications: "Notifications",
  settings: "Employer Settings",
  help: "Help Center"
};

const viewCopy: Record<EmployerView, string> = {
  dashboard: "Hiring command center for jobs, pipeline health, interviews, offers, team productivity, and alerts.",
  company: "Manage company profile, verification, branches, departments, culture, documents, benefits, and gallery.",
  jobs: "Enterprise job table with search, filters, bulk actions, SEO preview, Google Jobs readiness, and analytics.",
  pipeline: "Premium Kanban ATS with candidate cards, resume score, AI match, notes, tags, ratings, and quick actions.",
  candidates: "Full candidate workspace with resume preview, skills, projects, experience, notes, ratings, timeline, and offers.",
  interviews: "Calendar, upcoming interviews, completed rounds, meeting links, feedback, timeline, and interview scores.",
  team: "Invite members, assign roles and permissions, review activity, audit trails, and recruiter presence.",
  analytics: "Hiring funnel, time to hire, source analysis, offers, acceptance rate, response time, and recruiter performance.",
  billing: "Current plan, usage, invoices, payments, upgrades, coupons, billing history, and subscription health.",
  notifications: "Grouped recruitment, interview, verification, billing, and system notifications.",
  settings: "Company, brand, security, notifications, integrations, domains, API keys, and webhooks.",
  help: "Support, tickets, documentation, knowledge base, release notes, and contact support."
};

const stages = ["applied", "screening", "shortlisted", "interview", "offer", "hired", "rejected"];
const motionProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" }
} as const;
const formControl = "min-h-11 w-full rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm outline-none focus:border-[var(--cos-primary)] focus:ring-2 focus:ring-[var(--cos-focus-ring)]";

export function EmployerPortal({ view }: { view: EmployerView }) {
  const companiesQuery = useEmployerData().companies;
  const companies = liveItems<CompanyItem>(companiesQuery.data);
  const company = companies[0];
  const companyId = company?.id;
  const live = {
    company,
    data: useEmployerData(companyId),
    actions: useEmployerActions(companyId)
  };
  const companyName = company?.name ?? "Employer workspace";

  return (
    <AppShell
      variant="employer"
      title={titles[view]}
      nav={navigation.employer}
      workspaceLabel="Employer ATS"
      workspaceName={companyName}
      workspaceDescription={company?.industry ?? "Company workspace"}
      planTitle="Employer operations"
      planDescription="Live company and hiring data"
      quickActionHref="/employer/jobs#job-editor"
      actions={
        <div className="hidden items-center gap-2 sm:flex">
          <Badge tone={isVerified(company) ? "success" : "warning"}>{company?.status ?? "Unavailable"}</Badge>
          <Avatar name={companyName} src={company?.logo_url} shape="company" verified={isVerified(company)} />
        </div>
      }
    >
      <DataNotice queries={[companiesQuery, live.data.dashboard, live.data.jobs, live.data.team, live.data.branches, live.data.departments, live.data.applications, live.data.analytics, live.data.notifications]} />
      <motion.div {...motionProps} className="grid gap-6">
        <EmployerHeader view={view} live={live} />
        {renderView(view, live)}
      </motion.div>
    </AppShell>
  );
}

function renderView(view: EmployerView, live: EmployerLive) {
  switch (view) {
    case "company":
      return <CompanyView live={live} />;
    case "jobs":
      return <JobsView live={live} />;
    case "pipeline":
      return <PipelineView live={live} />;
    case "candidates":
      return <CandidateView live={live} />;
    case "interviews":
      return <InterviewsView live={live} />;
    case "team":
      return <TeamView live={live} />;
    case "analytics":
      return <AnalyticsView live={live} />;
    case "billing":
      return <BillingView />;
    case "notifications":
      return <NotificationsView live={live} />;
    case "settings":
      return <SettingsView />;
    case "help":
      return <HelpView />;
    default:
      return <DashboardView live={live} />;
  }
}

function EmployerHeader({ view, live }: { view: EmployerView; live: EmployerLive }) {
  const company = live.company;
  const companyName = company?.name ?? "Employer workspace";
  const jobs = liveItems<JobItem>(live.data.jobs.data);
  const applications = liveItems<ApplicationItem>(live.data.applications.data);
  const analytics = live.data.analytics.data as AnalyticsData | undefined;
  const health = hiringHealth(jobs, applications, analytics);
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 shadow-career-sm sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0A3A7A,#F59E0B)]" aria-hidden="true" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <Avatar name={companyName} src={company?.logo_url} shape="company" verified={isVerified(company)} className="h-16 w-16" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="premium">Hiring workspace</Badge>
              <Badge tone={isVerified(company) ? "success" : "warning"}><BadgeCheck size={13} /> {company?.status ?? "Company unavailable"}</Badge>
              {company?.size_range ? <Badge tone="info">{company.size_range}</Badge> : null}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-normal sm:text-3xl">{titles[view]}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--cos-on-surface-variant)]">{viewCopy[view]}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-[var(--cos-on-surface-variant)]">
              <span className="inline-flex items-center gap-1"><Building2 size={14} /> {companyName}</span>
              {company?.industry ? <span className="inline-flex items-center gap-1"><Briefcase size={14} /> {company.industry}</span> : null}
              <span className="inline-flex items-center gap-1"><Target size={14} /> Hiring health {health}%</span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <RadialScore label="Hiring Health" value={health} />
          <RadialScore label="Pipeline" value={pipelineHealth(applications)} />
          {typeof analytics?.conversion_rate === "number" ? <RadialScore label="Conversion" value={analytics.conversion_rate} /> : <div className="grid min-h-28 place-items-center rounded-[var(--radius-career-card)] border border-dashed border-[var(--cos-outline-variant)] p-3 text-center text-xs text-[var(--cos-on-surface-variant)]">Conversion unavailable</div>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" disabled={!company?.id} onClick={() => window.location.assign("/employer/jobs#job-editor")}><Plus size={15} /> Create Job</Button>
        <Button size="sm" variant="outline" disabled={!company?.id} onClick={() => window.location.assign("/employer/team#invite-member")}><UserPlus size={15} /> Invite Recruiter</Button>
        <Button size="sm" variant="outline" onClick={() => window.location.assign("/employer/analytics")}><Gauge size={15} /> Analytics</Button>
        <Button size="sm" variant="outline" onClick={() => window.location.assign("/employer/messages")}><MessageSquare size={15} /> Messages</Button>
      </div>
    </section>
  );
}

function DashboardView({ live }: { live: EmployerLive }) {
  const jobs = liveItems<JobItem>(live.data.jobs.data);
  const applications = liveItems<ApplicationItem>(live.data.applications.data);
  const team = liveItems<TeamItem>(live.data.team.data);
  const analytics = live.data.analytics.data as AnalyticsData | undefined;
  const interviews = analytics?.interviews ?? applications.filter((item) => includesStatus(item.status, "interview")).length;
  const offers = analytics?.offers ?? applications.filter((item) => includesStatus(item.status, "offer")).length;
  const hires = analytics?.hires ?? applications.filter((item) => includesStatus(item.status, "hired")).length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Open Jobs" value={String(jobs.filter((job) => job.status === "published").length)} trend="Today hiring" icon={<Briefcase size={18} />} />
        <DashboardCard label="Applications" value={String(analytics?.total_applications ?? applications.length)} trend="Live ATS inbox" icon={<Users size={18} />} />
        <DashboardCard label="Interviews" value={String(interviews)} trend="Calendar ready" icon={<CalendarDays size={18} />} />
        <DashboardCard label="Offers" value={String(offers)} trend={`${hires} hires`} icon={<CheckCircle2 size={18} />} />
      </div>
      <EmployerExclusiveGrid jobs={jobs} applications={applications} team={team} analytics={analytics} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_420px]">
        <AnalyticsPanel analytics={analytics} />
        <CommandCenter applications={applications} jobs={jobs} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentActivity applications={applications} />
        <InterviewCard applications={applications} />
        <VerificationCard company={live.company} />
      </div>
    </div>
  );
}

function EmployerExclusiveGrid({ jobs, applications, team, analytics }: { jobs: JobItem[]; applications: ApplicationItem[]; team: TeamItem[]; analytics?: AnalyticsData }) {
  const widgets = [
    ["Hiring Health", hiringHealth(jobs, applications, analytics), "Calculated from current jobs and application outcomes", Gauge],
    ["Pipeline Health", pipelineHealth(applications), "Calculated from current application stages", Archive],
    ["Applications", analytics?.total_applications ?? applications.length, "Applications returned by the ATS", Users],
    ["Interviews", analytics?.interviews ?? 0, "Recorded interview-stage applications", CalendarDays],
    ["Offers", analytics?.offers ?? 0, "Recorded offer-stage applications", FileText],
    ["Hires", analytics?.hires ?? 0, "Recorded hired applications", CheckCircle2],
    ["Team Members", team.length, "Accepted and invited workspace members", UserPlus]
  ] as const;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {widgets.map(([title, value, detail, Icon]) => (
        <EnterpriseCard key={title} title={title} description={detail} icon={<Icon size={18} />} badge={<Badge tone={title.includes("Health") && value >= 75 ? "success" : "info"}>{title.includes("Health") ? `${value}%` : value}</Badge>}>
          {title.includes("Health") ? <ProgressBar value={value} /> : <p className="text-2xl font-bold">{value}</p>}
        </EnterpriseCard>
      ))}
    </div>
  );
}

function CommandCenter({ applications, jobs }: { applications: ApplicationItem[]; jobs: JobItem[] }) {
  const closingSoon = jobs.filter((job) => job.status !== "closed").slice(0, 3);
  return (
    <div className="grid gap-6">
      <EnterpriseCard title="Hiring Command Center" description="Live application and offer activity from the current company workspace." icon={<Zap size={18} />} badge={<Badge tone="premium">Live</Badge>}>
        <Timeline items={[
          { title: "Applications today", description: `${applications.length} candidates in review`, tone: "info" },
          { title: "Offer pending", description: `${applications.filter((item) => includesStatus(item.status, "offer")).length} candidates need decision`, tone: "warning" }
        ]} />
      </EnterpriseCard>
      <EnterpriseCard title="Jobs Closing Soon" description="Publishing and pause workflow ready." icon={<Briefcase size={18} />}>
        <div className="grid gap-2">
          {closingSoon.length ? closingSoon.map((job) => <InfoRow key={job.id ?? job.title} label={job.title ?? "Untitled job"} value={job.status ?? "draft"} />) : <EmptyState title="No active jobs" />}
        </div>
      </EnterpriseCard>
    </div>
  );
}

function CompanyView({ live }: { live: EmployerLive }) {
  const company = live.company;
  const branches = liveItems<BranchItem>(live.data.branches.data);
  const departments = liveItems<DepartmentItem>(live.data.departments.data);
  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden p-0">
        <div className="h-44 bg-[linear-gradient(90deg,#0A3A7A,#F59E0B)]" />
        <div className="-mt-12 flex flex-wrap items-end gap-4 p-5">
          <Avatar name={company?.name ?? "Employer workspace"} src={company?.logo_url} shape="company" verified={isVerified(company)} className="h-24 w-24 border-4 border-[var(--cos-surface-container-lowest)]" />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">{company?.name ?? "Company profile unavailable"}</h2>
            <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">{company?.about ?? "Add company information to complete this workspace."}</p>
          </div>
          <UploadButton label="Upload Logo" accept="image/*" onFile={(file) => live.actions.uploadLogo.mutate(file)} />
          <UploadButton label="Upload Banner" accept="image/*" onFile={(file) => live.actions.uploadBanner.mutate(file)} variant="secondary" />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Verification" value={company?.status ?? "Unavailable"} icon={<BadgeCheck size={18} />} />
        <InfoCard title="Industry" value={company?.industry ?? "Unavailable"} icon={<Briefcase size={18} />} />
        <InfoCard title="Employees" value={company?.size_range ?? "Company size"} icon={<Users size={18} />} />
        <InfoCard title="Headquarters" value={company?.headquarters ?? "Unavailable"} icon={<Building2 size={18} />} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard title="Branches" items={branches.map((item) => [item.name, item.city, item.country].filter(Boolean).join(", ")).filter(Boolean)} icon={<Building2 size={18} />} />
        <ListCard title="Departments" items={departments.map((item) => item.name ?? "").filter(Boolean)} icon={<Users size={18} />} />
        <ListCard title="Benefits" items={company?.benefits ?? []} icon={<ShieldCheck size={18} />} />
        <ListCard title="Documents" items={[company?.gst_number ? `GST ${company.gst_number}` : "", company?.cin_number ? `CIN ${company.cin_number}` : "", company?.website ?? ""].filter(Boolean)} icon={<FileText size={18} />} />
        <ListCard title="Gallery" items={company?.gallery ?? []} icon={<Upload size={18} />} />
      </div>
      <VerificationTimeline company={company} />
    </div>
  );
}

function JobsView({ live }: { live: EmployerLive }) {
  const jobs = liveItems<JobItem>(live.data.jobs.data);
  const companyId = live.company?.id;
  const rows = jobs.map((job) => [
    <div key="job"><div className="font-semibold">{job.title ?? "Untitled job"}</div><div className="text-xs text-[var(--cos-on-surface-variant)]">{job.job_type ?? job.type ?? "Full time"} • {job.city ?? job.location ?? "Flexible"}</div></div>,
    <StatusChip key="status" status={job.status ?? "draft"} />,
    <div key="performance" className="text-sm">{typeof job.views === "number" ? `${job.views.toLocaleString("en-IN")} views` : "Views unavailable"}{typeof job.applications === "number" ? ` / ${job.applications} applications` : ""}</div>,
    <div key="badges" className="flex flex-wrap gap-2">{typeof job.seo === "number" ? <Badge tone="info">SEO {job.seo}%</Badge> : <Badge>SEO unavailable</Badge>}</div>,
    <div key="actions" className="flex gap-1">
      <IconButton label="Publish job" disabled={!job.id} onClick={() => job.id && live.actions.setJobStatus.mutate({ id: job.id, status: "published" })}><Eye size={15} /></IconButton>
      <IconButton label="Duplicate job" disabled={!job.id} onClick={() => job.id && live.actions.duplicateJob.mutate(job.id)}><Copy size={15} /></IconButton>
      <IconButton label="Pause job" disabled={!job.id} onClick={() => job.id && live.actions.setJobStatus.mutate({ id: job.id, status: "paused" })}><Pause size={15} /></IconButton>
      <IconButton label="Delete job" disabled={!job.id} onClick={() => job.id && live.actions.bulkJobs.mutate({ job_ids: [job.id], action: "delete" })}><Trash2 size={15} /></IconButton>
    </div>
  ]);
  return (
    <div className="grid gap-6">
      <EnterpriseCard title="Job Management" description="Search, review, publish, pause, duplicate, and archive the company job inventory." icon={<Briefcase size={18} />} actions={<Button disabled={!companyId} onClick={() => document.getElementById("job-editor")?.scrollIntoView({ behavior: "smooth" })}><Plus size={15} /> Create Job</Button>}>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="min-w-64 flex-1"><SearchBar placeholder="Search jobs" suggestions={jobs.map((job) => job.title ?? "Untitled job")} /></div>
          <Button variant="outline"><Gauge size={15} /> Filters</Button>
          <Button variant="outline" disabled={!jobs.length} onClick={() => live.actions.bulkJobs.mutate({ job_ids: jobs.flatMap((job) => job.id ? [job.id] : []), action: "pause" })}><Archive size={15} /> Bulk Pause</Button>
        </div>
        {jobs.length ? <Table columns={["Job", "Status", "Performance", "Badges", "Actions"]} rows={rows} /> : <EmptyState title="No jobs yet" description="Create a draft job to start the publishing workflow." />}
      </EnterpriseCard>
      <JobEditor live={live} />
    </div>
  );
}

function JobEditor({ live }: { live: EmployerLive }) {
  const initial = { title: "", short_description: "", full_description: "", job_type: "full_time", work_mode: "on_site", city: "" };
  const [form, setForm] = React.useState(initial);
  const [error, setError] = React.useState("");
  const companyId = live.company?.id;
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <EnterpriseCard title="Create Job" description="Create a complete draft from real employer input. Publish it after review from the jobs table." icon={<EditIcon />}>
    <form id="job-editor" className="grid scroll-mt-24 gap-4" onSubmit={async (event) => { event.preventDefault(); if (!companyId) return; setError(""); try { await live.actions.createJob.mutateAsync({ ...form, company_id: companyId, status: "draft" }); setForm(initial); } catch (caught) { setError(caught instanceof Error ? caught.message : "The job could not be created."); } }}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-semibold">Job title<input value={form.title} onChange={(event) => update("title", event.target.value)} className={formControl} /></label>
        <label className="grid gap-1.5 text-sm font-semibold">Job type<select value={form.job_type} onChange={(event) => update("job_type", event.target.value)} className={formControl}><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option><option value="internship">Internship</option><option value="freelance">Freelance</option><option value="temporary">Temporary</option><option value="apprenticeship">Apprenticeship</option><option value="10th-pass-jobs">10th pass jobs</option><option value="12th-pass-jobs">12th pass jobs</option><option value="iti-jobs">ITI jobs</option><option value="fresher-jobs">Fresher jobs</option><option value="experienced-jobs">Experienced jobs</option><option value="nursing-home-care-job">Nursing home care job</option><option value="staff-nurse-job">Staff nurse job</option><option value="doctors-job">Doctors job</option><option value="work-from-home-job">Work from home job</option><option value="remote-jobs">Remote jobs</option></select></label>
        <label className="grid gap-1.5 text-sm font-semibold">Work mode<select value={form.work_mode} onChange={(event) => update("work_mode", event.target.value)} className={formControl}><option value="on_site">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></label>
        <label className="grid gap-1.5 text-sm font-semibold">City<input value={form.city} onChange={(event) => update("city", event.target.value)} className={formControl} /></label>
        <label className="grid gap-1.5 text-sm font-semibold md:col-span-2">Short description<input value={form.short_description} onChange={(event) => update("short_description", event.target.value)} className={formControl} /></label>
      </div>
      <label className="grid gap-1.5 text-sm font-semibold">Full description<textarea rows={7} value={form.full_description} onChange={(event) => update("full_description", event.target.value)} className={cn(formControl, "h-auto py-3")} /></label>
      {error ? <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div><Button type="submit" disabled={!companyId || live.actions.createJob.isPending} loading={live.actions.createJob.isPending}>Save draft</Button></div>
    </form>
  </EnterpriseCard>;
}

function PipelineView({ live }: { live: EmployerLive }) {
  const applications = liveItems<ApplicationItem>(live.data.applications.data);
  const columns = stages.map((stage) => ({
    stage,
    candidates: applications.filter((item) => normalizeStage(item.status) === stage)
  }));
  return (
    <div className="grid gap-6">
      <EnterpriseCard title="ATS Pipeline" description="Kanban is drag-drop ready, keyboard scannable, and swipeable on small screens." icon={<Archive size={18} />} actions={<Button variant="outline"><Archive size={15} /> Bulk Status Update</Button>}>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {columns.map((column) => (
            <section key={column.stage} className="min-w-[300px] flex-1 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-4" aria-label={`${stageLabel(column.stage)} pipeline column`}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">{stageLabel(column.stage)}</h3>
                <Badge>{column.candidates.length}</Badge>
              </div>
              <div className="grid gap-3">
                {column.candidates.length ? column.candidates.map((candidate, index) => <CandidateCard key={candidate.id ?? `${column.stage}-${index}`} candidate={candidate} index={index} live={live} />) : <EmptyColumn />}
              </div>
            </section>
          ))}
        </div>
      </EnterpriseCard>
      <CandidateWorkspaceCard applications={applications} live={live} />
    </div>
  );
}

function CandidateCard({ candidate, index, live }: { candidate: ApplicationItem; index: number; live: EmployerLive }) {
  const name = candidate.candidate_name || candidate.candidate_email || "Candidate";
  return (
    <motion.article whileHover={{ y: -2 }} transition={{ duration: 0.18 }} className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-4 shadow-career-xs">
      <div className="flex items-start gap-3">
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{name}</div>
          <div className="mt-1 text-xs text-[var(--cos-on-surface-variant)]">{candidate.job_title || "Open role"} • AI match {86 - index}%</div>
        </div>
        <Badge tone="warning"><Star size={12} /> {candidate.rating ?? 4 + index / 10}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(candidate.tags?.length ? candidate.tags : ["Resume 88", "Notes", "High intent"]).slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={!candidate.id} onClick={() => candidate.id && live.actions.addApplicationNote.mutate({ id: candidate.id, payload: { note: "Reviewed from ATS pipeline." } })}>Note</Button>
        <Button size="sm" variant="outline" disabled={!candidate.id} onClick={() => candidate.id && live.actions.updateApplicationStatus.mutate({ id: candidate.id, payload: { status: "interview_scheduled" } })}>Interview</Button>
      </div>
    </motion.article>
  );
}

function CandidateWorkspaceCard({ applications, live }: { applications: ApplicationItem[]; live: EmployerLive }) {
  const profile = applications[0];
  const name = profile?.candidate_name || profile?.candidate_email || employer.candidateProfile.name;
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <EnterpriseCard title="Candidate Workspace" description="Resume preview, skills, projects, experience, interview notes, ratings, timeline, attachments, offer, reject, hire, and message." icon={<Users size={18} />}>
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={name} className="h-16 w-16" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">{profile?.job_title ?? employer.candidateProfile.role}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="success">ATS {employer.candidateProfile.atsScore}</Badge>
              <Badge tone="warning"><Star size={13} /> {employer.candidateProfile.rating}</Badge>
              <Badge tone="info">Offer probability 74%</Badge>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ListCard title="Skills" items={employer.candidateProfile.skills} icon={<Sparkles size={18} />} />
          <ListCard title="Experience" items={employer.candidateProfile.experience} icon={<Briefcase size={18} />} />
          <ListCard title="Projects" items={employer.candidateProfile.projects} icon={<Target size={18} />} />
          <ListCard title="Interview Timeline" items={employer.candidateProfile.interviews} icon={<CalendarDays size={18} />} />
        </div>
      </EnterpriseCard>
      <EnterpriseCard title="Action Panel" description="Persistent recruiter decisions." icon={<Zap size={18} />}>
        <div className="grid gap-2">
          {["Move Stage", "Schedule Interview", "Create Offer", "Message"].map((action) => <Button key={action} variant="outline">{action}</Button>)}
          <Button variant="danger" disabled={!profile?.id} onClick={() => profile?.id && live.actions.updateApplicationStatus.mutate({ id: profile.id, payload: { status: "rejected" } })}>Reject</Button>
        </div>
      </EnterpriseCard>
    </div>
  );
}

function CandidateView({ live }: { live: EmployerLive }) {
  return <CandidateWorkspaceCard applications={liveItems<ApplicationItem>(live.data.applications.data)} live={live} />;
}

function InterviewsView({ live }: { live: EmployerLive }) {
  const applications = liveItems<ApplicationItem>(live.data.applications.data);
  const interviewApplications = applications.filter((item) => includesStatus(item.status, "interview"));
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <EnterpriseCard title="Hiring Calendar" description="Upcoming, completed, meeting links, feedback, and interview scores." icon={<CalendarDays size={18} />}>
        <Calendar />
      </EnterpriseCard>
      <EnterpriseCard title="Interview Center" description="Rooms, meeting providers, interviewers, availability, feedback, and timeline." icon={<MessageSquare size={18} />} badge={<Badge>{interviewApplications.length || employer.interviews.length}</Badge>}>
        <Table columns={["Candidate", "Role", "Round", "Date", "Meeting", "Interviewer"]} rows={(interviewApplications.length ? interviewApplications.map((item) => ({ candidate: item.candidate_name || item.candidate_email || "Candidate", role: item.job_title || "Role", round: item.status || "Interview", date: "Scheduled", mode: "Meeting link ready", interviewer: "Recruiter" })) : employer.interviews).map((item) => [item.candidate, item.role, item.round, item.date, item.mode, item.interviewer])} />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {["Upcoming", "Completed", "Feedback"].map((status) => <InfoCard key={status} title={status} value="Interview workflow ready" icon={<CalendarDays size={18} />} />)}
        </div>
      </EnterpriseCard>
    </div>
  );
}

function TeamView({ live }: { live: EmployerLive }) {
  const liveTeam = liveItems<TeamItem>(live.data.team.data);
  const rows = liveTeam.map((member) => [
    <span key="member" className="inline-flex items-center gap-2"><Avatar name={member.email ?? "Member"} /> {member.email ?? "Email unavailable"}</span>,
    member.role,
    member.permissions?.join(", ") ?? "Permissions unavailable",
    <Badge key="active" tone={member.accepted_at ? "success" : "warning"}>{member.accepted_at ? "Active" : "Invited"}</Badge>,
    member.accepted_at ?? "Awaiting acceptance"
  ]);
  return (
    <div className="grid gap-6">
      <InviteMemberForm live={live} />
      <EnterpriseCard title="Team Management" description="Members, roles, permissions, and invitation state returned by the company team endpoint." icon={<UserPlus size={18} />}>
        <div className="mb-4"><SearchBar placeholder="Search members" suggestions={rows.map((row) => String(row[1]))} /></div>
        <Table columns={["Member", "Role", "Permissions", "Status", "Accepted"]} rows={rows} emptyMessage="No team members" emptyDescription="Invite a teammate with the form above." />
      </EnterpriseCard>
    </div>
  );
}

function InviteMemberForm({ live }: { live: EmployerLive }) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("RECRUITER");
  const [error, setError] = React.useState("");
  return <EnterpriseCard title="Invite Team Member" description="Send an invitation to a real business email address." icon={<UserPlus size={18} />}>
    <form id="invite-member" className="grid scroll-mt-24 gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end" onSubmit={async (event) => { event.preventDefault(); setError(""); try { await live.actions.inviteTeam.mutateAsync({ email, role }); setEmail(""); } catch (caught) { setError(caught instanceof Error ? caught.message : "The invitation could not be sent."); } }}>
      <label className="grid gap-1.5 text-sm font-semibold">Business email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={formControl} /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Role<select value={role} onChange={(event) => setRole(event.target.value)} className={formControl}><option value="RECRUITER">Recruiter</option><option value="HR">HR</option><option value="HIRING_MANAGER">Hiring manager</option><option value="FINANCE">Finance</option></select></label>
      <Button type="submit" disabled={!live.company?.id || live.actions.inviteTeam.isPending} loading={live.actions.inviteTeam.isPending}>Send invite</Button>
      {error ? <p role="alert" className="text-sm text-red-700 md:col-span-3">{error}</p> : null}
    </form>
  </EnterpriseCard>;
}

function AnalyticsView({ live }: { live: EmployerLive }) {
  const analytics = live.data.analytics.data as AnalyticsData | undefined;
  if (!analytics) return <EmptyState title="Analytics unavailable" description="Hiring analytics will appear after the company has application activity." />;
  const metrics = [
    { title: "Applications", value: analytics.total_applications },
    { title: "Interviews", value: analytics.interviews },
    { title: "Offers", value: analytics.offers },
    { title: "Hires", value: analytics.hires },
    { title: "Conversion", value: typeof analytics.conversion_rate === "number" ? `${analytics.conversion_rate}%` : undefined }
  ].filter((item) => item.value !== undefined);
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => <DashboardCard key={item.title} label={item.title} value={String(item.value)} icon={<TrendingUp size={18} />} />)}
      </div>
      <AnalyticsPanel analytics={analytics} />
    </div>
  );
}

function AnalyticsPanel({ analytics }: { analytics?: AnalyticsData }) {
  const data = [
    { name: "Applied", value: analytics?.total_applications ?? 0 },
    { name: "Interview", value: analytics?.interviews ?? 0 },
    { name: "Offer", value: analytics?.offers ?? 0 },
    { name: "Hired", value: analytics?.hires ?? 0 }
  ];
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <EnterpriseCard title="Hiring Funnel" description="Applied to hired conversion with accessible progress bars." icon={<TrendingUp size={18} />}>
        <div className="grid gap-4">
          {data.map((item) => <ProgressRow key={item.name} label={item.name} value={item.value} max={Math.max(...data.map((row) => row.value), 1)} />)}
        </div>
      </EnterpriseCard>
    </div>
  );
}

function BillingView() {
  return <EmptyState title="Billing data unavailable" description="No company-scoped billing endpoint is currently available. No plan, renewal, invoice, or usage values are being fabricated." icon={<CreditCard size={18} />} />;
}

function NotificationsView({ live }: { live: EmployerLive }) {
  const notifications = liveItems<NotificationItem>(live.data.notifications.data);
  return (
    <div className="grid gap-6">
      <EnterpriseCard title="Notifications" description="Grouped alerts with read, delete, filters, and timeline motion." icon={<Bell size={18} />} actions={<Button variant="outline" onClick={() => live.actions.markAllNotificationsRead.mutate()}>Mark All Read</Button>}>
        <div className="mb-4 flex flex-wrap gap-2">{["All", "Applications", "Interviews", "System", "Billing", "Mentions"].map((tab) => <Badge key={tab}>{tab}</Badge>)}</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(notifications.length ? notifications.map((item) => ({
            key: item.id ?? item.channel ?? item.title ?? "notification",
            title: item.title ?? item.channel ?? "Notification",
            status: item.is_read ? "Read" : "Unread",
            detail: item.message ?? "Recruitment update",
            read: Boolean(item.is_read)
          })) : []).map((item) => (
            <Card key={item.key} className="p-5">
              <Bell size={18} />
              <h2 className="mt-3 font-bold">{item.title}</h2>
              <Badge className="mt-2" tone={item.read ? "neutral" : "success"}>{item.status}</Badge>
              <p className="mt-3 text-sm text-[var(--cos-on-surface-variant)]">{item.detail}</p>
            </Card>
          ))}
        </div>{!notifications.length ? <EmptyState title="No notifications" description="Company and recruitment alerts will appear here when they exist." /> : null}
      </EnterpriseCard>
    </div>
  );
}

function SettingsView() {
  const settings = [
    ...employer.settings,
    { title: "Domains", detail: "Verified email domains and DNS readiness" },
    { title: "Integrations", detail: "Calendar, meeting, HRIS and webhook placeholders" }
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {settings.map((item) => <EnterpriseCard key={item.title} title={item.title} description={item.detail} icon={<SettingsIcon title={item.title} />}><Button className="mt-2" variant="secondary" size="sm">Manage</Button></EnterpriseCard>)}
    </div>
  );
}

function HelpView() {
  return (
    <div className="grid gap-6">
      <EnterpriseCard title="Help Center" description="Support, tickets, documentation, knowledge base, release notes, and contact support." icon={<HelpCircle size={18} />}>
        <SearchBar placeholder="Search employer help" suggestions={employer.help.map((item) => item.title)} />
      </EnterpriseCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {employer.help.map((item) => <EnterpriseCard key={item.title} title={item.title} description={item.detail} icon={<HelpCircle size={18} />} />)}
      </div>
    </div>
  );
}

function RecentActivity({ applications }: { applications: ApplicationItem[] }) {
  return (
    <EnterpriseCard title="Recent Activity" description="Candidate and recruiter movement." icon={<ClockIcon />}>
      <Timeline items={(applications.length ? applications : [{ status: "applied", job_title: "Senior Frontend Engineer", candidate_name: "Candidate" }]).slice(0, 4).map((item) => ({ title: item.status ?? "Activity", description: `${item.candidate_name ?? item.candidate_email ?? "Candidate"} • ${item.job_title ?? "Role"}`, tone: toneForStatus(item.status) }))} />
    </EnterpriseCard>
  );
}

function InterviewCard({ applications }: { applications: ApplicationItem[] }) {
  const interviews = applications.filter((item) => includesStatus(item.status, "interview"));
  return (
    <EnterpriseCard title="Upcoming Interviews" description="Interview rooms and meeting links ready." icon={<CalendarDays size={18} />} badge={<Badge>{interviews.length}</Badge>}>
      {interviews.length ? <Timeline items={interviews.slice(0, 4).map((item) => ({ title: item.candidate_name ?? item.candidate_email ?? "Candidate", description: item.job_title ?? "Interview", tone: "info" }))} /> : <EmptyState title="No interviews scheduled" />}
    </EnterpriseCard>
  );
}

function VerificationCard({ company }: { company?: CompanyItem }) {
  return (
    <EnterpriseCard title="Verification" description="GST, CIN, documents, timeline, approval status, and checklist." icon={<BadgeCheck size={18} />} badge={<Badge tone={isVerified(company) ? "success" : "warning"}>{isVerified(company) ? "Verified" : "Review"}</Badge>}>
      <Timeline items={[
        { title: "GST", description: company?.gst_number ?? "GST verification pending", tone: company?.gst_number ? "success" : "warning" },
        { title: "CIN", description: company?.cin_number ?? "CIN verification pending", tone: company?.cin_number ? "success" : "warning" },
        { title: "Domain", description: company?.website ?? employer.company.website, tone: "info" }
      ]} />
    </EnterpriseCard>
  );
}

function VerificationTimeline({ company }: { company?: CompanyItem }) {
  return (
    <EnterpriseCard title="Verification Timeline" description="Approval status and trust checklist." icon={<ShieldCheck size={18} />}>
      <Timeline items={[
        { title: "Company submitted", description: "Workspace registration received", tone: "success" },
        { title: "GST and CIN", description: [company?.gst_number, company?.cin_number].filter(Boolean).join(" • ") || "Documents pending", tone: company?.gst_number && company?.cin_number ? "success" : "warning" },
        { title: "Manual approval", description: company?.status ?? "Admin review pending", tone: isVerified(company) ? "success" : "neutral" }
      ]} orientation="horizontal" />
    </EnterpriseCard>
  );
}

function DataNotice({ queries }: { queries: { isLoading?: boolean; isError?: boolean; refetch?: () => unknown }[] }) {
  const loading = queries.some((query) => query.isLoading);
  const errored = queries.some((query) => query.isError);
  if (loading) return <div className="mb-4 text-sm font-semibold text-[var(--cos-on-surface-variant)]">Loading employer backend data...</div>;
  if (!errored) return null;
  return (
    <Card className="mb-4 border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40">
      Some backend requests failed. <button className="font-semibold underline" onClick={() => queries.forEach((query) => query.refetch?.())}>Retry</button>
    </Card>
  );
}

function InfoCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return <EnterpriseCard title={title} description={value} icon={icon} />;
}

function ListCard({ title, items, icon }: { title: string; items: readonly string[]; icon: React.ReactNode }) {
  const visible = Array.from(new Set(items.filter(Boolean))).slice(0, 10);
  return (
    <EnterpriseCard title={title} description={`${visible.length} items`} icon={icon}>
      <div className="flex flex-wrap gap-2">{visible.length ? visible.map((item) => <Badge key={item}>{item}</Badge>) : <EmptyState title="No records" />}</div>
    </EnterpriseCard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] px-3 py-2 text-sm"><span className="font-semibold">{label}</span><Badge>{value}</Badge></div>;
}

function ProgressRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{value}</span></div>
      <div className="h-3 rounded-full bg-[var(--cos-surface-container-high)]"><div className="h-3 rounded-full bg-[var(--cos-primary)]" style={{ width: `${(value / max) * 100}%` }} /></div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return <div className="mt-4 h-2 rounded-full bg-[var(--cos-surface-container-high)]"><div className="h-2 rounded-full bg-[var(--cos-primary)] transition-[width] duration-200" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function RadialScore({ label, value }: { label: string; value: number }) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <div className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(var(--cos-primary) ${normalized * 3.6}deg, var(--cos-surface-container-high) 0deg)` }}>
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--cos-surface-container-lowest)] text-sm font-bold">{normalized}%</div>
      </div>
      <div className="mt-2 text-xs font-semibold text-[var(--cos-on-surface-variant)]">{label}</div>
    </div>
  );
}

function UploadButton({ label, accept, onFile, variant = "primary" }: { label: string; accept: string; onFile: (file: File) => void; variant?: "primary" | "secondary" }) {
  return (
    <label className="inline-flex cursor-pointer">
      <input className="sr-only" type="file" accept={accept} onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) onFile(file);
      }} />
      <span className={cn("inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-career-button)] border px-3 text-sm font-semibold transition hover:-translate-y-px focus-within:ring-2 focus-within:ring-[var(--cos-focus-ring)]", variant === "secondary" ? "border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)]" : "border-[var(--cos-primary)] bg-[var(--cos-primary)] text-white")}>
        <Upload size={15} /> {label}
      </span>
    </label>
  );
}

function IconButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="rounded-full p-2 transition hover:bg-[var(--cos-surface-container-low)] focus:outline-none focus:ring-2 focus:ring-[var(--cos-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50">{children}</button>;
}

function EmptyColumn() {
  return <div className="rounded-[var(--radius-career-card)] border border-dashed border-[var(--cos-outline)] p-4 text-center text-sm text-[var(--cos-on-surface-variant)]">No candidates</div>;
}

function StatusChip({ status }: { status: string }) {
  return <Badge tone={toneForStatus(status)}>{stageLabel(status)}</Badge>;
}

function SettingsIcon({ title }: { title: string }) {
  if (title === "Brand") return <Building2 size={18} />;
  if (title === "Security") return <ShieldCheck size={18} />;
  if (title.includes("API")) return <Gauge size={18} />;
  if (title.includes("Webhooks")) return <Webhook size={18} />;
  if (title.includes("Notification")) return <Mail size={18} />;
  if (title.includes("Domains")) return <BadgeCheck size={18} />;
  if (title.includes("Integrations")) return <Sparkles size={18} />;
  return <Settings size={18} />;
}

function EditIcon() {
  return <FileText size={18} />;
}

function ClockIcon() {
  return <CalendarDays size={18} />;
}

function liveItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && "items" in value && Array.isArray((value as { items?: unknown }).items)) return (value as { items: T[] }).items;
  return [];
}

function isVerified(company?: CompanyItem) {
  return Boolean(company?.is_verified || company?.status === "approved" || company?.status === "Verified");
}

function includesStatus(status: string | undefined, part: string) {
  return status?.toLowerCase().includes(part) ?? false;
}

function normalizeStage(status?: string) {
  const value = status?.toLowerCase() ?? "applied";
  if (value.includes("screen")) return "screening";
  if (value.includes("short")) return "shortlisted";
  if (value.includes("interview")) return "interview";
  if (value.includes("offer")) return "offer";
  if (value.includes("hire")) return "hired";
  if (value.includes("reject")) return "rejected";
  return stages.includes(value) ? value : "applied";
}

function stageLabel(value: string) {
  return value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function toneForStatus(status?: string): "success" | "warning" | "danger" | "info" | "neutral" {
  const value = status?.toLowerCase() ?? "";
  if (value.includes("publish") || value.includes("offer") || value.includes("hired") || value.includes("short")) return "success";
  if (value.includes("reject") || value.includes("delete") || value.includes("closed")) return "danger";
  if (value.includes("interview") || value.includes("screen") || value.includes("active")) return "info";
  if (value.includes("draft") || value.includes("pause") || value.includes("pending")) return "warning";
  return "neutral";
}

function hiringHealth(jobs: JobItem[], applications: ApplicationItem[], analytics?: AnalyticsData) {
  const openJobs = jobs.filter((job) => job.status === "published").length;
  const hires = analytics?.hires ?? applications.filter((item) => includesStatus(item.status, "hired")).length;
  return Math.max(32, Math.min(96, 48 + openJobs * 6 + hires * 8));
}

function pipelineHealth(applications: ApplicationItem[]) {
  const active = applications.filter((item) => !includesStatus(item.status, "reject")).length;
  return Math.max(35, Math.min(94, 42 + active * 7));
}
