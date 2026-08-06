"use client";

import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Flame,
  GraduationCap,
  LineChart,
  MessageSquare,
  Rocket,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  WalletCards,
  Zap,
  FileSearch
} from "lucide-react";
import React from "react";

import { navigation } from "@career-os/config";
import { useAuthActions, useCandidateData } from "@career-os/hooks";
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Calendar,
  Chart,
  ChartShell,
  DashboardCard,
  EnterpriseCard,
  SearchBar,
  Table,
  Timeline
} from "@career-os/ui";

import { careerIntelligence } from "../../content/career-intelligence";

type CandidateRecord = { first_name?: string; last_name?: string; title?: string; headline?: string; resume_url?: string };
type Completion = { score: number; strength: string };
type ApplicationItem = { id?: string; job_title?: string; company_name?: string; status?: string; created_at?: string };
type EducationItem = { qualification?: string; university?: string };
type ExperienceItem = { title?: string; company_name?: string; is_current?: boolean };

/** Real data pulled from the candidate's account, used in place of fabricated numbers wherever available. */
type RealData = {
  displayName: string;
  completion?: Completion;
  resumeUploaded: boolean;
  applications: ApplicationItem[];
  skills: string[];
  latestEducation?: EducationItem;
  latestExperience?: ExperienceItem;
  refetch: () => void;
  isFetching: boolean;
};

/** Marks a card/section as still using sample data rather than a real analysis of the candidate's account. */
function PreviewBadge() {
  return <Badge tone="neutral">Preview data</Badge>;
}

/** Banner for entire views that are still sample content end-to-end (no real scoring backend exists yet). */
function ViewPreviewBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-career-card)] border border-dashed border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-4 text-sm">
      <PreviewBadge />
      <p className="text-[var(--cos-on-surface-variant)]">{text}</p>
    </div>
  );
}

function items<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && "items" in value && Array.isArray((value as { items?: unknown }).items)) return (value as { items: T[] }).items;
  return [];
}
function displayName(candidate: CandidateRecord) {
  return [candidate.first_name, candidate.last_name].filter(Boolean).join(" ") || candidate.title || "Candidate";
}
function applicationFunnelCount(applications: ApplicationItem[], stage: "responses" | "interviews" | "offers") {
  const status = (item: ApplicationItem) => (item.status || "").toLowerCase();
  if (stage === "responses") return applications.filter((item) => status(item) !== "applied").length;
  if (stage === "interviews") return applications.filter((item) => status(item).startsWith("interview")).length;
  return applications.filter((item) => status(item).startsWith("offer")).length;
}

export type CareerView =
  | "dashboard"
  | "resume"
  | "salary"
  | "skills"
  | "roadmaps"
  | "interview"
  | "learning"
  | "analytics"
  | "recommendations"
  | "guides";

const titles: Record<CareerView, string> = {
  dashboard: "Career Intelligence",
  resume: "Resume Intelligence",
  salary: "Salary Intelligence",
  skills: "Skill Intelligence",
  roadmaps: "Career Roadmaps",
  interview: "Interview Intelligence",
  learning: "Learning Center",
  analytics: "Career Analytics",
  recommendations: "Recommendations",
  guides: "Public Career Guides"
};

const descriptions: Record<CareerView, string> = {
  dashboard: "Your personal AI-ready Jobs View Operating System for health, goals, salary, skills, interviews, and momentum.",
  resume: "Resume score, ATS fit, keyword match, grammar, formatting, readability, timeline, and version intelligence.",
  salary: "Expected salary, market comparison, city and role benchmarks, salary trend, growth forecast, and promotion signal.",
  skills: "Skill gap, demand index, trending skills, learning path, progress, radar, and future skill index.",
  roadmaps: "Role-specific roadmaps for learning, skills, projects, interview preparation, salary growth, and milestones.",
  interview: "Interview readiness, calendar, mock interview placeholder, feedback, checklist, and communication score.",
  learning: "Roadmaps, courses, books, videos, certificates, bookmarks, progress, and learning calendar.",
  analytics: "Application funnel, interview funnel, salary trend, skill growth, career growth, profile views, and recruiter activity.",
  recommendations: "Personalized cards for jobs, skills, companies, courses, guides, roadmaps, and interview questions.",
  guides: "Premium editorial career guides with categories, reading time, difficulty, bookmarks, share, and related content."
};

const motionProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" }
} as const;

const exclusiveWidgets = [
  ["Career DNA", 86, "Profile, resume, skills, projects, and outcomes", Brain],
  ["Opportunity Index", 79, "Role-market fit and current demand", Target],
  ["Promotion Readiness", 74, "Leadership, impact, and scope signals", Trophy],
  ["Future Skill Index", 81, "Skills for the next 24 months", Rocket],
  ["Salary Confidence", 88, "Market, city, role, and seniority fit", WalletCards],
  ["Resume Evolution", 78, "Versions, ATS trend, and improvements", FileSearch],
  ["Recruiter Visibility", 72, "Profile views and recruiter interest", UserRound],
  ["Career Momentum", 84, "Streak, goals, learning, and applications", Flame]
] as const;

export function CareerIntelligencePlatform({ view }: { view: CareerView }) {
  const data = useCandidateData({ profile: true, completion: true, skills: true, education: true, experience: true, applications: true, savedJobs: false, notifications: false, notificationSummary: false });
  const auth = useAuthActions();
  const candidate = (data.profile.data && typeof data.profile.data === "object" ? (data.profile.data as { candidate?: CandidateRecord }).candidate ?? (data.profile.data as CandidateRecord) : {}) as CandidateRecord;
  const completionRaw = data.completion.data as Partial<Completion> | undefined;
  const applications = items<ApplicationItem>(data.applications.data);
  const education = items<EducationItem>(data.education.data);
  const experience = items<ExperienceItem>(data.experience.data);
  const skills = items<{ name?: string }>(data.skills.data).map((skill) => skill.name).filter((name): name is string => Boolean(name));
  const real: RealData = {
    displayName: displayName(candidate),
    completion: typeof completionRaw?.score === "number" && typeof completionRaw.strength === "string" ? { score: completionRaw.score, strength: completionRaw.strength } : undefined,
    resumeUploaded: Boolean(candidate.resume_url),
    applications,
    skills,
    latestEducation: education[0],
    latestExperience: experience[0],
    refetch: () => { void data.profile.refetch(); void data.completion.refetch(); void data.applications.refetch(); },
    isFetching: data.profile.isFetching || data.completion.isFetching || data.applications.isFetching
  };
  return (
    <AppShell
      variant="candidate"
      title={titles[view]}
      nav={navigation.candidate}
      workspaceLabel="Career Intelligence"
      workspaceName={real.displayName}
      workspaceDescription={candidate.headline || candidate.title || "Career profile"}
      planTitle="Jobs View"
      planDescription="Career intelligence workspace"
      quickActionHref="/career-intelligence"
      actions={
        <div className="hidden items-center gap-2 sm:flex">
          <Badge tone="info"><Bot size={13} /> AI ready</Badge>
          <Button size="sm" variant="secondary" loading={real.isFetching} disabled={real.isFetching} onClick={real.refetch}><Sparkles size={15} /> Refresh</Button>
        </div>
      }
      onLogout={() => auth.logout.mutate()}
    >
      <motion.div {...motionProps} className="grid gap-6">
        <CareerCommandHeader view={view} real={real} />
        {renderView(view, real)}
      </motion.div>
    </AppShell>
  );
}

function renderView(view: CareerView, real: RealData) {
  switch (view) {
    case "resume":
      return <ResumeIntelligenceView real={real} />;
    case "salary":
      return <SalaryIntelligenceView />;
    case "skills":
      return <SkillIntelligenceView real={real} />;
    case "roadmaps":
      return <RoadmapsView />;
    case "interview":
      return <InterviewIntelligenceView />;
    case "learning":
      return <LearningCenterView />;
    case "analytics":
      return <CareerAnalyticsView real={real} />;
    case "recommendations":
      return <RecommendationsView />;
    case "guides":
      return <GuidesView />;
    default:
      return <DashboardView real={real} />;
  }
}

function CareerCommandHeader({ view, real }: { view: CareerView; real: RealData }) {
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 shadow-career-sm sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#14B8A6,#2563EB)]" aria-hidden="true" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <Avatar name={real.displayName} className="h-16 w-16" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="premium">Career workspace</Badge>
              {real.resumeUploaded ? <Badge tone="success">Resume uploaded</Badge> : <Badge tone="warning">Resume missing</Badge>}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-normal sm:text-3xl">{titles[view]}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--cos-on-surface-variant)]">{descriptions[view]}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-[var(--cos-on-surface-variant)]">
              <span className="inline-flex items-center gap-1"><UserRound size={14} /> {real.displayName}</span>
              <span className="inline-flex items-center gap-1"><Sparkles size={14} /> {real.applications.length} application{real.applications.length === 1 ? "" : "s"} tracked</span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <RadialScore label="Profile Completion" value={real.completion?.score ?? 0} />
          <RadialScore label="Resume" value={real.resumeUploaded ? 100 : 0} />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href="/candidate/resume"><Button size="sm" variant="primary"><Sparkles size={15} /> Improve resume</Button></a>
        <a href="/candidate/profile"><Button size="sm" variant="outline"><Sparkles size={15} /> Update skills</Button></a>
        <a href="/salary/calculator"><Button size="sm" variant="outline"><Sparkles size={15} /> Salary calculator</Button></a>
      </div>
    </section>
  );
}

function DashboardView({ real }: { real: RealData }) {
  return (
    <div className="grid gap-6">
      <CommandMetrics real={real} />
      <CareerTimelinePanel real={real} />
      <div className="grid gap-4 md:grid-cols-3">
        <MiniModule title="Resume Intelligence" icon={<FileSearch size={18} />} href="/resume-insights" items={careerIntelligence.resumeInsights.missingSections} />
        <MiniModule title="Salary Intelligence" icon={<WalletCards size={18} />} href="/salary-insights" items={careerIntelligence.salary.drivers} />
        <MiniModule title="Skill Intelligence" icon={<Brain size={18} />} href="/skill-intelligence" items={careerIntelligence.skills.gaps} />
      </div>
      <details className="group rounded-[var(--radius-career-card)] border border-dashed border-[var(--cos-outline-variant)]">
        <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-semibold">
          <span className="transition-transform group-open:rotate-90">›</span>
          Preview: what deeper AI career analysis will look like
          <PreviewBadge />
        </summary>
        <div className="grid gap-6 p-4 pt-0">
          <p className="text-sm text-[var(--cos-on-surface-variant)]">These sections are sample content showing where Jobs View is headed. They are not calculated from your account.</p>
          <ExclusiveWidgets />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_440px]">
            <CareerHealthPanel />
            <GoalsAndAchievements />
          </div>
          <RecommendationsPanel />
        </div>
      </details>
    </div>
  );
}

function CommandMetrics({ real }: { real: RealData }) {
  const metrics = [
    ["Profile Completion", real.completion ? `${real.completion.score}%` : "Not calculated", real.completion?.strength || "Complete your profile", Target, false],
    ["Applications Sent", String(real.applications.length), "Tracked from your account", Briefcase, false],
    ["Interviews", String(applicationFunnelCount(real.applications, "interviews")), "From application status", CheckCircle2, false],
    ["Offers", String(applicationFunnelCount(real.applications, "offers")), "From application status", Trophy, false],
    ["Resume Score", scoreByLabel("Resume Score"), "Sample — ATS-ready signal", FileSearch, true],
    ["Salary Potential", scoreByLabel("Salary Potential"), careerIntelligence.salary.market, WalletCards, true],
    ["Profile Visibility", 72, "Sample — recruiter discovery", UserRound, true],
    ["Learning Progress", scoreByLabel("Learning Progress"), "Sample — weekly goal", GraduationCap, true]
  ] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, trend, Icon, preview]) => (
        <div key={label} className="relative">
          <DashboardCard label={label} value={String(value)} trend={String(trend)} icon={<Icon size={18} />} />
          {preview ? <span className="absolute right-3 top-3"><PreviewBadge /></span> : null}
        </div>
      ))}
    </div>
  );
}

function ExclusiveWidgets() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {exclusiveWidgets.map(([title, value, detail, Icon]) => (
        <EnterpriseCard key={title} title={title} description={detail} icon={<Icon size={18} />} badge={<PreviewBadge />}>
          <ProgressBar value={value} />
        </EnterpriseCard>
      ))}
    </div>
  );
}

function CareerHealthPanel() {
  return (
    <EnterpriseCard title="Career Health Radar" description="Experience, education, resume, projects, skills, interview, networking, certifications, portfolio, languages, and soft skills." icon={<Brain size={18} />} badge={<PreviewBadge />}>
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <RadarVisual />
        <div className="grid gap-3 sm:grid-cols-2">
          {careerIntelligence.healthBreakdown.map((item) => (
            <MetricStrip key={item.name} label={item.name} value={item.value} />
          ))}
          {[
            ["Interview", 74],
            ["Networking", 57],
            ["Soft Skills", 83]
          ].map(([label, value]) => <MetricStrip key={label as string} label={label as string} value={value as number} />)}
        </div>
      </div>
    </EnterpriseCard>
  );
}

function ResumeIntelligenceView({ real }: { real: RealData }) {
  const resume = careerIntelligence.resumeInsights;
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="grid gap-6">
        <EnterpriseCard title="Resume Status" description="What Jobs View actually knows about your resume today." icon={<FileSearch size={18} />} badge={<Badge tone={real.resumeUploaded ? "success" : "warning"}>{real.resumeUploaded ? "Uploaded" : "Missing"}</Badge>}>
          {real.resumeUploaded ? <p className="text-sm text-[var(--cos-on-surface-variant)]">A resume is attached to your profile.</p> : <p className="text-sm text-[var(--cos-on-surface-variant)]">No resume uploaded yet. Upload one from your profile to complete this section.</p>}
          <a href="/candidate/resume"><Button className="mt-3" size="sm">{real.resumeUploaded ? "Manage resume" : "Upload resume"}</Button></a>
        </EnterpriseCard>
        <EnterpriseCard title="Sample: Resume Score Breakdown" description="What automated ATS scoring will show once connected to a real parsing engine." icon={<FileSearch size={18} />} badge={<PreviewBadge />}>
          <RadialScore label="ATS Score" value={resume.atsScore} />
          <div className="mt-4 grid gap-3">
            <MetricStrip label="Keyword Match" value={82} />
            <MetricStrip label="Grammar" value={91} />
            <MetricStrip label="Formatting" value={88} />
            <MetricStrip label="Recruiter Readability" value={76} />
          </div>
        </EnterpriseCard>
      </div>
      <EnterpriseCard title="Sample: Improvement Console" description="Example of the AI suggestions this section will surface once built." icon={<Sparkles size={18} />} badge={<PreviewBadge />}>
        <Table columns={["Area", "Signals"]} rows={[
          ["Keywords", resume.keywords.join(", ")],
          ["Missing Skills", resume.missingSkills.join(", ")],
          ["Missing Sections", resume.missingSections.join(", ")],
          ["Strengths", resume.strengths.join(", ")],
          ["Weaknesses", resume.weaknesses.join(", ")]
        ]} />
      </EnterpriseCard>
    </div>
  );
}

function SalaryIntelligenceView() {
  return (
    <div className="grid gap-6">
      <ViewPreviewBanner text="Salary intelligence uses sample figures. Try the real salary calculator at /salary/calculator for an estimate based on your inputs." />
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard label="Expected Salary" value={careerIntelligence.salary.projection} trend="Sample" icon={<WalletCards size={18} />} />
        <DashboardCard label="Current Market" value={careerIntelligence.salary.market} trend="Sample" icon={<TrendingUp size={18} />} />
        <DashboardCard label="Current Salary" value={careerIntelligence.salary.current} trend="Sample" icon={<Target size={18} />} />
        <DashboardCard label="Promotion Forecast" value="74%" trend="Sample" icon={<Trophy size={18} />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ChartShell title="Salary Trend (sample)">
          <Chart data={careerIntelligence.salary.comparisons} />
        </ChartShell>
        <EnterpriseCard title="Salary Confidence" description="Role, city, experience, skill premium, and forecast drivers." icon={<WalletCards size={18} />} badge={<PreviewBadge />}>
          <div className="grid gap-3">
            {careerIntelligence.salary.drivers.map((item, index) => <InfoRow key={item} label={item} value={`${88 - index * 6}%`} icon={<TrendingUp size={16} />} />)}
          </div>
        </EnterpriseCard>
      </div>
    </div>
  );
}

function SkillIntelligenceView({ real }: { real: RealData }) {
  return (
    <div className="grid gap-6">
      <EnterpriseCard title="Your Skills" description="Skills currently saved in your profile." icon={<Brain size={18} />} badge={<Badge>{real.skills.length}</Badge>}>
        {real.skills.length ? <div className="flex flex-wrap gap-2">{real.skills.map((skill) => <Badge key={skill} tone="success">{skill}</Badge>)}</div> : <p className="text-sm text-[var(--cos-on-surface-variant)]">No skills added yet. <a className="font-semibold text-[var(--cos-primary)]" href="/candidate/profile">Add skills to your profile</a>.</p>}
      </EnterpriseCard>
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <EnterpriseCard title="Sample: Skill Gap" description="Demand index, trending skills, learning path, recommended skills, and progress." icon={<Brain size={18} />} badge={<PreviewBadge />}>
          <div className="flex flex-wrap gap-2">
            {[...careerIntelligence.skills.trending, ...careerIntelligence.skills.hotTech].map((skill) => <Badge key={skill}>{skill}</Badge>)}
          </div>
          <div className="mt-5 grid gap-3">
            {careerIntelligence.skills.gaps.map((gap) => <InfoRow key={gap} label={gap} value="Gap" icon={<Zap size={16} />} />)}
          </div>
        </EnterpriseCard>
        <EnterpriseCard title="Skill Radar" description="Demand graph and future skill index." icon={<LineChart size={18} />}>
          <div className="grid gap-3">
            {careerIntelligence.skills.demand.map((item) => <MetricStrip key={item.name} label={item.name} value={item.value} />)}
          </div>
        </EnterpriseCard>
      </div>
      <EnterpriseCard title="Learning Path" description="Recommended certifications and progress milestones." icon={<GraduationCap size={18} />}>
        <div className="grid gap-3 md:grid-cols-3">
          {careerIntelligence.skills.certifications.map((item, index) => <InfoCard key={item} title={item} detail={`${62 + index * 8}% relevance`} icon={<Award size={18} />} />)}
        </div>
      </EnterpriseCard>
    </div>
  );
}

function RoadmapsView() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div className="sm:col-span-2 xl:col-span-3"><ViewPreviewBanner text="Roadmap readiness scores and timelines shown below are sample content for each career track, not calculated from your profile." /></div>
      {careerIntelligence.roadmaps.map((roadmap) => (
        <EnterpriseCard key={roadmap.name} title={roadmap.name} description={`${roadmap.timeline} roadmap`} icon={<Rocket size={18} />} badge={<Badge tone={roadmap.readiness >= 80 ? "success" : "info"}>{roadmap.readiness}%</Badge>}>
          <div className="flex flex-wrap gap-2">{roadmap.skills.map((item) => <Badge key={item}>{item}</Badge>)}</div>
          <p className="mt-4 text-sm text-[var(--cos-on-surface-variant)]">{roadmap.project}</p>
          <p className="mt-2 text-sm font-semibold">{roadmap.salary}</p>
          <ProgressBar value={roadmap.readiness} />
        </EnterpriseCard>
      ))}
    </div>
  );
}

function InterviewIntelligenceView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="grid gap-6 xl:col-span-2"><ViewPreviewBanner text="Interview readiness scores and question banks below are sample content, not generated from your applications or practice sessions." /></div>
      <div className="grid gap-6">
        <EnterpriseCard title="Interview Readiness" description="Mock interviews placeholder, preparation checklist, feedback, and communication score." icon={<MessageSquare size={18} />} badge={<Badge tone="warning">{careerIntelligence.interviews.readiness}%</Badge>}>
          <RadialScore label="Readiness" value={careerIntelligence.interviews.readiness} />
          <div className="mt-4 grid gap-2">
            {["System design story", "Behavioral examples", "Compensation narrative", "Communication score placeholder"].map((item) => <InfoRow key={item} label={item} value="Prepare" icon={<CheckCircle2 size={16} />} />)}
          </div>
        </EnterpriseCard>
        <EnterpriseCard title="Interview Calendar" description="Upcoming, completed, and meeting prep." icon={<CalendarCheck size={18} />}>
          <Calendar />
        </EnterpriseCard>
      </div>
      <EnterpriseCard title="Question Intelligence" description="Coding, HR, company questions, mock interview placeholder, and feedback readiness." icon={<Brain size={18} />}>
        <div className="grid gap-4 md:grid-cols-2">
          {careerIntelligence.interviews.groups.map((group) => <InfoCard key={group.title} title={group.title} detail={`${group.count} items • ${group.detail}`} icon={<MessageSquare size={18} />} />)}
        </div>
      </EnterpriseCard>
    </div>
  );
}

function LearningCenterView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="xl:col-span-2"><ViewPreviewBanner text="Courses, progress, and the learning calendar below are sample content — Jobs View doesn't host learning content yet." /></div>
      <EnterpriseCard title="Learning Center" description="Roadmaps, courses, books, videos, certificates, bookmarks, progress, and calendar." icon={<GraduationCap size={18} />} badge={<PreviewBadge />}>
        <div className="grid gap-3">
          {careerIntelligence.learning.map((item) => (
            <div key={item.title} className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><Badge>{item.type}</Badge><h3 className="mt-2 font-semibold">{item.title}</h3></div>
                <span className="text-sm font-semibold">{item.progress}%</span>
              </div>
              <ProgressBar value={item.progress} />
            </div>
          ))}
        </div>
      </EnterpriseCard>
      <EnterpriseCard title="Learning Calendar" description="Weekly learning blocks and milestones." icon={<CalendarCheck size={18} />}>
        <Calendar />
      </EnterpriseCard>
    </div>
  );
}

function CareerAnalyticsView({ real }: { real: RealData }) {
  const realMetrics = [
    { label: "Applications", value: String(real.applications.length), detail: "From your account" },
    { label: "Interviews", value: String(applicationFunnelCount(real.applications, "interviews")), detail: "From application status" },
    { label: "Offers", value: String(applicationFunnelCount(real.applications, "offers")), detail: "From application status" }
  ];
  const sampleMetrics = careerIntelligence.analytics.filter((item) => !["Applications", "Interviews", "Offers"].includes(item.label));
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {realMetrics.map((item) => (
          <DashboardCard key={item.label} label={item.label} value={item.value} trend={item.detail} icon={<LineChart size={18} />} />
        ))}
        {sampleMetrics.map((item) => (
          <div key={item.label} className="relative"><DashboardCard label={item.label} value={item.value} trend={item.detail} icon={<LineChart size={18} />} /><span className="absolute right-3 top-3"><PreviewBadge /></span></div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <FunnelPanel real={real} />
        <div className="grid gap-2">
          <ViewPreviewBanner text="Career growth trend chart below uses sample scores." />
          <ChartShell title="Career Growth (sample)">
            <Chart data={careerIntelligence.scores.map((score) => ({ name: score.label.split(" ")[0], value: score.value }))} />
          </ChartShell>
        </div>
      </div>
      <CareerTimelinePanel real={real} />
    </div>
  );
}

function RecommendationsView() {
  return (
    <div className="grid gap-6">
      <ViewPreviewBanner text="These recommendation cards are sample content, not ranked from your profile or activity yet. Try the real job search and filters at /jobs." />
      <EnterpriseCard title="Personalized Recommendations" description="Jobs, companies, skills, courses, guides, roadmaps, and interview questions." icon={<Sparkles size={18} />} badge={<PreviewBadge />}>
        <SearchBar placeholder="Search recommendations" suggestions={careerIntelligence.recommendationGroups.flatMap((group) => group.items).slice(0, 8)} />
      </EnterpriseCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {careerIntelligence.recommendationGroups.map((group) => (
          <EnterpriseCard key={group.title} title={group.title} description="Personalized card stack" icon={<Sparkles size={18} />} badge={<Badge>Ranked</Badge>}>
            <div className="grid gap-2">{group.items.map((item) => <InfoRow key={item} label={item} value="Open" icon={<Rocket size={16} />} />)}</div>
          </EnterpriseCard>
        ))}
      </div>
    </div>
  );
}

function GuidesView() {
  return (
    <div className="grid gap-6">
      <ViewPreviewBanner text="Full guide articles aren't published yet — these are planned titles. Bookmarking and reading time will be added once the content is live." />
      <EnterpriseCard title="Planned Career Guides" description="Upcoming editorial guides by category." icon={<BookOpen size={18} />}>
        <SearchBar placeholder="Search career guides" suggestions={careerIntelligence.guides.map((guide) => guide.title)} />
      </EnterpriseCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {careerIntelligence.guides.map((guide) => (
          <EnterpriseCard key={guide.title} title={guide.title} description={guide.type} icon={<BookOpen size={18} />} badge={<Badge tone="neutral">Coming soon</Badge>} />
        ))}
      </div>
    </div>
  );
}

function GoalsAndAchievements() {
  return (
    <div className="grid gap-6">
      <EnterpriseCard title="Career Goals" description="Short term, long term, weekly, monthly, milestones, and progress." icon={<Target size={18} />} badge={<PreviewBadge />}>
        <div className="grid gap-3">
          {[
            ["Short Term", "Improve resume keyword density", 68],
            ["Long Term", "Move into frontend platform leadership", 52],
            ["Weekly Goal", "Complete two interview drills", 80],
            ["Monthly Goal", "Publish one portfolio case study", 41]
          ].map(([label, detail, value]) => <MetricStrip key={label as string} label={`${label}: ${detail}`} value={value as number} />)}
        </div>
      </EnterpriseCard>
      <EnterpriseCard title="Achievements" description="Professional badge system for streaks, applications, offers, profile, resume, skills, and learning." icon={<Award size={18} />} badge={<PreviewBadge />}>
        <div className="grid gap-3 sm:grid-cols-2">
          {["Career Streak", "Profile Completed", "Resume Optimized", "Skills Added", "Learning Completed", "Interview Ready"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] px-3 py-2 text-sm font-semibold">
              <Trophy size={16} className="text-[var(--cos-primary)]" />
              {item}
            </div>
          ))}
        </div>
      </EnterpriseCard>
    </div>
  );
}

function CareerTimelinePanel({ real }: { real: RealData }) {
  const offers = applicationFunnelCount(real.applications, "offers");
  const events = [
    { title: "Education", description: real.latestEducation ? [real.latestEducation.qualification, real.latestEducation.university].filter(Boolean).join(" — ") : "Not added to your profile yet", tone: real.latestEducation ? "success" as const : "neutral" as const },
    { title: "Experience", description: real.latestExperience ? [real.latestExperience.title, real.latestExperience.company_name].filter(Boolean).join(" at ") : "Not added to your profile yet", tone: real.latestExperience ? "success" as const : "neutral" as const },
    { title: "Applications", description: `${real.applications.length} application${real.applications.length === 1 ? "" : "s"} tracked`, tone: real.applications.length ? "info" as const : "neutral" as const },
    { title: "Offers", description: offers ? `${offers} offer${offers === 1 ? "" : "s"} received` : "No offers yet", tone: offers ? "success" as const : "neutral" as const }
  ];
  return (
    <EnterpriseCard title="Career Timeline" description="Education, experience, applications, and offers from your account." icon={<CalendarCheck size={18} />}>
      <Timeline items={events} />
    </EnterpriseCard>
  );
}

function RecommendationsPanel() {
  return (
    <EnterpriseCard title="Recommendations" description="AI-ready ranked suggestions." icon={<Sparkles size={18} />} badge={<PreviewBadge />}>
      <div className="grid gap-3">
        {careerIntelligence.recommendations.map((item, index) => (
          <div key={item} className="flex gap-3 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3 text-sm">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--cos-primary)] text-xs font-bold text-white">{index + 1}</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </EnterpriseCard>
  );
}

function FunnelPanel({ real }: { real: RealData }) {
  const funnel = [
    { name: "Applications", value: real.applications.length },
    { name: "Responses", value: applicationFunnelCount(real.applications, "responses") },
    { name: "Interviews", value: applicationFunnelCount(real.applications, "interviews") },
    { name: "Offers", value: applicationFunnelCount(real.applications, "offers") }
  ];
  const max = Math.max(1, real.applications.length);
  return (
    <EnterpriseCard title="Application Funnel" description="Application, interview, response, and offer counts from your account." icon={<Briefcase size={18} />}>
      <div className="grid gap-4">
        {funnel.map((item) => <ProgressRow key={item.name} label={item.name} value={item.value} max={max} />)}
      </div>
    </EnterpriseCard>
  );
}

function MiniModule({ title, icon, href, items }: { title: string; icon: React.ReactNode; href: string; items: readonly string[] }) {
  return (
    <EnterpriseCard title={title} description="Open focused intelligence module" icon={icon} actions={<a href={href} className="text-sm font-semibold text-[var(--cos-primary)]">Open</a>}>
      <div className="grid gap-2">{items.slice(0, 3).map((item) => <InfoRow key={item} icon={<Rocket size={15} />} label={item} value="Next" />)}</div>
    </EnterpriseCard>
  );
}

function RadarVisual() {
  const points = careerIntelligence.healthBreakdown.slice(0, 8);
  // Fixed (not responsive) size: the label ring below uses a fixed-pixel translate radius that
  // must match the circle's actual rendered size, so the circle can't be allowed to shrink with
  // its container on narrow screens without the labels detaching from it.
  return (
    <div className="relative mx-auto grid aspect-square w-[220px] max-w-full place-items-center rounded-full border border-[var(--cos-outline-variant)] bg-[radial-gradient(circle,var(--cos-surface-container-low)_0_34%,transparent_35%),conic-gradient(from_0deg,#14B8A6,#2563EB,#7C3AED,#14B8A6)] p-5">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-[var(--cos-surface-container-lowest)] text-center shadow-career-sm">
        <div>
          <div className="text-2xl font-bold">{careerIntelligence.scores[0]?.value}</div>
          <div className="text-xs font-semibold text-[var(--cos-on-surface-variant)]">Health</div>
        </div>
      </div>
      {points.map((point, index) => (
        <span
          key={point.name}
          className="absolute rounded-full bg-[var(--cos-surface-container-lowest)] px-1.5 py-0.5 text-[9px] font-semibold shadow-career-xs"
          style={{
            transform: `rotate(${index * 45}deg) translate(86px) rotate(-${index * 45}deg)`
          }}
        >
          {point.name}
        </span>
      ))}
    </div>
  );
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

function MetricStrip({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm font-semibold"><span>{label}</span><span>{value}%</span></div>
      <ProgressBar value={value} />
    </div>
  );
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
  return <div className="h-2 rounded-full bg-[var(--cos-surface-container-high)]"><div className="h-2 rounded-full bg-[var(--cos-primary)] transition-[width] duration-200" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function InfoCard({ title, detail, icon }: { title: string; detail: string; icon: React.ReactNode }) {
  return <EnterpriseCard title={title} description={detail} icon={icon} />;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3 text-sm">
      <span className="inline-flex min-w-0 items-center gap-2"><span className="text-[var(--cos-primary)]">{icon}</span><span className="truncate">{label}</span></span>
      <Badge>{value}</Badge>
    </div>
  );
}

function ClockIcon() {
  return <CalendarCheck size={18} />;
}

function scoreByLabel(label: string) {
  return careerIntelligence.scores.find((score) => score.label === label)?.value ?? 0;
}
