export type CareerGraphNodeKind =
  | "industry"
  | "department"
  | "jobFamily"
  | "role"
  | "specialization"
  | "skill"
  | "education"
  | "experience"
  | "salaryBand"
  | "progression";

export type CareerGraphNode = {
  id: string;
  kind: CareerGraphNodeKind;
  label: string;
  parentId?: string;
  aliases?: string[];
};

export type CandidateProfileEngineInput = {
  education?: string;
  highestQualification?: string;
  passingYear?: number;
  experienceYears?: number;
  currentJob?: string;
  preferredJob?: string;
  skills?: string[];
  certificates?: string[];
  languages?: string[];
  location?: string;
  travelDistanceKm?: number;
  preferredCities?: string[];
  preferredStates?: string[];
  salaryExpectation?: number;
  employmentType?: string;
  shiftPreference?: string;
  workMode?: string;
  availability?: string;
  drivingLicense?: boolean;
  vehicle?: boolean;
  profilePhotoUrl?: string;
  resumeUrl?: string;
  careerGoal?: string;
  industryPreference?: string;
  departmentPreference?: string;
};

export type JobMatchInput = {
  education?: string;
  minExperienceYears?: number;
  skills?: string[];
  location?: string;
  salaryMax?: number;
  industry?: string;
  languages?: string[];
  certificates?: string[];
  availability?: string;
};

export type JobMatchResult = {
  score: number;
  reasons: string[];
  missing: string[];
  weights: Record<string, number>;
};

export const careerGraphSeed: CareerGraphNode[] = [
  { id: "security", kind: "industry", label: "Security" },
  { id: "industrial-security", kind: "department", label: "Industrial Security", parentId: "security" },
  { id: "security-guard-family", kind: "jobFamily", label: "Security Guard", parentId: "industrial-security" },
  { id: "security-guard", kind: "role", label: "Security Guard", parentId: "security-guard-family" },
  { id: "senior-security-guard", kind: "specialization", label: "Senior Guard", parentId: "security-guard" },
  { id: "security-supervisor", kind: "progression", label: "Supervisor", parentId: "senior-security-guard" },
  { id: "security-officer", kind: "progression", label: "Security Officer", parentId: "security-supervisor" },
  { id: "security-manager", kind: "progression", label: "Security Manager", parentId: "security-officer" },
  { id: "site-patrolling", kind: "skill", label: "Site Patrolling", parentId: "security-guard" },
  { id: "access-control", kind: "skill", label: "Access Control", parentId: "security-guard" },
  { id: "secondary-school", kind: "education", label: "Secondary School", parentId: "security-guard" },
  { id: "entry-experience", kind: "experience", label: "0-2 years", parentId: "security-guard" },
  { id: "security-salary-band", kind: "salaryBand", label: "INR 2L-5L", parentId: "security-guard" },
  { id: "technology", kind: "industry", label: "Technology" },
  { id: "software-engineering", kind: "department", label: "Software Engineering", parentId: "technology" },
  { id: "frontend-family", kind: "jobFamily", label: "Frontend Engineering", parentId: "software-engineering" },
  { id: "frontend-engineer", kind: "role", label: "Frontend Engineer", parentId: "frontend-family", aliases: ["React Developer", "UI Engineer"] },
  { id: "senior-frontend-engineer", kind: "specialization", label: "Senior Frontend Engineer", parentId: "frontend-engineer" },
  { id: "staff-frontend-engineer", kind: "progression", label: "Staff Frontend Engineer", parentId: "senior-frontend-engineer" },
  { id: "react", kind: "skill", label: "React", parentId: "frontend-engineer" },
  { id: "typescript", kind: "skill", label: "TypeScript", parentId: "frontend-engineer" }
];

export const jobMatchWeights = {
  education: 20,
  experience: 25,
  skills: 25,
  location: 10,
  salary: 5,
  industry: 5,
  language: 5,
  certificates: 5,
  availability: 5
} as const;

export function careerPathForRole(role: string, graph: CareerGraphNode[] = careerGraphSeed) {
  const normalized = normalize(role);
  const node = graph.find((item) => normalize(item.label) === normalized || item.aliases?.some((alias) => normalize(alias) === normalized));
  if (!node) return [];
  const path: CareerGraphNode[] = [node];
  let parentId = node.parentId;
  while (parentId) {
    const parent = graph.find((item) => item.id === parentId);
    if (!parent) break;
    path.unshift(parent);
    parentId = parent.parentId;
  }
  return path;
}

export function careerProgressionForRole(role: string, graph: CareerGraphNode[] = careerGraphSeed) {
  const path = careerPathForRole(role, graph);
  const current = path[path.length - 1];
  if (!current) return [];
  const progression: CareerGraphNode[] = [];
  let next = graph.find((item) => item.parentId === current.id && (item.kind === "specialization" || item.kind === "progression"));
  while (next) {
    progression.push(next);
    next = graph.find((item) => item.parentId === next?.id && item.kind === "progression");
  }
  return progression;
}

export function calculateProfileCompletion(profile: CandidateProfileEngineInput) {
  const checks: Array<[keyof CandidateProfileEngineInput, string]> = [
    ["highestQualification", "Add highest qualification"],
    ["experienceYears", "Add experience"],
    ["preferredJob", "Add preferred job"],
    ["skills", "Add skills"],
    ["certificates", "Add certificates"],
    ["languages", "Add languages"],
    ["location", "Add location"],
    ["preferredCities", "Add preferred cities"],
    ["salaryExpectation", "Add salary expectation"],
    ["employmentType", "Add employment type"],
    ["workMode", "Add work mode"],
    ["availability", "Add availability"],
    ["profilePhotoUrl", "Upload profile photo"],
    ["resumeUrl", "Upload resume"],
    ["careerGoal", "Add career goal"],
    ["industryPreference", "Add industry preference"],
    ["departmentPreference", "Add department preference"]
  ];
  const missing = checks.filter(([key]) => isEmpty(profile[key])).map(([, label]) => label);
  const score = Math.round(((checks.length - missing.length) / checks.length) * 100);
  return {
    score,
    strength: score >= 85 ? "excellent" : score >= 65 ? "strong" : score >= 40 ? "building" : "incomplete",
    missing
  };
}

export function calculateJobMatch(candidate: CandidateProfileEngineInput, job: JobMatchInput): JobMatchResult {
  const reasons: string[] = [];
  const missing: string[] = [];
  let score = 0;

  score += scorePart(matchText(candidate.highestQualification ?? candidate.education, job.education), "Education matches", "Education mismatch", "education", reasons, missing);
  score += scorePart((candidate.experienceYears ?? 0) >= (job.minExperienceYears ?? 0), "Experience matches", "Experience below requirement", "experience", reasons, missing);
  score += scorePart(overlap(candidate.skills, job.skills), "Skills match", missingSkills(candidate.skills, job.skills, "Missing required skills"), "skills", reasons, missing);
  score += scorePart(matchLocation(candidate, job.location), "Nearby or preferred location", "Location preference mismatch", "location", reasons, missing);
  score += scorePart(!job.salaryMax || !candidate.salaryExpectation || candidate.salaryExpectation <= job.salaryMax, "Salary matches", "Salary expectation is above range", "salary", reasons, missing);
  score += scorePart(matchText(candidate.industryPreference, job.industry), "Industry matches", "Industry preference mismatch", "industry", reasons, missing);
  score += scorePart(overlap(candidate.languages, job.languages), "Language matches", missingSkills(candidate.languages, job.languages, "Missing language match"), "language", reasons, missing);
  score += scorePart(overlap(candidate.certificates, job.certificates), "Certificates match", missingSkills(candidate.certificates, job.certificates, "Missing certificate"), "certificates", reasons, missing);
  score += scorePart(matchText(candidate.availability, job.availability), "Availability matches", "Availability mismatch", "availability", reasons, missing);

  return { score: Math.min(100, score), reasons, missing, weights: jobMatchWeights };
}

export function recommendJobs<T extends JobMatchInput & { id?: string; title?: string }>(candidate: CandidateProfileEngineInput, jobs: T[]) {
  return jobs
    .map((job) => ({ job, match: calculateJobMatch(candidate, job) }))
    .sort((a, b) => b.match.score - a.match.score);
}

export function recommendCandidates<T extends CandidateProfileEngineInput & { id?: string; name?: string }>(job: JobMatchInput, candidates: T[]) {
  return candidates
    .map((candidate) => ({ candidate, match: calculateJobMatch(candidate, job) }))
    .sort((a, b) => b.match.score - a.match.score);
}

export function estimateSalary(input: CandidateProfileEngineInput & { role?: string; city?: string; companySize?: string }) {
  const base = input.role?.toLowerCase().includes("security") ? 240_000 : input.role?.toLowerCase().includes("driver") ? 300_000 : 900_000;
  const experienceMultiplier = 1 + Math.min(input.experienceYears ?? 0, 15) * 0.08;
  const skillPremium = Math.min(input.skills?.length ?? 0, 8) * 35_000;
  const certificatePremium = Math.min(input.certificates?.length ?? 0, 5) * 25_000;
  const cityMultiplier = ["bengaluru", "mumbai", "delhi", "hyderabad", "pune"].includes(normalize(input.city ?? input.location ?? "")) ? 1.15 : 1;
  const average = Math.round((base * experienceMultiplier + skillPremium + certificatePremium) * cityMultiplier);
  return {
    minimum: Math.round(average * 0.78),
    average,
    maximum: Math.round(average * 1.35),
    topCities: ["Bengaluru", "Mumbai", "Hyderabad", "Pune", "Delhi"],
    growthForecast: Math.round(average * 1.18),
    promotionForecast: Math.round(average * 1.32)
  };
}

function scorePart(matched: boolean, reason: string, missingReason: string, key: keyof typeof jobMatchWeights, reasons: string[], missing: string[]) {
  if (matched) {
    reasons.push(reason);
    return jobMatchWeights[key];
  }
  missing.push(missingReason);
  return 0;
}

function missingSkills(candidateItems: string[] | undefined, requiredItems: string[] | undefined, fallback: string) {
  if (!requiredItems?.length) return fallback;
  const candidate = new Set((candidateItems ?? []).map(normalize));
  const missing = requiredItems.filter((item) => !candidate.has(normalize(item)));
  return missing.length ? missing.join(", ") : fallback;
}

function overlap(left?: string[], right?: string[]) {
  if (!right?.length) return true;
  if (!left?.length) return false;
  const leftSet = new Set(left.map(normalize));
  return right.some((item) => leftSet.has(normalize(item)));
}

function matchText(left?: string, right?: string) {
  if (!right) return true;
  if (!left) return false;
  return normalize(left).includes(normalize(right)) || normalize(right).includes(normalize(left));
}

function matchLocation(candidate: CandidateProfileEngineInput, location?: string) {
  if (!location) return true;
  const target = normalize(location);
  return normalize(candidate.location).includes(target) || candidate.preferredCities?.some((city) => normalize(city).includes(target)) || candidate.preferredStates?.some((state) => normalize(state).includes(target)) || false;
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function normalize(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
