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
  return (
    <AppShell
      variant="candidate"
      title={titles[view]}
      nav={navigation.candidate}
      workspaceLabel="Career Intelligence"
      workspaceName={careerIntelligence.profile.name}
      workspaceDescription={careerIntelligence.profile.focus}
      planTitle="Jobs View"
      planDescription="AI-ready intelligence"
      quickActionHref="/career-intelligence"
      actions={
        <div className="hidden items-center gap-2 sm:flex">
          <Badge tone="info"><Bot size={13} /> AI ready</Badge>
          <Button size="sm" variant="secondary"><Sparkles size={15} /> Refresh scores</Button>
        </div>
      }
    >
      <motion.div {...motionProps} className="grid gap-6">
        <CareerCommandHeader view={view} />
        {renderView(view)}
      </motion.div>
    </AppShell>
  );
}

function renderView(view: CareerView) {
  switch (view) {
    case "resume":
      return <ResumeIntelligenceView />;
    case "salary":
      return <SalaryIntelligenceView />;
    case "skills":
      return <SkillIntelligenceView />;
    case "roadmaps":
      return <RoadmapsView />;
    case "interview":
      return <InterviewIntelligenceView />;
    case "learning":
      return <LearningCenterView />;
    case "analytics":
      return <CareerAnalyticsView />;
    case "recommendations":
      return <RecommendationsView />;
    case "guides":
      return <GuidesView />;
    default:
      return <DashboardView />;
  }
}

function CareerCommandHeader({ view }: { view: CareerView }) {
  const mainScore = careerIntelligence.scores[0]?.value ?? 0;
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 shadow-career-sm sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#14B8A6,#2563EB)]" aria-hidden="true" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <Avatar name={careerIntelligence.profile.name} verified className="h-16 w-16" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="premium">Today&apos;s Career Status</Badge>
              <Badge tone="success">{careerIntelligence.profile.updated}</Badge>
              <Badge tone="info">{careerIntelligence.profile.aiState}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-normal sm:text-3xl">{titles[view]}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--cos-on-surface-variant)]">{descriptions[view]}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-[var(--cos-on-surface-variant)]">
              <span className="inline-flex items-center gap-1"><UserRound size={14} /> {careerIntelligence.profile.name}</span>
              <span className="inline-flex items-center gap-1"><Target size={14} /> {careerIntelligence.profile.focus}</span>
              <span className="inline-flex items-center gap-1"><Sparkles size={14} /> Personal AI OS</span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <RadialScore label="Career Score" value={mainScore} />
          <RadialScore label="Market Demand" value={82} />
          <RadialScore label="Streak" value={91} />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["Analyze Health", "Improve Resume", "Open Roadmap", "Salary Forecast"].map((item) => (
          <Button key={item} size="sm" variant={item === "Analyze Health" ? "primary" : "outline"}>
            <Sparkles size={15} />
            {item}
          </Button>
        ))}
      </div>
    </section>
  );
}

function DashboardView() {
  return (
    <div className="grid gap-6">
      <CommandMetrics />
      <ExclusiveWidgets />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_440px]">
        <CareerHealthPanel />
        <GoalsAndAchievements />
      </div>
      <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <CareerTimelinePanel />
        <RecommendationsPanel />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MiniModule title="Resume Intelligence" icon={<FileSearch size={18} />} href="/resume-insights" items={careerIntelligence.resumeInsights.missingSections} />
        <MiniModule title="Salary Intelligence" icon={<WalletCards size={18} />} href="/salary-insights" items={careerIntelligence.salary.drivers} />
        <MiniModule title="Skill Intelligence" icon={<Brain size={18} />} href="/skill-intelligence" items={careerIntelligence.skills.gaps} />
      </div>
    </div>
  );
}

function CommandMetrics() {
  const metrics = [
    ["Overall Career Score", careerIntelligence.scores[0]?.value ?? 0, "Career Health Score", Target],
    ["Resume Score", scoreByLabel("Resume Score"), "ATS-ready signal", FileSearch],
    ["ATS Score", careerIntelligence.resumeInsights.atsScore, "Recruiter parsing", ShieldCheck],
    ["Salary Potential", scoreByLabel("Salary Potential"), careerIntelligence.salary.market, WalletCards],
    ["Profile Visibility", 72, "Recruiter discovery", UserRound],
    ["Recruiter Interest", 66, "Profile views rising", Sparkles],
    ["Applications", 42, "Tracked this month", Briefcase],
    ["Learning Progress", scoreByLabel("Learning Progress"), "Weekly goal active", GraduationCap]
  ] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, trend, Icon]) => (
        <DashboardCard key={label} label={label} value={String(value)} trend={String(trend)} icon={<Icon size={18} />} />
      ))}
    </div>
  );
}

function ExclusiveWidgets() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {exclusiveWidgets.map(([title, value, detail, Icon]) => (
        <EnterpriseCard key={title} title={title} description={detail} icon={<Icon size={18} />} badge={<Badge tone={value >= 84 ? "success" : "info"}>{value}%</Badge>}>
          <ProgressBar value={value} />
        </EnterpriseCard>
      ))}
    </div>
  );
}

function CareerHealthPanel() {
  return (
    <EnterpriseCard title="Career Health Radar" description="Experience, education, resume, projects, skills, interview, networking, certifications, portfolio, languages, and soft skills." icon={<Brain size={18} />} badge={<Badge tone="info">0-100</Badge>}>
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

function ResumeIntelligenceView() {
  const resume = careerIntelligence.resumeInsights;
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="grid gap-6">
        <EnterpriseCard title="Resume Intelligence" description="Resume score, ATS score, keyword match, grammar, formatting, readability, and recruiter readability." icon={<FileSearch size={18} />} badge={<Badge tone="success">{resume.atsScore}%</Badge>}>
          <RadialScore label="ATS Score" value={resume.atsScore} />
          <div className="mt-4 grid gap-3">
            <MetricStrip label="Keyword Match" value={82} />
            <MetricStrip label="Grammar" value={91} />
            <MetricStrip label="Formatting" value={88} />
            <MetricStrip label="Recruiter Readability" value={76} />
          </div>
        </EnterpriseCard>
        <EnterpriseCard title="Version History" description="Download, compare versions, and resume evolution timeline." icon={<ClockIcon />} actions={<Button size="sm" variant="outline">Download</Button>}>
          <Timeline items={resume.versions.map((version, index) => ({ title: version, description: index === 0 ? "Active version" : "Comparable archive", tone: index === 0 ? "success" : "neutral" }))} />
        </EnterpriseCard>
      </div>
      <EnterpriseCard title="Improvement Console" description="AI suggestions placeholder, missing sections, strengths, weaknesses, and improvement timeline." icon={<Sparkles size={18} />}>
        <Table columns={["Area", "Signals"]} rows={[
          ["Keywords", resume.keywords.join(", ")],
          ["Missing Skills", resume.missingSkills.join(", ")],
          ["Missing Sections", resume.missingSections.join(", ")],
          ["Strengths", resume.strengths.join(", ")],
          ["Weaknesses", resume.weaknesses.join(", ")]
        ]} />
        <div className="mt-5">
          <Timeline orientation="horizontal" items={[
            { title: "Parse", description: "ATS score generated", tone: "success" },
            { title: "Improve", description: "Add quantified impact", tone: "info" },
            { title: "Compare", description: "Version comparison ready", tone: "neutral" }
          ]} />
        </div>
      </EnterpriseCard>
    </div>
  );
}

function SalaryIntelligenceView() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard label="Expected Salary" value={careerIntelligence.salary.projection} trend="Growth forecast" icon={<WalletCards size={18} />} />
        <DashboardCard label="Current Market" value={careerIntelligence.salary.market} trend="Bengaluru median" icon={<TrendingUp size={18} />} />
        <DashboardCard label="Current Salary" value={careerIntelligence.salary.current} trend="Baseline" icon={<Target size={18} />} />
        <DashboardCard label="Promotion Forecast" value="74%" trend="Scope dependent" icon={<Trophy size={18} />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ChartShell title="Salary Trend">
          <Chart data={careerIntelligence.salary.comparisons} />
        </ChartShell>
        <EnterpriseCard title="Salary Confidence" description="Role, city, experience, skill premium, and forecast drivers." icon={<WalletCards size={18} />} badge={<Badge tone="success">88%</Badge>}>
          <div className="grid gap-3">
            {careerIntelligence.salary.drivers.map((item, index) => <InfoRow key={item} label={item} value={`${88 - index * 6}%`} icon={<TrendingUp size={16} />} />)}
          </div>
        </EnterpriseCard>
      </div>
    </div>
  );
}

function SkillIntelligenceView() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <EnterpriseCard title="Skill Gap" description="Demand index, trending skills, learning path, recommended skills, and progress." icon={<Brain size={18} />} badge={<Badge tone="info">Demand live-ready</Badge>}>
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
      <EnterpriseCard title="Learning Center" description="Roadmaps, courses, books, videos, certificates, bookmarks, progress, and calendar." icon={<GraduationCap size={18} />} badge={<Badge tone="info">Bookmarks ready</Badge>}>
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

function CareerAnalyticsView() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {careerIntelligence.analytics.map((item) => (
          <DashboardCard key={item.label} label={item.label} value={item.value} trend={item.detail} icon={<LineChart size={18} />} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <FunnelPanel />
        <ChartShell title="Career Growth">
          <Chart data={careerIntelligence.scores.map((score) => ({ name: score.label.split(" ")[0], value: score.value }))} />
        </ChartShell>
      </div>
      <CareerTimelinePanel />
    </div>
  );
}

function RecommendationsView() {
  return (
    <div className="grid gap-6">
      <EnterpriseCard title="Personalized Recommendations" description="Jobs, companies, skills, courses, guides, roadmaps, and interview questions." icon={<Sparkles size={18} />} badge={<Badge tone="info">AI rank ready</Badge>}>
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
      <EnterpriseCard title="Public Career Guides" description="Premium editorial experience with categories, reading time, difficulty, bookmarks, share, and related guides." icon={<BookOpen size={18} />} actions={<Button size="sm" variant="outline"><Share2 size={15} /> Share</Button>}>
        <SearchBar placeholder="Search career guides" suggestions={careerIntelligence.guides.map((guide) => guide.title)} />
      </EnterpriseCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {careerIntelligence.guides.map((guide, index) => (
          <EnterpriseCard key={guide.title} title={guide.title} description={`${guide.type} • ${6 + index} min read • ${index % 2 ? "Advanced" : "Beginner"}`} icon={<BookOpen size={18} />} badge={<Badge tone="info">{guide.status}</Badge>}>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary">Bookmark</Button>
              <Button size="sm" variant="outline">Read</Button>
            </div>
          </EnterpriseCard>
        ))}
      </div>
    </div>
  );
}

function GoalsAndAchievements() {
  return (
    <div className="grid gap-6">
      <EnterpriseCard title="Career Goals" description="Short term, long term, weekly, monthly, milestones, and progress." icon={<Target size={18} />} badge={<Badge tone="success">Weekly goal</Badge>}>
        <div className="grid gap-3">
          {[
            ["Short Term", "Improve resume keyword density", 68],
            ["Long Term", "Move into frontend platform leadership", 52],
            ["Weekly Goal", "Complete two interview drills", 80],
            ["Monthly Goal", "Publish one portfolio case study", 41]
          ].map(([label, detail, value]) => <MetricStrip key={label as string} label={`${label}: ${detail}`} value={value as number} />)}
        </div>
      </EnterpriseCard>
      <EnterpriseCard title="Achievements" description="Professional badge system for streaks, applications, offers, profile, resume, skills, and learning." icon={<Award size={18} />}>
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

function CareerTimelinePanel() {
  const events = [
    { title: "Education", description: "B.Tech Computer Science", tone: "success" as const },
    { title: "Job", description: "Senior Frontend Engineer trajectory", tone: "info" as const },
    { title: "Project", description: "Design system migration case study", tone: "neutral" as const },
    { title: "Certification", description: "AWS Cloud Practitioner in progress", tone: "warning" as const },
    { title: "Application", description: "42 applications tracked", tone: "info" as const },
    { title: "Offer", description: "2 offers and 1 negotiation", tone: "success" as const }
  ];
  return (
    <EnterpriseCard title="Career Timeline" description="Education, jobs, projects, certifications, achievements, applications, and offers connected." icon={<CalendarCheck size={18} />}>
      <Timeline items={events} />
    </EnterpriseCard>
  );
}

function RecommendationsPanel() {
  return (
    <EnterpriseCard title="Recommendations" description="AI-ready ranked suggestions." icon={<Sparkles size={18} />} badge={<Badge tone="info">Placeholder</Badge>}>
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

function FunnelPanel() {
  const funnel = [
    { name: "Applications", value: 42 },
    { name: "Responses", value: 20 },
    { name: "Interviews", value: 7 },
    { name: "Offers", value: 2 }
  ];
  return (
    <EnterpriseCard title="Application Funnel" description="Application, interview, response, and offer analytics." icon={<Briefcase size={18} />}>
      <div className="grid gap-4">
        {funnel.map((item) => <ProgressRow key={item.name} label={item.name} value={item.value} max={42} />)}
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
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[280px] place-items-center rounded-full border border-[var(--cos-outline-variant)] bg-[radial-gradient(circle,var(--cos-surface-container-low)_0_34%,transparent_35%),conic-gradient(from_0deg,#14B8A6,#2563EB,#7C3AED,#14B8A6)] p-6">
      <div className="grid h-32 w-32 place-items-center rounded-full bg-[var(--cos-surface-container-lowest)] text-center shadow-career-sm">
        <div>
          <div className="text-3xl font-bold">{careerIntelligence.scores[0]?.value}</div>
          <div className="text-xs font-semibold text-[var(--cos-on-surface-variant)]">Health</div>
        </div>
      </div>
      {points.map((point, index) => (
        <span
          key={point.name}
          className="absolute rounded-full bg-[var(--cos-surface-container-lowest)] px-2 py-1 text-[10px] font-semibold shadow-career-xs"
          style={{
            transform: `rotate(${index * 45}deg) translate(112px) rotate(-${index * 45}deg)`
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
