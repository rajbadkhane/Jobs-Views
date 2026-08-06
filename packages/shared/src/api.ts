import type { AxiosInstance, AxiosRequestConfig } from "axios";

import { api } from "./index";

type SuccessEnvelope<T> = {
  success: true;
  message?: string;
  data: T;
};

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

function params(input?: QueryParams) {
  if (!input) return undefined;
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

async function request<T>(client: AxiosInstance, config: AxiosRequestConfig) {
  const response = await client.request<SuccessEnvelope<T>>(config);
  return response.data.data;
}

function formData(field: string, file: File, extra?: Record<string, string | Blob>) {
  const body = new FormData();
  body.append(field, file);
  Object.entries(extra ?? {}).forEach(([key, value]) => body.append(key, value));
  return body;
}

export type AuthUser = {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EMPLOYER" | "JOB_SEEKER";
  is_verified?: boolean;
  permissions?: string[];
};

export type AuthResult = {
  user: AuthUser;
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  verification_token?: string;
};

export type PublicJobSkill = {
  id?: string;
  name: string;
  requirement_type?: "required" | "preferred" | string;
  level?: string;
  years_experience?: number;
};

export type PublicJob = {
  id: string;
  company_id: string;
  company_name: string;
  company_slug?: string;
  company_logo_url?: string;
  job_type_id?: number;
  job_type?: string;
  job_types?: string[];
  job_types_list?: string[];
  title: string;
  slug: string;
  short_description?: string;
  full_description: string;
  responsibilities?: string[];
  requirements?: string[];
  qualifications?: string[];
  benefits?: string[];
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  salary_period?: "hourly" | "daily" | "monthly" | "annual";
  salary_basis?: "gross" | "take_home" | "ctc";
  experience_min?: number;
  experience_max?: number;
  education?: string;
  openings?: number;
  expiry_date?: string;
  work_mode?: string;
  country?: string;
  state?: string;
  city?: string;
  status?: string;
  visibility?: string;
  is_featured?: boolean;
  is_urgent?: boolean;
  canonical_url?: string;
  meta_title?: string;
  meta_description?: string;
  open_graph?: Record<string, unknown>;
  json_ld?: Record<string, unknown>;
  skills?: PublicJobSkill[];
  notice_period_required?: string;
  recruiter_response_time?: string;
  is_direct_employer?: boolean;
  ai_match_score?: number;
  salary_benchmark_tag?: string;
  applications_count?: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type PublicCompany = {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
  about?: string;
  mission?: string;
  vision?: string;
  culture?: string;
  size_range?: string;
  industry?: string;
  founded_year?: number;
  headquarters?: string;
  social_links?: Record<string, unknown>;
  benefits?: string[];
  gallery?: string[];
  status?: string;
  is_verified?: boolean;
  verified_badge?: boolean;
  culture_rating?: number;
  work_life_balance_rating?: number;
  career_growth_rating?: number;
  recruiter_velocity_badge?: string;
  is_direct_employer?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CandidatePlan = {
  id: number;
  name: "Basic" | "Premium" | string;
  slug: "basic" | "premium" | string;
  price_paise: number;
  currency: string;
  duration_days: number;
  application_limit?: number | null;
  entitlements: Record<string, unknown>;
};

export type CandidateEntitlements = Record<string, unknown>;

export type CandidateSubscription = {
  active: boolean;
  status: "none" | "active" | "expired" | "cancelled" | "refunded" | string;
  plan?: CandidatePlan;
  starts_at?: string;
  ends_at?: string;
  entitlements: CandidateEntitlements;
  applications_used: number;
  applications_remaining?: number | null;
};

export type CandidateCheckout = {
  checkout_id: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount_paise: number;
  currency: string;
  plan_slug: string;
  plan_name: string;
  email: string;
  next: string;
};

export type CandidatePaymentResult = {
  status: string;
  next: string;
  subscription: CandidateSubscription;
};

export type RazorpayOrder = {
  order_id: string;
  amount: number;
  currency: string;
};

export type RazorpayPaymentVerification = {
  verified: boolean;
  razorpay_order_id: string;
  razorpay_payment_id: string;
};

export type SalaryConfidence = "low" | "medium" | "high";
export type SalarySource = { name: string; publisher: string; url: string; published_on?: string; methodology: string; last_reviewed_at?: string };
export type SalaryBenchmark = {
  role: string;
  role_slug: string;
  geography: string;
  geography_level: "city" | "state" | "remote" | "national";
  p25_annual?: number;
  median_annual?: number;
  p75_annual?: number;
  mean_annual?: number;
  sample_size?: number;
  effective_date: string;
  confidence: SalaryConfidence;
  salary_basis: string;
  source: SalarySource;
  comparable_cities: { name: string; slug: string }[];
};
export type SalaryEstimate = { available: boolean; message: string; requested_role: string; requested_city: string; display: "monthly" | "annual"; benchmark?: SalaryBenchmark; stale: boolean; methodology_url: string };
export type SalaryEstimateRequest = { role: string; city: string; experience: number; work_mode?: "remote" | "hybrid" | "on_site" | ""; education?: string; shift?: string; skills?: string[]; display?: "monthly" | "annual" };

export type ResumeTemplateSlug = "ats-classic" | "student-fresher" | "frontline-skilled" | "modern-professional" | "technical-portfolio";
export type ResumeDocument = { id: string; name: string; template_slug: ResumeTemplateSlug; content: Record<string, unknown>; section_order: string[]; style: Record<string, unknown>; is_primary: boolean; last_version: number; created_at: string; updated_at: string };
export type ResumeDocumentInput = Pick<ResumeDocument, "name" | "template_slug" | "content" | "section_order" | "style">;
export type ResumeDocumentVersion = Omit<ResumeDocument, "id" | "is_primary" | "last_version" | "updated_at"> & { version: number };

export const authApi = {
  register: (payload: { email: string; password: string; role: "EMPLOYER" | "JOB_SEEKER"; first_name?: string; last_name?: string; mobile?: string; company_name?: string; website?: string; gst_number?: string; cin_number?: string }) =>
    request<AuthResult>(api, { method: "POST", url: "/auth/register", data: payload }),
  login: (payload: { email: string; password: string }) => request<AuthResult>(api, { method: "POST", url: "/auth/login", data: payload }),
  logout: () => request<null>(api, { method: "POST", url: "/auth/logout" }),
  logoutAll: () => request<null>(api, { method: "POST", url: "/auth/logout-all" }),
  refresh: () => request<AuthResult>(api, { method: "POST", url: "/auth/refresh" }),
  forgotPassword: (payload: { email: string }) => request<{ reset_token?: string } | null>(api, { method: "POST", url: "/auth/forgot-password", data: payload }),
  resetPassword: (payload: { token: string; password: string }) => request<null>(api, { method: "POST", url: "/auth/reset-password", data: payload }),
  verifyEmail: (token: string) => request<null>(api, { method: "GET", url: "/auth/verify", params: { token } }),
  verifyRegistrationOtp: (payload: { email: string; otp: string }) => request<null>(api, { method: "POST", url: "/auth/verify-registration-otp", data: payload }),
  resendRegistrationOtp: (payload: { email: string }) => request<null>(api, { method: "POST", url: "/auth/resend-registration-otp", data: payload }),
  me: () => request<AuthUser & { permissions: string[] }>(api, { method: "GET", url: "/users/me" })
};

export const userApi = {
  me: () => request<unknown>(api, { method: "GET", url: "/users/me" }),
  updateMe: (payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: "/users/me", data: payload }),
  sessions: () => request<{ items: unknown[] }>(api, { method: "GET", url: "/users/me/sessions" }),
  devices: () => request<{ items: unknown[] }>(api, { method: "GET", url: "/users/me/devices" }),
  loginHistory: () => request<{ items: unknown[] }>(api, { method: "GET", url: "/users/me/login-history" }),
  auditTrail: () => request<{ items: unknown[] }>(api, { method: "GET", url: "/users/me/audit-trail" })
};

export const profileApi = {
  me: () => request<unknown>(api, { method: "GET", url: "/profiles/me" }),
  completion: () => request<{ score: number; strength: string; missing_fields: string[] }>(api, { method: "GET", url: "/profiles/completion" }),
  updateCandidate: (payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: "/profiles/candidate", data: payload }),
  updateEmployer: (payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: "/profiles/employer", data: payload }),
  updateAdmin: (payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: "/profiles/admin", data: payload }),
  deleteMe: () => request<null>(api, { method: "DELETE", url: "/profiles/me" }),
  uploadAvatar: (file: File) => request<unknown>(api, { method: "POST", url: "/profiles/avatar", data: formData("file", file) }),
  uploadResume: (file: File) => request<unknown>(api, { method: "POST", url: "/profiles/resume", data: formData("file", file) }),
  skills: () => request<unknown[]>(api, { method: "GET", url: "/profiles/skills" }),
  upsertSkill: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/profiles/skills", data: payload }),
  deleteSkill: (id: string) => request<null>(api, { method: "DELETE", url: `/profiles/skills/${id}` }),
  education: () => request<unknown[]>(api, { method: "GET", url: "/profiles/education" }),
  createEducation: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/profiles/education", data: payload }),
  deleteEducation: (id: string) => request<null>(api, { method: "DELETE", url: `/profiles/education/${id}` }),
  experience: () => request<unknown[]>(api, { method: "GET", url: "/profiles/experience" }),
  createExperience: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/profiles/experience", data: payload }),
  deleteExperience: (id: string) => request<null>(api, { method: "DELETE", url: `/profiles/experience/${id}` }),
  socialLinks: () => request<unknown>(api, { method: "GET", url: "/profiles/social-links" }),
  updateSocialLinks: (payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: "/profiles/social-links", data: payload }),
  preferences: () => request<unknown>(api, { method: "GET", url: "/profiles/notification-preferences" }),
  updatePreferences: (payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: "/profiles/notification-preferences", data: payload }),
  settings: () => request<unknown>(api, { method: "GET", url: "/profiles/settings" }),
  updateSettings: (payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: "/profiles/settings", data: payload }),
  search: (query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: "/profiles/search", params: params(query) }),
  publicCandidate: (id: string) => request<unknown>(api, { method: "GET", url: `/profiles/public/${id}` }),
  resumeDocuments: () => request<{ items: ResumeDocument[] }>(api, { method: "GET", url: "/profiles/resume-documents" }),
  createResumeDocument: (payload: ResumeDocumentInput) => request<ResumeDocument>(api, { method: "POST", url: "/profiles/resume-documents", data: payload }),
  resumeDocument: (id: string) => request<ResumeDocument>(api, { method: "GET", url: `/profiles/resume-documents/${id}` }),
  updateResumeDocument: (id: string, payload: ResumeDocumentInput) => request<ResumeDocument>(api, { method: "PATCH", url: `/profiles/resume-documents/${id}`, data: payload }),
  deleteResumeDocument: (id: string) => request<null>(api, { method: "DELETE", url: `/profiles/resume-documents/${id}` }),
  duplicateResumeDocument: (id: string) => request<ResumeDocument>(api, { method: "POST", url: `/profiles/resume-documents/${id}/duplicate` }),
  resumeVersions: (id: string) => request<{ items: ResumeDocumentVersion[] }>(api, { method: "GET", url: `/profiles/resume-documents/${id}/versions` }),
  restoreResumeVersion: (id: string, version: number) => request<ResumeDocument>(api, { method: "POST", url: `/profiles/resume-documents/${id}/versions/${version}/restore` })
};

export const salaryApi = {
  options: () => request<{ roles: { name: string; slug: string }[]; locations: { name: string; slug: string }[]; work_modes: { name: string; slug: string }[]; periods: { name: string; slug: string }[] }>(api, { method: "GET", url: "/salary/options" }),
  estimate: (payload: SalaryEstimateRequest) => request<SalaryEstimate>(api, { method: "POST", url: "/salary/estimate", data: payload }),
  benchmark: (role: string, city: string) => request<SalaryEstimate>(api, { method: "GET", url: `/salary/benchmarks/${encodeURIComponent(role)}/${encodeURIComponent(city)}` })
};

export const companyApi = {
  search: (query?: QueryParams) => request<{ items: PublicCompany[] } | PublicCompany[]>(api, { method: "GET", url: "/companies", params: params(query) }),
  publicBySlug: (slug: string) => request<PublicCompany>(api, { method: "GET", url: `/companies/slug/${encodeURIComponent(slug)}` }),
  register: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/companies", data: payload }),
  mine: () => request<unknown[]>(api, { method: "GET", url: "/companies/me" }),
  update: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: `/companies/${id}`, data: payload }),
  delete: (id: string) => request<null>(api, { method: "DELETE", url: `/companies/${id}` }),
  team: (id: string) => request<unknown[]>(api, { method: "GET", url: `/companies/${id}/team` }),
  invite: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: `/companies/${id}/team/invite`, data: payload }),
  branches: (id: string) => request<unknown[]>(api, { method: "GET", url: `/companies/${id}/branches` }),
  createBranch: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: `/companies/${id}/branches`, data: payload }),
  deleteBranch: (id: string, childId: string) => request<null>(api, { method: "DELETE", url: `/companies/${id}/branches/${childId}` }),
  departments: (id: string) => request<unknown[]>(api, { method: "GET", url: `/companies/${id}/departments` }),
  createDepartment: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: `/companies/${id}/departments`, data: payload }),
  deleteDepartment: (id: string, childId: string) => request<null>(api, { method: "DELETE", url: `/companies/${id}/departments/${childId}` }),
  dashboard: (id: string) => request<unknown>(api, { method: "GET", url: `/companies/${id}/dashboard` }),
  settings: (id: string) => request<unknown>(api, { method: "GET", url: `/companies/${id}/settings` }),
  updateSettings: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: `/companies/${id}/settings`, data: payload }),
  uploadMedia: (id: string, type: "logo" | "banner" | "gallery" | "document", file: File) =>
    request<unknown>(api, { method: "POST", url: `/companies/${id}/media/${type}`, data: formData("file", file) }),
  setStatus: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: `/companies/${id}/status`, data: payload }),
  verify: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: `/companies/${id}/verification`, data: payload })
};

export const jobsApi = {
  search: (query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: "/jobs", params: params(query) }),
  taxonomies: () => request<unknown>(api, { method: "GET", url: "/jobs/taxonomies" }),
  publicBySlug: (slug: string) => request<PublicJob>(api, { method: "GET", url: `/jobs/slug/${encodeURIComponent(slug)}` }),
  seo: (slug: string) => request<unknown>(api, { method: "GET", url: `/jobs/${slug}/seo` }),
  structuredData: (slug: string) => request<unknown>(api, { method: "GET", url: `/jobs/${slug}/structured-data` }),
  create: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/jobs", data: payload }),
  companyJobs: (companyId: string, query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: `/jobs/company/${companyId}`, params: params(query) }),
  update: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: `/jobs/${id}`, data: payload }),
  delete: (id: string) => request<null>(api, { method: "DELETE", url: `/jobs/${id}` }),
  duplicate: (id: string) => request<unknown>(api, { method: "POST", url: `/jobs/${id}/duplicate` }),
  setStatus: (id: string, status: string) => request<unknown>(api, { method: "PATCH", url: `/jobs/${id}/status`, data: { status } }),
  bulk: (payload: { job_ids: string[]; action: "publish" | "pause" | "delete" }) => request<unknown>(api, { method: "POST", url: "/jobs/bulk", data: payload }),
  save: (id: string) => request<unknown>(api, { method: "POST", url: `/jobs/${id}/save` }),
  share: (id: string) => request<unknown>(api, { method: "POST", url: `/jobs/${id}/share` }),
  analytics: (id: string) => request<unknown>(api, { method: "GET", url: `/jobs/${id}/analytics` }),
  createTaxonomy: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/jobs/taxonomies", data: payload })
};

export const applicationsApi = {
  apply: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/applications", data: payload }),
  mine: (query?: QueryParams) => request<unknown>(api, { method: "GET", url: "/applications/me", params: params(query) }),
  inbox: (companyId: string, query?: QueryParams) => request<unknown>(api, { method: "GET", url: `/applications/inbox/${companyId}`, params: params(query) }),
  updateStatus: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: `/applications/${id}/status`, data: payload }),
  bulkStatus: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/applications/bulk/status", data: payload }),
  timeline: (id: string) => request<unknown[]>(api, { method: "GET", url: `/applications/${id}/timeline` }),
  notes: (id: string) => request<unknown[]>(api, { method: "GET", url: `/applications/${id}/notes` }),
  addNote: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: `/applications/${id}/notes`, data: payload }),
  interviews: (id: string) => request<unknown[]>(api, { method: "GET", url: `/applications/${id}/interviews` }),
  createInterview: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: `/applications/${id}/interviews`, data: payload }),
  offers: (id: string) => request<unknown[]>(api, { method: "GET", url: `/applications/${id}/offers` }),
  createOffer: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: `/applications/${id}/offers`, data: payload }),
  analytics: (companyId: string) => request<unknown>(api, { method: "GET", url: `/applications/analytics/${companyId}` }),
  notifications: () => request<unknown[]>(api, { method: "GET", url: "/applications/notifications" }),
  notificationSummary: () => request<{ unread: number }>(api, { method: "GET", url: "/applications/notifications/summary" }),
  markNotificationRead: (id: string) => request<null>(api, { method: "PATCH", url: `/applications/notifications/${id}/read` }),
  markAllNotificationsRead: () => request<null>(api, { method: "PATCH", url: "/applications/notifications/read-all" }),
  deleteNotification: (id: string) => request<null>(api, { method: "DELETE", url: `/applications/notifications/${id}` }),
  savedJobs: () => request<unknown[]>(api, { method: "GET", url: "/saved-jobs" }),
  saveJob: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/saved-jobs", data: payload }),
  removeSavedJob: (jobId: string) => request<null>(api, { method: "DELETE", url: `/saved-jobs/${jobId}` })
};

export const adminApi = {
  dashboard: () => request<unknown>(api, { method: "GET", url: "/admin/dashboard" }),
  dashboardTrends: (days = 30) => request<unknown>(api, { method: "GET", url: "/admin/dashboard/trends", params: { days } }),
  businessDashboard: () => request<unknown>(api, { method: "GET", url: "/admin/business-dashboard" }),
  marketplace: () => request<unknown>(api, { method: "GET", url: "/admin/marketplace" }),
  users: (query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: "/admin/users", params: params(query) }),
  companies: (query?: QueryParams) => request<{ items: PublicCompany[]; page: number; limit: number; total: number }>(api, { method: "GET", url: "/admin/companies", params: params(query) }),
  jobs: (query?: QueryParams) => request<{ items: PublicJob[]; page: number; limit: number; total: number }>(api, { method: "GET", url: "/admin/jobs", params: params(query) }),
  suspendUser: (id: string) => request<unknown>(api, { method: "PATCH", url: `/admin/users/${id}/suspend` }),
  activateUser: (id: string) => request<unknown>(api, { method: "PATCH", url: `/admin/users/${id}/activate` }),
  deleteUser: (id: string) => request<null>(api, { method: "DELETE", url: `/admin/users/${id}` }),
  resetPassword: (id: string) => request<unknown>(api, { method: "POST", url: `/admin/users/${id}/reset-password` }),
  assignRole: (id: string, role: string) => request<unknown>(api, { method: "PATCH", url: `/admin/users/${id}/roles`, data: { role } }),
  moderateCompany: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: `/admin/companies/${id}/status`, data: payload }),
  moderateJob: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: `/admin/jobs/${id}/status`, data: payload }),
  setJobFlags: (id: string, payload: Record<string, unknown>) => request<unknown>(api, { method: "PATCH", url: `/admin/jobs/${id}/flags`, data: payload }),
  quickPostJob: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/admin/jobs/quick-post", data: payload }),
  applications: (query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: "/admin/applications", params: params(query) }),
  plans: () => request<unknown[]>(api, { method: "GET", url: "/admin/plans" }),
  upsertPlan: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/admin/plans", data: payload }),
  cms: (query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: "/admin/cms", params: params(query) }),
  upsertCms: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/admin/cms", data: payload }),
  settings: () => request<unknown[]>(api, { method: "GET", url: "/admin/settings" }),
  upsertSetting: (payload: Record<string, unknown>) => request<unknown>(api, { method: "PUT", url: "/admin/settings", data: payload }),
  audit: (query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: "/admin/audit-logs", params: params(query) }),
  reports: (query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: "/admin/reports", params: params(query) }),
  createReport: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/admin/reports", data: payload }),
  tickets: (query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: "/admin/support/tickets", params: params(query) }),
  createTicket: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/admin/support/tickets", data: payload }),
  seoTemplates: () => request<unknown[]>(api, { method: "GET", url: "/admin/seo/templates" }),
  upsertSeo: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/admin/seo/templates", data: payload }),
  systemHealth: () => request<unknown>(api, { method: "GET", url: "/admin/system-health" }),
  salarySources: () => request<{ items: SalarySource[] }>(api, { method: "GET", url: "/admin/salary/sources" }),
  previewSalaryImport: (payload: Record<string, unknown>) => request<unknown>(api, { method: "POST", url: "/admin/salary/imports/preview", data: payload }),
  commitSalaryImport: (id: string) => request<unknown>(api, { method: "POST", url: `/admin/salary/imports/${id}/commit` })
};

export type Advertisement = {
  id: string;
  title: string;
  image_url: string;
  link_url?: string | null;
  alt_text?: string | null;
  placement: string;
  is_active: boolean;
  sort_order: number;
  starts_at?: string | null;
  ends_at?: string | null;
  created_by_email?: string | null;
  created_at: string;
  updated_at: string;
};

export const advertisementsApi = {
  list: () => request<{ items: Advertisement[]; total: number }>(api, { method: "GET", url: "/admin/advertisements" }),
  create: (file: File, fields: { title: string; link_url?: string; alt_text?: string; placement?: string; sort_order?: number }) =>
    request<Advertisement>(api, {
      method: "POST",
      url: "/admin/advertisements",
      data: formData("image", file, {
        title: fields.title,
        link_url: fields.link_url ?? "",
        alt_text: fields.alt_text ?? "",
        placement: fields.placement ?? "homepage_hero",
        sort_order: String(fields.sort_order ?? 0)
      })
    }),
  update: (id: string, payload: Partial<Pick<Advertisement, "title" | "link_url" | "alt_text" | "placement" | "is_active" | "sort_order" | "starts_at" | "ends_at">>) =>
    request<Advertisement>(api, { method: "PATCH", url: `/admin/advertisements/${id}`, data: payload }),
  remove: (id: string) => request<null>(api, { method: "DELETE", url: `/admin/advertisements/${id}` })
};

export const subscriptionApi = {
  plans: () => request<{ items: CandidatePlan[] }>(api, { method: "GET", url: "/subscriptions/plans" }),
  me: () => request<CandidateSubscription>(api, { method: "GET", url: "/subscriptions/me" }),
  startOtp: (payload: { plan_slug: string; next?: string }) =>
    request<{ checkout_id: string; email_masked: string; plan_slug: string; expires_at: string }>(api, { method: "POST", url: "/subscriptions/otp/start", data: payload }),
  verifyOtp: (payload: { checkout_id: string; otp: string }) =>
    request<CandidateCheckout>(api, { method: "POST", url: "/subscriptions/otp/verify", data: payload }),
  startCheckout: (payload: { plan_slug: string; next?: string }) =>
    request<CandidateCheckout>(api, { method: "POST", url: "/subscriptions/checkout", data: payload }),
  verifyPayment: (payload: { checkout_id: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    request<CandidatePaymentResult>(api, { method: "POST", url: "/subscriptions/payment/verify", data: payload }),
  order: (checkoutId: string) => request<{ checkout_id: string; status: string; next: string }>(api, { method: "GET", url: `/subscriptions/orders/${checkoutId}` }),
  support: (payload: { subject: string; message: string }) => request<{ id: string; status: string; priority: string }>(api, { method: "POST", url: "/subscriptions/support", data: payload })
};

export const razorpayApi = {
  createOrder: (payload: { amount: number; currency?: string; receipt?: string }) =>
    request<RazorpayOrder>(api, { method: "POST", url: "/create-order", data: payload }),
  verifyPayment: (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    request<RazorpayPaymentVerification>(api, { method: "POST", url: "/verify-payment", data: payload })
};

export const contentApi = {
  list: (query?: QueryParams) => request<unknown[]>(api, { method: "GET", url: "/content", params: params(query) }),
  bySlug: (type: string, slug: string) => request<unknown>(api, { method: "GET", url: `/content/${type}/${slug}` }),
  advertisements: (placement = "homepage_hero") =>
    request<{ items: Advertisement[] }>(api, { method: "GET", url: "/content/advertisements", params: { placement } })
};

export const healthApi = {
  health: () => request<unknown>(api, { method: "GET", url: "/health" }),
  ready: () => request<unknown>(api, { method: "GET", url: "/ready" }),
  live: () => request<unknown>(api, { method: "GET", url: "/live" })
};

export const globalSearchApi = {
  search: async (query: QueryParams) => {
    const [jobs, companies, candidates, content] = await Promise.all([
      jobsApi.search(query),
      companyApi.search(query),
      profileApi.search(query),
      contentApi.list(query)
    ]);
    return { jobs, companies, candidates, content };
  }
};
