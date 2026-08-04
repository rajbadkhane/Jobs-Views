export type WorkflowStage = {
  key: string;
  label: string;
  color: string;
  icon: string;
  order: number;
  automationKeys?: string[];
};

export type AutomationTrigger =
  | "candidate_applied"
  | "candidate_shortlisted"
  | "interview_scheduled"
  | "interview_passed"
  | "offer_sent"
  | "offer_accepted"
  | "candidate_rejected"
  | "candidate_joined"
  | "document_missing"
  | "profile_updated"
  | "job_updated";

export type AutomationAction =
  | "send_email"
  | "send_sms_placeholder"
  | "send_whatsapp_placeholder"
  | "send_push"
  | "send_in_app"
  | "notify_recruiter"
  | "create_task"
  | "send_calendar_invite"
  | "schedule_reminder"
  | "move_stage"
  | "refresh_recommendations"
  | "escalate";

export type AutomationRule = {
  key: string;
  name: string;
  trigger: AutomationTrigger;
  actions: Array<{ type: AutomationAction; delayMinutes?: number; targetStage?: string; templateKey?: string }>;
  enabled: boolean;
};

export type RecruiterTask = {
  id: string;
  title: string;
  category: "interview" | "follow_up" | "review" | "offer" | "document" | "background_check" | "overdue";
  dueAt?: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "done" | "overdue";
};

export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  interviewerIds: string[];
};

export type DocumentRequirement = {
  key: string;
  label: string;
  mandatory: boolean;
};

export type DocumentSubmission = {
  key: string;
  status: "missing" | "submitted" | "verified" | "rejected";
};

export type JoiningStep = {
  key: string;
  label: string;
  status: "pending" | "in_progress" | "complete";
};

export const defaultHiringWorkflow: WorkflowStage[] = [
  { key: "applied", label: "Applied", color: "#2563EB", icon: "inbox", order: 1 },
  { key: "screening", label: "Screening", color: "#0F766E", icon: "search", order: 2 },
  { key: "shortlisted", label: "Shortlisted", color: "#16A34A", icon: "check", order: 3 },
  { key: "hr_interview", label: "HR Interview", color: "#7C3AED", icon: "message", order: 4 },
  { key: "technical_interview", label: "Technical Interview", color: "#4F46E5", icon: "code", order: 5 },
  { key: "final_interview", label: "Final Interview", color: "#9333EA", icon: "star", order: 6 },
  { key: "offer", label: "Offer", color: "#F59E0B", icon: "file", order: 7 },
  { key: "hired", label: "Hired", color: "#059669", icon: "award", order: 8 },
  { key: "joined", label: "Joined", color: "#047857", icon: "briefcase", order: 9 },
  { key: "closed", label: "Closed", color: "#64748B", icon: "archive", order: 10 }
];

export const defaultAutomationRules: AutomationRule[] = [
  { key: "apply_thank_you", name: "Send thank you after apply", trigger: "candidate_applied", enabled: true, actions: [{ type: "send_email", templateKey: "application_thank_you" }, { type: "send_in_app", templateKey: "application_received" }] },
  { key: "shortlist_notify", name: "Notify shortlisted candidate and recruiter", trigger: "candidate_shortlisted", enabled: true, actions: [{ type: "send_whatsapp_placeholder", templateKey: "candidate_shortlisted" }, { type: "notify_recruiter" }] },
  { key: "interview_reminders", name: "Interview calendar and reminders", trigger: "interview_scheduled", enabled: true, actions: [{ type: "send_calendar_invite" }, { type: "schedule_reminder", delayMinutes: -1440 }, { type: "schedule_reminder", delayMinutes: -60 }] },
  { key: "rejection_email", name: "Send rejection email", trigger: "candidate_rejected", enabled: true, actions: [{ type: "send_email", templateKey: "application_rejected" }] },
  { key: "interview_passed_move", name: "Move interview passed to final", trigger: "interview_passed", enabled: true, actions: [{ type: "move_stage", targetStage: "final_interview" }] },
  { key: "offer_accepted_hired", name: "Move accepted offer to hired", trigger: "offer_accepted", enabled: true, actions: [{ type: "move_stage", targetStage: "hired" }, { type: "create_task", templateKey: "joining_documents" }] },
  { key: "search_refresh_profile", name: "Refresh recommendations after profile update", trigger: "profile_updated", enabled: true, actions: [{ type: "refresh_recommendations" }] },
  { key: "search_refresh_job", name: "Refresh recommendations after job update", trigger: "job_updated", enabled: true, actions: [{ type: "refresh_recommendations" }] }
];

export const blueCollarWorkflowTemplates: Record<string, { stages: WorkflowStage[]; documents: DocumentRequirement[]; joiningChecklist: string[]; salaryRange: string; certificates: string[] }> = {
  security_guard: {
    stages: defaultHiringWorkflow.filter((stage) => ["applied", "screening", "shortlisted", "hr_interview", "offer", "hired", "joined", "closed"].includes(stage.key)),
    documents: documents(["aadhaar", "pan", "police_verification", "medical_fitness", "resume"]),
    joiningChecklist: ["Uniform issued", "Shift assigned", "Site briefing", "Attendance setup"],
    salaryRange: "INR 2L-5L",
    certificates: ["Security training", "Police verification"]
  },
  driver: {
    stages: defaultHiringWorkflow.filter((stage) => ["applied", "screening", "shortlisted", "hr_interview", "offer", "hired", "joined", "closed"].includes(stage.key)),
    documents: documents(["aadhaar", "pan", "driving_license", "medical_fitness"]),
    joiningChecklist: ["Vehicle assigned", "Route briefing", "License verified", "Uniform issued"],
    salaryRange: "INR 3L-6L",
    certificates: ["Driving license"]
  },
  warehouse_associate: {
    stages: defaultHiringWorkflow.filter((stage) => ["applied", "screening", "shortlisted", "hr_interview", "offer", "hired", "joined", "closed"].includes(stage.key)),
    documents: documents(["aadhaar", "pan", "medical_fitness", "certificates"]),
    joiningChecklist: ["Safety briefing", "Shift assigned", "Supervisor assigned", "PF/ESIC setup"],
    salaryRange: "INR 2.4L-5.5L",
    certificates: ["Forklift certificate optional"]
  }
};

export const defaultJoiningWorkflow: JoiningStep[] = [
  { key: "offer_accepted", label: "Offer Accepted", status: "complete" },
  { key: "documents_submitted", label: "Documents Submitted", status: "pending" },
  { key: "verification", label: "Verification", status: "pending" },
  { key: "joining_date", label: "Joining Date", status: "pending" },
  { key: "joined", label: "Joined", status: "pending" },
  { key: "probation", label: "Probation Review", status: "pending" },
  { key: "completed", label: "Completed", status: "pending" }
];

export function nextWorkflowStage(current: string, workflow: WorkflowStage[] = defaultHiringWorkflow) {
  const ordered = [...workflow].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((stage) => stage.key === current);
  return index >= 0 ? ordered[index + 1] : undefined;
}

export function automationActionsFor(trigger: AutomationTrigger, rules: AutomationRule[] = defaultAutomationRules) {
  return rules.filter((rule) => rule.enabled && rule.trigger === trigger).flatMap((rule) => rule.actions.map((action) => ({ ruleKey: rule.key, ...action })));
}

export function detectCalendarConflicts(events: CalendarEvent[]) {
  return events.flatMap((event, index) => events.slice(index + 1).filter((other) => hasSharedInterviewer(event, other) && overlaps(event, other)).map((other) => ({ firstId: event.id, secondId: other.id, interviewerIds: event.interviewerIds.filter((id) => other.interviewerIds.includes(id)) })));
}

export function documentCompletion(requirements: DocumentRequirement[], submissions: DocumentSubmission[]) {
  const mandatory = requirements.filter((item) => item.mandatory);
  const submitted = mandatory.filter((req) => submissions.some((item) => item.key === req.key && ["submitted", "verified"].includes(item.status)));
  return {
    percent: mandatory.length ? Math.round((submitted.length / mandatory.length) * 100) : 100,
    missing: mandatory.filter((req) => !submitted.includes(req)).map((item) => item.label)
  };
}

export function smartFollowUps(input: { lastResponseDays?: number; offerExpiresInDays?: number; feedbackPending?: boolean; documentsPending?: boolean }) {
  const tasks: RecruiterTask[] = [];
  if ((input.lastResponseDays ?? 0) >= 3) tasks.push(task("no-response", "No response for 3 days", "follow_up", "high"));
  if (input.offerExpiresInDays === 1) tasks.push(task("offer-expiry", "Offer expires tomorrow", "offer", "urgent"));
  if (input.feedbackPending) tasks.push(task("feedback", "Interview feedback pending", "review", "high"));
  if (input.documentsPending) tasks.push(task("documents", "Documents pending", "document", "normal"));
  return tasks;
}

export function automationAnalytics(input: { triggered: number; succeeded: number; failed: number; candidates: number; converted: number; employers: number; activeEmployers: number }) {
  return {
    automationSuccessRate: pct(input.succeeded, Math.max(input.triggered, 1)),
    workflowPerformance: pct(input.converted, Math.max(input.candidates, 1)),
    recruiterEfficiency: pct(input.succeeded + input.converted, Math.max(input.triggered + input.candidates, 1)),
    candidateConversion: pct(input.converted, Math.max(input.candidates, 1)),
    employerConversion: pct(input.activeEmployers, Math.max(input.employers, 1)),
    failures: input.failed
  };
}

function documents(keys: string[]): DocumentRequirement[] {
  const labels: Record<string, string> = {
    aadhaar: "Aadhaar",
    pan: "PAN",
    driving_license: "Driving License",
    police_verification: "Police Verification",
    resume: "Resume",
    certificates: "Certificates",
    medical_fitness: "Medical Fitness",
    passport: "Passport"
  };
  return keys.map((key) => ({ key, label: labels[key] ?? key, mandatory: true }));
}

function task(id: string, title: string, category: RecruiterTask["category"], priority: RecruiterTask["priority"]): RecruiterTask {
  return { id, title, category, priority, status: "open" };
}

function hasSharedInterviewer(left: CalendarEvent, right: CalendarEvent) {
  return left.interviewerIds.some((id) => right.interviewerIds.includes(id));
}

function overlaps(left: CalendarEvent, right: CalendarEvent) {
  return new Date(left.startsAt) < new Date(right.endsAt) && new Date(right.startsAt) < new Date(left.endsAt);
}

function pct(value: number, total: number) {
  return Math.round((value / total) * 10000) / 100;
}
