"use client";

import { motion } from "framer-motion";

import { navigation } from "@career-os/config";
import {
  useAdminActions,
  useAdminData,
  useAuthActions,
  type AdminDataOptions,
} from "@career-os/hooks";
import { AppShell, Avatar, Badge, ErrorState, PageSkeleton } from "@career-os/ui";

import { BillingView, MarketplaceView, SubscriptionsView } from "./admin/business-views";
import { CmsView, AuditView, MonitoringView, SettingsView, SeoView } from "./admin/content-views";
import { AdvertisementsView } from "./admin/advertisements-view";
import { DashboardView, UsersView, CompaniesView } from "./admin/core-views";
import { JobsView, RecruitmentView } from "./admin/jobs-views";
import { ReportsView, SupportView } from "./admin/ops-views";

export type AdminView =
  | "dashboard"
  | "users"
  | "candidates"
  | "employers"
  | "companies"
  | "jobs"
  | "recruitment"
  | "billing"
  | "subscriptions"
  | "marketplace"
  | "cms"
  | "advertisements"
  | "seo"
  | "reports"
  | "support"
  | "audit"
  | "monitoring"
  | "settings";

export type DashboardData = {
  total_users?: number;
  active_users?: number;
  companies?: number;
  active_jobs?: number;
  applications?: number;
  revenue?: number;
  pending_verifications?: number;
  reports?: number;
};
export type BusinessData = {
  mrr?: number;
  arr?: number;
  revenue?: number;
  employers?: number;
  active_subscriptions?: number;
  invoices?: number;
  open_operations?: number;
};
export type TrendPoint = { name: string; value: number };
export type DashboardTrends = {
  users?: TrendPoint[];
  jobs?: TrendPoint[];
  applications?: TrendPoint[];
  revenue?: TrendPoint[];
  application_funnel?: TrendPoint[];
};
export type UserItem = {
  id?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
};
export type PlanItem = {
  id?: number;
  name?: string;
  slug?: string;
  price?: number;
  currency?: string;
  billing_interval?: string;
  interval?: string;
  features?: Record<string, unknown>;
  is_active?: boolean;
  status?: string;
};
export type ApplicationItem = {
  id?: string;
  candidate_email?: string;
  candidate_name?: string;
  job_title?: string;
  company?: string;
  company_name?: string;
  status?: string;
  created_at?: string;
};
export type CmsItem = {
  id?: string;
  title?: string;
  slug?: string;
  content_type?: string;
  status?: string;
  summary?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
};
export type SettingItem = {
  key?: string;
  category?: string;
  value?: Record<string, unknown>;
  is_public?: boolean;
};
export type AuditItem = {
  id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};
export type ReportItem = {
  id?: string;
  report_type?: string;
  format?: string;
  status?: string;
  file_url?: string;
  created_at?: string;
};
export type TicketItem = {
  id?: string;
  email?: string;
  ticket_type?: string;
  subject?: string;
  message?: string;
  status?: string;
  priority?: string;
  created_at?: string;
};
export type SeoItem = {
  key?: string;
  title_template?: string;
  description_template?: string;
  schema_defaults?: Record<string, unknown>;
  updated_at?: string;
};
export type QueryState = {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => unknown;
};
export type AdminLive = {
  data: ReturnType<typeof useAdminData>;
  actions: ReturnType<typeof useAdminActions>;
};
export type Confirmation = {
  title: string;
  description: string;
  label: string;
  intent?: "default" | "danger";
  run: () => Promise<unknown>;
  busy: boolean;
};

export const publicSiteURL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const titles: Record<AdminView, string> = {
  dashboard: "Platform Dashboard",
  users: "User Management",
  candidates: "Candidate Management",
  employers: "Employer Management",
  companies: "Company Management",
  jobs: "Job Moderation",
  recruitment: "Recruitment Monitoring",
  billing: "Billing Operations",
  subscriptions: "Subscriptions & Plans",
  marketplace: "Marketplace Operations",
  cms: "Content Management",
  advertisements: "Advertisements",
  seo: "SEO Configuration",
  reports: "Reports",
  support: "Support",
  audit: "Audit Log",
  monitoring: "System Monitoring",
  settings: "Platform Settings",
};
const descriptions: Record<AdminView, string> = {
  dashboard:
    "Live platform totals, review queues, operations, and recent administrative activity.",
  users: "Search, filter, review, and manage platform identities.",
  candidates:
    "Review candidate identities without mixing employer and administrator accounts.",
  employers: "Review employer identities, access state, and account status.",
  companies:
    "Review company records and run supported approval and verification actions.",
  jobs: "Review published job records and run supported moderation actions.",
  recruitment:
    "Inspect application records returned by the admin recruitment endpoint.",
  billing:
    "Review live revenue, invoices, collections, and employer billing totals.",
  subscriptions:
    "Review and maintain subscription plans and active subscription totals.",
  marketplace:
    "Inspect marketplace products, coupons, boosts, operations, and automation records.",
  cms: "Review content entries returned by the CMS endpoint.",
  advertisements: "Upload and manage homepage advertisement banners.",
  seo: "Review and maintain metadata templates backed by the SEO configuration store.",
  reports: "Request reports and review the generated report history.",
  support: "Review the support queue and create operational tickets.",
  audit: "Search recent administrative events and resource changes.",
  monitoring:
    "Inspect the current system-health response without estimated measurements.",
  settings:
    "Review and update existing platform configuration grouped by category.",
};
export const inputClass =
  "h-10 w-full rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm outline-none focus:border-[var(--cos-primary)] focus:ring-2 focus:ring-[var(--cos-focus-ring)]";
const motionProps = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const;

export function AdminPortal({ view }: { view: AdminView }) {
  const data = useAdminData(undefined, dataOptions(view));
  const live = { data, actions: useAdminActions() };
  const auth = useAuthActions();
  const queries = viewQueries(view, data);
  const failed = queries.find((query) => query.isError);
  return (
    <AppShell
      variant="admin"
      title={titles[view]}
      nav={navigation.admin}
      workspaceLabel="Super Admin"
      workspaceName="Jobs View"
      workspaceDescription="Platform control center"
      planTitle="Platform operations"
      planDescription="Live administrative workspace"
      quickActionHref="/admin/jobs#quick-post"
      actions={
        <div className="hidden items-center gap-2 sm:flex">
          <Badge tone="success">Super Admin</Badge>
          <Avatar name="Super Admin" verified />
        </div>
      }
      onLogout={() => auth.logout.mutate()}
    >
      {queries.some((query) => query.isPending) ? (
        <PageSkeleton
          variant={view === "dashboard" ? "dashboard" : "list"}
          cards={view === "dashboard" ? 8 : 5}
        />
      ) : failed ? (
        (() => {
          const status = (failed.error as { response?: { status?: number } })?.response?.status;
          const isUnauth = status === 401 || String(failed.error).includes("401") || String(failed.error).toLowerCase().includes("unauthorized");
          if (isUnauth && typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            setTimeout(() => { window.location.href = "/admin/login"; }, 1500);
          }
          return (
            <ErrorState
              error={failed.error}
              title={isUnauth ? "Admin Authentication Required" : undefined}
              description={isUnauth ? "You are not signed in on this device, or your session expired. Up to 10 concurrent devices allowed per account. Redirecting to admin login..." : undefined}
              onRetry={isUnauth ? undefined : () => queries.forEach((query) => void query.refetch())}
              retrying={queries.some((query) => query.isFetching)}
              backHref={isUnauth ? "/admin/login" : "/admin"}
              backLabel={isUnauth ? "Sign in to Admin Panel" : "Admin dashboard"}
            />
          );
        })()
      ) : (
        <motion.div {...motionProps} className="grid gap-6">
          <AdminHeader view={view} />
          {renderView(view, live)}
        </motion.div>
      )}
    </AppShell>
  );
}

function dataOptions(view: AdminView): AdminDataOptions {
  const none: AdminDataOptions = {
    dashboard: false,
    dashboardTrends: false,
    businessDashboard: false,
    marketplace: false,
    users: false,
    companies: false,
    jobs: false,
    applications: false,
    plans: false,
    cms: false,
    settings: false,
    audit: false,
    reports: false,
    tickets: false,
    seo: false,
    health: false,
  };
  if (view === "dashboard")
    return {
      ...none,
      dashboard: true,
      dashboardTrends: true,
      businessDashboard: true,
      audit: true,
      health: true,
    };
  if (["users", "candidates", "employers"].includes(view))
    return { ...none, users: true };
  if (view === "companies") return { ...none, companies: true };
  if (view === "jobs") return { ...none, jobs: true };
  if (view === "recruitment") return { ...none, applications: true };
  if (view === "billing") return { ...none, businessDashboard: true };
  if (view === "subscriptions")
    return { ...none, plans: true, businessDashboard: true };
  if (view === "marketplace") return { ...none, marketplace: true };
  if (view === "cms") return { ...none, cms: true };
  if (view === "advertisements") return none;
  if (view === "audit") return { ...none, audit: true };
  if (view === "monitoring") return { ...none, health: true };
  if (view === "settings") return { ...none, settings: true };
  if (view === "reports") return { ...none, reports: true };
  if (view === "support") return { ...none, tickets: true };
  if (view === "seo") return { ...none, seo: true };
  return none;
}

function viewQueries(
  view: AdminView,
  data: ReturnType<typeof useAdminData>,
): QueryState[] {
  if (view === "dashboard")
    return [
      data.dashboard,
      data.dashboardTrends,
      data.businessDashboard,
      data.audit,
      data.health,
    ] as QueryState[];
  if (view === "billing") return [data.businessDashboard as QueryState];
  if (view === "subscriptions")
    return [data.plans as QueryState, data.businessDashboard as QueryState];
  if (view === "marketplace") return [data.marketplace as QueryState];
  if (view === "reports") return [data.reports as QueryState];
  if (view === "support") return [data.tickets as QueryState];
  if (view === "seo") return [data.seo as QueryState];
  if (view === "advertisements") return [];
  const mapping: Partial<Record<AdminView, QueryState>> = {
    users: data.users as QueryState,
    candidates: data.users as QueryState,
    employers: data.users as QueryState,
    companies: data.companies as QueryState,
    jobs: data.jobs as QueryState,
    recruitment: data.applications as QueryState,
    cms: data.cms as QueryState,
    audit: data.audit as QueryState,
    monitoring: data.health as QueryState,
    settings: data.settings as QueryState,
  };
  return mapping[view] ? [mapping[view] as QueryState] : [];
}

function renderView(view: AdminView, live: AdminLive) {
  if (view === "dashboard") return <DashboardView live={live} />;
  if (view === "users") return <UsersView live={live} />;
  if (view === "candidates")
    return <UsersView live={live} fixedRole="JOB_SEEKER" />;
  if (view === "employers")
    return <UsersView live={live} fixedRole="EMPLOYER" />;
  if (view === "companies") return <CompaniesView live={live} />;
  if (view === "jobs") return <JobsView live={live} />;
  if (view === "recruitment") return <RecruitmentView live={live} />;
  if (view === "billing") return <BillingView live={live} />;
  if (view === "subscriptions") return <SubscriptionsView live={live} />;
  if (view === "marketplace") return <MarketplaceView live={live} />;
  if (view === "cms") return <CmsView live={live} />;
  if (view === "advertisements") return <AdvertisementsView />;
  if (view === "audit") return <AuditView live={live} />;
  if (view === "monitoring") return <MonitoringView live={live} />;
  if (view === "settings") return <SettingsView live={live} />;
  if (view === "seo") return <SeoView live={live} />;
  if (view === "reports") return <ReportsView live={live} />;
  return <SupportView live={live} />;
}

function AdminHeader({ view }: { view: AdminView }) {
  return (
    <header className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 shadow-career-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone="premium">Platform Operations</Badge>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            {titles[view]}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--cos-on-surface-variant)]">
            {descriptions[view]}
          </p>
        </div>
        {view !== "dashboard" ? (
          <a
            className="inline-flex h-10 items-center gap-2 self-start rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] px-3 text-sm font-semibold hover:border-[var(--cos-primary)]"
            href="/admin"
          >
            Dashboard
          </a>
        ) : null}
      </div>
    </header>
  );
}
