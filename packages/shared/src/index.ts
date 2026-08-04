import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type * as React from "react";
import { create } from "zustand";
import { z } from "zod";

import { appConfig } from "@career-os/config";
import type { ApiFailure, AuthTokens, ThemeMode, ToastMessage, UploadPurpose, User } from "@career-os/types";
import { createId } from "@career-os/utils";

const ACCESS_TOKEN_KEY = "jobsview.access_token";
const REFRESH_TOKEN_KEY = "jobsview.refresh_token";

type LogLevel = "debug" | "info" | "warn" | "error";
type TelemetryPayload = Record<string, unknown>;

function shouldSample() {
  return Math.random() <= Math.max(0, Math.min(appConfig.monitoring.sampleRate, 1));
}

function sendMonitoringEvent(type: string, payload: TelemetryPayload) {
  if (typeof window === "undefined" || !appConfig.monitoring.endpoint || !shouldSample()) return;
  const body = JSON.stringify({
    type,
    payload,
    release: appConfig.monitoring.release,
    environment: appConfig.monitoring.environment,
    timestamp: new Date().toISOString(),
    path: window.location.pathname
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(appConfig.monitoring.endpoint, new Blob([body], { type: "application/json" }));
    return;
  }
  fetch(appConfig.monitoring.endpoint, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
}

export const logger = {
  debug: (message: string, context?: TelemetryPayload) => {
    if (process.env.NODE_ENV !== "production") console.debug(message, context ?? "");
  },
  info: (message: string, context?: TelemetryPayload) => {
    if (process.env.NODE_ENV !== "production") console.info(message, context ?? "");
    sendMonitoringEvent("log.info", { message, ...context });
  },
  warn: (message: string, context?: TelemetryPayload) => {
    if (process.env.NODE_ENV !== "production") console.warn(message, context ?? "");
    sendMonitoringEvent("log.warn", { message, ...context });
  },
  error: (message: string, context?: TelemetryPayload) => {
    if (process.env.NODE_ENV !== "production") console.error(message, context ?? "");
    sendMonitoringEvent("log.error", { message, ...context });
  }
} satisfies Record<LogLevel, (message: string, context?: TelemetryPayload) => void>;

export function trackEvent(name: string, payload: TelemetryPayload = {}) {
  sendMonitoringEvent("event", { name, ...payload });
}

export function reportPerformanceMetric(metric: { name: string; value: number; id?: string; rating?: string; label?: string }) {
  sendMonitoringEvent("web-vital", metric);
}

export function apiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiFailure | undefined;
    if (typeof data?.error === "string") return data.error;
    if (data?.error && typeof data.error === "object" && "message" in data.error) return String(data.error.message);
    if (error.code === "ECONNABORTED") return "The network request timed out. Please retry.";
    if (!error.response) return "Network unavailable. Check your connection and retry.";
    if (error.response.status === 429) return "Too many requests. Please wait a moment and retry.";
    if (error.response.status === 403) return "You do not have permission to perform this action.";
    if (error.response.status >= 500) return "Jobs View is temporarily unavailable. Please retry shortly.";
  }
  if (error instanceof Error) return error.message;
  return "Unexpected error. Please retry.";
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Enter your full name."),
  mobile: z.string().trim().min(8, "Enter a valid mobile number.").optional().or(z.literal("")),
  confirmPassword: z.string().min(8, "Confirm your password."),
  role: z.enum(["EMPLOYER", "JOB_SEEKER"]).default("JOB_SEEKER"),
  companyName: z.string().trim().optional(),
  website: z.string().trim().url("Enter a valid website URL.").optional().or(z.literal("")),
  gstNumber: z.string().trim().optional(),
  cinNumber: z.string().trim().optional()
}).superRefine((value, ctx) => {
  if (value.password !== value.confirmPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmPassword"], message: "Passwords must match" });
  }
  if (value.role === "EMPLOYER" && !value.companyName?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "Company name is required" });
  }
});

export const emailSchema = z.object({ email: z.string().email() });

export const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8)
});

export const uploadRules: Record<UploadPurpose, { accept: string[]; maxBytes: number }> = {
  avatar: { accept: ["image/jpeg", "image/png", "image/webp"], maxBytes: 2_097_152 },
  resume: {
    accept: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ],
    maxBytes: 10_485_760
  },
  logo: { accept: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"], maxBytes: 2_097_152 },
  banner: { accept: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5_242_880 },
  gallery: { accept: ["image/jpeg", "image/png", "image/webp"], maxBytes: 10_485_760 }
};

export type AuthState = {
  user: User | null;
  tokens: AuthTokens | null;
  hydrated: boolean;
  setSession: (user: User | null, tokens?: AuthTokens | null) => void;
  clearSession: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  hydrated: false,
  setSession: (user, tokens = null) => {
    let activeTokens = tokens;
    if (typeof window !== "undefined") {
      if (tokens) {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        if (tokens.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      } else if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
        activeTokens = {
          accessToken: localStorage.getItem(ACCESS_TOKEN_KEY)!,
          refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined
        };
      }
    }
    set({ user, tokens: activeTokens });
  },
  clearSession: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    set({ user: null, tokens: null });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      set({
        tokens: accessToken ? { accessToken, refreshToken: refreshToken ?? undefined } : null,
        hydrated: true
      });
  }
}));

export const useThemeStore = create<{
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  hydrate: () => void;
}>((set) => ({
  mode: "system",
  setMode: (mode) => {
    if (typeof window !== "undefined") localStorage.setItem("jobsview.theme", mode);
    set({ mode });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const mode = localStorage.getItem("jobsview.theme") as ThemeMode | null;
    if (mode) set({ mode });
  }
}));

export const useNotificationStore = create<{
  items: ToastMessage[];
  notify: (toast: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}>((set) => ({
  items: [],
  notify: (toast) => set((state) => ({ items: [...state.items, { id: createId("toast"), ...toast }] })),
  dismiss: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
}));

export const usePreferenceStore = create<{
  language: string;
  timezone: string;
  setPreference: (key: "language" | "timezone", value: string) => void;
}>((set) => ({
  language: "en",
  timezone: "Asia/Calcutta",
  setPreference: (key, value) => set({ [key]: value })
}));

export const useCompanyStore = create<{
  companyId: string | null;
  setCompanyId: (companyId: string | null) => void;
}>((set) => ({
  companyId: null,
  setCompanyId: (companyId) => set({ companyId })
}));

export function createApiClient(baseURL = appConfig.apiBaseUrl): AxiosInstance {
  const client = axios.create({ baseURL, timeout: 15_000, withCredentials: true });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    config.headers["X-Request-ID"] = createId("req");
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiFailure>) => {
      const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean; _attempt?: number }) | undefined;
      const status = error.response?.status;
      const method = original?.method?.toUpperCase();
      const canRetry = Boolean(original && method === "GET" && (!status || status >= 500) && (original._attempt ?? 0) < 2);
      if (canRetry && original) {
        const attempt = (original._attempt ?? 0) + 1;
        original._attempt = attempt;
        await new Promise((resolve) => setTimeout(resolve, attempt * 400));
        return client(original);
        }
        const isAuthEndpoint = typeof original?.url === "string" && original.url.startsWith("/auth/");
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
        if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint && refreshToken) {
          original._retry = true;
          try {
            const refresh = await axios.post(
              `${baseURL}/auth/refresh`,
              { refresh_token: refreshToken },
              {
                withCredentials: true,
                timeout: 10_000,
                headers: { "X-Refresh-Token": refreshToken }
              }
            );
            const data = refresh.data?.data;
            if (typeof window !== "undefined" && data?.access_token) localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
            if (typeof window !== "undefined" && data?.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
            return client(original);
          } catch (refreshError) {
            if (typeof window !== "undefined") {
              localStorage.removeItem(ACCESS_TOKEN_KEY);
              localStorage.removeItem(REFRESH_TOKEN_KEY);
              window.dispatchEvent(new CustomEvent("jobsview:session-expired"));
            }
            logger.warn("Session refresh failed", { message: apiErrorMessage(refreshError) });
          }
        } else if (error.response?.status === 401 && !refreshToken && typeof window !== "undefined") {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      logger.warn("API request failed", { status, url: original?.url, method, message: apiErrorMessage(error) });
      return Promise.reject(error);
    }
  );

  return client;
}

export const api = createApiClient();

export function validateUpload(file: File, purpose: UploadPurpose) {
  const rule = uploadRules[purpose];
  if (!rule.accept.includes(file.type)) {
    return `Unsupported file type. Allowed: ${rule.accept.join(", ")}`;
  }
  if (file.size > rule.maxBytes) {
    return "File is larger than the allowed limit.";
  }
  return null;
}

export function buildMetadata(title: string, description: string, path = "/", image = "/images/home-hero-india-careers.png") {
  const url = new URL(path, appConfig.siteUrl).toString();
  const imageUrl = new URL(image, appConfig.siteUrl).toString();
  return {
    title,
    description,
    applicationName: "Jobs View",
    keywords: [
      "Jobs View",
      "jobs in India",
      "career platform",
      "verified companies",
      "job search",
      "recruitment software"
    ],
    authors: [{ name: "Jobs View" }],
    creator: "Jobs View",
    publisher: "Jobs View",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large" as const,
        "max-video-preview": -1
      }
    },
    alternates: {
      canonical: url,
      languages: {
        "en-IN": url,
        "x-default": url
      }
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Jobs View",
      locale: "en_IN",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export function jsonLd(type: string, payload: Record<string, unknown>) {
  return { "@context": "https://schema.org", "@type": type, ...payload };
}

export function websiteSchema() {
  return jsonLd("WebSite", {
    name: "Jobs View",
    url: appConfig.siteUrl,
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${appConfig.siteUrl}/jobs?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });
}

export function organizationSchema() {
  return jsonLd("Organization", {
    name: "Jobs View",
    url: appConfig.siteUrl,
    logo: `${appConfig.siteUrl}/images/home-hero-india-careers.png`,
    foundingLocation: { "@type": "Country", name: "India" },
    areaServed: { "@type": "Country", name: "India" },
    sameAs: [
      "https://www.linkedin.com/company/jobsview",
      "https://twitter.com/jobsview"
    ]
  });
}

export function webPageSchema(title: string, description: string, path: string, type = "WebPage") {
  const url = new URL(path, appConfig.siteUrl).toString();
  return jsonLd(type, {
    name: title,
    headline: title,
    description,
    url,
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: "Jobs View", url: appConfig.siteUrl },
    publisher: { "@type": "Organization", name: "Jobs View", url: appConfig.siteUrl }
  });
}

export function collectionPageSchema(title: string, description: string, path: string, itemPaths: { name: string; path: string }[] = []) {
  return {
    ...webPageSchema(title, description, path, "CollectionPage"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: itemPaths.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: new URL(item.path, appConfig.siteUrl).toString()
      }))
    }
  };
}

export function articleSchema(title: string, description: string, path: string, keywords: string[] = []) {
  const url = new URL(path, appConfig.siteUrl).toString();
  return jsonLd("Article", {
    headline: title,
    description,
    url,
    inLanguage: "en-IN",
    keywords,
    author: { "@type": "Organization", name: "Jobs View" },
    publisher: { "@type": "Organization", name: "Jobs View", logo: { "@type": "ImageObject", url: `${appConfig.siteUrl}/images/home-hero-india-careers.png` } },
    mainEntityOfPage: url
  });
}

export function companySchema(name: string, description: string, path: string) {
  return jsonLd("Organization", {
    name,
    description,
    url: new URL(path, appConfig.siteUrl).toString(),
    areaServed: { "@type": "Country", name: "India" },
    makesOffer: { "@type": "Offer", name: `${name} jobs on Jobs View` },
    sameAs: []
  });
}

export function definedTermSchema(name: string, description: string, path: string) {
  return jsonLd("DefinedTerm", {
    name,
    description,
    url: new URL(path, appConfig.siteUrl).toString(),
    inDefinedTermSet: { "@type": "DefinedTermSet", name: "Jobs View Skills", url: `${appConfig.siteUrl}/skills` }
  });
}

export function datasetSchema(name: string, description: string, path: string) {
  return jsonLd("Dataset", {
    name,
    description,
    url: new URL(path, appConfig.siteUrl).toString(),
    inLanguage: "en-IN",
    creator: { "@type": "Organization", name: "Jobs View" },
    spatialCoverage: { "@type": "Country", name: "India" },
    variableMeasured: ["salary range", "city benchmark", "skill premium", "experience growth"]
  });
}

export function courseSchema(name: string, description: string, path: string) {
  return jsonLd("Course", {
    name,
    description,
    url: new URL(path, appConfig.siteUrl).toString(),
    provider: { "@type": "Organization", name: "Jobs View", url: appConfig.siteUrl },
    educationalCredentialAwarded: "Career roadmap"
  });
}

export function personSchema(name: string, description: string, path: string) {
  return jsonLd("Person", {
    name,
    description,
    url: new URL(path, appConfig.siteUrl).toString(),
    worksFor: { "@type": "Organization", name: "Jobs View talent network" }
  });
}

export function jobPostingSchema(input: {
  title: string;
  description: string;
  slug: string;
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  employmentType?: string;
  skills?: string[];
  validThrough?: string;
}) {
  const company = input.company ?? "Jobs View Verified Employer";
  const location = input.location ?? "India";
  const url = new URL(`/jobs/${input.slug}`, appConfig.siteUrl).toString();
  return jsonLd("JobPosting", {
    title: input.title,
    description: input.description,
    datePosted: new Date().toISOString().slice(0, 10),
    validThrough: input.validThrough ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: input.employmentType ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: company,
      sameAs: appConfig.siteUrl,
      logo: `${appConfig.siteUrl}/images/home-hero-india-careers.png`
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
        addressCountry: "IN"
      }
    },
    applicantLocationRequirements: { "@type": "Country", name: "India" },
    jobLocationType: "TELECOMMUTE",
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: input.currency ?? "INR",
      value: {
        "@type": "QuantitativeValue",
        minValue: input.salaryMin ?? 1200000,
        maxValue: input.salaryMax ?? 3800000,
        unitText: "YEAR"
      }
    },
    directApply: true,
    identifier: { "@type": "PropertyValue", name: "Jobs View", value: input.slug },
    occupationCategory: input.title,
    skills: input.skills?.join(", ") ?? "Communication, collaboration, problem solving",
    qualifications: "Role-specific qualifications are listed on the Jobs View job page.",
    responsibilities: "Own role-specific outcomes, collaborate with teams, and deliver measurable impact.",
    benefits: "Benefits vary by employer and are displayed on the Jobs View job page.",
    url
  });
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return jsonLd("BreadcrumbList", {
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, appConfig.siteUrl).toString()
    }))
  });
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return jsonLd("FAQPage", {
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  });
}

export function roleHome(role?: string) {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return `${appConfig.adminUrl}/admin`;
  if (role === "EMPLOYER") return `${appConfig.employerUrl}/employer`;
  return "/candidate";
}

export function navigationForSession<T extends { label: string; href: string }>(
  items: T[],
  permissions: readonly string[] = [],
  requirements: Partial<Record<string, string>> = {}
) {
  return items.filter((item) => {
    const required = requirements[item.href] ?? requirements[item.label];
    return !required || permissions.includes(required);
  });
}

export * from "./api";
export * from "./career-engine";
export * from "./content-engine";
export * from "./enterprise-launch-engine";
export * from "./intelligent-hiring-engine";
export * from "./marketplace-engine";
export * from "./production-journey-engine";
export * from "./recruitment-automation-engine";
export * from "./workforce-platform-engine";

export function ProtectedRoute({ hydrated, hasToken, children, fallback }: { hydrated: boolean; hasToken: boolean; children: React.ReactNode; fallback: React.ReactNode }) {
  if (!hydrated) return fallback;
  if (!hasToken) return fallback;
  return children;
}
