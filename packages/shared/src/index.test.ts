import { describe, expect, it } from "vitest";

import {
  automationActionsFor,
  automationAnalytics,
  buildSmartRecommendations,
  auditButtons,
  auditDocumentCenter,
  auditJourneys,
  auditLocalHiring,
  auditRoutes,
  buildDigitalProfileCard,
  communicationPlanFor,
  calculateCandidateTrustScore,
  calculateCompanyVerificationScore,
  launchCenterSnapshot,
  productionReadinessScore,
  queueForCommunication,
  signWebhookPayload,
  defaultHiringWorkflow,
  detectCalendarConflicts,
  documentCompletion,
  nextWorkflowStage,
  parseResumeText,
  profileBuilderProgress,
  salaryCalculator,
  smartFollowUps,
  validateUpload
} from "./index";

describe("validateUpload", () => {
  it("rejects unsupported upload types", () => {
    const file = new File(["bad"], "bad.exe", { type: "application/x-msdownload" });
    expect(validateUpload(file, "resume")).toContain("Unsupported");
  });
});

describe("workforce platform engine", () => {
  it("builds verifiable digital profile cards", () => {
    const card = buildDigitalProfileCard({
      userId: "8a8d1f9e-0000-4000-9000-jobsview",
      siteUrl: "https://jobsview.example",
      slug: "raj-kumar",
      verifiedDocuments: 4,
      totalDocuments: 6,
      skills: ["Driving"],
      languages: ["Hindi"]
    });

    expect(card.jobsViewId).toContain("JV-");
    expect(card.verifiedBadge).toBe(true);
    expect(card.publicProfileUrl).toBe("https://jobsview.example/candidate/raj-kumar");
  });

  it("calculates candidate and company trust scores", () => {
    expect(calculateCandidateTrustScore({ profileCompletion: 80, verifiedDocuments: 4, totalDocuments: 5, interviewAttendance: 90, offerAcceptance: 75, resumeQuality: 70 })).toBeGreaterThan(70);
    expect(calculateCompanyVerificationScore({ verificationItems: 5, verifiedItems: 4, responseRate: 90, hiringSpeed: 80, offerAcceptance: 75, candidateRating: 85, profileCompletion: 95 })).toBeGreaterThan(80);
  });
});

describe("enterprise launch engine", () => {
  it("plans communications through centralized queues", () => {
    const plan = communicationPlanFor("offer_released");

    expect(plan.map((item) => item.channel)).toContain("email");
    expect(queueForCommunication("email")).toBe("email");
    expect(queueForCommunication("push")).toBe("notification");
  });

  it("builds launch snapshots and readiness scores", () => {
    const snapshot = launchCenterSnapshot({ jobsToday: 12, errors: 0, environment: "staging" });
    const score = productionReadinessScore({
      checks: [
        { key: "api", label: "API", status: "healthy", critical: true },
        { key: "redis", label: "Redis", status: "degraded", critical: true }
      ],
      queuesReady: true,
      webhooksReady: true,
      publicApisReady: true,
      featureFlagsReady: true
    });

    expect(snapshot.productionHealth).toBe("healthy");
    expect(score).toBe(70);
    expect(signWebhookPayload("{}", "secret")).toContain("v1=");
  });
});

describe("production journey audit engine", () => {
  it("keeps route, button, and journey contracts complete", () => {
    expect(auditRoutes().score).toBe(100);
    expect(auditButtons().score).toBe(100);
    expect(auditJourneys().score).toBe(100);
    expect(auditLocalHiring().score).toBe(100);
    expect(auditDocumentCenter().score).toBe(100);
  });
});

describe("intelligent hiring engine", () => {
  it("parses resume text into reviewable fields", () => {
    const parsed = parseResumeText("Raj Kumar\nFrontend Engineer\nB.Tech University\nReact TypeScript PostgreSQL\nEnglish Hindi");

    expect(parsed.name).toBe("Raj Kumar");
    expect(parsed.skills).toContain("React");
    expect(parsed.languages).toContain("English");
    expect(parsed.confidence).toBeGreaterThan(40);
  });

  it("ranks jobs with explainable matches", () => {
    const recommendations = buildSmartRecommendations(
      { highestQualification: "B.Tech", experienceYears: 3, skills: ["React"], location: "Bengaluru", salaryExpectation: 1200000, availability: "immediate" },
      [
        { id: "1", title: "React Engineer", education: "B.Tech", minExperienceYears: 2, skills: ["React"], location: "Bengaluru", salaryMax: 1800000, availability: "immediate" },
        { id: "2", title: "Driver", skills: ["Driving"], location: "Delhi" }
      ]
    );

    expect(recommendations[0].job.title).toBe("React Engineer");
    expect(recommendations[0].match.explanation).toContain("Education");
  });

  it("calculates profile builder progress and salary output", () => {
    const progress = profileBuilderProgress({ highestQualification: "Diploma", skills: ["Welding"], availability: "Immediate" });
    const salary = salaryCalculator({ role: "Welder", experienceYears: 4, skills: ["Welding"], city: "Mumbai", shift: "Night Shift" });

    expect(progress.percent).toBeGreaterThan(0);
    expect(salary.averageSalary).toBeGreaterThan(0);
  });
});

describe("recruitment automation engine", () => {
  it("moves candidates through the default hiring workflow", () => {
    expect(defaultHiringWorkflow.map((stage) => stage.key)).toContain("joined");
    expect(nextWorkflowStage("applied")?.key).toBe("screening");
  });

  it("returns configured automation actions for interview scheduling", () => {
    const actions = automationActionsFor("interview_scheduled").map((action) => action.type);

    expect(actions).toContain("send_calendar_invite");
    expect(actions).toContain("schedule_reminder");
  });

  it("detects interviewer calendar conflicts", () => {
    const conflicts = detectCalendarConflicts([
      { id: "a", title: "HR", startsAt: "2026-07-12T10:00:00.000Z", endsAt: "2026-07-12T11:00:00.000Z", timezone: "Asia/Calcutta", interviewerIds: ["u1"] },
      { id: "b", title: "Tech", startsAt: "2026-07-12T10:30:00.000Z", endsAt: "2026-07-12T11:30:00.000Z", timezone: "Asia/Calcutta", interviewerIds: ["u1", "u2"] }
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].interviewerIds).toEqual(["u1"]);
  });

  it("calculates documents, follow ups, and automation analytics", () => {
    const completion = documentCompletion(
      [
        { key: "aadhaar", label: "Aadhaar", mandatory: true },
        { key: "pan", label: "PAN", mandatory: true }
      ],
      [{ key: "aadhaar", status: "verified" }]
    );

    expect(completion.percent).toBe(50);
    expect(completion.missing).toEqual(["PAN"]);
    expect(smartFollowUps({ lastResponseDays: 3, offerExpiresInDays: 1, feedbackPending: true })).toHaveLength(3);
    expect(automationAnalytics({ triggered: 10, succeeded: 8, failed: 2, candidates: 20, converted: 5, employers: 4, activeEmployers: 3 }).automationSuccessRate).toBe(80);
  });
});
