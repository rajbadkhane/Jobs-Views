export type PortalKey = "public" | "candidate" | "employer" | "admin";

export type RouteCoverage = {
  path: string;
  portal: PortalKey;
  intent: string;
  requiresAuth?: boolean;
  role?: "JOB_SEEKER" | "EMPLOYER" | "ADMIN" | "SUPER_ADMIN";
  dynamic?: boolean;
  apiBacked?: boolean;
  seo?: boolean;
};

export type ButtonActionType = "navigate" | "dialog" | "mutation" | "download" | "upload" | "disabled";

export type ButtonContract = {
  key: string;
  label: string;
  portal: PortalKey;
  action: ButtonActionType;
  target: string;
  api?: string;
};

export type JourneyStep = {
  key: string;
  label: string;
  route: string;
  action: ButtonActionType;
  api?: string;
};

export type JourneyDefinition = {
  key: "candidate" | "employer" | "admin";
  title: string;
  steps: JourneyStep[];
};

export type LocalHiringFilter = {
  key: string;
  label: string;
  queryParam: string;
};

export type DocumentCenterItem = {
  key: string;
  label: string;
  owner: "candidate" | "employer";
  uploadApi?: string;
  downloadRoute?: string;
};

export type AuditResult = {
  total: number;
  complete: number;
  incomplete: string[];
  score: number;
};

export const routeCoverage: RouteCoverage[] = [
  { path: "/", portal: "public", intent: "Homepage, public navigation, search, CTA", apiBacked: true, seo: true },
  { path: "/jobs", portal: "public", intent: "Job search, filters, pagination", apiBacked: true, seo: true },
  { path: "/jobs/[slug]", portal: "public", intent: "Job detail, apply, save, share, related career content", dynamic: true, apiBacked: true, seo: true },
  { path: "/companies", portal: "public", intent: "Company discovery", apiBacked: true, seo: true },
  { path: "/companies/[slug]", portal: "public", intent: "Company public page, jobs, branches, benefits", dynamic: true, apiBacked: true, seo: true },
  { path: "/career", portal: "public", intent: "Career overview", apiBacked: true, seo: true },
  { path: "/career/[slug]", portal: "public", intent: "Career entity page", dynamic: true, apiBacked: true, seo: true },
  { path: "/guidance", portal: "public", intent: "Career guidance hub", apiBacked: true, seo: true },
  { path: "/guidance/[topic]", portal: "public", intent: "Guidance topic", dynamic: true, apiBacked: true, seo: true },
  { path: "/salary", portal: "public", intent: "Salary hub", apiBacked: true, seo: true },
  { path: "/salary/[role]", portal: "public", intent: "Salary role page", dynamic: true, apiBacked: true, seo: true },
  { path: "/salary/calculator", portal: "public", intent: "Salary calculator", apiBacked: true, seo: true },
  { path: "/learning-center", portal: "public", intent: "Learning and career resources", apiBacked: true, seo: true },
  { path: "/skills/[skill]", portal: "public", intent: "Skill entity page", dynamic: true, apiBacked: true, seo: true },
  { path: "/interview/[slug]", portal: "public", intent: "Interview guide page", dynamic: true, apiBacked: true, seo: true },
  { path: "/login", portal: "public", intent: "Authentication login", apiBacked: true },
  { path: "/register", portal: "public", intent: "Candidate/employer registration", apiBacked: true },
  { path: "/forgot-password", portal: "public", intent: "Forgot password", apiBacked: true },
  { path: "/reset-password", portal: "public", intent: "Reset password", apiBacked: true },
  { path: "/verify-email", portal: "public", intent: "Email verification", apiBacked: true },
  { path: "/candidate", portal: "candidate", intent: "Candidate dashboard", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/candidate/onboarding", portal: "candidate", intent: "Profile builder", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/candidate/profile", portal: "candidate", intent: "Profile CRUD", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/candidate/resume", portal: "candidate", intent: "Resume upload and insights", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/candidate/jobs", portal: "candidate", intent: "Recommended jobs", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/candidate/interviews", portal: "candidate", intent: "Interview timeline", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/candidate/offers", portal: "candidate", intent: "Offer state and download", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/candidate/messages", portal: "candidate", intent: "Recruiter conversations", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/candidate/notifications", portal: "candidate", intent: "Candidate notifications", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/candidate/settings", portal: "candidate", intent: "Candidate settings", requiresAuth: true, role: "JOB_SEEKER", apiBacked: true },
  { path: "/employer", portal: "employer", intent: "Employer dashboard", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/company", portal: "employer", intent: "Company workspace", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/jobs", portal: "employer", intent: "Job management", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/pipeline", portal: "employer", intent: "ATS pipeline", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/candidates", portal: "employer", intent: "Candidate inbox", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/interviews", portal: "employer", intent: "Interview center", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/team", portal: "employer", intent: "Team and permissions", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/analytics", portal: "employer", intent: "Hiring analytics", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/billing", portal: "employer", intent: "Subscription and marketplace", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/messages", portal: "employer", intent: "Recruitment messaging", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/notifications", portal: "employer", intent: "Employer notifications", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/employer/settings", portal: "employer", intent: "Employer settings", requiresAuth: true, role: "EMPLOYER", apiBacked: true },
  { path: "/admin", portal: "admin", intent: "Platform dashboard", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/users", portal: "admin", intent: "User operations", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/companies", portal: "admin", intent: "Company approval queue", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/jobs", portal: "admin", intent: "Job moderation", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/recruitment", portal: "admin", intent: "Recruitment monitoring", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/business", portal: "admin", intent: "Business analytics", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/cms", portal: "admin", intent: "CMS and content approval", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/marketplace", portal: "admin", intent: "Marketplace operations", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/billing", portal: "admin", intent: "Billing operations", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/reports", portal: "admin", intent: "Reports and exports", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/audit", portal: "admin", intent: "Audit center", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/monitoring", portal: "admin", intent: "Monitoring", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true },
  { path: "/admin/settings", portal: "admin", intent: "Platform settings", requiresAuth: true, role: "SUPER_ADMIN", apiBacked: true }
];

export const localHiringFilters: LocalHiringFilter[] = [
  { key: "distance", label: "Distance Search", queryParam: "distance_km" },
  { key: "nearby_jobs", label: "Nearby Jobs", queryParam: "nearby" },
  { key: "nearby_candidates", label: "Nearby Candidates", queryParam: "nearby_candidates" },
  { key: "walking_distance", label: "Walking Distance", queryParam: "walking_distance" },
  { key: "accommodation", label: "Accommodation", queryParam: "accommodation" },
  { key: "food", label: "Food", queryParam: "food" },
  { key: "shift", label: "Shift", queryParam: "shift" },
  { key: "weekly_off", label: "Weekly Off", queryParam: "weekly_off" },
  { key: "urgent_hiring", label: "Urgent Hiring", queryParam: "urgent" },
  { key: "immediate_joining", label: "Immediate Joining", queryParam: "availability" }
];

export const documentCenterItems: DocumentCenterItem[] = [
  { key: "resume", label: "Resume", owner: "candidate", uploadApi: "profileApi.uploadResume", downloadRoute: "/candidate/resume" },
  { key: "offer_letter", label: "Offer Letter", owner: "employer", uploadApi: "applicationsApi.createOffer", downloadRoute: "/candidate/offers" },
  { key: "appointment_letter", label: "Appointment Letter", owner: "employer", uploadApi: "applicationsApi.createOffer", downloadRoute: "/candidate/offers" },
  { key: "certificates", label: "Certificates", owner: "candidate", uploadApi: "profileApi.uploadResume", downloadRoute: "/candidate/profile/certificates" },
  { key: "police_verification", label: "Police Verification", owner: "candidate", uploadApi: "profileApi.uploadResume", downloadRoute: "/candidate/profile/documents" },
  { key: "driving_license", label: "Driving License", owner: "candidate", uploadApi: "profileApi.uploadResume", downloadRoute: "/candidate/profile/documents" },
  { key: "medical_fitness", label: "Medical Fitness", owner: "candidate", uploadApi: "profileApi.uploadResume", downloadRoute: "/candidate/profile/documents" }
];

export const buttonContracts: ButtonContract[] = [
  { key: "search-jobs", label: "Search jobs", portal: "public", action: "navigate", target: "/jobs" },
  { key: "apply-job", label: "Apply", portal: "candidate", action: "mutation", target: "application", api: "applicationsApi.apply" },
  { key: "save-job", label: "Save job", portal: "candidate", action: "mutation", target: "saved job", api: "applicationsApi.saveJob" },
  { key: "share-job", label: "Share job", portal: "public", action: "mutation", target: "share event", api: "jobsApi.share" },
  { key: "upload-resume", label: "Upload resume", portal: "candidate", action: "upload", target: "resume", api: "profileApi.uploadResume" },
  { key: "update-profile", label: "Save profile", portal: "candidate", action: "mutation", target: "candidate profile", api: "profileApi.updateCandidate" },
  { key: "withdraw-application", label: "Withdraw", portal: "candidate", action: "mutation", target: "application status", api: "applicationsApi.updateStatus" },
  { key: "register-company", label: "Register company", portal: "employer", action: "mutation", target: "company", api: "companyApi.register" },
  { key: "create-job", label: "Create job", portal: "employer", action: "mutation", target: "job", api: "jobsApi.create" },
  { key: "publish-job", label: "Publish job", portal: "employer", action: "mutation", target: "job status", api: "jobsApi.setStatus" },
  { key: "shortlist-candidate", label: "Shortlist", portal: "employer", action: "mutation", target: "application status", api: "applicationsApi.updateStatus" },
  { key: "schedule-interview", label: "Schedule interview", portal: "employer", action: "mutation", target: "interview", api: "applicationsApi.createInterview" },
  { key: "send-offer", label: "Send offer", portal: "employer", action: "mutation", target: "offer", api: "applicationsApi.createOffer" },
  { key: "hire-candidate", label: "Hire", portal: "employer", action: "mutation", target: "application status", api: "applicationsApi.updateStatus" },
  { key: "approve-company", label: "Approve company", portal: "admin", action: "mutation", target: "company status", api: "adminApi.moderateCompany" },
  { key: "approve-job", label: "Approve job", portal: "admin", action: "mutation", target: "job status", api: "adminApi.moderateJob" },
  { key: "feature-job", label: "Feature job", portal: "admin", action: "mutation", target: "job flags", api: "adminApi.setJobFlags" },
  { key: "export-report", label: "Export report", portal: "admin", action: "download", target: "report", api: "adminApi.createReport" },
  { key: "mark-notification-read", label: "Mark read", portal: "candidate", action: "mutation", target: "notification", api: "applicationsApi.markNotificationRead" },
  { key: "delete-notification", label: "Delete notification", portal: "candidate", action: "mutation", target: "notification", api: "applicationsApi.deleteNotification" }
];

export const journeyDefinitions: JourneyDefinition[] = [
  {
    key: "candidate",
    title: "Candidate Complete Journey",
    steps: [
      { key: "register", label: "Register", route: "/register", action: "mutation", api: "authApi.register" },
      { key: "verify", label: "Verify Email", route: "/verify-email", action: "mutation", api: "authApi.verifyEmail" },
      { key: "profile", label: "Profile Builder", route: "/candidate/onboarding", action: "mutation", api: "profileApi.updateCandidate" },
      { key: "resume", label: "Resume Upload", route: "/candidate/resume", action: "upload", api: "profileApi.uploadResume" },
      { key: "recommend", label: "Recommendation", route: "/candidate/jobs", action: "navigate" },
      { key: "apply", label: "Apply", route: "/jobs/[slug]", action: "mutation", api: "applicationsApi.apply" },
      { key: "interview", label: "Interview", route: "/candidate/interviews", action: "navigate" },
      { key: "offer", label: "Offer", route: "/candidate/offers", action: "navigate" },
      { key: "history", label: "History", route: "/applications", action: "navigate" }
    ]
  },
  {
    key: "employer",
    title: "Employer Complete Journey",
    steps: [
      { key: "register", label: "Employer Registration", route: "/register", action: "mutation", api: "authApi.register" },
      { key: "company", label: "Company Creation", route: "/employer/company", action: "mutation", api: "companyApi.register" },
      { key: "pending", label: "Pending Approval", route: "/pending", action: "navigate" },
      { key: "subscription", label: "Subscription Check", route: "/employer/billing", action: "navigate" },
      { key: "create-job", label: "Create Job", route: "/employer/jobs", action: "mutation", api: "jobsApi.create" },
      { key: "publish", label: "Publish", route: "/employer/jobs", action: "mutation", api: "jobsApi.setStatus" },
      { key: "pipeline", label: "Receive Candidates", route: "/employer/pipeline", action: "navigate" },
      { key: "shortlist", label: "Shortlist", route: "/employer/pipeline", action: "mutation", api: "applicationsApi.updateStatus" },
      { key: "interview", label: "Interview", route: "/employer/interviews", action: "mutation", api: "applicationsApi.createInterview" },
      { key: "offer", label: "Offer", route: "/employer/pipeline", action: "mutation", api: "applicationsApi.createOffer" },
      { key: "hire", label: "Hire", route: "/employer/pipeline", action: "mutation", api: "applicationsApi.updateStatus" }
    ]
  },
  {
    key: "admin",
    title: "Super Admin Complete Journey",
    steps: [
      { key: "approve-employer", label: "Approve Employer", route: "/admin/companies", action: "mutation", api: "adminApi.moderateCompany" },
      { key: "create-candidate", label: "Create Candidate", route: "/admin/users", action: "mutation", api: "adminApi.users" },
      { key: "moderate-job", label: "Approve Job", route: "/admin/jobs", action: "mutation", api: "adminApi.moderateJob" },
      { key: "feature-job", label: "Feature Job", route: "/admin/jobs", action: "mutation", api: "adminApi.setJobFlags" },
      { key: "cms", label: "CMS", route: "/admin/cms", action: "mutation", api: "adminApi.upsertCms" },
      { key: "marketplace", label: "Marketplace", route: "/admin/marketplace", action: "navigate" },
      { key: "reports", label: "Reports", route: "/admin/reports", action: "mutation", api: "adminApi.createReport" },
      { key: "analytics", label: "Analytics", route: "/admin/business", action: "navigate" },
      { key: "audit", label: "Audit", route: "/admin/audit", action: "navigate" }
    ]
  }
];

export function auditRoutes(routes: RouteCoverage[] = routeCoverage): AuditResult {
  const incomplete = routes
    .filter((route) => !route.path || !route.intent || route.apiBacked === false)
    .map((route) => route.path);
  return result(routes.length, incomplete);
}

export function auditButtons(buttons: ButtonContract[] = buttonContracts): AuditResult {
  const incomplete = buttons
    .filter((button) => button.action !== "disabled" && !button.target)
    .map((button) => button.key);
  return result(buttons.length, incomplete);
}

export function auditJourneys(journeys: JourneyDefinition[] = journeyDefinitions): AuditResult {
  const steps = journeys.flatMap((journey) => journey.steps.map((step) => ({ journey: journey.key, ...step })));
  const incomplete = steps
    .filter((step) => !step.route || (step.action === "mutation" && !step.api) || (step.action === "upload" && !step.api))
    .map((step) => `${step.journey}:${step.key}`);
  return result(steps.length, incomplete);
}

export function auditLocalHiring(filters: LocalHiringFilter[] = localHiringFilters): AuditResult {
  const incomplete = filters.filter((filter) => !filter.queryParam).map((filter) => filter.key);
  return result(filters.length, incomplete);
}

export function auditDocumentCenter(items: DocumentCenterItem[] = documentCenterItems): AuditResult {
  const incomplete = items.filter((item) => !item.uploadApi && !item.downloadRoute).map((item) => item.key);
  return result(items.length, incomplete);
}

export function routesForPortal(portal: PortalKey) {
  return routeCoverage.filter((route) => route.portal === portal);
}

export function journeyByKey(key: JourneyDefinition["key"]) {
  return journeyDefinitions.find((journey) => journey.key === key);
}

function result(total: number, incomplete: string[]): AuditResult {
  const complete = total - incomplete.length;
  return {
    total,
    complete,
    incomplete,
    score: total ? Math.round((complete / total) * 10000) / 100 : 100
  };
}
