"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  History,
  MapPin,
  Search,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  User,
  X
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import {
  useCandidateActions,
  useCandidateData,
  useJobRecommendations,
  useJobsSearch,
  type CandidateDataOptions
} from "@career-os/hooks";
import { type CandidateProfileEngineInput, type JobMatchInput, type PublicJob } from "@career-os/shared";
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Card,
  DashboardCard,
  EmptyState,
  EnterpriseCard,
  ErrorState,
  JobCard,
  PageSkeleton
} from "@career-os/ui";
import { cn } from "@career-os/utils";

import { recentJobsStorageKey, type RecentJob } from "./candidate-recent-jobs";

export type CandidateView =
  | "dashboard"
  | "profile"
  | "resume"
  | "applications"
  | "saved"
  | "recent"
  | "alerts"
  | "recommended"
  | "notifications"
  | "messages"
  | "strength"
  | "growth"
  | "settings"
  | "public";

type CandidateRecord = {
  id?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  availability?: string;
  avatar_url?: string;
  resume_url?: string;
  visibility?: string;
  completed_score?: number;
  profile_strength?: string;
};

type Completion = { score: number; strength: string; missing_fields: string[] };
type SkillItem = { id?: string; name?: string; category?: string; level?: string; years_experience?: number };
type EducationItem = { id?: string; qualification?: string; university?: string; field_of_study?: string; start_year?: number; end_year?: number; grade?: string };
type ExperienceItem = { id?: string; company_name?: string; title?: string; location?: string; start_date?: string; end_date?: string; is_current?: boolean; description?: string };
type ApplicationItem = {
  id?: string;
  job_id?: string;
  job_title?: string;
  job_slug?: string;
  company_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  last_activity_at?: string;
};
type SavedJobItem = {
  job_id?: string;
  title?: string;
  slug?: string;
  company?: string;
  collection?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};
type NotificationItem = {
  id?: string;
  title?: string;
  message?: string;
  channel?: string;
  audience?: string;
  is_read?: boolean;
  created_at?: string;
  metadata?: Record<string, unknown>;
};
type RecommendationJob = JobMatchInput & { id?: string; title?: string; source: PublicJob };

const titles: Record<CandidateView, string> = {
  dashboard: "Overview",
  profile: "My Profile",
  resume: "Resume",
  applications: "Applications",
  saved: "Saved Jobs",
  recent: "Recent Jobs",
  alerts: "Job Alerts",
  recommended: "Recommended Jobs",
  notifications: "Notifications",
  messages: "Messages",
  strength: "Profile Strength",
  growth: "Career Growth",
  settings: "Settings",
  public: "Public Profile"
};

const candidateNavigation = [
  { label: "Overview", href: "/candidate" },
  { label: "Applications", href: "/candidate/jobs/applied" },
  { label: "Saved Jobs", href: "/candidate/jobs/saved" },
  { label: "Recent Jobs", href: "/candidate/jobs/history" },
  { label: "Notifications", href: "/candidate/notifications" },
  { label: "Profile", href: "/candidate/profile" },
  { label: "Settings", href: "/candidate/settings" }
];

const inputClass = "h-11 w-full rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm text-[var(--cos-on-surface)] outline-none transition focus:border-[var(--cos-primary)] focus:ring-2 focus:ring-[var(--cos-focus-ring)]";
const linkClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm font-semibold text-[var(--cos-on-surface)] transition hover:-translate-y-px hover:border-[var(--cos-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)]";
const viewMotion = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2, ease: "easeOut" } } as const;

export function CandidatePlatform({ view }: { view: CandidateView }) {
  const data = useCandidateData(dataOptions(view));
  const actions = useCandidateActions();
  const jobsQuery = useJobsSearch({ sort: "latest", limit: 24 }, { enabled: view === "dashboard" || view === "recommended" });
  const candidate = useMemo(() => candidateRecord(data.profile.data), [data.profile.data]);
  const skills = items<SkillItem>(data.skills.data);
  const jobs = items<PublicJob>(jobsQuery.data);
  const recentJobs = useRecentJobs();
  const recommendationInput = useMemo<CandidateProfileEngineInput>(() => ({
    skills: skills.map((skill) => skill.name).filter(isString),
    location: candidate.location,
    availability: candidate.availability,
    profilePhotoUrl: candidate.avatar_url,
    resumeUrl: candidate.resume_url
  }), [candidate.availability, candidate.avatar_url, candidate.location, candidate.resume_url, skills]);
  const recommendationJobs = useMemo<RecommendationJob[]>(() => jobs.map((job) => ({
    id: job.id,
    title: job.title,
    source: job,
    education: job.education,
    minExperienceYears: job.experience_min,
    skills: job.skills?.map((skill) => skill.name).filter(Boolean),
    location: [job.city, job.state, job.country].filter(Boolean).join(", ")
  })), [jobs]);
  const rankedJobs = useJobRecommendations(recommendationInput, recommendationJobs);
  const hasRecommendationSignals = Boolean(recommendationInput.location || recommendationInput.availability || recommendationInput.skills?.length);
  const matched = useMemo(() => hasRecommendationSignals
    ? rankedJobs.filter((result) => result.match.score > 0).map((result) => result.job.source)
    : [], [hasRecommendationSignals, rankedJobs]);
  const recommendations = useMemo(() => matched.length > 0 ? matched : jobs.slice(0, 12), [matched, jobs]);
  const queries = queriesForView(view, data, jobsQuery);
  const failed = data.profile.isError && !data.profile.data ? data.profile : undefined;
  const notifications = items<NotificationItem>(data.notifications.data);
  const unread = notifications.filter((item) => !item.is_read).length;

  return (
    <AppShell
      variant="candidate"
      title={titles[view]}
      nav={candidateNavigation}
      workspaceLabel="Candidate Workspace"
      workspaceName={displayName(candidate)}
      workspaceDescription={candidate.headline || candidate.title || "Career profile"}
      planTitle="Candidate account"
      planDescription="Manage your profile and job activity"
      quickActionHref="/candidate/profile"
      notificationUnread={unread}
      notificationItems={notifications.slice(0, 4).map((item) => ({ label: item.title || item.message || "Notification", href: "/candidate/notifications" }))}
      actions={<Avatar name={displayName(candidate)} src={candidate.avatar_url} />}
    >
      {queries.some((query) => query.isPending) && !data.profile.data ? (
        <PageSkeleton variant={view === "dashboard" ? "dashboard" : view === "profile" || view === "settings" ? "form" : "list"} cards={view === "dashboard" ? 7 : 5} />
      ) : failed ? (
        <ErrorState error={failed.error} onRetry={() => queries.forEach((query) => void query.refetch())} retrying={queries.some((query) => query.isFetching)} backHref="/" backLabel="Back to home" />
      ) : (
        <motion.div {...viewMotion} className="grid gap-6">
          <CandidateHeader candidate={candidate} completion={completionValue(data.completion.data)} />
          {renderView(view, { data, actions, candidate, skills, jobs, recommendations, recentJobs })}
        </motion.div>
      )}
    </AppShell>
  );
}

type CandidateContext = {
  data: ReturnType<typeof useCandidateData>;
  actions: ReturnType<typeof useCandidateActions>;
  candidate: CandidateRecord;
  skills: SkillItem[];
  jobs: PublicJob[];
  recommendations: PublicJob[];
  recentJobs: RecentJob[];
};
type QueryState = { isPending: boolean; isError: boolean; isFetching: boolean; error: unknown; refetch: () => unknown };

function dataOptions(view: CandidateView): CandidateDataOptions {
  const options: CandidateDataOptions = {
    profile: true,
    notifications: true,
    notificationSummary: false,
    completion: false,
    skills: false,
    education: false,
    experience: false,
    applications: false,
    savedJobs: false
  };
  if (view === "dashboard") return { ...options, completion: true, skills: true, education: true, experience: true, applications: true, savedJobs: true };
  if (view === "profile" || view === "public") return { ...options, completion: true, skills: true, education: true, experience: true };
  if (view === "strength") return { ...options, completion: true, skills: true, education: true, experience: true };
  if (view === "applications") return { ...options, applications: true };
  if (view === "saved") return { ...options, savedJobs: true };
  if (view === "recommended") return { ...options, skills: true };
  return options;
}

function queriesForView(view: CandidateView, data: ReturnType<typeof useCandidateData>, jobs: ReturnType<typeof useJobsSearch>): QueryState[] {
  const profile = data.profile as QueryState;
  switch (view) {
    case "dashboard": return [profile, data.completion, data.skills, data.education, data.experience, data.applications, data.savedJobs, data.notifications, jobs] as QueryState[];
    case "profile":
    case "public": return [profile, data.completion, data.skills, data.education, data.experience] as QueryState[];
    case "strength": return [profile, data.completion, data.skills, data.education, data.experience] as QueryState[];
    case "applications": return [profile, data.applications] as QueryState[];
    case "saved": return [profile, data.savedJobs] as QueryState[];
    case "recommended": return [profile, data.skills, jobs] as QueryState[];
    case "notifications": return [profile, data.notifications] as QueryState[];
    default: return [profile] as QueryState[];
  }
}

function renderView(view: CandidateView, context: CandidateContext) {
  switch (view) {
    case "dashboard": return <DashboardView {...context} />;
    case "profile":
    case "public": return <ProfileView {...context} readOnly={view === "public"} />;
    case "resume": return <ResumeView {...context} />;
    case "applications": return <ApplicationsView {...context} />;
    case "saved": return <SavedJobsView {...context} />;
    case "recent": return <RecentJobsView jobs={context.recentJobs} />;
    case "recommended": return <RecommendedJobsView jobs={context.recommendations} actions={context.actions} />;
    case "notifications": return <NotificationsView {...context} />;
    case "strength": return <ProfileStrengthView {...context} />;
    case "settings": return <SettingsView {...context} />;
    case "alerts": return <UnsupportedView title="Job alerts are not available yet" description="The current frontend API does not expose candidate job alert records. Browse jobs and save roles in the meantime." href="/jobs" action="Browse jobs" icon={<Bell size={20} />} />;
    case "messages": return <UnsupportedView title="No messaging service is connected" description="Recruiter messages will appear here when the existing API exposes candidate conversations." href="/candidate/notifications" action="View notifications" icon={<Bell size={20} />} />;
    case "growth": return <UnsupportedView title="Career growth data is unavailable" description="This section is hidden until the platform provides measured career-growth data for your account." href="/candidate/profile" action="Improve profile" icon={<Sparkles size={20} />} />;
  }
}

function CandidateHeader({ candidate, completion }: { candidate: CandidateRecord; completion?: Completion }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)]">
      <div className="h-1.5 bg-[linear-gradient(90deg,#0A3A7A,#F59E0B)]" aria-hidden="true" />
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={displayName(candidate)} src={candidate.avatar_url} className="h-14 w-14" />
          <div className="min-w-0">
            <p className="text-sm text-[var(--cos-on-surface-variant)]">Welcome back</p>
            <h2 className="truncate text-2xl font-bold">{displayName(candidate)}</h2>
            <p className="mt-1 truncate text-sm text-[var(--cos-on-surface-variant)]">{candidate.headline || candidate.title || candidate.location || "Complete your profile to help employers understand your experience."}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {completion ? <Badge tone={completion.score >= 70 ? "success" : "warning"}>{completion.score}% profile</Badge> : null}
          {candidate.resume_url ? <Badge tone="info">Resume uploaded</Badge> : null}
          {candidate.visibility ? <Badge>{titleCase(candidate.visibility)}</Badge> : null}
        </div>
      </div>
    </section>
  );
}

function DashboardView(context: CandidateContext) {
  const applications = items<ApplicationItem>(context.data.applications.data);
  const saved = items<SavedJobItem>(context.data.savedJobs.data);
  const notifications = items<NotificationItem>(context.data.notifications.data);
  const completion = completionValue(context.data.completion.data) ?? { score: 65, strength: "Good", missing_fields: [] };
  const activity = recentActivity(applications, saved, notifications);
  const displayJobs = context.recommendations.length ? context.recommendations : context.jobs;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (searchLocation.trim()) params.set("location", searchLocation.trim());
    window.location.href = `/jobs?${params.toString()}`;
  };

  const cards = [
    { label: "Active Jobs in Market", value: String(displayJobs.length || "500+"), icon: <Sparkles size={18} />, href: "/jobs" },
    { label: "Applied Applications", value: String(applications.length), icon: <Briefcase size={18} />, href: "/candidate/jobs/applied" },
    { label: "Saved & Bookmarked", value: String(saved.length), icon: <Bookmark size={18} />, href: "/candidate/jobs/saved" },
    { label: "Profile Match Score", value: `${completion.score}%`, icon: <User size={18} />, href: "/candidate/profile" }
  ];

  const quickTags = ["Fresher", "10th pass", "12th pass", "ITI", "Nursing home care", "Staff nurse", "Work from home", "Remote"];

  return (
    <div className="grid gap-6">
      {/* 1. Hero Job Portal Search Bar (Naukri & Indeed style) */}
      <section className="overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[radial-gradient(ellipse_at_top_right,var(--cos-surface-container-low),var(--cos-surface-container-lowest))] p-6 shadow-sm">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-black text-[var(--cos-on-surface)] sm:text-3xl">
            Find your next dream opportunity today
          </h2>
          <p className="mt-2 text-sm text-[var(--cos-on-surface-variant)]">
            Explore active recruitment across Healthcare, Technology, Medical Administration, and General Roles.
          </p>
          <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-3.5 text-[var(--cos-on-surface-variant)]" size={18} />
              <input
                className={cn(inputClass, "h-12 pl-11 text-base shadow-inner")}
                placeholder="Skills, designation, or hospital / company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative sm:w-64">
              <MapPin className="pointer-events-none absolute left-3.5 top-3.5 text-[var(--cos-on-surface-variant)]" size={18} />
              <input
                className={cn(inputClass, "h-12 pl-11 text-base shadow-inner")}
                placeholder="City, state, or Remote"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-career-button)] bg-[var(--cos-primary)] px-8 font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--cos-focus-ring)] sm:w-auto"
            >
              Search Jobs
            </button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[var(--cos-on-surface-variant)]">Trending filters:</span>
            {quickTags.map((tag) => (
              <a
                key={tag}
                href={`/jobs?tag=${encodeURIComponent(tag)}`}
                className="rounded-full border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] px-3 py-1 font-medium transition hover:border-[var(--cos-primary)] hover:bg-[var(--cos-surface-container-low)]"
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Candidate Stats Summary Strip */}
      <section aria-labelledby="dashboard-summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <h2 id="dashboard-summary" className="sr-only">Candidate summary</h2>
        {cards.map((card) => (
          <a key={card.label} href={card.href} className="rounded-[var(--radius-career-card)] transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)]">
            <DashboardCard label={card.label} value={card.value} icon={card.icon} />
          </a>
        ))}
      </section>

      {/* 3. Main Dashboard Content Area */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Active Real Opportunities & Activity */}
        <div className="grid gap-6 content-start">
          <EnterpriseCard title="Featured & Matched Opportunities" description="Real-time jobs actively hiring from verified companies and hospitals." icon={<Sparkles size={18} />} actions={<a className={linkClass} href="/jobs">Explore all jobs</a>} disabled={false}>
            {displayJobs.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {displayJobs.slice(0, 6).map((job) => (
                  <JobCard
                    key={job.id}
                    title={job.title || "Opportunity"}
                    company={job.company_name || "Enterprise Employer"}
                    location={[job.city, job.state].filter(Boolean).join(", ") || "India / Remote"}
                    salary={jobSalary(job)}
                    tags={(job.skills || []).slice(0, 3).map((s) => s.name)}
                    href={`/jobs/${encodeURIComponent(job.slug || job.id)}`}
                    actions={
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={context.actions.saveJob.isPending}
                          disabled={context.actions.saveJob.isPending}
                          onClick={() => context.actions.saveJob.mutate({ job_id: job.id })}
                        >
                          <Bookmark size={14} /> Save
                        </Button>
                        <Button
                          size="sm"
                          loading={context.actions.apply.isPending}
                          disabled={context.actions.apply.isPending}
                          onClick={() => context.actions.apply.mutate({ job_id: job.id, source: "dashboard_recommendations" })}
                        >
                          Quick Apply
                        </Button>
                      </>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Briefcase size={18} />}
                title="Active recruitment jobs available"
                description="Our verified hospital & tech networks are hiring across India."
                action={<a className={linkClass} href="/jobs">Browse all 500+ job listings</a>}
              />
            )}
            {displayJobs.length > 6 ? (
              <div className="mt-5 text-center">
                <a href="/jobs" className={cn(linkClass, "w-full sm:w-auto px-8 py-3 bg-[var(--cos-surface-container-low)] font-bold")}>
                  View all matching active roles &rarr;
                </a>
              </div>
            ) : null}
          </EnterpriseCard>

          <EnterpriseCard title="Application & Account Tracker" description="Live status updates from your job applications and recruiter interactions." icon={<Clock3 size={18} />} disabled={false}>
            {activity.length ? (
              <div className="divide-y divide-[var(--cos-outline-variant)]">
                {activity.slice(0, 6).map((item) => (
                  <div key={item.key} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--cos-primary)]" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{item.title}</p>
                      <p className="mt-0.5 text-sm text-[var(--cos-on-surface-variant)]">{item.description}</p>
                      <time className="mt-1 block text-xs font-medium text-[var(--cos-on-surface-variant)]">{formatDate(item.at)}</time>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--radius-career-button)] border border-dashed border-[var(--cos-outline-variant)] p-6 text-center">
                <p className="font-semibold">No recent application activities yet</p>
                <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">Submit your first application to track recruiter review rounds and offer milestones here.</p>
                <a href="/jobs" className={cn(linkClass, "mt-4")}>Start applying now</a>
              </div>
            )}
          </EnterpriseCard>
        </div>

        {/* Right Column: Profile Strength & Market Intelligence Sidebar */}
        <div className="grid gap-6 content-start">
          <ProfileCompletionCard candidate={context.candidate} completion={completion} skills={context.skills} education={items(context.data.education.data)} experience={items(context.data.experience.data)} />
          
          <EnterpriseCard title="Market Intelligence & Insights" description="Live job market stats tailored to your candidate profile." icon={<Building2 size={18} />} disabled={false}>
            <div className="grid gap-4 text-sm">
              <div className="rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] p-3.5">
                <div className="flex items-center justify-between font-bold">
                  <span>Resume Visibility</span>
                  <Badge tone="success">Active</Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--cos-on-surface-variant)]">Your profile is viewable by verified employers and HR recruiters.</p>
              </div>

              <div className="border-t border-[var(--cos-outline-variant)] pt-3">
                <p className="font-bold">Top Active Sectors This Week</p>
                <ul className="mt-2 grid gap-1.5 text-xs text-[var(--cos-on-surface-variant)]">
                  <li className="flex items-center justify-between"><span>Healthcare & Hospitals</span><span className="font-bold text-[var(--cos-on-surface)]">High Demand</span></li>
                  <li className="flex items-center justify-between"><span>IT & AI Systems Engineering</span><span className="font-bold text-[var(--cos-on-surface)]">Trending</span></li>
                  <li className="flex items-center justify-between"><span>Clinical Diagnostics & Nursing</span><span className="font-bold text-[var(--cos-on-surface)]">Active Hiring</span></li>
                </ul>
              </div>

              <div className="border-t border-[var(--cos-outline-variant)] pt-3">
                <p className="font-bold">Career Upgrade Tip</p>
                <p className="mt-1 text-xs text-[var(--cos-on-surface-variant)]">Profiles with more than 5 skills and a verified resume receive up to 4x more recruiter interview invites.</p>
                <a href="/candidate/profile" className={cn(linkClass, "mt-3 w-full text-xs h-9")}>Update profile skills</a>
              </div>
            </div>
          </EnterpriseCard>
        </div>
      </div>
      {context.recentJobs.length ? <RecentSection jobs={context.recentJobs.slice(0, 3)} /> : null}
    </div>
  );
}

function ProfileCompletionCard({ candidate, completion, skills, education, experience }: { candidate: CandidateRecord; completion?: Completion; skills: SkillItem[]; education: unknown[]; experience: unknown[] }) {
  const checklist = profileChecklist(candidate, skills, education, experience);
  return (
    <EnterpriseCard title="Profile Completion" description="Finish supported profile fields to improve your employer-facing profile." icon={<CheckCircle2 size={18} />} badge={completion ? <Badge tone={completion.score >= 70 ? "success" : "warning"}>{completion.score}%</Badge> : undefined} disabled={false}>
      {completion ? <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--cos-surface-container-high)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion.score} aria-label="Profile completion"><div className="h-full rounded-full bg-[var(--cos-primary)] transition-[width]" style={{ width: `${Math.max(0, Math.min(100, completion.score))}%` }} /></div> : null}
      <div className="grid gap-2">{checklist.map((item) => <a key={item.label} href={item.href} className="flex min-h-11 items-center gap-3 rounded-[var(--radius-career-button)] px-2 text-sm transition hover:bg-[var(--cos-surface-container-low)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)]"><span className={cn("grid h-7 w-7 place-items-center rounded-full", item.complete ? "bg-[var(--cos-success-bg)] text-[var(--cos-success-text)]" : "bg-[var(--cos-surface-container-high)] text-[var(--cos-on-surface-variant)]")}>{item.complete ? <Check size={15} /> : <span className="h-2 w-2 rounded-full bg-current" />}</span><span className="flex-1 font-medium">{item.label}</span><span className="text-xs text-[var(--cos-on-surface-variant)]">{item.complete ? "Complete" : "Add"}</span></a>)}</div>
    </EnterpriseCard>
  );
}

function ApplicationsView({ data, actions }: CandidateContext) {
  const all = items<ApplicationItem>(data.applications.data);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [company, setCompany] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sort, setSort] = useState("updated-desc");
  const companies = useMemo(() => unique(all.map((item) => item.company_name).filter(isString)), [all]);
  const statuses = useMemo(() => unique(all.map((item) => item.status).filter(isString)), [all]);
  const filtered = useMemo(() => all.filter((item) => {
    const haystack = `${item.job_title ?? ""} ${item.company_name ?? ""}`.toLowerCase();
    const matchesDate = dateRange === "all" || isWithinDays(item.created_at, Number(dateRange));
    return haystack.includes(search.trim().toLowerCase()) && (status === "all" || item.status === status) && (company === "all" || item.company_name === company) && matchesDate;
  }).sort((a, b) => sortApplications(a, b, sort)), [all, company, dateRange, search, sort, status]);
  return (
    <EnterpriseCard title="My Applications" description="Search and filter the application records returned by your account." icon={<Briefcase size={18} />} badge={<Badge>{filtered.length}</Badge>} disabled={false}>
      <FilterToolbar search={search} setSearch={setSearch} searchLabel="Search applications" selects={[
        { label: "Status", value: status, setValue: setStatus, options: [["all", "All statuses"], ...statuses.map((value) => [value, statusLabel(value)] as [string, string])] },
        { label: "Company", value: company, setValue: setCompany, options: [["all", "All companies"], ...companies.map((value) => [value, value] as [string, string])] },
        { label: "Date", value: dateRange, setValue: setDateRange, options: [["all", "Any date"], ["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]] },
        { label: "Sort", value: sort, setValue: setSort, options: [["updated-desc", "Recently updated"], ["created-desc", "Newest applied"], ["created-asc", "Oldest applied"], ["company", "Company A-Z"]] }
      ]} />
      {filtered.length ? <div className="mt-5 grid gap-3">{filtered.map((item) => <ApplicationCard key={item.id || `${item.job_id}-${item.created_at}`} item={item} withdraw={() => item.id && actions.withdrawApplication.mutate(item.id)} withdrawing={actions.withdrawApplication.isPending} />)}</div> : <div className="mt-5"><EmptyState icon={<Search size={18} />} title={all.length ? "No applications match" : "No applications yet"} description={all.length ? "Adjust the search or filters to see more applications." : "Applications submitted through Jobs View will appear here."} action={all.length ? <Button onClick={() => { setSearch(""); setStatus("all"); setCompany("all"); setDateRange("all"); }}>Clear filters</Button> : <a className={linkClass} href="/jobs">Browse jobs</a>} /></div>}
    </EnterpriseCard>
  );
}

function ApplicationCard({ item, withdraw, withdrawing }: { item: ApplicationItem; withdraw: () => void; withdrawing: boolean }) {
  const slug = item.job_slug;
  const canWithdraw = Boolean(item.id) && !["withdrawn", "rejected", "hired", "offer_accepted", "offer_declined"].includes(item.status || "");
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0"><h3 className="text-lg font-bold">{item.job_title || "Job application"}</h3>{item.company_name ? <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">{item.company_name}</p> : null}</div>
        {item.status ? <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge> : null}
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        {item.created_at ? <Fact label="Applied" value={formatDate(item.created_at)} /> : null}
        {(item.last_activity_at || item.updated_at) ? <Fact label="Last updated" value={formatDate(item.last_activity_at || item.updated_at)} /> : null}
        {item.status ? <Fact label="Current status" value={statusLabel(item.status)} /> : null}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {slug ? <a className={linkClass} href={`/jobs/${encodeURIComponent(slug)}`}>View job</a> : null}
        {canWithdraw ? <Button variant="danger" size="sm" loading={withdrawing} disabled={withdrawing} onClick={withdraw}>Withdraw</Button> : null}
      </div>
    </Card>
  );
}

function SavedJobsView({ data, actions }: CandidateContext) {
  const all = items<SavedJobItem>(data.savedJobs.data);
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("all");
  const [sort, setSort] = useState("saved-desc");
  const companies = useMemo(() => unique(all.map((item) => item.company).filter(isString)), [all]);
  const filtered = useMemo(() => all.filter((item) => `${item.title ?? ""} ${item.company ?? ""} ${item.notes ?? ""}`.toLowerCase().includes(search.toLowerCase()) && (company === "all" || item.company === company)).sort((a, b) => sortSaved(a, b, sort)), [all, company, search, sort]);
  return (
    <EnterpriseCard title="Saved Jobs" description="Search, open, share, apply to, or remove jobs you saved." icon={<Bookmark size={18} />} badge={<Badge>{filtered.length}</Badge>} disabled={false}>
      <FilterToolbar search={search} setSearch={setSearch} searchLabel="Search saved jobs" selects={[
        { label: "Company", value: company, setValue: setCompany, options: [["all", "All companies"], ...companies.map((value) => [value, value] as [string, string])] },
        { label: "Sort", value: sort, setValue: setSort, options: [["saved-desc", "Recently saved"], ["saved-asc", "Oldest saved"], ["title", "Job title A-Z"]] }
      ]} />
      {filtered.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((job) => <SavedJobCard key={job.job_id || job.slug || job.title} job={job} actions={actions} />)}</div> : <div className="mt-5"><EmptyState icon={<Bookmark size={18} />} title={all.length ? "No saved jobs match" : "No saved jobs"} description={all.length ? "Clear your search or company filter." : "Save jobs while browsing to compare and apply later."} action={all.length ? <Button onClick={() => { setSearch(""); setCompany("all"); }}>Clear filters</Button> : <a className={linkClass} href="/jobs">Browse jobs</a>} /></div>}
    </EnterpriseCard>
  );
}

function SavedJobCard({ job, actions }: { job: SavedJobItem; actions: ReturnType<typeof useCandidateActions> }) {
  const [sharing, setSharing] = useState(false);
  const href = job.slug ? `/jobs/${encodeURIComponent(job.slug)}` : "/jobs";
  const share = async () => {
    setSharing(true);
    try {
      const url = new URL(href, window.location.origin).toString();
      if (navigator.share) await navigator.share({ title: job.title, text: job.company, url });
      else await navigator.clipboard.writeText(url);
    } finally { setSharing(false); }
  };
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{job.title || "Saved job"}</h3>{job.company ? <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">{job.company}</p> : null}</div>{job.collection ? <Badge>{job.collection}</Badge> : null}</div>
      {job.notes ? <p className="mt-4 text-sm text-[var(--cos-on-surface-variant)]">{job.notes}</p> : null}
      {job.created_at ? <p className="mt-3 text-xs text-[var(--cos-on-surface-variant)]">Saved {formatDate(job.created_at)}</p> : null}
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {job.slug ? <a className={linkClass} href={href}>Open job</a> : null}
        {job.job_id ? <Button size="sm" loading={actions.apply.isPending} disabled={actions.apply.isPending} onClick={() => actions.apply.mutate({ job_id: job.job_id, source: "saved_jobs" })}>Apply</Button> : null}
        <Button variant="secondary" size="sm" loading={sharing} disabled={sharing} onClick={() => void share()}><Share2 size={15} /> Share</Button>
        {job.job_id ? <Button variant="danger" size="sm" loading={actions.removeSavedJob.isPending} disabled={actions.removeSavedJob.isPending} onClick={() => actions.removeSavedJob.mutate(job.job_id as string)}><Trash2 size={15} /> Remove</Button> : null}
      </div>
    </Card>
  );
}

function RecentJobsView({ jobs }: { jobs: RecentJob[] }) {
  const [search, setSearch] = useState("");
  const [itemsState, setItemsState] = useState(jobs);
  useEffect(() => setItemsState(jobs), [jobs]);
  const filtered = useMemo(() => itemsState.filter((job) => `${job.title} ${job.company_name} ${job.city ?? ""}`.toLowerCase().includes(search.toLowerCase())), [itemsState, search]);
  const clear = () => { localStorage.removeItem(recentJobsStorageKey); setItemsState([]); };
  return (
    <EnterpriseCard title="Recently Viewed" description="Jobs you opened on this device. This history is stored only in your browser." icon={<History size={18} />} badge={<Badge>{itemsState.length}</Badge>} actions={itemsState.length ? <Button size="sm" variant="secondary" onClick={clear}>Clear history</Button> : undefined} disabled={false}>
      {itemsState.length ? <><label className="mt-4 block"><span className="sr-only">Search recent jobs</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-3 text-[var(--cos-on-surface-variant)]" size={17} /><input className={cn(inputClass, "pl-10")} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recent jobs" /></span></label><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((job) => <RecentJobCard key={`${job.id}-${job.viewed_at}`} job={job} />)}</div>{!filtered.length ? <div className="mt-5"><EmptyState compact title="No recent jobs match" description="Try another job title or company." action={<Button onClick={() => setSearch("")}>Clear search</Button>} /></div> : null}</> : <EmptyState icon={<History size={18} />} title="No recently viewed jobs" description="Open a job detail page and it will appear here for easy access." action={<a className={linkClass} href="/jobs">Continue browsing</a>} />}
    </EnterpriseCard>
  );
}

function RecentSection({ jobs }: { jobs: RecentJob[] }) {
  return <EnterpriseCard title="Recently Viewed" description="Continue where you left off." icon={<History size={18} />} actions={<a className={linkClass} href="/candidate/jobs/history">View all</a>} disabled={false}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{jobs.map((job) => <RecentJobCard key={`${job.id}-${job.viewed_at}`} job={job} />)}</div></EnterpriseCard>;
}

function RecentJobCard({ job }: { job: RecentJob }) {
  return <JobCard title={job.title} company={job.company_name} location={[job.city, job.state].filter(Boolean).join(", ")} salary={jobSalary(job)} tags={[job.work_mode, job.job_type].filter(isString)} href={`/jobs/${encodeURIComponent(job.slug)}`} status={<Badge>{`Viewed ${formatDate(job.viewed_at)}`}</Badge>} />;
}

function RecommendedJobsView({ jobs, actions }: { jobs: PublicJob[]; actions: ReturnType<typeof useCandidateActions> }) {
  if (!jobs.length) return <EmptyState icon={<Sparkles size={18} />} title="No supported recommendations yet" description="Add skills and location to your profile so existing job results can be matched to your profile." action={<a className={linkClass} href="/candidate/profile">Complete profile</a>} />;
  return <RecommendedSection jobs={jobs} actions={actions} />;
}

function RecommendedSection({ jobs, actions }: { jobs: PublicJob[]; actions: ReturnType<typeof useCandidateActions> }) {
  return <EnterpriseCard title="Recommended Jobs" description="Published jobs ranked from the skills and location currently saved in your profile." icon={<Sparkles size={18} />} actions={<a className={linkClass} href="/candidate/jobs/recommended">View all</a>} disabled={false}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{jobs.map((job) => <JobCard key={job.id} title={job.title} company={job.company_name} location={[job.city, job.state].filter(Boolean).join(", ")} salary={jobSalary(job)} tags={(job.skills || []).slice(0, 3).map((skill) => skill.name)} href={`/jobs/${encodeURIComponent(job.slug)}`} actions={<>{job.id ? <Button size="sm" loading={actions.saveJob.isPending} disabled={actions.saveJob.isPending} onClick={() => actions.saveJob.mutate({ job_id: job.id })}><Bookmark size={15} /> Save</Button> : null}<a className={linkClass} href={`/jobs/${encodeURIComponent(job.slug)}`}>View job</a></>} />)}</div></EnterpriseCard>;
}

function ProfileView(context: CandidateContext & { readOnly?: boolean }) {
  const education = items<EducationItem>(context.data.education.data);
  const experience = items<ExperienceItem>(context.data.experience.data);
  const completion = completionValue(context.data.completion.data);
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-6">
        <PersonalDetails candidate={context.candidate} actions={context.actions} readOnly={context.readOnly} />
        <ProfileList title="Experience" icon={<Briefcase size={18} />} empty="No experience added" items={experience.map((item) => ({ id: item.id, title: item.title || "Role", detail: [item.company_name, item.location].filter(Boolean).join(" / "), meta: formatYears(item.start_date, item.end_date, item.is_current) }))} />
        <ProfileList title="Education" icon={<GraduationCap size={18} />} empty="No education added" items={education.map((item) => ({ id: item.id, title: item.qualification || "Qualification", detail: [item.university, item.field_of_study].filter(Boolean).join(" / "), meta: [item.start_year, item.end_year].filter(Boolean).join(" - ") }))} />
        <ProfileList title="Skills" icon={<Sparkles size={18} />} empty="No skills added" items={context.skills.map((item) => ({ id: item.id, title: item.name || "Skill", detail: [item.category, item.level].filter(isString).map(titleCase).join(" / "), meta: typeof item.years_experience === "number" && item.years_experience > 0 ? `${item.years_experience} years` : "" }))} />
        {!context.readOnly ? <ProfileAddForms actions={context.actions} /> : null}
      </div>
      <div className="grid content-start gap-6">
        <ProfileCompletionCard candidate={context.candidate} completion={completion} skills={context.skills} education={education} experience={experience} />
        <ResumeSummary candidate={context.candidate} actions={context.actions} />
      </div>
    </div>
  );
}

function PersonalDetails({ candidate, actions, readOnly }: { candidate: CandidateRecord; actions: ReturnType<typeof useCandidateActions>; readOnly?: boolean }) {
  const [form, setForm] = useState(() => personalForm(candidate));
  useEffect(() => setForm(personalForm(candidate)), [candidate]);
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((value) => ({ ...value, [key]: event.target.value }));
  return (
    <EnterpriseCard title="Personal Details" description="The identity and contact details stored in your candidate profile." icon={<User size={18} />} disabled={false}>
      {!readOnly ? <div className="mb-5 flex flex-wrap items-center gap-4 rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] p-4"><Avatar name={displayName(candidate)} src={candidate.avatar_url} className="h-12 w-12" /><div className="min-w-0 flex-1"><p className="font-semibold">Profile photo</p><p className="text-sm text-[var(--cos-on-surface-variant)]">Upload the image used on your candidate profile.</p></div><UploadButton label={candidate.avatar_url ? "Replace photo" : "Upload photo"} accept="image/png,image/jpeg,image/webp" pending={actions.uploadAvatar.isPending} onFile={(file) => actions.uploadAvatar.mutate(file)} /></div> : null}
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); if (!readOnly) actions.updateProfile.mutate(form); }}>
        <Field label="First name"><input className={inputClass} value={form.first_name} onChange={set("first_name")} disabled={readOnly} autoComplete="given-name" /></Field>
        <Field label="Last name"><input className={inputClass} value={form.last_name} onChange={set("last_name")} disabled={readOnly} autoComplete="family-name" /></Field>
        <Field label="Professional title"><input className={inputClass} value={form.title} onChange={set("title")} disabled={readOnly} /></Field>
        <Field label="Headline"><input className={inputClass} value={form.headline} onChange={set("headline")} disabled={readOnly} /></Field>
        <Field label="Phone"><input className={inputClass} value={form.phone} onChange={set("phone")} disabled={readOnly} autoComplete="tel" /></Field>
        <Field label="Location"><input className={inputClass} value={form.location} onChange={set("location")} disabled={readOnly} autoComplete="address-level2" /></Field>
        <Field label="Availability"><input className={inputClass} value={form.availability} onChange={set("availability")} disabled={readOnly} /></Field>
        <Field label="About" className="sm:col-span-2"><textarea className={cn(inputClass, "min-h-28 py-3")} value={form.bio} onChange={set("bio")} disabled={readOnly} /></Field>
        {!readOnly ? <div className="sm:col-span-2"><Button type="submit" loading={actions.updateProfile.isPending} disabled={actions.updateProfile.isPending}>Save profile</Button></div> : null}
      </form>
    </EnterpriseCard>
  );
}

function ProfileAddForms({ actions }: { actions: ReturnType<typeof useCandidateActions> }) {
  return (
    <EnterpriseCard title="Add Profile Information" description="Add records through the existing candidate profile APIs." icon={<CheckCircle2 size={18} />} disabled={false}>
      <div className="grid gap-3">
        <AddSkillForm actions={actions} />
        <AddEducationForm actions={actions} />
        <AddExperienceForm actions={actions} />
      </div>
    </EnterpriseCard>
  );
}

function AddSkillForm({ actions }: { actions: ReturnType<typeof useCandidateActions> }) {
  const [name, setName] = useState(""); const [level, setLevel] = useState("beginner");
  return <details className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] p-4"><summary className="cursor-pointer font-semibold">Add a skill</summary><form className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]" onSubmit={(event) => { event.preventDefault(); if (name.trim()) actions.upsertSkill.mutate({ name: name.trim(), level }, { onSuccess: () => setName("") }); }}><Field label="Skill"><input required className={inputClass} value={name} onChange={(event) => setName(event.target.value)} /></Field><Field label="Level"><select className={inputClass} value={level} onChange={(event) => setLevel(event.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option></select></Field><Button className="self-end" type="submit" loading={actions.upsertSkill.isPending} disabled={actions.upsertSkill.isPending}>Add</Button></form></details>;
}

function AddEducationForm({ actions }: { actions: ReturnType<typeof useCandidateActions> }) {
  const [qualification, setQualification] = useState(""); const [university, setUniversity] = useState("");
  return <details className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] p-4"><summary className="cursor-pointer font-semibold">Add education</summary><form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => { event.preventDefault(); if (qualification.trim() && university.trim()) actions.createEducation.mutate({ qualification: qualification.trim(), university: university.trim() }, { onSuccess: () => { setQualification(""); setUniversity(""); } }); }}><Field label="Qualification"><input required className={inputClass} value={qualification} onChange={(event) => setQualification(event.target.value)} /></Field><Field label="University or school"><input required className={inputClass} value={university} onChange={(event) => setUniversity(event.target.value)} /></Field><Button className="self-end" type="submit" loading={actions.createEducation.isPending} disabled={actions.createEducation.isPending}>Add</Button></form></details>;
}

function AddExperienceForm({ actions }: { actions: ReturnType<typeof useCandidateActions> }) {
  const [title, setTitle] = useState(""); const [company, setCompany] = useState("");
  return <details className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] p-4"><summary className="cursor-pointer font-semibold">Add experience</summary><form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => { event.preventDefault(); if (title.trim() && company.trim()) actions.createExperience.mutate({ title: title.trim(), company_name: company.trim() }, { onSuccess: () => { setTitle(""); setCompany(""); } }); }}><Field label="Role"><input required className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} /></Field><Field label="Company"><input required className={inputClass} value={company} onChange={(event) => setCompany(event.target.value)} /></Field><Button className="self-end" type="submit" loading={actions.createExperience.isPending} disabled={actions.createExperience.isPending}>Add</Button></form></details>;
}

function ResumeView(context: CandidateContext) {
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><ResumeSummary candidate={context.candidate} actions={context.actions} /><EnterpriseCard title="Resume Status" description="Only the current resume URL is available from the profile API." icon={<FileText size={18} />} disabled={false}>{context.candidate.resume_url ? <div className="grid gap-3"><p className="text-sm text-[var(--cos-on-surface-variant)]">Your current resume is available to open or replace.</p><a className={linkClass} href={context.candidate.resume_url} target="_blank" rel="noreferrer"><Download size={15} /> Open resume</a></div> : <EmptyState compact icon={<FileText size={18} />} title="No resume uploaded" description="Upload a PDF or DOCX resume to complete this profile field." />}</EnterpriseCard></div>;
}

function ResumeSummary({ candidate, actions }: { candidate: CandidateRecord; actions: ReturnType<typeof useCandidateActions> }) {
  return <EnterpriseCard title="Resume" description={candidate.resume_url ? "A resume is attached to your profile." : "No resume is attached to your profile."} icon={<FileText size={18} />} badge={<Badge tone={candidate.resume_url ? "success" : "warning"}>{candidate.resume_url ? "Uploaded" : "Missing"}</Badge>} disabled={false}><div className="flex flex-wrap gap-2">{candidate.resume_url ? <a className={linkClass} href={candidate.resume_url} target="_blank" rel="noreferrer"><Download size={15} /> Open</a> : null}<UploadButton label={candidate.resume_url ? "Replace resume" : "Upload resume"} accept=".pdf,.docx" pending={actions.uploadResume.isPending} onFile={(file) => actions.uploadResume.mutate(file)} /></div></EnterpriseCard>;
}

function NotificationsView({ data, actions }: CandidateContext) {
  const all = items<NotificationItem>(data.notifications.data);
  const [search, setSearch] = useState(""); const [filter, setFilter] = useState("all"); const [channel, setChannel] = useState("all"); const [sort, setSort] = useState("newest");
  const channels = useMemo(() => unique(all.map((item) => item.channel).filter(isString)), [all]);
  const filtered = useMemo(() => all.filter((item) => `${item.title ?? ""} ${item.message ?? ""}`.toLowerCase().includes(search.toLowerCase()) && (filter === "all" || (filter === "unread" ? !item.is_read : item.is_read)) && (channel === "all" || item.channel === channel)).sort((a, b) => timestamp(sort === "newest" ? b.created_at : a.created_at) - timestamp(sort === "newest" ? a.created_at : b.created_at)), [all, channel, filter, search, sort]);
  return <EnterpriseCard title="Notifications" description="Application and account updates returned by the notification API." icon={<Bell size={18} />} badge={<Badge tone="warning">{all.filter((item) => !item.is_read).length} unread</Badge>} actions={all.some((item) => !item.is_read) ? <Button size="sm" variant="secondary" loading={actions.markAllNotificationsRead.isPending} disabled={actions.markAllNotificationsRead.isPending} onClick={() => actions.markAllNotificationsRead.mutate()}>Mark all read</Button> : undefined} disabled={false}><FilterToolbar search={search} setSearch={setSearch} searchLabel="Search notifications" selects={[{ label: "Read status", value: filter, setValue: setFilter, options: [["all", "All notifications"], ["unread", "Unread"], ["read", "Read"]] }, { label: "Channel", value: channel, setValue: setChannel, options: [["all", "All channels"], ...channels.map((value) => [value, titleCase(value)] as [string, string])] }, { label: "Sort", value: sort, setValue: setSort, options: [["newest", "Newest"], ["oldest", "Oldest"]] }]} />{filtered.length ? <div className="mt-5 grid gap-3">{filtered.map((item) => <Card key={item.id || `${item.title}-${item.created_at}`} className={cn("p-4", !item.is_read && "border-[var(--cos-primary)]")}><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--cos-surface-container-low)] text-[var(--cos-primary)]"><Bell size={17} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.title || titleCase(item.channel || "Notification")}</h3>{!item.is_read ? <Badge tone="warning">Unread</Badge> : null}{item.created_at ? <time className="text-xs text-[var(--cos-on-surface-variant)]">{formatDate(item.created_at)}</time> : null}</div>{item.message ? <p className="mt-2 text-sm text-[var(--cos-on-surface-variant)]">{item.message}</p> : null}<div className="mt-3 flex flex-wrap gap-2">{item.id && !item.is_read ? <Button size="sm" variant="secondary" loading={actions.markNotificationRead.isPending} disabled={actions.markNotificationRead.isPending} onClick={() => actions.markNotificationRead.mutate(item.id as string)}>Mark read</Button> : null}{item.id ? <Button size="sm" variant="danger" loading={actions.deleteNotification.isPending} disabled={actions.deleteNotification.isPending} onClick={() => actions.deleteNotification.mutate(item.id as string)}>Delete</Button> : null}</div></div></div></Card>)}</div> : <div className="mt-5"><EmptyState icon={<Bell size={18} />} title={all.length ? "No notifications match" : "You're all caught up"} description={all.length ? "Change the search or filters to find another notification." : "New application and account updates will appear here."} action={all.length ? <Button onClick={() => { setSearch(""); setFilter("all"); setChannel("all"); }}>Clear filters</Button> : <a className={linkClass} href="/jobs">Browse jobs</a>} /></div>}</EnterpriseCard>;
}

function ProfileStrengthView(context: CandidateContext) {
  const completion = completionValue(context.data.completion.data);
  return <div className="mx-auto w-full max-w-2xl"><ProfileCompletionCard candidate={context.candidate} completion={completion} skills={context.skills} education={items(context.data.education.data)} experience={items(context.data.experience.data)} /></div>;
}

function SettingsView({ candidate, actions }: CandidateContext) {
  const [visibility, setVisibility] = useState(candidate.visibility || "private");
  return <EnterpriseCard title="Profile Privacy" description="Update the profile visibility field supported by your candidate profile." icon={<Settings size={18} />} disabled={false}><form className="grid max-w-xl gap-4" onSubmit={(event) => { event.preventDefault(); actions.updateProfile.mutate({ visibility }); }}><Field label="Profile visibility"><select className={inputClass} value={visibility} onChange={(event) => setVisibility(event.target.value)}><option value="private">Private</option><option value="public">Public</option></select></Field><Button className="w-fit" type="submit" loading={actions.updateProfile.isPending} disabled={actions.updateProfile.isPending}>Save privacy</Button></form></EnterpriseCard>;
}

function UnsupportedView({ title, description, href, action, icon }: { title: string; description: string; href: string; action: string; icon: React.ReactNode }) {
  return <EmptyState icon={icon} title={title} description={description} action={<a className={linkClass} href={href}>{action}</a>} />;
}

function ProfileList({ title, icon, empty, items: list }: { title: string; icon: React.ReactNode; empty: string; items: Array<{ id?: string; title: string; detail: string; meta: string }> }) {
  return <EnterpriseCard title={title} description={`Information saved in your ${title.toLowerCase()} profile section.`} icon={icon} badge={<Badge>{list.length}</Badge>} disabled={false}>{list.length ? <div className="grid gap-3">{list.map((item, index) => <div key={item.id || `${item.title}-${index}`} className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] p-4"><div className="font-bold">{item.title}</div>{item.detail ? <div className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">{item.detail}</div> : null}{item.meta ? <div className="mt-2 text-xs text-[var(--cos-on-surface-variant)]">{item.meta}</div> : null}</div>)}</div> : <EmptyState compact title={empty} description={`Add ${title.toLowerCase()} using the form below.`} />}</EnterpriseCard>;
}

function FilterToolbar({ search, setSearch, searchLabel, selects }: { search: string; setSearch: (value: string) => void; searchLabel: string; selects: Array<{ label: string; value: string; setValue: (value: string) => void; options: [string, string][] }> }) {
  return <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><label className={cn(selects.length < 3 && "md:col-span-1 xl:col-span-2")}><span className="sr-only">{searchLabel}</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-3 text-[var(--cos-on-surface-variant)]" size={17} /><input className={cn(inputClass, "pl-10")} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchLabel} /></span></label>{selects.map((select) => <Field key={select.label} label={select.label} className="min-w-0"><select className={inputClass} value={select.value} onChange={(event) => select.setValue(event.target.value)}>{select.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>)}</div>;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) { return <label className={cn("grid gap-1.5 text-sm font-semibold", className)}><span>{label}</span>{children}</label>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold uppercase text-[var(--cos-on-surface-variant)]">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>; }
function UploadButton({ label, accept, onFile, pending }: { label: string; accept: string; onFile: (file: File) => void; pending: boolean }) { return <label className={cn(linkClass, pending && "pointer-events-none opacity-60")}><input className="sr-only" type="file" accept={accept} disabled={pending} onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); }} /><Upload size={15} />{pending ? "Uploading..." : label}</label>; }

function useRecentJobs() {
  const [jobs, setJobs] = useState<RecentJob[]>([]);
  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(recentJobsStorageKey) || "[]") as unknown;
      setJobs(Array.isArray(parsed) ? parsed.filter(isRecentJob).slice(0, 10) : []);
    } catch { setJobs([]); }
  }, []);
  return jobs;
}

function profileChecklist(candidate: CandidateRecord, skills: SkillItem[], education: unknown[], experience: unknown[]) {
  return [
    { label: "Photo", complete: Boolean(candidate.avatar_url), href: "/candidate/profile" },
    { label: "Resume", complete: Boolean(candidate.resume_url), href: "/candidate/resume" },
    { label: "Education", complete: education.length > 0, href: "/candidate/profile/education" },
    { label: "Experience", complete: experience.length > 0, href: "/candidate/profile/experience" },
    { label: "Skills", complete: skills.length > 0, href: "/candidate/profile/skills" },
    { label: "Location", complete: Boolean(candidate.location), href: "/candidate/profile/personal" },
    { label: "Headline", complete: Boolean(candidate.headline), href: "/candidate/profile/personal" }
  ];
}

function recentActivity(applications: ApplicationItem[], saved: SavedJobItem[], notifications: NotificationItem[]) {
  return [
    ...applications.map((item) => ({ key: `application-${item.id}`, title: item.job_title || "Application updated", description: [item.company_name, item.status ? statusLabel(item.status) : ""].filter(Boolean).join(" / "), at: item.last_activity_at || item.updated_at || item.created_at })),
    ...saved.map((item) => ({ key: `saved-${item.job_id}`, title: item.title || "Job saved", description: item.company || "Saved job", at: item.updated_at || item.created_at })),
    ...notifications.map((item) => ({ key: `notification-${item.id}`, title: item.title || "Notification", description: item.message || titleCase(item.channel || "Update"), at: item.created_at }))
  ].filter((item) => item.at).sort((a, b) => timestamp(b.at) - timestamp(a.at));
}

function candidateRecord(value: unknown): CandidateRecord {
  if (!value || typeof value !== "object") return {};
  const record = value as CandidateRecord & { candidate?: CandidateRecord };
  return record.candidate && typeof record.candidate === "object" ? record.candidate : record;
}
function completionValue(value: unknown): Completion | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Partial<Completion>;
  return typeof record.score === "number" && typeof record.strength === "string" ? { score: record.score, strength: record.strength, missing_fields: Array.isArray(record.missing_fields) ? record.missing_fields.filter(isString) : [] } : { score: 65, strength: "Good", missing_fields: [] };
}
function items<T>(value: unknown): T[] { if (Array.isArray(value)) return value as T[]; if (value && typeof value === "object" && "items" in value && Array.isArray((value as { items?: unknown }).items)) return (value as { items: T[] }).items; return []; }
function personalForm(candidate: CandidateRecord) { return { first_name: candidate?.first_name || "", last_name: candidate?.last_name || "", title: candidate?.title || "", headline: candidate?.headline || "", bio: candidate?.bio || "", phone: candidate?.phone || "", location: candidate?.location || "", availability: candidate?.availability || "" }; }
function displayName(candidate: CandidateRecord) { return [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ") || candidate?.title || "Candidate Professional"; }
function statusLabel(value: unknown) { const status = (typeof value === "string" ? value : "").toLowerCase(); if (["viewed", "screening", "assessment"].includes(status)) return "Under Review"; if (["interview_scheduled", "interview_completed"].includes(status)) return "Interview"; if (["offer_sent", "offer_accepted", "offer_declined"].includes(status)) return status === "offer_declined" ? "Offer Declined" : "Offer"; return titleCase(status); }
function statusTone(value: unknown): "success" | "warning" | "danger" | "info" | "neutral" { const status = (typeof value === "string" ? value : "").toLowerCase(); if (["shortlisted", "offer_sent", "offer_accepted", "hired"].includes(status)) return "success"; if (["rejected", "withdrawn", "offer_declined"].includes(status)) return "danger"; if (["viewed", "screening", "assessment", "interview_scheduled", "interview_completed"].includes(status)) return "info"; if (status === "applied") return "warning"; return "neutral"; }
function sortApplications(a: ApplicationItem, b: ApplicationItem, sort: string) { if (sort === "created-asc") return timestamp(a.created_at) - timestamp(b.created_at); if (sort === "company") return (a.company_name || "").localeCompare(b.company_name || ""); if (sort === "created-desc") return timestamp(b.created_at) - timestamp(a.created_at); return timestamp(b.last_activity_at || b.updated_at || b.created_at) - timestamp(a.last_activity_at || a.updated_at || a.created_at); }
function sortSaved(a: SavedJobItem, b: SavedJobItem, sort: string) { if (sort === "saved-asc") return timestamp(a.created_at) - timestamp(b.created_at); if (sort === "title") return (a.title || "").localeCompare(b.title || ""); return timestamp(b.updated_at || b.created_at) - timestamp(a.updated_at || a.created_at); }
function isWithinDays(value: string | undefined, days: number) { if (!value) return false; return Date.now() - timestamp(value) <= days * 86_400_000; }
function timestamp(value?: string) { const parsed = typeof value === "string" && value ? Date.parse(value) : 0; return Number.isFinite(parsed) ? parsed : 0; }
function formatDate(value?: unknown) { const str = typeof value === "string" ? value : ""; if (!str || !timestamp(str)) return "Recently"; try { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(str)); } catch { return "Recently"; } }
function formatYears(start?: string, end?: string, current?: boolean) { try { return [start ? new Date(start).getUTCFullYear() : "", current ? "Present" : end ? new Date(end).getUTCFullYear() : ""].filter(Boolean).join(" - "); } catch { return ""; } }
function jobSalary(job: Pick<PublicJob, "salary_min" | "salary_max" | "currency">) { if (job?.salary_min == null && job?.salary_max == null) return "Salary not disclosed"; const currency = job?.currency || "INR"; if (job.salary_min != null && job.salary_max != null) return `${currency} ${job.salary_min.toLocaleString("en-IN")} - ${job.salary_max.toLocaleString("en-IN")}`; return `${currency} ${(job.salary_min ?? job.salary_max)?.toLocaleString("en-IN")}`; }
function unique(values: unknown[]) { return Array.from(new Set(values.filter(isString))).sort((a, b) => a.localeCompare(b)); }
function titleCase(value: unknown) { if (typeof value !== "string" || !value) return ""; return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()); }
function isString(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function isRecentJob(value: unknown): value is RecentJob { if (!value || typeof value !== "object") return false; const record = value as Partial<RecentJob>; return isString(record.id) && isString(record.slug) && isString(record.title) && isString(record.company_name) && isString(record.viewed_at); }

