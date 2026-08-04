"use client";

import { Activity, Banknote, Briefcase, Building2, ClipboardCheck, FileBarChart, Gauge, Plus, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";

import type { PublicCompany } from "@career-os/shared";
import { Badge, Button, Chart, ChartShell, DashboardCard, EmptyState, EnterpriseCard } from "@career-os/ui";
import { cn } from "@career-os/utils";

import type { AdminLive, AuditItem, BusinessData, Confirmation, DashboardData, DashboardTrends, TrendPoint, UserItem } from "../admin-portal";
import { inputClass, publicSiteURL } from "../admin-portal";
import { AdminColumn, AdminDataTable } from "../admin-data-table";
import { AdminDrawer, DetailList, PublicLink } from "../admin-overlays";

import { ActivityTimeline, ConfirmationDialog, FilterGroup, QuickLink, RoleEditor, Select, StatusBadge } from "./shared";
import { formatDate, isString, items, metric, moneyMetric, notNull, objectValue, timestamp, titleCase, unique } from "./utils";

export function DashboardView({ live }: { live: AdminLive }) {
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

export function UsersView({
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

export function CompaniesView({ live }: { live: AdminLive }) {
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

