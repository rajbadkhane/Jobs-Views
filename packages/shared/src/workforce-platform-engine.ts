export type WorkforceDocumentKey =
  | "aadhaar"
  | "pan"
  | "driving_license"
  | "passport"
  | "resume"
  | "education_certificate"
  | "experience_certificate"
  | "police_verification"
  | "medical_fitness"
  | "vaccination"
  | "bank_details"
  | "uan"
  | "esic"
  | "pf";

export type VerificationKey =
  | "email"
  | "phone"
  | "government_id"
  | "education"
  | "experience"
  | "employer"
  | "police_verification"
  | "driving_license"
  | "medical";

export type VerificationStatus = "missing" | "pending" | "verified" | "rejected" | "expired";

export type WorkforceDocument = {
  key: WorkforceDocumentKey;
  label: string;
  requiredFor: string[];
  expires: boolean;
  verification: VerificationStatus;
  downloadable: boolean;
  replaceable: boolean;
  history: boolean;
  adminVerification: boolean;
};

export type DigitalProfileCard = {
  jobsViewId: string;
  qrPayload: string;
  publicProfileUrl: string;
  verifiedBadge: boolean;
  resumePreviewUrl?: string;
  skills: string[];
  experienceYears?: number;
  languages: string[];
  availability?: string;
};

export type VerificationTimelineItem = {
  key: VerificationKey;
  label: string;
  status: VerificationStatus;
  updatedAt?: string;
};

export type HiringEventType =
  | "walk_in"
  | "campus_drive"
  | "mass_hiring"
  | "job_fair"
  | "security_guard_drive"
  | "delivery_drive"
  | "factory_drive";

export type HiringEvent = {
  id: string;
  title: string;
  type: HiringEventType;
  location: string;
  date: string;
  capacity: number;
  eligibleRoles: string[];
  documentsRequired: WorkforceDocumentKey[];
  registrations: number;
  attendance: number;
  selectedCandidates: number;
};

export type ReferralRecord = {
  id: string;
  referrerType: "candidate" | "employer";
  referredType: "candidate" | "employer";
  status: "invited" | "registered" | "interviewed" | "hired" | "reward_pending" | "rewarded";
  bonusPlaceholder?: number;
};

export type TrustScoreInput = {
  profileCompletion?: number;
  verifiedDocuments?: number;
  totalDocuments?: number;
  interviewAttendance?: number;
  offerAcceptance?: number;
  resumeQuality?: number;
  employerFeedback?: number;
};

export type CompanyTrustInput = {
  verificationItems?: number;
  verifiedItems?: number;
  responseRate?: number;
  hiringSpeed?: number;
  offerAcceptance?: number;
  candidateRating?: number;
  profileCompletion?: number;
};

export type HiringDashboardInput = {
  interviewsToday?: number;
  joiningToday?: number;
  offersPending?: number;
  documentsPending?: number;
  nearbyCandidates?: number;
  urgentJobs?: number;
  recruiterTasks?: number;
};

export type CandidateHomeInput = {
  recommendations?: number;
  nearbyJobs?: number;
  unreadMessages?: number;
  upcomingInterviews?: number;
  profileCompletion?: number;
  salaryInsightAvailable?: boolean;
  learningSuggestions?: number;
};

export type GovernmentJobCategory = {
  key: string;
  label: string;
  filters: string[];
};

export const workforceDocumentVault: WorkforceDocument[] = [
  doc("aadhaar", "Aadhaar", ["identity", "blue_collar", "joining"], false, true),
  doc("pan", "PAN", ["identity", "joining", "payroll"], false, true),
  doc("driving_license", "Driving License", ["driver", "delivery"], true, true),
  doc("passport", "Passport", ["identity", "international"], true, true),
  doc("resume", "Resume", ["candidate_profile", "application"], false, false),
  doc("education_certificate", "Education Certificates", ["education", "verification"], false, true),
  doc("experience_certificate", "Experience Certificates", ["experience", "verification"], false, true),
  doc("police_verification", "Police Verification", ["security_guard", "driver", "housekeeping"], true, true),
  doc("medical_fitness", "Medical Fitness", ["factory", "warehouse", "field"], true, true),
  doc("vaccination", "Vaccination", ["healthcare", "field"], true, true),
  doc("bank_details", "Bank Details", ["payroll", "joining"], false, true),
  doc("uan", "UAN", ["payroll", "pf"], false, true),
  doc("esic", "ESIC", ["payroll", "blue_collar"], false, true),
  doc("pf", "PF", ["payroll", "joining"], false, true)
];

export const verificationTimelineTemplate: VerificationTimelineItem[] = [
  { key: "email", label: "Email", status: "missing" },
  { key: "phone", label: "Phone", status: "missing" },
  { key: "government_id", label: "Government ID", status: "missing" },
  { key: "education", label: "Education", status: "missing" },
  { key: "experience", label: "Experience", status: "missing" },
  { key: "employer", label: "Employer", status: "missing" },
  { key: "police_verification", label: "Police Verification", status: "missing" },
  { key: "driving_license", label: "Driving License", status: "missing" },
  { key: "medical", label: "Medical", status: "missing" }
];

export const blueCollarRoleProfiles: Record<string, { fields: string[]; documents: WorkforceDocumentKey[]; recommendationSignals: string[] }> = {
  security_guard: {
    fields: ["height", "shift", "sitePreference", "policeVerification", "uniformSize"],
    documents: ["aadhaar", "pan", "police_verification", "medical_fitness"],
    recommendationSignals: ["distance", "shift", "police_verification", "immediate_joining"]
  },
  driver: {
    fields: ["licenseType", "vehicleType", "routePreference", "shift", "experienceYears"],
    documents: ["aadhaar", "pan", "driving_license", "medical_fitness"],
    recommendationSignals: ["license", "distance", "route", "shift"]
  },
  electrician: {
    fields: ["certification", "tools", "siteType", "experienceYears"],
    documents: ["aadhaar", "pan", "certificates", "medical_fitness"] as WorkforceDocumentKey[],
    recommendationSignals: ["certificate", "site_type", "distance"]
  },
  plumber: {
    fields: ["tools", "siteType", "experienceYears", "availability"],
    documents: ["aadhaar", "pan", "experience_certificate"],
    recommendationSignals: ["experience", "distance", "availability"]
  },
  warehouse: {
    fields: ["shift", "liftingCapacity", "forklift", "weeklyOff"],
    documents: ["aadhaar", "pan", "medical_fitness"],
    recommendationSignals: ["shift", "weekly_off", "distance"]
  },
  housekeeping: {
    fields: ["sitePreference", "shift", "uniformSize", "experienceYears"],
    documents: ["aadhaar", "pan", "police_verification", "medical_fitness"],
    recommendationSignals: ["site", "shift", "distance"]
  },
  receptionist: {
    fields: ["languages", "computerSkills", "shift", "experienceYears"],
    documents: ["aadhaar", "pan", "resume"],
    recommendationSignals: ["languages", "computer_skills", "distance"]
  },
  delivery: {
    fields: ["licenseType", "vehicleOwned", "routePreference", "shift"],
    documents: ["aadhaar", "pan", "driving_license"],
    recommendationSignals: ["license", "vehicle", "distance", "urgent"]
  },
  retail: {
    fields: ["counterExperience", "languages", "shift", "weeklyOff"],
    documents: ["aadhaar", "pan", "resume"],
    recommendationSignals: ["languages", "shift", "location"]
  },
  factory: {
    fields: ["machineExperience", "shift", "safetyTraining", "weeklyOff"],
    documents: ["aadhaar", "pan", "medical_fitness", "certificates"] as WorkforceDocumentKey[],
    recommendationSignals: ["machine", "shift", "safety", "distance"]
  }
};

export const governmentJobCategories: GovernmentJobCategory[] = [
  { key: "psu", label: "PSU", filters: ["qualification", "age", "deadline", "state"] },
  { key: "railway", label: "Railway", filters: ["qualification", "zone", "deadline", "category"] },
  { key: "bank", label: "Bank", filters: ["qualification", "exam", "deadline", "state"] },
  { key: "ssc", label: "SSC", filters: ["qualification", "age", "deadline", "post"] },
  { key: "upsc", label: "UPSC", filters: ["qualification", "exam", "deadline"] },
  { key: "state_psc", label: "State PSC", filters: ["state", "qualification", "deadline"] },
  { key: "police", label: "Police", filters: ["state", "physical", "age", "deadline"] },
  { key: "army", label: "Army", filters: ["physical", "qualification", "age", "deadline"] }
];

export function buildJobsViewId(userId: string, createdAt = new Date()) {
  const suffix = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase().padEnd(8, "0");
  return `JV-${createdAt.getFullYear()}-${suffix}`;
}

export function buildDigitalProfileCard(input: {
  userId: string;
  siteUrl: string;
  slug: string;
  verifiedDocuments?: number;
  totalDocuments?: number;
  resumePreviewUrl?: string;
  skills?: string[];
  experienceYears?: number;
  languages?: string[];
  availability?: string;
}): DigitalProfileCard {
  const publicProfileUrl = new URL(`/candidate/${input.slug}`, input.siteUrl).toString();
  const jobsViewId = buildJobsViewId(input.userId);
  return {
    jobsViewId,
    publicProfileUrl,
    qrPayload: JSON.stringify({ id: jobsViewId, url: publicProfileUrl }),
    verifiedBadge: (input.verifiedDocuments ?? 0) >= Math.max(1, Math.ceil((input.totalDocuments ?? 1) * 0.6)),
    resumePreviewUrl: input.resumePreviewUrl,
    skills: input.skills ?? [],
    experienceYears: input.experienceYears,
    languages: input.languages ?? [],
    availability: input.availability
  };
}

export function calculateCandidateTrustScore(input: TrustScoreInput) {
  const documentScore = pct(input.verifiedDocuments ?? 0, Math.max(input.totalDocuments ?? 1, 1));
  return weightedScore([
    [input.profileCompletion ?? 0, 0.25],
    [documentScore, 0.25],
    [input.interviewAttendance ?? 0, 0.15],
    [input.offerAcceptance ?? 0, 0.1],
    [input.resumeQuality ?? 0, 0.15],
    [input.employerFeedback ?? 0, 0.1]
  ]);
}

export function calculateCompanyVerificationScore(input: CompanyTrustInput) {
  const verificationScore = pct(input.verifiedItems ?? 0, Math.max(input.verificationItems ?? 1, 1));
  return weightedScore([
    [verificationScore, 0.25],
    [input.responseRate ?? 0, 0.2],
    [input.hiringSpeed ?? 0, 0.15],
    [input.offerAcceptance ?? 0, 0.15],
    [input.candidateRating ?? 0, 0.1],
    [input.profileCompletion ?? 0, 0.15]
  ]);
}

export function hiringEventFillRate(event: HiringEvent) {
  return {
    registrationRate: pct(event.registrations, Math.max(event.capacity, 1)),
    attendanceRate: pct(event.attendance, Math.max(event.registrations, 1)),
    selectionRate: pct(event.selectedCandidates, Math.max(event.attendance, 1))
  };
}

export function referralLeaderboard(referrals: ReferralRecord[]) {
  const points: Record<string, number> = {
    invited: 1,
    registered: 5,
    interviewed: 10,
    hired: 25,
    reward_pending: 30,
    rewarded: 35
  };
  return referrals.map((referral) => ({ ...referral, points: points[referral.status] ?? 0 })).sort((a, b) => b.points - a.points);
}

export function employerHiringDashboard(input: HiringDashboardInput) {
  return [
    { key: "interviews_today", label: "Today's Interviews", value: input.interviewsToday ?? 0 },
    { key: "joining_today", label: "Today's Joining", value: input.joiningToday ?? 0 },
    { key: "offers_pending", label: "Offers Pending", value: input.offersPending ?? 0 },
    { key: "documents_pending", label: "Documents Pending", value: input.documentsPending ?? 0 },
    { key: "nearby_candidates", label: "Candidates Nearby", value: input.nearbyCandidates ?? 0 },
    { key: "urgent_jobs", label: "Urgent Jobs", value: input.urgentJobs ?? 0 },
    { key: "recruiter_tasks", label: "Recruiter Tasks", value: input.recruiterTasks ?? 0 }
  ];
}

export function candidateHomeCards(input: CandidateHomeInput) {
  return [
    { key: "recommendations", label: "Today's Recommendations", value: input.recommendations ?? 0 },
    { key: "nearby_jobs", label: "Nearby Jobs", value: input.nearbyJobs ?? 0 },
    { key: "messages", label: "New Messages", value: input.unreadMessages ?? 0 },
    { key: "interviews", label: "Interview Reminder", value: input.upcomingInterviews ?? 0 },
    { key: "profile", label: "Incomplete Profile", value: Math.max(0, 100 - (input.profileCompletion ?? 0)) },
    { key: "salary", label: "Salary Insight", value: input.salaryInsightAvailable ? 1 : 0 },
    { key: "learning", label: "Learning Suggestion", value: input.learningSuggestions ?? 0 }
  ];
}

export function employerCareersSitePath(slug: string) {
  return `/companies/${slug}`;
}

function doc(key: WorkforceDocumentKey, label: string, requiredFor: string[], expires: boolean, adminVerification: boolean): WorkforceDocument {
  return {
    key,
    label,
    requiredFor,
    expires,
    verification: "missing",
    downloadable: true,
    replaceable: true,
    history: true,
    adminVerification
  };
}

function weightedScore(parts: Array<[number, number]>) {
  return Math.round(parts.reduce((sum, [value, weight]) => sum + clamp(value) * weight, 0));
}

function pct(value: number, total: number) {
  return Math.round((value / total) * 10000) / 100;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
