"use client";

import { Activity, Banknote, Briefcase, CheckCircle2, FileText, Plus, Users } from "lucide-react";
import { useState } from "react";

import { useAdminActions } from "@career-os/hooks";
import { Button, DashboardCard, EmptyState, EnterpriseCard } from "@career-os/ui";

import type { AdminLive, BusinessData, PlanItem } from "../admin-portal";
import { AdminColumn, AdminDataTable } from "../admin-data-table";
import { AdminDrawer, DetailList } from "../admin-overlays";

import { Select, StatusBadge, TextField } from "./shared";
import { items, metric, moneyMetric, notNull, objectValue, titleCase } from "./utils";

export function SubscriptionsView({ live }: { live: AdminLive }) {
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

export function BillingView({ live }: { live: AdminLive }) {
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

export function MarketplaceView({ live }: { live: AdminLive }) {
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

