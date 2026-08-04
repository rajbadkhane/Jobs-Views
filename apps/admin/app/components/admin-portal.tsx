"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Banknote,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  FileText,
  Gauge,
  LifeBuoy,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import { navigation } from "@career-os/config";
import {
  useAdminActions,
  useAdminData,
  type AdminDataOptions,
} from "@career-os/hooks";
import {
  apiErrorMessage,
  type PublicCompany,
  type PublicJob,
} from "@career-os/shared";
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Card,
  Chart,
  ChartShell,
  DashboardCard,
  EmptyState,
  EnterpriseCard,
  ErrorState,
  PageSkeleton,
} from "@career-os/ui";
import { cn } from "@career-os/utils";

import { AdminDataTable, type AdminColumn } from "./admin-data-table";
import {
  AdminDrawer,
  ConfirmDialog,
  DetailList,
  PublicLink,
} from "./admin-overlays";

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
  | "seo"
  | "reports"
  | "support"
  | "audit"
  | "monitoring"
  | "settings";

type DashboardData = {
  total_users?: number;
  active_users?: number;
  companies?: number;
  active_jobs?: number;
  applications?: number;
  revenue?: number;
  pending_verifications?: number;
  reports?: number;
};
type BusinessData = {
  mrr?: number;
  arr?: number;
  revenue?: number;
  employers?: number;
  active_subscriptions?: number;
  invoices?: number;
  open_operations?: number;
};
type TrendPoint = { name: string; value: number };
type DashboardTrends = {
  users?: TrendPoint[];
  jobs?: TrendPoint[];
  applications?: TrendPoint[];
  revenue?: TrendPoint[];
  application_funnel?: TrendPoint[];
};
type UserItem = {
  id?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
};
type PlanItem = {
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
type ApplicationItem = {
  id?: string;
  candidate_email?: string;
  candidate_name?: string;
  job_title?: string;
  company?: string;
  company_name?: string;
  status?: string;
  created_at?: string;
};
type CmsItem = {
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
type SettingItem = {
  key?: string;
  category?: string;
  value?: Record<string, unknown>;
  is_public?: boolean;
};
type AuditItem = {
  id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};
type ReportItem = {
  id?: string;
  report_type?: string;
  format?: string;
  status?: string;
  file_url?: string;
  created_at?: string;
};
type TicketItem = {
  id?: string;
  email?: string;
  ticket_type?: string;
  subject?: string;
  message?: string;
  status?: string;
  priority?: string;
  created_at?: string;
};
type SeoItem = {
  key?: string;
  title_template?: string;
  description_template?: string;
  schema_defaults?: Record<string, unknown>;
  updated_at?: string;
};
type QueryState = {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => unknown;
};
type AdminLive = {
  data: ReturnType<typeof useAdminData>;
  actions: ReturnType<typeof useAdminActions>;
};
type Confirmation = {
  title: string;
  description: string;
  label: string;
  intent?: "default" | "danger";
  run: () => Promise<unknown>;
  busy: boolean;
};

const publicSiteURL =
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
  seo: "Review and maintain metadata templates backed by the SEO configuration store.",
  reports: "Request reports and review the generated report history.",
  support: "Review the support queue and create operational tickets.",
  audit: "Search recent administrative events and resource changes.",
  monitoring:
    "Inspect the current system-health response without estimated measurements.",
  settings:
    "Review and update existing platform configuration grouped by category.",
};
const inputClass =
  "h-10 w-full rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm outline-none focus:border-[var(--cos-primary)] focus:ring-2 focus:ring-[var(--cos-focus-ring)]";
const motionProps = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const;

export function AdminPortal({ view }: { view: AdminView }) {
  const data = useAdminData(undefined, dataOptions(view));
  const live = { data, actions: useAdminActions() };
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
              description={isUnauth ? "You are not signed in on this device, or your session expired. Up to 5 concurrent devices allowed per account. Redirecting to admin login..." : undefined}
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
  if (view === "billing") return <BillingOverview live={live} />;
  if (view === "subscriptions") return <BillingView live={live} />;
  if (view === "marketplace") return <MarketplaceView live={live} />;
  if (view === "cms") return <CmsView live={live} />;
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

function DashboardView({ live }: { live: AdminLive }) {
  const dashboard = objectValue<DashboardData>(live.data.dashboard.data);
  const business = objectValue<BusinessData>(live.data.businessDashboard.data);
  const trends = objectValue<DashboardTrends>(live.data.dashboardTrends.data);
  const audit = items<AuditItem>(live.data.audit.data);
  const health = objectValue<Record<string, unknown>>(live.data.health.data);
  const metrics = [
    metric("Total Users", dashboard?.total_users, <Users size={18} />),
    metric("Active Users", dashboard?.active_users, <Users size={18} />),
    metric("Companies", dashboard?.companies, <Building2 size={18} />),
    metric("Published Jobs", dashboard?.active_jobs, <Briefcase size={18} />),
    metric(
      "Applications",
      dashboard?.applications,
      <ClipboardCheck size={18} />,
    ),
    metric(
      "Pending Reviews",
      dashboard?.pending_verifications,
      <ShieldCheck size={18} />,
    ),
    metric("Employers", business?.employers, <Building2 size={18} />),
    metric(
      "Active Subscriptions",
      business?.active_subscriptions,
      <Banknote size={18} />,
    ),
    moneyMetric("Revenue", dashboard?.revenue, <Banknote size={18} />),
    moneyMetric("MRR", business?.mrr, <Banknote size={18} />),
    metric("Reports", dashboard?.reports, <FileBarChart size={18} />),
    health && Object.keys(health).length
      ? {
          label: "Health Signals",
          value: String(Object.keys(health).length),
          icon: <Gauge size={18} />,
        }
      : null,
  ].filter(notNull);
  const chartSeries = [
    { title: "User Growth", data: trends?.users },
    { title: "Job Growth", data: trends?.jobs },
    { title: "Applications", data: trends?.applications },
    { title: "Revenue Trend", data: trends?.revenue },
  ].filter((item): item is { title: string; data: TrendPoint[] } =>
    Boolean(item.data?.length),
  );
  return (
    <div className="grid gap-6">
      <section
        aria-label="Platform metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6"
      >
        {metrics.map((item) => (
          <DashboardCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </section>
      {chartSeries.length ? (
        <section
          aria-label="Platform trends"
          className="grid gap-5 xl:grid-cols-2"
        >
          {chartSeries.map((series) => (
            <ChartShell key={series.title} title={series.title}>
              <Chart data={series.data} />
            </ChartShell>
          ))}
        </section>
      ) : null}
      {trends?.application_funnel?.length ? (
        <EnterpriseCard
          title="Application Funnel"
          description="Current application status totals from the recruitment pipeline."
          icon={<ClipboardCheck size={18} />}
          disabled={false}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {trends.application_funnel.map((item) => (
              <DashboardCard
                key={item.name}
                label={item.name}
                value={String(item.value)}
              />
            ))}
          </div>
        </EnterpriseCard>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <EnterpriseCard
          title="Recent Activity"
          description="Events returned by the admin audit endpoint."
          icon={<Activity size={18} />}
          disabled={false}
        >
          {audit.length ? (
            <div className="divide-y divide-[var(--cos-outline-variant)]">
              {audit.slice(0, 10).map((event) => (
                <div
                  key={event.id || `${event.action}-${event.created_at}`}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {titleCase(event.action || "Admin event")}
                    </p>
                    {event.resource_type ? (
                      <Badge>{titleCase(event.resource_type)}</Badge>
                    ) : null}
                  </div>
                  {event.created_at ? (
                    <time className="mt-1 block text-xs text-[var(--cos-on-surface-variant)]">
                      {formatDate(event.created_at)}
                    </time>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="No recent activity"
              description="Admin actions will appear when audit records exist."
              icon={<Activity size={18} />}
            />
          )}
        </EnterpriseCard>
        <EnterpriseCard
          title="Quick Actions"
          description="Open common administrative workflows directly."
          icon={<Plus size={18} />}
          disabled={false}
        >
          <div className="grid gap-2">
            <QuickLink href="/admin/jobs#quick-post" label="Post Job" />
            <QuickLink href="/admin/companies" label="Approve Companies" />
            <QuickLink href="/admin/jobs" label="Review Jobs" />
            <QuickLink href="/admin/subscriptions" label="Subscriptions" />
            <QuickLink href="/admin/recruitment" label="Recruitment Activity" />
            <QuickLink href="/admin/monitoring" label="System Monitoring" />
          </div>
        </EnterpriseCard>
      </div>
    </div>
  );
}

function UsersView({
  live,
  fixedRole,
}: {
  live: AdminLive;
  fixedRole?: string;
}) {
  const all = items<UserItem>(live.data.users.data);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<UserItem>();
  const [confirm, setConfirm] = useState<Confirmation>();
  const rows = useMemo(
    () =>
      all.filter(
        (user) =>
          (user.email || "").toLowerCase().includes(search.toLowerCase()) &&
          (!fixedRole || user.role === fixedRole) &&
          (role === "all" || user.role === role) &&
          (status === "all" ||
            (status === "active"
              ? user.is_active !== false
              : user.is_active === false)),
      ),
    [all, fixedRole, role, search, status],
  );
  const columns: AdminColumn<UserItem>[] = [
    {
      id: "email",
      header: "User",
      width: 270,
      hideable: false,
      sortValue: (row) => row.email,
      cell: (row) => (
        <div>
          <div className="font-semibold">
            {row.email || "Email unavailable"}
          </div>
          {row.id ? (
            <div className="mt-1 truncate text-xs text-[var(--cos-on-surface-variant)]">
              {row.id}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      sortValue: (row) => row.role,
      cell: (row) => (row.role ? <Badge>{row.role}</Badge> : null),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.is_active,
      cell: (row) => (
        <StatusBadge value={row.is_active === false ? "Suspended" : "Active"} />
      ),
    },
    {
      id: "verified",
      header: "Verification",
      sortValue: (row) => row.is_verified,
      cell: (row) => (
        <StatusBadge value={row.is_verified ? "Verified" : "Pending"} />
      ),
    },
    {
      id: "created",
      header: "Created",
      sortValue: (row) => timestamp(row.created_at),
      cell: (row) => formatDate(row.created_at),
    },
  ];
  const bulk = (action: "activate" | "suspend" | "delete" | "reset") =>
    setConfirm({
      title: `${titleCase(action)} ${selected.size} users?`,
      description: `This will run the supported ${action} action for every selected user.`,
      label: titleCase(action),
      intent: action === "delete" ? "danger" : "default",
      busy: live.actions.bulkUsers.isPending,
      run: () =>
        live.actions.bulkUsers
          .mutateAsync({ ids: [...selected], action })
          .then(() => setSelected(new Set())),
    });
  const userAction = (
    action: "activate" | "suspend" | "delete" | "reset",
    user: UserItem,
  ) => {
    if (!user.id) return;
    setConfirm({
      title: `${titleCase(action)} this user?`,
      description: `${titleCase(action)} ${user.email || "this account"} using the existing admin endpoint.`,
      label: titleCase(action),
      intent: action === "delete" ? "danger" : "default",
      busy: false,
      run: () =>
        action === "activate"
          ? live.actions.activateUser.mutateAsync(user.id as string)
          : action === "suspend"
            ? live.actions.suspendUser.mutateAsync(user.id as string)
            : action === "delete"
              ? live.actions.deleteUser.mutateAsync(user.id as string)
              : live.actions.resetPassword.mutateAsync(user.id as string),
    });
  };
  return (
    <>
      <AdminDataTable
        label="Users"
        rows={rows}
        columns={columns}
        rowKey={(row) => row.id || row.email || "user"}
        onOpen={setDetail}
        selected={selected}
        onSelectedChange={setSelected}
        search={search}
        onSearch={setSearch}
        filters={
          <FilterGroup>
            <Select
              value={role}
              onChange={setRole}
              label="Role"
              options={[
                ["all", "All roles"],
                ...unique(all.map((item) => item.role).filter(isString)).map(
                  (value) => [value, value] as [string, string],
                ),
              ]}
            />
            <Select
              value={status}
              onChange={setStatus}
              label="Status"
              options={[
                ["all", "All statuses"],
                ["active", "Active"],
                ["suspended", "Suspended"],
              ]}
            />
          </FilterGroup>
        }
        bulkActions={[
          { label: "Activate", onClick: () => bulk("activate") },
          { label: "Suspend", onClick: () => bulk("suspend") },
          { label: "Reset Password", onClick: () => bulk("reset") },
          { label: "Delete", intent: "danger", onClick: () => bulk("delete") },
        ]}
        emptyTitle="No users found"
        emptyDescription="No user records match the current filters."
      />
      <AdminDrawer
        open={Boolean(detail)}
        title={detail?.email || "User details"}
        description={detail?.role}
        onClose={() => setDetail(undefined)}
      >
        <DetailList
          items={[
            { label: "ID", value: detail?.id },
            { label: "Role", value: detail?.role },
            {
              label: "Status",
              value: detail?.is_active === false ? "Suspended" : "Active",
            },
            { label: "Verified", value: detail?.is_verified ? "Yes" : "No" },
            { label: "Created", value: formatDate(detail?.created_at) },
          ]}
        />
        <div className="mt-5 flex flex-wrap gap-2">
          {detail?.is_active === false ? (
            <Button onClick={() => userAction("activate", detail)}>
              Activate
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => detail && userAction("suspend", detail)}
            >
              Suspend
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => detail && userAction("reset", detail)}
          >
            Reset password
          </Button>
          <Button
            variant="danger"
            onClick={() => detail && userAction("delete", detail)}
          >
            Delete
          </Button>
        </div>
        {detail?.id ? (
          <RoleEditor user={detail} actions={live.actions} />
        ) : null}
      </AdminDrawer>
      <ConfirmationDialog value={confirm} setValue={setConfirm} />
    </>
  );
}

function CompaniesView({ live }: { live: AdminLive }) {
  const all = items<PublicCompany>(live.data.companies.data);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [status, setStatus] = useState("all");
  const [verified, setVerified] = useState("all");
  const [location, setLocation] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<PublicCompany>();
  const [confirm, setConfirm] = useState<Confirmation>();
  const rows = useMemo(
    () =>
      all.filter(
        (company) =>
          `${company.name} ${company.industry ?? ""} ${company.headquarters ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (industry === "all" || company.industry === industry) &&
          (status === "all" || company.status === status) &&
          (verified === "all" ||
            (verified === "yes"
              ? Boolean(company.is_verified || company.verified_badge)
              : !company.is_verified && !company.verified_badge)) &&
          (company.headquarters || "")
            .toLowerCase()
            .includes(location.toLowerCase()),
      ),
    [all, industry, location, search, status, verified],
  );
  const columns: AdminColumn<PublicCompany>[] = [
    {
      id: "name",
      header: "Company",
      width: 250,
      hideable: false,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div>
          <div>{row.name}</div>
          {row.website ? (
            <div className="mt-1 truncate text-xs text-[var(--cos-on-surface-variant)]">
              {row.website}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => (row.status ? <StatusBadge value={row.status} /> : null),
    },
    {
      id: "verified",
      header: "Verified",
      sortValue: (row) => Boolean(row.is_verified || row.verified_badge),
      cell: (row) => (
        <StatusBadge
          value={
            row.is_verified || row.verified_badge ? "Verified" : "Not verified"
          }
        />
      ),
    },
    {
      id: "industry",
      header: "Industry",
      sortValue: (row) => row.industry,
      cell: (row) => row.industry || "",
    },
    {
      id: "location",
      header: "Headquarters",
      sortValue: (row) => row.headquarters,
      cell: (row) => row.headquarters || "",
    },
    {
      id: "size",
      header: "Size",
      sortValue: (row) => row.size_range,
      cell: (row) => row.size_range || "",
    },
    {
      id: "created",
      header: "Created",
      sortValue: (row) => timestamp(row.created_at),
      cell: (row) => formatDate(row.created_at),
    },
  ];
  const moderate = (company: PublicCompany, next: string) =>
    setConfirm({
      title: `${titleCase(next)} ${company.name}?`,
      description: `This changes the company moderation status to ${next}.`,
      label: titleCase(next),
      intent:
        next === "rejected" || next === "suspended" ? "danger" : "default",
      busy: live.actions.moderateCompany.isPending,
      run: () =>
        live.actions.moderateCompany.mutateAsync({
          id: company.id,
          payload: { status: next },
        }),
    });
  const bulk = (next: string) =>
    setConfirm({
      title: `${titleCase(next)} ${selected.size} companies?`,
      description:
        "This applies the moderation status to every selected company.",
      label: titleCase(next),
      intent: next === "rejected" ? "danger" : "default",
      busy: live.actions.bulkModerateCompanies.isPending,
      run: () =>
        live.actions.bulkModerateCompanies
          .mutateAsync({ ids: [...selected], status: next })
          .then(() => setSelected(new Set())),
    });
  const bulkVerify = () =>
    setConfirm({
      title: `Verify ${selected.size} companies?`,
      description:
        "This approves all verification checks through the existing verification endpoint.",
      label: "Verify",
      busy: live.actions.bulkVerifyCompanies.isPending,
      run: () =>
        live.actions.bulkVerifyCompanies
          .mutateAsync([...selected])
          .then(() => setSelected(new Set())),
    });
  return (
    <>
      <AdminDataTable
        label="Companies"
        rows={rows}
        columns={columns}
        rowKey={(row) => row.id}
        onOpen={setDetail}
        selected={selected}
        onSelectedChange={setSelected}
        search={search}
        onSearch={setSearch}
        filters={
          <FilterGroup>
            <Select
              label="Industry"
              value={industry}
              onChange={setIndustry}
              options={[
                ["all", "All industries"],
                ...unique(
                  all.map((item) => item.industry).filter(isString),
                ).map((value) => [value, value] as [string, string]),
              ]}
            />
            <Select
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                ["all", "All statuses"],
                ...unique(all.map((item) => item.status).filter(isString)).map(
                  (value) => [value, titleCase(value)] as [string, string],
                ),
              ]}
            />
            <Select
              label="Verification"
              value={verified}
              onChange={setVerified}
              options={[
                ["all", "All companies"],
                ["yes", "Verified"],
                ["no", "Not verified"],
              ]}
            />
            <label className="sr-only" htmlFor="company-location">
              Location
            </label>
            <input
              id="company-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={cn(inputClass, "w-40")}
              placeholder="Location"
            />
          </FilterGroup>
        }
        bulkActions={[
          { label: "Approve", onClick: () => bulk("approved") },
          { label: "Verify", onClick: bulkVerify },
          {
            label: "Reject",
            intent: "danger",
            onClick: () => bulk("rejected"),
          },
        ]}
        emptyTitle="No companies found"
        emptyDescription="No company records match the current filters."
      />
      <AdminDrawer
        open={Boolean(detail)}
        title={detail?.name || "Company details"}
        description={detail?.industry}
        onClose={() => setDetail(undefined)}
      >
        <DetailList
          items={[
            { label: "Status", value: detail?.status },
            {
              label: "Verified",
              value:
                detail?.is_verified || detail?.verified_badge ? "Yes" : "No",
            },
            { label: "Website", value: detail?.website },
            { label: "Headquarters", value: detail?.headquarters },
            { label: "Size", value: detail?.size_range },
            { label: "Founded", value: detail?.founded_year },
            { label: "Created", value: formatDate(detail?.created_at) },
            { label: "Updated", value: formatDate(detail?.updated_at) },
          ]}
        />
        {detail?.description || detail?.about ? (
          <p className="mt-5 text-sm leading-6 text-[var(--cos-on-surface-variant)]">
            {detail.about || detail.description}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {detail ? (
            <>
              <Button onClick={() => moderate(detail, "approved")}>
                Approve
              </Button>
              <Button
                variant="secondary"
                loading={live.actions.verifyCompany.isPending}
                disabled={live.actions.verifyCompany.isPending}
                onClick={() => live.actions.verifyCompany.mutate(detail.id)}
              >
                Verify
              </Button>
              <Button
                variant="danger"
                onClick={() => moderate(detail, "rejected")}
              >
                Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => moderate(detail, "suspended")}
              >
                Suspend
              </Button>
              {detail.slug ? (
                <PublicLink href={`${publicSiteURL}/companies/${detail.slug}`}>
                  Public page
                </PublicLink>
              ) : null}
            </>
          ) : null}
        </div>
        <ActivityTimeline
          values={[
            { label: "Created", date: detail?.created_at },
            { label: "Updated", date: detail?.updated_at },
            {
              label: detail?.status ? titleCase(detail.status) : "",
              date: detail?.updated_at,
            },
          ]}
        />
      </AdminDrawer>
      <ConfirmationDialog value={confirm} setValue={setConfirm} />
    </>
  );
}

function JobsView({ live }: { live: AdminLive }) {
  const all = items<PublicJob>(live.data.jobs.data);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [company, setCompany] = useState("all");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [detail, setDetail] = useState<PublicJob>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<Confirmation>();
  const rows = useMemo(
    () =>
      all.filter(
        (job) =>
          `${job.title} ${job.company_name} ${(job.skills || []).map((skill) => skill.name).join(" ")}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (status === "all" || job.status === status) &&
          (company === "all" || job.company_name === company) &&
          (jobType === "all" || job.job_type === jobType || (job.job_types && job.job_types.includes(jobType)) || (job.job_types_list && job.job_types_list.includes(jobType))) &&
          `${job.city ?? ""} ${job.state ?? ""} ${job.country ?? ""}`
            .toLowerCase()
            .includes(location.toLowerCase()) &&
          (dateRange === "all" ||
            isWithinDays(
              job.published_at || job.created_at,
              Number(dateRange),
            )) &&
          matchesExperience(job, experienceFilter),
      ),
    [
      all,
      company,
      dateRange,
      experienceFilter,
      jobType,
      location,
      search,
      status,
    ],
  );
  const columns: AdminColumn<PublicJob>[] = [
    {
      id: "title",
      header: "Job",
      width: 280,
      hideable: false,
      sortValue: (row) => row.title,
      cell: (row) => (
        <div>
          <div>{row.title}</div>
          <div className="mt-1 text-xs text-[var(--cos-on-surface-variant)]">
            {row.company_name}
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => (row.status ? <StatusBadge value={row.status} /> : null),
    },
    {
      id: "location",
      header: "Location",
      sortValue: (row) => row.city,
      cell: (row) =>
        [row.city, row.state, row.country].filter(Boolean).join(", "),
    },
    {
      id: "type",
      header: "Job Type",
      sortValue: (row) => row.job_type,
      cell: (row) => {
        const list = row.job_types?.length ? row.job_types : row.job_types_list?.length ? row.job_types_list : row.job_type ? [row.job_type] : [];
        return list.map((item) => titleCase(item)).join(", ");
      },
    },
    {
      id: "mode",
      header: "Work Mode",
      sortValue: (row) => row.work_mode,
      cell: (row) => (row.work_mode ? titleCase(row.work_mode) : ""),
    },
    {
      id: "experience",
      header: "Experience",
      sortValue: (row) => row.experience_min,
      cell: (row) => experience(row),
    },
    {
      id: "published",
      header: "Published",
      sortValue: (row) => timestamp(row.published_at),
      cell: (row) => formatDate(row.published_at),
    },
  ];
  const moderate = (job: PublicJob, next: string) =>
    setConfirm({
      title: `${titleCase(next)} ${job.title}?`,
      description: `This changes the job moderation status to ${next}.`,
      label: titleCase(next),
      intent: next === "rejected" || next === "archived" ? "danger" : "default",
      busy: live.actions.moderateJob.isPending,
      run: () =>
        live.actions.moderateJob.mutateAsync({
          id: job.id,
          payload: { status: next },
        }),
    });
  const bulk = (next: string) =>
    setConfirm({
      title: `${titleCase(next)} ${selected.size} jobs?`,
      description: "This applies the moderation status to every selected job.",
      label: titleCase(next),
      intent: next === "archived" ? "danger" : "default",
      busy: live.actions.bulkModerateJobs.isPending,
      run: () =>
        live.actions.bulkModerateJobs
          .mutateAsync({ ids: [...selected], status: next })
          .then(() => setSelected(new Set())),
    });
  return (
    <>
      <QuickPostJobForm live={live} />
      <AdminDataTable
        label="Jobs"
        rows={rows}
        columns={columns}
        rowKey={(row) => row.id}
        onOpen={setDetail}
        selected={selected}
        onSelectedChange={setSelected}
        search={search}
        onSearch={setSearch}
        filters={
          <FilterGroup>
            <Select
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                ["all", "All statuses"],
                ...unique(all.map((item) => item.status).filter(isString)).map(
                  (value) => [value, titleCase(value)] as [string, string],
                ),
              ]}
            />
            <Select
              label="Company"
              value={company}
              onChange={setCompany}
              options={[
                ["all", "All companies"],
                ...unique(
                  all.map((item) => item.company_name).filter(isString),
                ).map((value) => [value, value] as [string, string]),
              ]}
            />
            <Select
              label="Job type"
              value={jobType}
              onChange={setJobType}
              options={[
                ["all", "All job types"],
                ...unique(
                  all.flatMap((item) => [item.job_type, ...(item.job_types || []), ...(item.job_types_list || [])]).filter(isString),
                ).map((value) => [value, titleCase(value)] as [string, string]),
              ]}
            />
            <Select
              label="Experience"
              value={experienceFilter}
              onChange={setExperienceFilter}
              options={[
                ["all", "Any experience"],
                ["entry", "0-2 years"],
                ["mid", "3-5 years"],
                ["senior", "6+ years"],
              ]}
            />
            <Select
              label="Date"
              value={dateRange}
              onChange={setDateRange}
              options={[
                ["all", "Any date"],
                ["7", "Last 7 days"],
                ["30", "Last 30 days"],
                ["90", "Last 90 days"],
              ]}
            />
            <label className="sr-only" htmlFor="job-location">
              Location
            </label>
            <input
              id="job-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={cn(inputClass, "w-40")}
              placeholder="Location"
            />
          </FilterGroup>
        }
        bulkActions={[
          { label: "Publish", onClick: () => bulk("published") },
          { label: "Pause", onClick: () => bulk("paused") },
          {
            label: "Archive",
            intent: "danger",
            onClick: () => bulk("archived"),
          },
        ]}
        emptyTitle="No jobs found"
        emptyDescription="No job records match the current filters. The existing admin data source exposes publicly searchable jobs only."
      />
      <AdminDrawer
        open={Boolean(detail)}
        title={detail?.title || "Job details"}
        description={detail?.company_name}
        onClose={() => setDetail(undefined)}
      >
        <DetailList
          items={[
            { label: "Status", value: detail?.status },
            { label: "Company", value: detail?.company_name },
            {
              label: "Location",
              value: detail
                ? [detail.city, detail.state, detail.country]
                    .filter(Boolean)
                    .join(", ")
                : undefined,
            },
            {
              label: "Work mode",
              value: detail?.work_mode
                ? titleCase(detail.work_mode)
                : undefined,
            },
            {
              label: "Job type",
              value: detail?.job_type ? titleCase(detail.job_type) : undefined,
            },
            {
              label: "Experience",
              value: detail ? experience(detail) : undefined,
            },
            { label: "Salary", value: detail ? salary(detail) : undefined },
            { label: "Openings", value: detail?.openings },
            { label: "Created", value: formatDate(detail?.created_at) },
            { label: "Updated", value: formatDate(detail?.updated_at) },
            { label: "Published", value: formatDate(detail?.published_at) },
          ]}
        />
        {detail?.full_description ? (
          <section className="mt-5">
            <h3 className="font-bold">Description</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--cos-on-surface-variant)]">
              {detail.full_description}
            </p>
          </section>
        ) : null}
        <DetailArray title="Requirements" values={detail?.requirements} />
        <DetailArray title="Benefits" values={detail?.benefits} />
        <div className="mt-5 flex flex-wrap gap-2">
          {detail ? (
            <>
              <Button onClick={() => moderate(detail, "published")}>
                Publish
              </Button>
              <Button
                variant="secondary"
                onClick={() => moderate(detail, "paused")}
              >
                Pause
              </Button>
              <Button
                variant="danger"
                onClick={() => moderate(detail, "rejected")}
              >
                Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => moderate(detail, "archived")}
              >
                Archive
              </Button>
              <Button
                variant="secondary"
                loading={live.actions.setJobFlags.isPending}
                disabled={live.actions.setJobFlags.isPending}
                onClick={() =>
                  live.actions.setJobFlags.mutate({
                    id: detail.id,
                    payload: {
                      is_featured: !detail.is_featured,
                      is_urgent: Boolean(detail.is_urgent),
                    },
                  })
                }
              >
                {detail.is_featured ? "Remove featured" : "Feature"}
              </Button>
              {detail.slug ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void navigator.clipboard.writeText(
                        `${publicSiteURL}/jobs/${detail.slug}`,
                      )
                    }
                  >
                    Copy public link
                  </Button>
                  <PublicLink href={`${publicSiteURL}/jobs/${detail.slug}`}>
                    View public page
                  </PublicLink>
                </>
              ) : null}
            </>
          ) : null}
        </div>
        <ActivityTimeline
          values={[
            { label: "Created", date: detail?.created_at },
            { label: "Updated", date: detail?.updated_at },
            { label: "Published", date: detail?.published_at },
            {
              label: detail?.status === "archived" ? "Archived" : "",
              date:
                detail?.status === "archived" ? detail.updated_at : undefined,
            },
          ]}
        />
      </AdminDrawer>
      <ConfirmationDialog value={confirm} setValue={setConfirm} />
    </>
  );
}

function QuickPostJobForm({ live }: { live: AdminLive }) {
  const blank = {
    companyName: "",
    website: "",
    industry: "",
    headquarters: "",
    sizeRange: "",
    title: "",
    shortDescription: "",
    fullDescription: "",
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "annual",
    salaryBasis: "ctc",
    city: "",
    state: "",
    country: "India",
    workMode: "on_site",
    jobType: "full-time",
    jobTypes: ["full-time"] as string[],
    education: "",
    experienceMin: "",
    experienceMax: "",
    openings: "1",
    requirements: "",
    benefits: "",
    skills: "",
    publish: true,
  };
  const [form, setForm] = useState(blank);
  const [publicURL, setPublicURL] = useState("");
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string | boolean | string[]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setPublicURL("");
    try {
      const lines = (value: string) =>
        value
          .split(/\r?\n|,/)
          .map((item) => item.trim())
          .filter(Boolean);
      const result = (await live.actions.quickPostJob.mutateAsync({
        company: {
          name: form.companyName,
          website: form.website,
          industry: form.industry,
          headquarters: form.headquarters,
          size_range: form.sizeRange,
        },
        job: {
          title: form.title,
          short_description: form.shortDescription,
          full_description: form.fullDescription,
          salary_min: Number(form.salaryMin || 0),
          salary_max: Number(form.salaryMax || 0),
          salary_period: form.salaryPeriod,
          salary_basis: form.salaryBasis,
          city: form.city,
          state: form.state,
          country: form.country,
          work_mode: form.workMode,
          job_type: form.jobTypes[0] || form.jobType || "full-time",
          job_types: form.jobTypes,
          education: form.education,
          experience_min: Number(form.experienceMin || 0),
          experience_max: Number(form.experienceMax || 0),
          openings: Math.max(1, Number(form.openings || 1)),
          requirements: lines(form.requirements),
          benefits: lines(form.benefits),
          skills: lines(form.skills).map((name) => ({
            name,
            requirement_type: "required",
            level: "intermediate",
            years_experience: 0,
          })),
        },
        publish: form.publish,
      })) as { public_url?: string };
      setPublicURL(result.public_url || "");
      setForm(blank);
    } catch (caught) {
      setError(apiErrorMessage(caught));
    }
  };
  return (
    <details
      id="quick-post"
      className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] shadow-career-sm"
    >
      <summary className="flex min-h-14 cursor-pointer items-center gap-3 px-5 font-bold">
        <Plus size={18} className="text-[var(--cos-primary)]" />
        Quick Post Job<Badge tone="verified">Super Admin</Badge>
      </summary>
      <form
        onSubmit={submit}
        className="grid gap-4 border-t border-[var(--cos-outline-variant)] p-5"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <TextField
            label="Company"
            value={form.companyName}
            setValue={(value) => set("companyName", value)}
          />
          <TextField
            label="Website"
            value={form.website}
            setValue={(value) => set("website", value)}
          />
          <TextField
            label="Industry"
            value={form.industry}
            setValue={(value) => set("industry", value)}
          />
          <TextField
            label="Headquarters"
            value={form.headquarters}
            setValue={(value) => set("headquarters", value)}
          />
          <TextField
            label="Company size"
            value={form.sizeRange}
            setValue={(value) => set("sizeRange", value)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <TextField
            label="Job title"
            value={form.title}
            setValue={(value) => set("title", value)}
          />
          <TextField
            label="City"
            value={form.city}
            setValue={(value) => set("city", value)}
          />
          <TextField
            label="State"
            value={form.state}
            setValue={(value) => set("state", value)}
          />
          <TextField
            label="Country"
            value={form.country}
            setValue={(value) => set("country", value)}
          />
          <TextField
            label="Salary min"
            type="number"
            value={form.salaryMin}
            setValue={(value) => set("salaryMin", value)}
          />
          <TextField
            label="Salary max"
            type="number"
            value={form.salaryMax}
            setValue={(value) => set("salaryMax", value)}
          />
          <Select
            label="Salary period"
            value={form.salaryPeriod}
            onChange={(value) => set("salaryPeriod", value)}
            options={[
              ["hourly", "Hourly"],
              ["daily", "Daily"],
              ["monthly", "Monthly"],
              ["annual", "Annual"],
            ]}
          />
          <Select
            label="Salary basis"
            value={form.salaryBasis}
            onChange={(value) => set("salaryBasis", value)}
            options={[
              ["gross", "Gross"],
              ["take_home", "Take home"],
              ["ctc", "Annual CTC"],
            ]}
          />
          <TextField
            label="Experience min"
            type="number"
            value={form.experienceMin}
            setValue={(value) => set("experienceMin", value)}
          />
          <TextField
            label="Experience max"
            type="number"
            value={form.experienceMax}
            setValue={(value) => set("experienceMax", value)}
          />
          <Select
            label="Work mode"
            value={form.workMode}
            onChange={(value) => set("workMode", value)}
            options={[
              ["on_site", "On-site"],
              ["hybrid", "Hybrid"],
              ["remote", "Remote"],
            ]}
          />
          <TextField
            label="Education"
            value={form.education}
            setValue={(value) => set("education", value)}
          />
          <TextField
            label="Openings"
            type="number"
            value={form.openings}
            setValue={(value) => set("openings", value)}
          />
        </div>
        <div className="grid gap-3 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-sm font-black text-[var(--cos-on-surface)] block">
                Job Types & Categories <span className="text-xs font-semibold text-[#f59e0b]">(Multi-Select Enabled)</span>
              </span>
              <span className="text-xs font-medium text-[var(--cos-on-surface-variant)]">
                Click to tag multiple employment terms, experience levels, and healthcare roles for this single job.
              </span>
            </div>
            <Badge tone="verified">{form.jobTypes.length} Selected</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-3 pt-3 border-t border-[var(--cos-outline-variant)]">
            <div className="grid gap-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#0a3a7a]">1. Employment & Terms</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ["full-time", "Full Time"],
                  ["part-time", "Part Time"],
                  ["contract", "Contract"],
                  ["internship", "Internship"],
                  ["freelance", "Freelance"],
                  ["temporary", "Temporary"],
                  ["apprenticeship", "Apprenticeship"],
                ].map(([slug, label]) => {
                  const active = form.jobTypes.includes(slug);
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? form.jobTypes.filter((item) => item !== slug)
                          : [...form.jobTypes, slug];
                        setForm((curr) => ({ ...curr, jobTypes: next.length > 0 ? next : [slug], jobType: next[0] || "full-time" }));
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-150 shadow-sm",
                        active
                          ? "bg-gradient-to-r from-[#0a3a7a] to-[#144999] text-white border-2 border-[#f59e0b] shadow-md -translate-y-0.5"
                          : "bg-[var(--cos-surface-container-low)] text-[var(--cos-on-surface-variant)] border border-[var(--cos-outline-variant)] hover:bg-[var(--cos-surface-container-high)] hover:text-[var(--cos-on-surface)]"
                      )}
                    >
                      <span>{label}</span>
                      {active ? <span className="text-[#f59e0b] font-black">✓</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#0a3a7a]">2. Experience & Education</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ["10th-pass-jobs", "10th pass jobs"],
                  ["12th-pass-jobs", "12th pass jobs"],
                  ["iti-jobs", "ITI jobs"],
                  ["fresher-jobs", "Fresher jobs"],
                  ["experienced-jobs", "Experienced jobs"],
                ].map(([slug, label]) => {
                  const active = form.jobTypes.includes(slug);
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? form.jobTypes.filter((item) => item !== slug)
                          : [...form.jobTypes, slug];
                        setForm((curr) => ({ ...curr, jobTypes: next.length > 0 ? next : [slug], jobType: next[0] || "full-time" }));
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-150 shadow-sm",
                        active
                          ? "bg-gradient-to-r from-[#104899] to-[#0a3a7a] text-white border-2 border-[#f59e0b] shadow-md -translate-y-0.5"
                          : "bg-[var(--cos-surface-container-low)] text-[var(--cos-on-surface-variant)] border border-[var(--cos-outline-variant)] hover:bg-[var(--cos-surface-container-high)] hover:text-[var(--cos-on-surface)]"
                      )}
                    >
                      <span>{label}</span>
                      {active ? <span className="text-[#f59e0b] font-black">✓</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#0a3a7a]">3. Healthcare & Remote</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ["nursing-home-care-job", "Nursing home care job"],
                  ["staff-nurse-job", "Staff nurse job"],
                  ["doctors-job", "Doctors job"],
                  ["work-from-home-job", "Work from home job"],
                  ["remote-jobs", "Remote jobs"],
                ].map(([slug, label]) => {
                  const active = form.jobTypes.includes(slug);
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? form.jobTypes.filter((item) => item !== slug)
                          : [...form.jobTypes, slug];
                        setForm((curr) => ({ ...curr, jobTypes: next.length > 0 ? next : [slug], jobType: next[0] || "full-time" }));
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-150 shadow-sm",
                        active
                          ? "bg-gradient-to-r from-[#0a3a7a] via-[#154b9c] to-[#0a3a7a] text-white border-2 border-[#f59e0b] shadow-md -translate-y-0.5"
                          : "bg-[var(--cos-surface-container-low)] text-[var(--cos-on-surface-variant)] border border-[var(--cos-outline-variant)] hover:bg-[var(--cos-surface-container-high)] hover:text-[var(--cos-on-surface)]"
                      )}
                    >
                      <span>{label}</span>
                      {active ? <span className="text-[#f59e0b] font-black">✓</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <TextField
          label="Short description"
          value={form.shortDescription}
          setValue={(value) => set("shortDescription", value)}
        />
        <TextArea
          label="Full description"
          value={form.fullDescription}
          setValue={(value) => set("fullDescription", value)}
        />
        <div className="grid gap-3 lg:grid-cols-3">
          <TextArea
            label="Requirements"
            value={form.requirements}
            setValue={(value) => set("requirements", value)}
          />
          <TextArea
            label="Benefits"
            value={form.benefits}
            setValue={(value) => set("benefits", value)}
          />
          <TextArea
            label="Skills"
            value={form.skills}
            setValue={(value) => set("skills", value)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.publish}
              onChange={(event) => set("publish", event.target.checked)}
            />
            Publish immediately
          </label>
          <Button
            type="submit"
            loading={live.actions.quickPostJob.isPending}
            disabled={live.actions.quickPostJob.isPending}
          >
            Post job
          </Button>
        </div>
        {publicURL ? (
          <PublicLink
            href={
              publicURL.startsWith("http")
                ? publicURL
                : `${publicSiteURL}${publicURL}`
            }
          >
            Open published job
          </PublicLink>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="rounded border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700"
          >
            {error}
          </p>
        ) : null}
      </form>
    </details>
  );
}

function RecruitmentView({ live }: { live: AdminLive }) {
  const all = items<ApplicationItem>(live.data.applications.data);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const rows = useMemo(
    () =>
      all.filter(
        (item) =>
          `${item.candidate_email ?? item.candidate_name ?? ""} ${item.job_title ?? ""} ${item.company ?? item.company_name ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (status === "all" || item.status === status),
      ),
    [all, search, status],
  );
  const columns: AdminColumn<ApplicationItem>[] = [
    {
      id: "candidate",
      header: "Candidate",
      width: 250,
      hideable: false,
      sortValue: (row) => row.candidate_email || row.candidate_name,
      cell: (row) => row.candidate_email || row.candidate_name || "",
    },
    {
      id: "job",
      header: "Job",
      sortValue: (row) => row.job_title,
      cell: (row) => row.job_title || "",
    },
    {
      id: "company",
      header: "Company",
      sortValue: (row) => row.company || row.company_name,
      cell: (row) => row.company || row.company_name || "",
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => (row.status ? <StatusBadge value={row.status} /> : null),
    },
    {
      id: "created",
      header: "Created",
      sortValue: (row) => timestamp(row.created_at),
      cell: (row) => formatDate(row.created_at),
    },
  ];
  return (
    <AdminDataTable
      label="Applications"
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id || `${row.candidate_email}-${row.created_at}`}
      search={search}
      onSearch={setSearch}
      filters={
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            ["all", "All statuses"],
            ...unique(all.map((item) => item.status).filter(isString)).map(
              (value) => [value, titleCase(value)] as [string, string],
            ),
          ]}
        />
      }
      emptyTitle="No applications found"
      emptyDescription="No recruitment records match the current filters."
    />
  );
}

function BillingView({ live }: { live: AdminLive }) {
  const plans = items<PlanItem>(live.data.plans.data);
  const business = objectValue<BusinessData>(live.data.businessDashboard.data);
  const [detail, setDetail] = useState<PlanItem>();
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>();
  const columns: AdminColumn<PlanItem>[] = [
    {
      id: "name",
      header: "Plan",
      width: 240,
      hideable: false,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div>
          <div>{row.name || row.slug}</div>
          {row.slug ? (
            <div className="text-xs text-[var(--cos-on-surface-variant)]">
              {row.slug}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      sortValue: (row) => row.price,
      cell: (row) =>
        `${row.currency || "INR"} ${Number(row.price ?? 0).toLocaleString("en-IN")}`,
    },
    {
      id: "interval",
      header: "Billing",
      sortValue: (row) => row.billing_interval || row.interval,
      cell: (row) => row.billing_interval || row.interval || "",
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.is_active,
      cell: (row) => (
        <StatusBadge value={row.is_active === false ? "Inactive" : "Active"} />
      ),
    },
  ];
  const metrics = [
    moneyMetric("Revenue", business?.revenue, <Banknote size={18} />),
    moneyMetric("MRR", business?.mrr, <Banknote size={18} />),
    moneyMetric("ARR", business?.arr, <Banknote size={18} />),
    metric(
      "Active Subscriptions",
      business?.active_subscriptions,
      <CheckCircle2 size={18} />,
    ),
  ].filter(notNull);
  return (
    <div className="grid gap-6">
      {metrics.length ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
            <DashboardCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </section>
      ) : null}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setDetail(undefined);
            setEditingPlan(null);
          }}
        >
          <Plus size={16} /> Create plan
        </Button>
      </div>
      <AdminDataTable
        label="Subscription plans"
        rows={plans}
        columns={columns}
        rowKey={(row) => String(row.id || row.slug)}
        onOpen={setDetail}
        emptyTitle="No subscription plans"
        emptyDescription="Plans will appear after they are created through the existing plans endpoint."
      />
      <AdminDrawer
        open={Boolean(detail)}
        title={detail?.name || detail?.slug || "Plan details"}
        description="Subscription plan"
        onClose={() => setDetail(undefined)}
      >
        <DetailList
          items={[
            { label: "Slug", value: detail?.slug },
            {
              label: "Price",
              value: detail
                ? `${detail.currency || "INR"} ${Number(detail.price ?? 0).toLocaleString("en-IN")}`
                : undefined,
            },
            {
              label: "Interval",
              value: detail?.billing_interval || detail?.interval,
            },
            {
              label: "Status",
              value: detail?.is_active === false ? "Inactive" : "Active",
            },
          ]}
        />
        {detail?.features && Object.keys(detail.features).length ? (
          <pre className="mt-5 overflow-auto rounded bg-[var(--cos-surface-container-low)] p-3 text-xs">
            {JSON.stringify(detail.features, null, 2)}
          </pre>
        ) : null}
        <Button
          className="mt-5"
          onClick={() => {
            setEditingPlan(detail || null);
            setDetail(undefined);
          }}
        >
          Edit plan
        </Button>
      </AdminDrawer>
      <PlanEditor
        key={
          editingPlan === undefined
            ? "closed"
            : `editor-${editingPlan?.id || "new"}`
        }
        open={editingPlan !== undefined}
        initial={editingPlan || undefined}
        actions={live.actions}
        onClose={() => setEditingPlan(undefined)}
      />
    </div>
  );
}

function BillingOverview({ live }: { live: AdminLive }) {
  const business = objectValue<
    BusinessData & {
      collections?: number;
      refunds?: number;
      invoices?: number;
      marketplace_purchases?: number;
      job_boosts?: number;
      resume_unlocks?: number;
      leads?: number;
      open_operations?: number;
    }
  >(live.data.businessDashboard.data);
  if (!business)
    return (
      <EmptyState
        title="No billing data"
        description="Billing totals will appear when the business dashboard endpoint returns records."
        icon={<Banknote size={18} />}
      />
    );
  const metrics = [
    moneyMetric("Revenue", business.revenue, <Banknote size={18} />),
    moneyMetric("Collections", business.collections, <Banknote size={18} />),
    moneyMetric("Refunds", business.refunds, <Banknote size={18} />),
    moneyMetric("MRR", business.mrr, <Banknote size={18} />),
    moneyMetric("ARR", business.arr, <Banknote size={18} />),
    metric("Invoices", business.invoices, <FileText size={18} />),
    metric(
      "Active Subscriptions",
      business.active_subscriptions,
      <CheckCircle2 size={18} />,
    ),
    metric(
      "Marketplace Purchases",
      business.marketplace_purchases,
      <Banknote size={18} />,
    ),
    metric("Job Boosts", business.job_boosts, <Briefcase size={18} />),
    metric("Resume Unlocks", business.resume_unlocks, <FileText size={18} />),
    metric("Employer Leads", business.leads, <Users size={18} />),
    metric("Open Operations", business.open_operations, <Activity size={18} />),
  ].filter(notNull);
  return (
    <section
      aria-label="Billing metrics"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6"
    >
      {metrics.map((item) => (
        <DashboardCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
        />
      ))}
    </section>
  );
}

function MarketplaceView({ live }: { live: AdminLive }) {
  const marketplace = objectValue<Record<string, unknown[]>>(
    live.data.marketplace.data,
  );
  if (!marketplace)
    return (
      <EmptyState
        title="No marketplace data"
        description="Marketplace records will appear when products or operations exist."
        icon={<Banknote size={18} />}
      />
    );
  const groups = Object.entries(marketplace);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {groups.map(([name, records]) => (
        <EnterpriseCard
          key={name}
          title={titleCase(name)}
          description={`${Array.isArray(records) ? records.length : 0} live record${Array.isArray(records) && records.length === 1 ? "" : "s"}`}
          icon={<Banknote size={18} />}
          disabled={false}
        >
          {Array.isArray(records) && records.length ? (
            <div className="grid gap-2">
              {records.slice(0, 10).map((record, index) => (
                <div
                  key={String(
                    (record as Record<string, unknown>).id ??
                      `${name}-${index}`,
                  )}
                  className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3"
                >
                  <p className="font-semibold">
                    {String(
                      (record as Record<string, unknown>).name ??
                        (record as Record<string, unknown>).title ??
                        (record as Record<string, unknown>).key ??
                        `Record ${index + 1}`,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[var(--cos-on-surface-variant)]">
                    {String(
                      (record as Record<string, unknown>).status ??
                        (record as Record<string, unknown>).channel ??
                        "Available",
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title={`No ${titleCase(name).toLowerCase()}`}
              description="No stored records are available for this category."
            />
          )}
        </EnterpriseCard>
      ))}
    </div>
  );
}

function PlanEditor({
  open,
  initial,
  actions,
  onClose,
}: {
  open: boolean;
  initial?: PlanItem;
  actions: ReturnType<typeof useAdminActions>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    price: String(initial?.price ?? ""),
    currency: initial?.currency || "INR",
    billing_interval: initial?.billing_interval || initial?.interval || "month",
    is_active: initial?.is_active ?? true,
  });
  return (
    <AdminDrawer
      open={open}
      title={initial ? "Edit plan" : "Create plan"}
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          actions.upsertPlan.mutate(
            { ...form, price: Number(form.price || 0), features: {} },
            { onSuccess: onClose },
          );
        }}
      >
        <TextField
          label="Name"
          value={form.name}
          setValue={(value) =>
            setForm((current) => ({ ...current, name: value }))
          }
          required
        />
        <TextField
          label="Slug"
          value={form.slug}
          setValue={(value) =>
            setForm((current) => ({ ...current, slug: value }))
          }
          required
        />
        <TextField
          label="Price"
          type="number"
          value={form.price}
          setValue={(value) =>
            setForm((current) => ({ ...current, price: value }))
          }
        />
        <TextField
          label="Currency"
          value={form.currency}
          setValue={(value) =>
            setForm((current) => ({ ...current, currency: value }))
          }
        />
        <Select
          label="Billing interval"
          value={form.billing_interval}
          onChange={(value) =>
            setForm((current) => ({ ...current, billing_interval: value }))
          }
          options={[
            ["month", "Monthly"],
            ["year", "Yearly"],
          ]}
        />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                is_active: event.target.checked,
              }))
            }
          />
          Active
        </label>
        <Button
          type="submit"
          loading={actions.upsertPlan.isPending}
          disabled={actions.upsertPlan.isPending}
        >
          Save plan
        </Button>
      </form>
    </AdminDrawer>
  );
}

function CmsView({ live }: { live: AdminLive }) {
  const entries = items<CmsItem>(live.data.cms.data);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const rows = entries.filter(
    (entry) =>
      `${entry.title ?? ""} ${entry.content_type ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "all" || entry.status === status),
  );
  const columns: AdminColumn<CmsItem>[] = [
    {
      id: "title",
      header: "Content",
      width: 280,
      hideable: false,
      sortValue: (row) => row.title,
      cell: (row) => row.title || "",
    },
    {
      id: "type",
      header: "Type",
      sortValue: (row) => row.content_type,
      cell: (row) => (row.content_type ? titleCase(row.content_type) : ""),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => (row.status ? <StatusBadge value={row.status} /> : null),
    },
    {
      id: "updated",
      header: "Updated",
      sortValue: (row) => timestamp(row.updated_at),
      cell: (row) => formatDate(row.updated_at),
    },
    {
      id: "published",
      header: "Published",
      sortValue: (row) => timestamp(row.published_at),
      cell: (row) => formatDate(row.published_at),
    },
  ];
  return (
    <AdminDataTable
      label="CMS entries"
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id || row.slug || row.title || "entry"}
      search={search}
      onSearch={setSearch}
      filters={
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            ["all", "All statuses"],
            ...unique(entries.map((item) => item.status).filter(isString)).map(
              (value) => [value, titleCase(value)] as [string, string],
            ),
          ]}
        />
      }
      emptyTitle="No CMS entries"
      emptyDescription="No content records match the current filters."
    />
  );
}

function AuditView({ live }: { live: AdminLive }) {
  const all = items<AuditItem>(live.data.audit.data);
  const [search, setSearch] = useState("");
  const rows = all.filter((event) =>
    `${event.action ?? ""} ${event.resource_type ?? ""} ${event.ip_address ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const columns: AdminColumn<AuditItem>[] = [
    {
      id: "action",
      header: "Action",
      width: 260,
      hideable: false,
      sortValue: (row) => row.action,
      cell: (row) => titleCase(row.action || "Event"),
    },
    {
      id: "resource",
      header: "Resource",
      sortValue: (row) => row.resource_type,
      cell: (row) => (row.resource_type ? titleCase(row.resource_type) : ""),
    },
    {
      id: "resource_id",
      header: "Resource ID",
      cell: (row) => row.resource_id || "",
    },
    {
      id: "ip",
      header: "IP Address",
      sortValue: (row) => row.ip_address,
      cell: (row) => row.ip_address || "",
    },
    {
      id: "created",
      header: "Created",
      sortValue: (row) => timestamp(row.created_at),
      cell: (row) => formatDate(row.created_at),
    },
  ];
  return (
    <AdminDataTable
      label="Audit events"
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id || `${row.action}-${row.created_at}`}
      search={search}
      onSearch={setSearch}
      emptyTitle="No audit events"
      emptyDescription="No audit records match the current search."
    />
  );
}

function MonitoringView({ live }: { live: AdminLive }) {
  const health = objectValue<Record<string, unknown>>(live.data.health.data);
  if (!health || !Object.keys(health).length)
    return (
      <EmptyState
        title="No health data"
        description="The system-health endpoint returned no measurements."
        icon={<Gauge size={18} />}
        action={
          <Button onClick={() => void live.data.health.refetch()}>Retry</Button>
        }
      />
    );
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Object.entries(health).map(([key, value]) => (
        <EnterpriseCard
          key={key}
          title={titleCase(key)}
          description="Live system-health value"
          icon={<Gauge size={18} />}
          badge={<StatusBadge value={String(value)} />}
          disabled={false}
        >
          <p className="break-words text-xl font-bold">{String(value)}</p>
        </EnterpriseCard>
      ))}
    </section>
  );
}

function SettingsView({ live }: { live: AdminLive }) {
  const settings = items<SettingItem>(live.data.settings.data);
  const groups = groupBy(settings, (item) => item.category || "General");
  if (!settings.length)
    return (
      <EmptyState
        title="No platform settings"
        description="The settings endpoint returned no configured values."
        icon={<Settings size={18} />}
      />
    );
  return (
    <div className="grid gap-6">
      {Object.entries(groups).map(([category, entries]) => (
        <EnterpriseCard
          key={category}
          title={titleCase(category)}
          description={`${entries.length} configured setting${entries.length === 1 ? "" : "s"}.`}
          icon={<Settings size={18} />}
          disabled={false}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {entries.map((setting) => (
              <SettingEditor
                key={setting.key}
                setting={setting}
                actions={live.actions}
              />
            ))}
          </div>
        </EnterpriseCard>
      ))}
    </div>
  );
}

function SettingEditor({
  setting,
  actions,
}: {
  setting: SettingItem;
  actions: ReturnType<typeof useAdminActions>;
}) {
  const [value, setValue] = useState(
    JSON.stringify(setting.value || {}, null, 2),
  );
  const [error, setError] = useState("");
  return (
    <form
      className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] p-4"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          const parsed = JSON.parse(value) as Record<string, unknown>;
          setError("");
          actions.upsertSetting.mutate({
            key: setting.key,
            category: setting.category || "general",
            value: parsed,
            is_public: Boolean(setting.is_public),
          });
        } catch {
          setError("Value must be valid JSON.");
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold">{setting.key || "Setting"}</h3>
        <Badge>{setting.is_public ? "Public" : "Private"}</Badge>
      </div>
      <textarea
        aria-label={`${setting.key} value`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={5}
        className={cn(
          inputClass,
          "mt-3 h-auto min-h-28 py-2 font-mono text-xs",
        )}
      />
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        className="mt-3"
        size="sm"
        type="submit"
        loading={actions.upsertSetting.isPending}
        disabled={actions.upsertSetting.isPending}
      >
        Save
      </Button>
    </form>
  );
}

function SeoView({ live }: { live: AdminLive }) {
  const templates = items<SeoItem>(live.data.seo.data);
  const columns: AdminColumn<SeoItem>[] = [
    {
      id: "key",
      header: "Key",
      hideable: false,
      width: 220,
      sortValue: (row) => row.key,
      cell: (row) => row.key || "",
    },
    {
      id: "title",
      header: "Title template",
      sortValue: (row) => row.title_template,
      cell: (row) => row.title_template || "",
    },
    {
      id: "description",
      header: "Description template",
      cell: (row) => row.description_template || "",
    },
    {
      id: "updated",
      header: "Updated",
      sortValue: (row) => timestamp(row.updated_at),
      cell: (row) => formatDate(row.updated_at),
    },
  ];
  return (
    <div className="grid gap-6">
      <SeoForm actions={live.actions} />
      <AdminDataTable
        label="SEO templates"
        rows={templates}
        columns={columns}
        rowKey={(row) => row.key || "template"}
        emptyTitle="No SEO templates"
        emptyDescription="Create the first metadata template with the form above."
      />
    </div>
  );
}

function SeoForm({ actions }: { actions: ReturnType<typeof useAdminActions> }) {
  const [form, setForm] = useState({
    key: "",
    title_template: "",
    description_template: "",
  });
  return (
    <FormCard
      title="SEO Template"
      description="Create or update a reusable metadata template."
      icon={<Search size={18} />}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          actions.upsertSeo.mutate({ ...form, schema_defaults: {} });
        }}
      >
        <TextField
          label="Template key"
          value={form.key}
          setValue={(value) =>
            setForm((current) => ({ ...current, key: value }))
          }
          required
        />
        <TextField
          label="Title template"
          value={form.title_template}
          setValue={(value) =>
            setForm((current) => ({ ...current, title_template: value }))
          }
          required
        />
        <TextArea
          label="Description template"
          value={form.description_template}
          setValue={(value) =>
            setForm((current) => ({ ...current, description_template: value }))
          }
          required
        />
        <Button
          type="submit"
          loading={actions.upsertSeo.isPending}
          disabled={actions.upsertSeo.isPending}
        >
          Save template
        </Button>
      </form>
    </FormCard>
  );
}
function ReportForm({
  actions,
}: {
  actions: ReturnType<typeof useAdminActions>;
}) {
  const [type, setType] = useState("users");
  const [format, setFormat] = useState("csv");
  return (
    <FormCard
      title="Generate Report"
      description="Request a report using the formats supported by the existing endpoint."
      icon={<FileBarChart size={18} />}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          actions.createReport.mutate({
            report_type: type,
            format,
            filters: {},
          });
        }}
      >
        <Select
          label="Report type"
          value={type}
          onChange={setType}
          options={[
            ["users", "Users"],
            ["companies", "Companies"],
            ["jobs", "Jobs"],
            ["applications", "Applications"],
            ["revenue", "Revenue"],
          ]}
        />
        <Select
          label="Format"
          value={format}
          onChange={setFormat}
          options={[
            ["csv", "CSV"],
            ["excel", "Excel"],
            ["pdf", "PDF"],
          ]}
        />
        <Button
          type="submit"
          loading={actions.createReport.isPending}
          disabled={actions.createReport.isPending}
        >
          Generate report
        </Button>
      </form>
    </FormCard>
  );
}
function ReportsView({ live }: { live: AdminLive }) {
  const reports = items<ReportItem>(live.data.reports.data);
  const columns: AdminColumn<ReportItem>[] = [
    {
      id: "type",
      header: "Report",
      hideable: false,
      sortValue: (row) => row.report_type,
      cell: (row) => titleCase(row.report_type || "Report"),
    },
    {
      id: "format",
      header: "Format",
      sortValue: (row) => row.format,
      cell: (row) => (row.format || "").toUpperCase(),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge value={row.status || "queued"} />,
    },
    {
      id: "created",
      header: "Created",
      sortValue: (row) => timestamp(row.created_at),
      cell: (row) => formatDate(row.created_at),
    },
    {
      id: "download",
      header: "Download",
      cell: (row) =>
        row.status === "ready" && row.file_url ? (
          <PublicLink href={row.file_url}>Download</PublicLink>
        ) : (
          <span className="text-xs text-[var(--cos-on-surface-variant)]">
            Unavailable
          </span>
        ),
    },
  ];
  return (
    <div className="grid gap-6">
      <ReportForm actions={live.actions} />
      <AdminDataTable
        label="Report history"
        rows={reports}
        columns={columns}
        rowKey={(row) => row.id || `${row.report_type}-${row.created_at}`}
        emptyTitle="No reports"
        emptyDescription="Generated report requests will appear here."
      />
    </div>
  );
}
function SupportForm({
  actions,
}: {
  actions: ReturnType<typeof useAdminActions>;
}) {
  const [form, setForm] = useState({
    email: "",
    ticket_type: "ticket",
    subject: "",
    message: "",
    priority: "normal",
  });
  return (
    <FormCard
      title="Create Support Ticket"
      description="Create an operational ticket and add it to the support queue."
      icon={<LifeBuoy size={18} />}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          actions.createTicket.mutate(form);
        }}
      >
        <TextField
          label="Email"
          type="email"
          value={form.email}
          setValue={(value) =>
            setForm((current) => ({ ...current, email: value }))
          }
        />
        <Select
          label="Ticket type"
          value={form.ticket_type}
          onChange={(value) =>
            setForm((current) => ({ ...current, ticket_type: value }))
          }
          options={[
            ["ticket", "Support ticket"],
            ["feedback", "Feedback"],
            ["contact", "Contact"],
            ["bug", "Bug report"],
            ["feature", "Feature request"],
          ]}
        />
        <TextField
          label="Subject"
          value={form.subject}
          setValue={(value) =>
            setForm((current) => ({ ...current, subject: value }))
          }
          required
        />
        <TextArea
          label="Message"
          value={form.message}
          setValue={(value) =>
            setForm((current) => ({ ...current, message: value }))
          }
          required
        />
        <Select
          label="Priority"
          value={form.priority}
          onChange={(value) =>
            setForm((current) => ({ ...current, priority: value }))
          }
          options={[
            ["low", "Low"],
            ["normal", "Normal"],
            ["high", "High"],
            ["urgent", "Urgent"],
          ]}
        />
        <Button
          type="submit"
          loading={actions.createTicket.isPending}
          disabled={actions.createTicket.isPending}
        >
          Create ticket
        </Button>
      </form>
    </FormCard>
  );
}
function SupportView({ live }: { live: AdminLive }) {
  const tickets = items<TicketItem>(live.data.tickets.data);
  const columns: AdminColumn<TicketItem>[] = [
    {
      id: "subject",
      header: "Subject",
      hideable: false,
      width: 280,
      sortValue: (row) => row.subject,
      cell: (row) => (
        <div>
          <div className="font-semibold">{row.subject}</div>
          <div className="text-xs text-[var(--cos-on-surface-variant)]">
            {row.email}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      sortValue: (row) => row.ticket_type,
      cell: (row) => titleCase(row.ticket_type || "ticket"),
    },
    {
      id: "priority",
      header: "Priority",
      sortValue: (row) => row.priority,
      cell: (row) => <StatusBadge value={row.priority || "normal"} />,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge value={row.status || "open"} />,
    },
    {
      id: "created",
      header: "Created",
      sortValue: (row) => timestamp(row.created_at),
      cell: (row) => formatDate(row.created_at),
    },
  ];
  return (
    <div className="grid gap-6">
      <SupportForm actions={live.actions} />
      <AdminDataTable
        label="Support queue"
        rows={tickets}
        columns={columns}
        rowKey={(row) => row.id || `${row.subject}-${row.created_at}`}
        emptyTitle="No support tickets"
        emptyDescription="New support requests will appear here."
      />
    </div>
  );
}

function ConfirmationDialog({
  value,
  setValue,
}: {
  value?: Confirmation;
  setValue: (value?: Confirmation) => void;
}) {
  return (
    <ConfirmDialog
      open={Boolean(value)}
      title={value?.title || "Confirm action"}
      description={value?.description || ""}
      confirmLabel={value?.label || "Confirm"}
      intent={value?.intent}
      busy={value?.busy}
      onCancel={() => setValue(undefined)}
      onConfirm={() => {
        if (!value) return;
        void value.run().finally(() => setValue(undefined));
      }}
    />
  );
}
function RoleEditor({
  user,
  actions,
}: {
  user: UserItem;
  actions: ReturnType<typeof useAdminActions>;
}) {
  const [role, setRole] = useState(user.role || "JOB_SEEKER");
  return (
    <form
      className="mt-6 border-t border-[var(--cos-outline-variant)] pt-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (user.id) actions.assignRole.mutate({ id: user.id, role });
      }}
    >
      <Select
        label="Assigned role"
        value={role}
        onChange={setRole}
        options={[
          ["JOB_SEEKER", "Job Seeker"],
          ["EMPLOYER", "Employer"],
          ["ADMIN", "Admin"],
          ["SUPER_ADMIN", "Super Admin"],
        ]}
      />
      <Button
        className="mt-3"
        type="submit"
        loading={actions.assignRole.isPending}
        disabled={actions.assignRole.isPending}
      >
        Update role
      </Button>
    </form>
  );
}
function ActivityTimeline({
  values,
}: {
  values: Array<{ label: string; date?: string }>;
}) {
  const available = values.filter((item) => item.label && item.date);
  if (!available.length) return null;
  return (
    <section className="mt-6 border-t border-[var(--cos-outline-variant)] pt-5">
      <h3 className="font-bold">Activity</h3>
      <ol className="mt-3 grid gap-3">
        {available.map((item) => (
          <li key={`${item.label}-${item.date}`} className="flex gap-3 text-sm">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--cos-primary)]" />
            <span>
              <strong>{item.label}</strong>
              <time className="ml-2 text-[var(--cos-on-surface-variant)]">
                {formatDate(item.date)}
              </time>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
function DetailArray({ title, values }: { title: string; values?: string[] }) {
  if (!values?.length) return null;
  return (
    <section className="mt-5">
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-2 grid gap-2 text-sm text-[var(--cos-on-surface-variant)]">
        {values.map((value) => (
          <li key={value} className="flex gap-2">
            <span>•</span>
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
function FormCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <EnterpriseCard
        title={title}
        description={description}
        icon={icon}
        disabled={false}
      >
        {children}
      </EnterpriseCard>
    </div>
  );
}
function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex min-h-11 items-center justify-between rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] px-3 text-sm font-semibold transition hover:border-[var(--cos-primary)] hover:bg-[var(--cos-surface-container-low)]"
    >
      <span>{label}</span>
      <span aria-hidden="true">→</span>
    </a>
  );
}
function FilterGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "w-auto min-w-36")}
      >
        {options.map(([option, text]) => (
          <option key={option} value={option}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
function TextField({
  label,
  value,
  setValue,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      <span>{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}
function TextArea({
  label,
  value,
  setValue,
  required,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      <span>{label}</span>
      <textarea
        required={required}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={5}
        className={cn(inputClass, "h-auto min-h-28 py-2")}
      />
    </label>
  );
}
function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone =
    normalized.includes("active") ||
    normalized.includes("verified") ||
    normalized.includes("published") ||
    normalized === "ok" ||
    normalized === "healthy"
      ? "success"
      : normalized.includes("reject") ||
          normalized.includes("suspend") ||
          normalized.includes("error")
        ? "danger"
        : normalized.includes("pending") || normalized.includes("draft")
          ? "warning"
          : "info";
  return <Badge tone={tone}>{titleCase(value)}</Badge>;
}

function metric(
  label: string,
  value: number | undefined,
  icon: React.ReactNode,
) {
  return value === undefined
    ? null
    : { label, value: Number(value).toLocaleString("en-IN"), icon };
}
function moneyMetric(
  label: string,
  value: number | undefined,
  icon: React.ReactNode,
) {
  return value === undefined
    ? null
    : { label, value: `INR ${Number(value).toLocaleString("en-IN")}`, icon };
}
function salary(job: PublicJob) {
  if (job.salary_min == null && job.salary_max == null) return undefined;
  return `${job.currency || "INR"} ${Number(job.salary_min ?? job.salary_max).toLocaleString("en-IN")}${job.salary_min != null && job.salary_max != null ? ` - ${Number(job.salary_max).toLocaleString("en-IN")}` : ""}`;
}
function experience(job: PublicJob) {
  if (job.experience_min == null && job.experience_max == null) return "";
  return `${job.experience_min ?? 0}-${job.experience_max ?? job.experience_min ?? 0} years`;
}
function formatDate(value?: string) {
  if (!value || !timestamp(value)) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
function timestamp(value?: string) {
  const parsed = value ? Date.parse(value) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}
function isWithinDays(value: string | undefined, days: number) {
  return Boolean(value) && Date.now() - timestamp(value) <= days * 86_400_000;
}
function matchesExperience(job: PublicJob, filter: string) {
  const minimum = job.experience_min ?? 0;
  if (filter === "entry") return minimum <= 2;
  if (filter === "mid") return minimum >= 3 && minimum <= 5;
  if (filter === "senior") return minimum >= 6;
  return true;
}
function items<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (
    value &&
    typeof value === "object" &&
    "items" in value &&
    Array.isArray((value as { items?: unknown }).items)
  )
    return (value as { items: T[] }).items;
  return [];
}
function objectValue<T>(value: unknown): T | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as T)
    : undefined;
}
function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
function groupBy<T>(values: T[], key: (value: T) => string) {
  return values.reduce<Record<string, T[]>>((groups, value) => {
    const group = key(value);
    groups[group] = [...(groups[group] || []), value];
    return groups;
  }, {});
}
function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function notNull<T>(value: T | null): value is T {
  return value !== null;
}
