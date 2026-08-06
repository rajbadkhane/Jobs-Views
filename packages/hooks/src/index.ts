"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  adminApi,
  apiErrorMessage,
  applicationsApi,
  authApi,
  companyApi,
  contentApi,
  globalSearchApi,
  healthApi,
  calculateJobMatch,
  calculateProfileCompletion,
  buildSmartRecommendations,
  estimateSalary,
  employerHiringAnalytics,
  automationActionsFor,
  automationAnalytics,
  intelligentJobMatch,
  detectCalendarConflicts,
  documentCompletion,
  nextWorkflowStage,
  parseResumeText,
  profileBuilderProgress,
  recommendCandidates,
  recommendJobs,
  salaryCalculator,
  smartFollowUps,
  type AutomationTrigger,
  type CalendarEvent,
  type CandidateProfileEngineInput,
  type DocumentRequirement,
  type DocumentSubmission,
  type IntelligentJobInput,
  type JobMatchInput,
  type SalaryCalculatorInput,
  jobsApi,
  profileApi,
  roleHome,
  subscriptionApi,
  userApi,
  useAuthStore,
  useNotificationStore
} from "@career-os/shared";

export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useAutosaveDraft<T>(key: string, value: T, options: { enabled?: boolean; delayMs?: number } = {}) {
  const { enabled = true, delayMs = 700 } = options;
  const [restored, setRestored] = useState<{ value: T; savedAt: string } | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(`Jobs View.draft.${key}`);
    if (!raw) return;
    try {
      setRestored(JSON.parse(raw) as { value: T; savedAt: string });
    } catch {
      window.localStorage.removeItem(`Jobs View.draft.${key}`);
    }
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(`Jobs View.draft.${key}`, JSON.stringify({ value, savedAt: new Date().toISOString() }));
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, enabled, key, value]);

  const clearDraft = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(`Jobs View.draft.${key}`);
    setRestored(null);
  }, [key]);

  return { restored, clearDraft };
}

export function useSessionTimeoutWarning(timeoutMs: number, onWarn: () => void) {
  useEffect(() => {
    if (typeof window === "undefined" || timeoutMs <= 0) return;
    let timer = window.setTimeout(onWarn, timeoutMs);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onWarn, timeoutMs);
    };
    window.addEventListener("click", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("visibilitychange", reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("click", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("visibilitychange", reset);
    };
  }, [onWarn, timeoutMs]);
}

export function useStableId(prefix: string) {
  const reactId = useId();
  return useMemo(() => `${prefix}-${reactId.replace(/:/g, "")}`, [prefix, reactId]);
}

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) return undefined;
  const response = (error as { response?: { status?: number } }).response;
  return response?.status;
}

export function authDestination(role: string) {
  if (typeof window === "undefined" || role !== "JOB_SEEKER") return roleHome(role);
  const next = new URLSearchParams(window.location.search).get("next")?.trim();
  return next && next.startsWith("/") && !next.startsWith("//") ? next : roleHome(role);
}

export const queryKeys = {
  session: ["auth", "me"] as const,
  profile: ["profile", "me"] as const,
  profileCompletion: ["profile", "completion"] as const,
  skills: ["profile", "skills"] as const,
  education: ["profile", "education"] as const,
  experience: ["profile", "experience"] as const,
  companies: (query?: unknown) => ["companies", query] as const,
  company: (slug: string) => ["companies", "detail", slug] as const,
  myCompanies: ["companies", "me"] as const,
  jobs: (query?: unknown) => ["jobs", query] as const,
  job: (slug: string) => ["jobs", "detail", slug] as const,
  applications: (query?: unknown) => ["applications", "me", query] as const,
  savedJobs: ["saved-jobs"] as const,
  notifications: ["notifications"] as const,
  adminDashboard: ["admin", "dashboard"] as const,
  adminBusinessDashboard: ["admin", "business-dashboard"] as const,
  adminMarketplace: ["admin", "marketplace"] as const,
  adminUsers: (query?: unknown) => ["admin", "users", query] as const,
  adminCms: (query?: unknown) => ["admin", "cms", query] as const,
  adminHealth: ["admin", "system-health"] as const,
  content: (query?: unknown) => ["content", query] as const,
  contentEntry: (type: string, slug: string) => ["content", type, slug] as const,
  globalSearch: (query?: unknown) => ["search", query] as const,
  health: ["health"] as const,
  candidatePlans: ["subscriptions", "plans"] as const,
  candidateSubscription: ["subscriptions", "me"] as const
};

export function useCandidatePlans() {
  return useQuery({ queryKey: queryKeys.candidatePlans, queryFn: async () => (await subscriptionApi.plans()).items, staleTime: 5 * 60_000 });
}

export function useCandidateSubscription(enabled = true) {
  return useQuery({ queryKey: queryKeys.candidateSubscription, queryFn: subscriptionApi.me, enabled, retry: false });
}

export function useSubscriptionActions() {
  const client = useQueryClient();
  return {
    startOtp: useMutation({ mutationFn: subscriptionApi.startOtp }),
    verifyOtp: useMutation({ mutationFn: subscriptionApi.verifyOtp }),
    verifyPayment: useMutation({ mutationFn: subscriptionApi.verifyPayment, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.candidateSubscription }); } }),
    support: useMutation({ mutationFn: subscriptionApi.support })
  };
}

export function useSession() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      const user = await authApi.me();
      setSession({
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions ?? [],
        isVerified: user.is_verified
      });
      return user;
    },
    retry: false,
    meta: {
      onError: clearSession
    }
  });
}

export function useAuthActions() {
  const client = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const notify = useNotificationStore((state) => state.notify);

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      setSession(
        {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          permissions: result.user.permissions ?? [],
          isVerified: result.user.is_verified
        },
        { accessToken: result.access_token, refreshToken: result.refresh_token }
      );
      notify({ title: "Logged in", description: "Session restored from backend.", intent: "success" });
      if (typeof window !== "undefined") window.location.href = authDestination(result.user.role);
    }
  });

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (result) => {
      setSession(
        {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          permissions: result.user.permissions ?? [],
          isVerified: result.user.is_verified
        },
        { accessToken: result.access_token, refreshToken: result.refresh_token }
      );
      notify({ title: "Account created", description: "Enter the code we emailed you to verify your account.", intent: "success" });
    }
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      clearSession();
      await client.clear();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  });

  const logoutAll = useMutation({
    mutationFn: authApi.logoutAll,
    onSettled: async () => {
      clearSession();
      await client.clear();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  });

  return {
    login,
    register,
    logout,
    logoutAll,
    forgotPassword: useMutation({ mutationFn: authApi.forgotPassword }),
    resetPassword: useMutation({ mutationFn: authApi.resetPassword }),
    verifyEmail: useMutation({ mutationFn: authApi.verifyEmail }),
    verifyRegistrationOtp: useMutation({
      mutationFn: authApi.verifyRegistrationOtp,
      onSuccess: () => notify({ title: "Email verified", description: "Your account is fully verified.", intent: "success" })
    }),
    resendRegistrationOtp: useMutation({ mutationFn: authApi.resendRegistrationOtp }),
    refresh: useMutation({ mutationFn: authApi.refresh })
  };
}

export function useSessionManagement() {
  return {
    sessions: useQuery({ queryKey: ["user", "sessions"], queryFn: userApi.sessions }),
    devices: useQuery({ queryKey: ["user", "devices"], queryFn: userApi.devices }),
    loginHistory: useQuery({ queryKey: ["user", "login-history"], queryFn: userApi.loginHistory }),
    auditTrail: useQuery({ queryKey: ["user", "audit-trail"], queryFn: userApi.auditTrail })
  };
}

export type CandidateDataOptions = Partial<Record<
  "profile" | "completion" | "skills" | "education" | "experience" | "applications" | "savedJobs" | "notifications" | "notificationSummary",
  boolean
>>;

export function useCandidateData(options: CandidateDataOptions = {}) {
  const enabled = (key: keyof CandidateDataOptions) => options[key] ?? true;
  return {
    profile: useQuery({ queryKey: queryKeys.profile, queryFn: profileApi.me, enabled: enabled("profile") }),
    completion: useQuery({ queryKey: queryKeys.profileCompletion, queryFn: profileApi.completion, enabled: enabled("completion") }),
    skills: useQuery({ queryKey: queryKeys.skills, queryFn: profileApi.skills, enabled: enabled("skills") }),
    education: useQuery({ queryKey: queryKeys.education, queryFn: profileApi.education, enabled: enabled("education") }),
    experience: useQuery({ queryKey: queryKeys.experience, queryFn: profileApi.experience, enabled: enabled("experience") }),
    applications: useQuery({ queryKey: queryKeys.applications(), queryFn: () => applicationsApi.mine(), enabled: enabled("applications") }),
    savedJobs: useQuery({ queryKey: queryKeys.savedJobs, queryFn: applicationsApi.savedJobs, enabled: enabled("savedJobs") }),
    notifications: useQuery({ queryKey: queryKeys.notifications, queryFn: applicationsApi.notifications, enabled: enabled("notifications") }),
    notificationSummary: useQuery({ queryKey: ["notifications", "summary"], queryFn: applicationsApi.notificationSummary, enabled: enabled("notificationSummary") })
  };
}

export function useCandidateActions() {
  const client = useQueryClient();
  const notify = useNotificationStore((state) => state.notify);
  const failed = (error: unknown) => notify({ title: "Action failed", description: apiErrorMessage(error), intent: "error" });
  const complete = (title: string, description: string) => notify({ title, description, intent: "success" });
  return {
    updateProfile: useMutation({ mutationFn: profileApi.updateCandidate, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.profile }); complete("Profile updated", "Your latest profile details are now available."); }, onError: failed }),
    uploadAvatar: useMutation({ mutationFn: profileApi.uploadAvatar, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.profile }); complete("Avatar uploaded", "Your profile image was updated."); }, onError: failed }),
    uploadResume: useMutation({ mutationFn: profileApi.uploadResume, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.profile }); complete("Resume uploaded", "Your current resume is ready."); }, onError: failed }),
    upsertSkill: useMutation({ mutationFn: profileApi.upsertSkill, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.skills }); complete("Skill saved", "Your skills list was updated."); }, onError: failed }),
    deleteSkill: useMutation({ mutationFn: profileApi.deleteSkill, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.skills }), onError: failed }),
    createEducation: useMutation({ mutationFn: profileApi.createEducation, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.education }); complete("Education added", "Your profile now includes this qualification."); }, onError: failed }),
    createExperience: useMutation({ mutationFn: profileApi.createExperience, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.experience }); complete("Experience added", "Your work history was updated."); }, onError: failed }),
    apply: useMutation({ mutationFn: applicationsApi.apply, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.applications() }); complete("Application submitted", "You can track its progress from Applications."); }, onError: failed }),
    withdrawApplication: useMutation({ mutationFn: (id: string) => applicationsApi.updateStatus(id, { status: "withdrawn", message: "Withdrawn by candidate." }), onSuccess: async () => { await client.invalidateQueries({ queryKey: ["applications"] }); complete("Application withdrawn", "The application status was updated."); }, onError: failed }),
    saveJob: useMutation({ mutationFn: applicationsApi.saveJob, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.savedJobs }), onError: failed }),
    removeSavedJob: useMutation({ mutationFn: applicationsApi.removeSavedJob, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.savedJobs }); complete("Saved job removed", "The role was removed from your saved jobs."); }, onError: failed }),
    markNotificationRead: useMutation({ mutationFn: applicationsApi.markNotificationRead, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications }), onError: failed }),
    markAllNotificationsRead: useMutation({ mutationFn: applicationsApi.markAllNotificationsRead, onSuccess: async () => { await client.invalidateQueries({ queryKey: ["notifications"] }); complete("Notifications updated", "All notifications are marked as read."); }, onError: failed }),
    deleteNotification: useMutation({ mutationFn: applicationsApi.deleteNotification, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications }), onError: failed })
  };
}

export function useEmployerData(companyId?: string) {
  return {
    companies: useQuery({ queryKey: queryKeys.myCompanies, queryFn: companyApi.mine }),
    dashboard: useQuery({ queryKey: ["company", companyId, "dashboard"], queryFn: () => companyApi.dashboard(companyId as string), enabled: Boolean(companyId) }),
    jobs: useQuery({ queryKey: ["company", companyId, "jobs"], queryFn: () => jobsApi.companyJobs(companyId as string), enabled: Boolean(companyId) }),
    team: useQuery({ queryKey: ["company", companyId, "team"], queryFn: () => companyApi.team(companyId as string), enabled: Boolean(companyId) }),
    branches: useQuery({ queryKey: ["company", companyId, "branches"], queryFn: () => companyApi.branches(companyId as string), enabled: Boolean(companyId) }),
    departments: useQuery({ queryKey: ["company", companyId, "departments"], queryFn: () => companyApi.departments(companyId as string), enabled: Boolean(companyId) }),
    applications: useQuery({ queryKey: ["company", companyId, "applications"], queryFn: () => applicationsApi.inbox(companyId as string), enabled: Boolean(companyId) }),
    analytics: useQuery({ queryKey: ["company", companyId, "application-analytics"], queryFn: () => applicationsApi.analytics(companyId as string), enabled: Boolean(companyId) }),
    notifications: useQuery({ queryKey: queryKeys.notifications, queryFn: applicationsApi.notifications })
  };
}

export function useEmployerActions(companyId?: string) {
  const client = useQueryClient();
  const invalidateCompany = () => client.invalidateQueries({ queryKey: ["company", companyId] });
  return {
    registerCompany: useMutation({ mutationFn: companyApi.register, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.myCompanies }) }),
    updateCompany: useMutation({ mutationFn: (payload: Record<string, unknown>) => companyApi.update(companyId as string, payload), onSuccess: invalidateCompany }),
    uploadLogo: useMutation({ mutationFn: (file: File) => companyApi.uploadMedia(companyId as string, "logo", file), onSuccess: invalidateCompany }),
    uploadBanner: useMutation({ mutationFn: (file: File) => companyApi.uploadMedia(companyId as string, "banner", file), onSuccess: invalidateCompany }),
    inviteTeam: useMutation({ mutationFn: (payload: Record<string, unknown>) => companyApi.invite(companyId as string, payload), onSuccess: invalidateCompany }),
    createJob: useMutation({ mutationFn: jobsApi.create, onSuccess: invalidateCompany }),
    updateJob: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => jobsApi.update(id, payload), onSuccess: invalidateCompany }),
    duplicateJob: useMutation({ mutationFn: jobsApi.duplicate, onSuccess: invalidateCompany }),
    setJobStatus: useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => jobsApi.setStatus(id, status), onSuccess: invalidateCompany }),
    bulkJobs: useMutation({ mutationFn: jobsApi.bulk, onSuccess: invalidateCompany }),
    updateApplicationStatus: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => applicationsApi.updateStatus(id, payload), onSuccess: invalidateCompany }),
    createInterview: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => applicationsApi.createInterview(id, payload), onSuccess: invalidateCompany }),
    createOffer: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => applicationsApi.createOffer(id, payload), onSuccess: invalidateCompany }),
    addApplicationNote: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => applicationsApi.addNote(id, payload), onSuccess: invalidateCompany }),
    markNotificationRead: useMutation({ mutationFn: applicationsApi.markNotificationRead, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications }) }),
    markAllNotificationsRead: useMutation({ mutationFn: applicationsApi.markAllNotificationsRead, onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }) })
  };
}

export function useJobsSearch(query?: Record<string, string | number | boolean | null | undefined>, options?: { enabled?: boolean }) {
  return useQuery({ queryKey: queryKeys.jobs(query), queryFn: () => jobsApi.search(query), enabled: options?.enabled ?? true });
}

export function useCompaniesSearch(query?: Record<string, string | number | boolean | null | undefined>) {
  return useQuery({ queryKey: queryKeys.companies(query), queryFn: () => companyApi.search(query) });
}

export function useCompanyBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.company(slug),
    queryFn: () => companyApi.publicBySlug(slug),
    enabled: Boolean(slug),
    retry: (failureCount, error) => errorStatus(error) !== 404 && failureCount < 2
  });
}

export function useCompanyBranches(companyId?: string) {
  return useQuery({
    queryKey: ["company", companyId, "public-branches"],
    queryFn: () => companyApi.branches(companyId as string),
    enabled: Boolean(companyId)
  });
}

export function useJobBySlug(slug: string, initialData?: Awaited<ReturnType<typeof jobsApi.publicBySlug>>) {
  return useQuery({
    queryKey: queryKeys.job(slug),
    queryFn: () => jobsApi.publicBySlug(slug),
    enabled: Boolean(slug),
    initialData,
    retry: (failureCount, error) => errorStatus(error) !== 404 && failureCount < 2
  });
}

export function useGlobalSearch(query?: Record<string, string | number | boolean | null | undefined>) {
  return useQuery({ queryKey: queryKeys.globalSearch(query), queryFn: () => globalSearchApi.search(query ?? {}), enabled: Boolean(query?.keyword || query?.q) });
}

export type AdminDataOptions = Partial<Record<"dashboard" | "dashboardTrends" | "businessDashboard" | "marketplace" | "users" | "companies" | "jobs" | "applications" | "plans" | "cms" | "settings" | "audit" | "reports" | "tickets" | "seo" | "health", boolean>>;

export function useAdminData(query?: Record<string, string | number | boolean | null | undefined>, options: AdminDataOptions = {}) {
  const enabled = (key: keyof AdminDataOptions) => options[key] ?? true;
  return {
    dashboard: useQuery({ queryKey: queryKeys.adminDashboard, queryFn: adminApi.dashboard, enabled: enabled("dashboard") }),
    dashboardTrends: useQuery({ queryKey: ["admin", "dashboard", "trends", 30], queryFn: () => adminApi.dashboardTrends(30), enabled: enabled("dashboardTrends") }),
    businessDashboard: useQuery({ queryKey: queryKeys.adminBusinessDashboard, queryFn: adminApi.businessDashboard, enabled: enabled("businessDashboard") }),
    marketplace: useQuery({ queryKey: queryKeys.adminMarketplace, queryFn: adminApi.marketplace, enabled: enabled("marketplace") }),
    users: useQuery({ queryKey: queryKeys.adminUsers(query), queryFn: () => adminApi.users(query), enabled: enabled("users") }),
    companies: useQuery({ queryKey: ["admin", "companies", query], queryFn: () => adminApi.companies({ ...query, limit: query?.limit ?? 100 }), enabled: enabled("companies") }),
    jobs: useQuery({ queryKey: ["admin", "jobs", query], queryFn: () => adminApi.jobs({ ...query, limit: query?.limit ?? 100 }), enabled: enabled("jobs") }),
    applications: useQuery({ queryKey: ["admin", "applications", query], queryFn: () => adminApi.applications(query), enabled: enabled("applications") }),
    plans: useQuery({ queryKey: ["admin", "plans"], queryFn: adminApi.plans, enabled: enabled("plans") }),
    cms: useQuery({ queryKey: queryKeys.adminCms(query), queryFn: () => adminApi.cms(query), enabled: enabled("cms") }),
    settings: useQuery({ queryKey: ["admin", "settings"], queryFn: adminApi.settings, enabled: enabled("settings") }),
    audit: useQuery({ queryKey: ["admin", "audit", query], queryFn: () => adminApi.audit(query), enabled: enabled("audit") }),
    reports: useQuery({ queryKey: ["admin", "reports", query], queryFn: () => adminApi.reports(query), enabled: enabled("reports") }),
    tickets: useQuery({ queryKey: ["admin", "tickets", query], queryFn: () => adminApi.tickets(query), enabled: enabled("tickets") }),
    seo: useQuery({ queryKey: ["admin", "seo"], queryFn: adminApi.seoTemplates, enabled: enabled("seo") }),
    health: useQuery({ queryKey: queryKeys.adminHealth, queryFn: adminApi.systemHealth, enabled: enabled("health") })
  };
}

export function useAdminActions() {
  const client = useQueryClient();
  const notify = useNotificationStore((state) => state.notify);
  const refreshAdmin = () => client.invalidateQueries({ queryKey: ["admin"] });
  const failed = (error: unknown) => notify({ title: "Admin action failed", description: apiErrorMessage(error), intent: "error" });
  const completed = (description: string) => notify({ title: "Admin action completed", description, intent: "success" });
  return {
    suspendUser: useMutation({ mutationFn: adminApi.suspendUser, onSuccess: async () => { await refreshAdmin(); completed("The user was suspended."); }, onError: failed }),
    activateUser: useMutation({ mutationFn: adminApi.activateUser, onSuccess: async () => { await refreshAdmin(); completed("The user was activated."); }, onError: failed }),
    deleteUser: useMutation({ mutationFn: adminApi.deleteUser, onSuccess: async () => { await refreshAdmin(); completed("The user was deleted."); }, onError: failed }),
    resetPassword: useMutation({ mutationFn: adminApi.resetPassword, onSuccess: () => completed("Password reset instructions were created."), onError: failed }),
    assignRole: useMutation({ mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.assignRole(id, role), onSuccess: async () => { await refreshAdmin(); completed("The user role was updated."); }, onError: failed }),
    moderateCompany: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => adminApi.moderateCompany(id, payload), onSuccess: async () => { await refreshAdmin(); completed("The company status was updated."); }, onError: failed }),
    verifyCompany: useMutation({ mutationFn: (id: string) => companyApi.verify(id, { gst_status: "approved", cin_status: "approved", website_status: "approved", domain_email_status: "approved", manual_status: "approved" }), onSuccess: async () => { await refreshAdmin(); completed("The company verification was approved."); }, onError: failed }),
    moderateJob: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => adminApi.moderateJob(id, payload), onSuccess: async () => { await refreshAdmin(); completed("The job status was updated."); }, onError: failed }),
    setJobFlags: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: { is_featured: boolean; is_urgent: boolean } }) => adminApi.setJobFlags(id, payload), onSuccess: async () => { await refreshAdmin(); completed("The job flags were updated."); }, onError: failed }),
    bulkModerateJobs: useMutation({ mutationFn: ({ ids, status }: { ids: string[]; status: string }) => Promise.all(ids.map((id) => adminApi.moderateJob(id, { status }))), onSuccess: async () => { await refreshAdmin(); completed("The selected jobs were updated."); }, onError: failed }),
    bulkModerateCompanies: useMutation({ mutationFn: ({ ids, status }: { ids: string[]; status: string }) => Promise.all(ids.map((id) => adminApi.moderateCompany(id, { status }))), onSuccess: async () => { await refreshAdmin(); completed("The selected companies were updated."); }, onError: failed }),
    bulkVerifyCompanies: useMutation({ mutationFn: (ids: string[]) => Promise.all(ids.map((id) => companyApi.verify(id, { gst_status: "approved", cin_status: "approved", website_status: "approved", domain_email_status: "approved", manual_status: "approved" }))), onSuccess: async () => { await refreshAdmin(); completed("The selected companies were verified."); }, onError: failed }),
    bulkUsers: useMutation({
      mutationFn: ({ ids, action }: { ids: string[]; action: "activate" | "suspend" | "delete" | "reset" }) => Promise.all(ids.map((id) => action === "activate" ? adminApi.activateUser(id) : action === "suspend" ? adminApi.suspendUser(id) : action === "delete" ? adminApi.deleteUser(id) : adminApi.resetPassword(id))),
      onSuccess: async () => { await refreshAdmin(); completed("The selected users were updated."); },
      onError: failed
    }),
    quickPostJob: useMutation({
      mutationFn: adminApi.quickPostJob,
      onSuccess: () => {
        refreshAdmin();
        client.invalidateQueries({ queryKey: ["jobs"] });
        completed("The job was created successfully.");
      },
      onError: failed
    }),
    upsertPlan: useMutation({ mutationFn: adminApi.upsertPlan, onSuccess: async () => { await refreshAdmin(); completed("The subscription plan was saved."); }, onError: failed }),
    upsertCms: useMutation({ mutationFn: adminApi.upsertCms, onSuccess: async () => { await refreshAdmin(); completed("CMS content was saved."); }, onError: failed }),
    upsertSetting: useMutation({ mutationFn: adminApi.upsertSetting, onSuccess: async () => { await refreshAdmin(); completed("Platform settings were saved."); }, onError: failed }),
    createReport: useMutation({ mutationFn: adminApi.createReport, onSuccess: async () => { await refreshAdmin(); completed("The report request was created."); }, onError: failed }),
    createTicket: useMutation({ mutationFn: adminApi.createTicket, onSuccess: async () => { await refreshAdmin(); completed("The support ticket was created."); }, onError: failed }),
    upsertSeo: useMutation({ mutationFn: adminApi.upsertSeo, onSuccess: async () => { await refreshAdmin(); completed("SEO configuration was saved."); }, onError: failed })
  };
}

export function usePublishedContent(query?: Record<string, string | number | boolean | null | undefined>) {
  return useQuery({ queryKey: queryKeys.content(query), queryFn: () => contentApi.list(query) });
}

export function usePublishedContentEntry(type: string, slug: string) {
  return useQuery({ queryKey: queryKeys.contentEntry(type, slug), queryFn: () => contentApi.bySlug(type, slug), enabled: Boolean(type && slug) });
}

export function useHealthChecks() {
  return useQuery({ queryKey: queryKeys.health, queryFn: healthApi.health, refetchInterval: 30_000 });
}

export function useProfileEngine(profile: CandidateProfileEngineInput) {
  return useMemo(() => calculateProfileCompletion(profile), [profile]);
}

export function useJobRecommendations<T extends JobMatchInput & { id?: string; title?: string }>(candidate: CandidateProfileEngineInput, jobs: T[] = []) {
  return useMemo(() => recommendJobs(candidate, jobs), [candidate, jobs]);
}

export function useEmployerCandidateMatches<T extends CandidateProfileEngineInput & { id?: string; name?: string }>(job: JobMatchInput, candidates: T[] = []) {
  return useMemo(() => recommendCandidates(job, candidates), [job, candidates]);
}

export function useJobMatch(candidate: CandidateProfileEngineInput, job: JobMatchInput) {
  return useMemo(() => calculateJobMatch(candidate, job), [candidate, job]);
}

export function useSalaryEstimate(profile: CandidateProfileEngineInput & { role?: string; city?: string; companySize?: string }) {
  return useMemo(() => estimateSalary(profile), [profile]);
}

export function useProfileBuilder(profile: CandidateProfileEngineInput) {
  return useMemo(() => profileBuilderProgress(profile), [profile]);
}

export function useResumeParser(rawText: string) {
  return useMemo(() => parseResumeText(rawText), [rawText]);
}

export function useSmartJobRecommendations(candidate: CandidateProfileEngineInput, jobs: IntelligentJobInput[] = []) {
  return useMemo(() => buildSmartRecommendations(candidate, jobs), [candidate, jobs]);
}

export function useIntelligentJobMatch(candidate: CandidateProfileEngineInput, job: IntelligentJobInput) {
  return useMemo(() => intelligentJobMatch(candidate, job), [candidate, job]);
}

export function useSalaryCalculator(input: SalaryCalculatorInput) {
  return useMemo(() => salaryCalculator(input), [input]);
}

export function useEmployerHiringAnalytics(input: Parameters<typeof employerHiringAnalytics>[0]) {
  return useMemo(() => employerHiringAnalytics(input), [input]);
}

export function useWorkflowNextStage(current: string) {
  return useMemo(() => nextWorkflowStage(current), [current]);
}

export function useAutomationActions(trigger: AutomationTrigger) {
  return useMemo(() => automationActionsFor(trigger), [trigger]);
}

export function useRecruiterCalendarConflicts(events: CalendarEvent[] = []) {
  return useMemo(() => detectCalendarConflicts(events), [events]);
}

export function useDocumentCompletion(requirements: DocumentRequirement[] = [], submissions: DocumentSubmission[] = []) {
  return useMemo(() => documentCompletion(requirements, submissions), [requirements, submissions]);
}

export function useSmartFollowUps(input: Parameters<typeof smartFollowUps>[0]) {
  return useMemo(() => smartFollowUps(input), [input]);
}

export function useAutomationAnalytics(input: Parameters<typeof automationAnalytics>[0]) {
  return useMemo(() => automationAnalytics(input), [input]);
}
