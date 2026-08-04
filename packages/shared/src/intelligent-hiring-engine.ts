import type { CandidateProfileEngineInput, JobMatchInput, JobMatchResult } from "./career-engine";
import { calculateJobMatch, estimateSalary } from "./career-engine";

export type ProfileBuilderStepKey =
  | "basic"
  | "education"
  | "experience"
  | "skills"
  | "certificates"
  | "preferred_job"
  | "salary"
  | "location"
  | "availability"
  | "complete";

export type ProfileBuilderStep = {
  key: ProfileBuilderStepKey;
  title: string;
  estimatedMinutes: number;
  fields: Array<keyof CandidateProfileEngineInput | "name" | "projects" | "currentCompany" | "currentDesignation">;
};

export type ResumeParseResult = {
  name?: string;
  education: string[];
  experience: string[];
  skills: string[];
  projects: string[];
  languages: string[];
  certificates: string[];
  currentCompany?: string;
  currentDesignation?: string;
  preferredJob?: string;
  confidence: number;
  rawText: string;
};

export type IntelligentJobInput = JobMatchInput & {
  id?: string;
  title?: string;
  workMode?: string;
  shift?: string;
  distanceKm?: number;
  isUrgent?: boolean;
  isFeatured?: boolean;
  isGovernment?: boolean;
  postedAt?: string;
  companyViewedCandidate?: boolean;
  recentlyViewed?: boolean;
  continueApplying?: boolean;
  previousJobs?: string[];
  careerGoal?: string;
};

export type IntelligentMatchResult = JobMatchResult & {
  category: "recommended" | "nearby" | "skills" | "urgent" | "government" | "recent" | "resume" | "company_viewed" | "recently_viewed" | "continue_applying";
  explanation: string;
};

export type SalaryCalculatorInput = CandidateProfileEngineInput & {
  role?: string;
  city?: string;
  industry?: string;
  companyType?: string;
  companySize?: string;
  shift?: string;
};

export type ApplicationTimelineStatus = "applied" | "viewed" | "shortlisted" | "interview_scheduled" | "offer" | "rejected" | "withdrawn" | "hired";

export const profileBuilderSteps: ProfileBuilderStep[] = [
  { key: "basic", title: "Basic Information", estimatedMinutes: 2, fields: ["name", "location", "profilePhotoUrl"] },
  { key: "education", title: "Education", estimatedMinutes: 3, fields: ["education", "highestQualification", "passingYear"] },
  { key: "experience", title: "Experience", estimatedMinutes: 4, fields: ["experienceYears", "currentCompany", "currentDesignation", "currentJob"] },
  { key: "skills", title: "Skills", estimatedMinutes: 3, fields: ["skills"] },
  { key: "certificates", title: "Certificates", estimatedMinutes: 2, fields: ["certificates"] },
  { key: "preferred_job", title: "Preferred Job", estimatedMinutes: 2, fields: ["preferredJob", "careerGoal", "industryPreference", "departmentPreference"] },
  { key: "salary", title: "Salary Expectation", estimatedMinutes: 1, fields: ["salaryExpectation"] },
  { key: "location", title: "Preferred Location", estimatedMinutes: 2, fields: ["preferredCities", "preferredStates", "travelDistanceKm"] },
  { key: "availability", title: "Availability", estimatedMinutes: 2, fields: ["availability", "employmentType", "workMode", "shiftPreference"] },
  { key: "complete", title: "Complete", estimatedMinutes: 1, fields: ["resumeUrl"] }
];

export const blueCollarCategories = [
  "Security Guard",
  "Driver",
  "Delivery",
  "Electrician",
  "Housekeeping",
  "Receptionist",
  "Retail",
  "Factory",
  "Helper",
  "Office Boy",
  "Plumber",
  "Welder",
  "Mechanic",
  "Machine Operator",
  "Warehouse"
];

export const blueCollarFilters = [
  "accommodation",
  "food",
  "pf",
  "esic",
  "uniform",
  "night_shift",
  "day_shift",
  "immediate_joining",
  "weekly_off",
  "walking_distance",
  "license",
  "certificate"
];

export const applicationTimeline: Array<{ status: ApplicationTimelineStatus; label: string; notification: string }> = [
  { status: "applied", label: "Applied", notification: "Application submitted successfully." },
  { status: "viewed", label: "Viewed", notification: "Employer viewed your application." },
  { status: "shortlisted", label: "Shortlisted", notification: "You were shortlisted for the next step." },
  { status: "interview_scheduled", label: "Interview Scheduled", notification: "Interview scheduled. Check details and reminders." },
  { status: "offer", label: "Offer", notification: "Offer update available." },
  { status: "rejected", label: "Rejected", notification: "Application status changed to rejected." },
  { status: "withdrawn", label: "Withdrawn", notification: "Application withdrawn." },
  { status: "hired", label: "Hired", notification: "Congratulations. Hiring flow completed." }
];

export function profileBuilderProgress(profile: CandidateProfileEngineInput) {
  const completed = profileBuilderSteps.filter((step) => step.fields.some((field) => {
    const value = profile[field as keyof CandidateProfileEngineInput];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }));
  return {
    percent: Math.round((completed.length / profileBuilderSteps.length) * 100),
    completedSteps: completed.map((step) => step.key),
    remainingMinutes: profileBuilderSteps.filter((step) => !completed.includes(step)).reduce((sum, step) => sum + step.estimatedMinutes, 0)
  };
}

export function parseResumeText(rawText: string): ResumeParseResult {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const text = rawText.toLowerCase();
  const skills = extractKnown(rawText, ["React", "TypeScript", "Go", "PostgreSQL", "Redis", "Excel", "Sales", "Security", "Driving", "Welding", "Plumbing", "AWS", "Java", "Python"]);
  const languages = extractKnown(rawText, ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali", "Gujarati"]);
  const certificates = lines.filter((line) => /certificate|certification|licensed|license/i.test(line)).slice(0, 8);
  const education = lines.filter((line) => /bachelor|master|degree|diploma|university|college|school|iti|b\.?tech|m\.?tech|mba/i.test(line)).slice(0, 8);
  const experience = lines.filter((line) => /experience|worked|company|engineer|manager|guard|driver|operator|executive|associate/i.test(line)).slice(0, 10);
  const projects = lines.filter((line) => /project|built|developed|implemented|launched/i.test(line)).slice(0, 6);
  const currentCompanyLine = lines.find((line) => /current company|company/i.test(line));
  const designationLine = lines.find((line) => /designation|role|title/i.test(line));
  return {
    name: lines[0],
    education,
    experience,
    skills,
    projects,
    languages,
    certificates,
    currentCompany: currentCompanyLine?.replace(/current company:?/i, "").trim(),
    currentDesignation: designationLine?.replace(/designation|role|title|:/gi, "").trim(),
    preferredJob: text.includes("frontend") ? "Frontend Engineer" : text.includes("security") ? "Security Guard" : undefined,
    confidence: Math.min(95, 35 + skills.length * 6 + education.length * 5 + experience.length * 4),
    rawText
  };
}

export function intelligentJobMatch(candidate: CandidateProfileEngineInput, job: IntelligentJobInput): IntelligentMatchResult {
  const base = calculateJobMatch(candidate, job);
  let score = base.score;
  const reasons = [...base.reasons];
  const missing = [...base.missing];
  if (job.distanceKm !== undefined && (candidate.travelDistanceKm ?? 25) >= job.distanceKm) {
    score += 5;
    reasons.push("Within preferred distance");
  }
  if (job.shift && candidate.shiftPreference && normalize(job.shift) === normalize(candidate.shiftPreference)) {
    score += 5;
    reasons.push("Shift preference matches");
  }
  if (job.careerGoal && candidate.careerGoal && normalize(job.careerGoal).includes(normalize(candidate.careerGoal))) {
    score += 5;
    reasons.push("Career goal aligns");
  }
  const category = recommendationCategory(job);
  return {
    ...base,
    score: Math.min(100, score),
    reasons,
    missing,
    category,
    explanation: reasons.length ? reasons.slice(0, 4).join(", ") : "Recommended based on your Jobs View profile."
  };
}

export function buildSmartRecommendations(candidate: CandidateProfileEngineInput, jobs: IntelligentJobInput[]) {
  return jobs
    .map((job) => ({ job, match: intelligentJobMatch(candidate, job) }))
    .sort((a, b) => b.match.score - a.match.score);
}

export function salaryCalculator(input: SalaryCalculatorInput) {
  const estimate = estimateSalary(input);
  const shiftPremium = normalize(input.shift).includes("night") ? 1.08 : 1;
  const companyPremium = normalize(input.companySize).includes("enterprise") ? 1.12 : 1;
  const average = Math.round(estimate.average * shiftPremium * companyPremium);
  return {
    averageSalary: average,
    marketRange: { minimum: Math.round(average * 0.75), maximum: Math.round(average * 1.35) },
    growthPrediction: Math.round(average * 1.18),
    promotionPrediction: Math.round(average * 1.32),
    topPayingCities: estimate.topCities,
    topCompanies: ["Enterprise SaaS", "BFSI", "Healthcare", "Manufacturing", "Logistics"]
  };
}

export function employerHiringAnalytics(input: { applications: number; viewed: number; shortlisted: number; interviews: number; offers: number; hires: number; responses: number; totalCandidates: number; sourceCosts?: number }) {
  const funnelBase = Math.max(input.applications, 1);
  return {
    jobPerformance: Math.round((input.applications + input.viewed) / 2),
    candidateFunnel: {
      viewed: pct(input.viewed, funnelBase),
      shortlisted: pct(input.shortlisted, funnelBase),
      interviews: pct(input.interviews, funnelBase),
      offers: pct(input.offers, funnelBase),
      hires: pct(input.hires, funnelBase)
    },
    responseRate: pct(input.responses, Math.max(input.totalCandidates, 1)),
    hiringTime: input.hires > 0 ? Math.max(3, Math.round(input.applications / input.hires)) : 0,
    sourceAnalysis: "Jobs View, referrals, organic, and paid channels ready.",
    recommendationAccuracy: pct(input.shortlisted + input.interviews, funnelBase),
    hiringCost: input.sourceCosts ?? 0
  };
}

function recommendationCategory(job: IntelligentJobInput): IntelligentMatchResult["category"] {
  if (job.continueApplying) return "continue_applying";
  if (job.companyViewedCandidate) return "company_viewed";
  if (job.recentlyViewed) return "recently_viewed";
  if (job.isGovernment) return "government";
  if (job.isUrgent) return "urgent";
  if (job.distanceKm !== undefined && job.distanceKm <= 10) return "nearby";
  if (job.postedAt && Date.now() - new Date(job.postedAt).getTime() < 7 * 24 * 60 * 60 * 1000) return "recent";
  if (job.skills?.length) return "skills";
  return "recommended";
}

function extractKnown(text: string, values: string[]) {
  const haystack = normalize(text);
  return values.filter((value) => haystack.includes(normalize(value)));
}

function pct(value: number, total: number) {
  return Math.round((value / total) * 10000) / 100;
}

function normalize(value?: unknown): string {
  if (!value || typeof value !== "string") return "";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
