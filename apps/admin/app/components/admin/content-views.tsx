"use client";

import { Gauge, Search, Settings } from "lucide-react";
import { useState } from "react";

import { useAdminActions } from "@career-os/hooks";
import { Badge, Button, EmptyState, EnterpriseCard } from "@career-os/ui";
import { cn } from "@career-os/utils";

import type { AdminLive, AuditItem, CmsItem, SeoItem, SettingItem } from "../admin-portal";
import { inputClass } from "../admin-portal";
import { AdminColumn, AdminDataTable } from "../admin-data-table";

import { FormCard, Select, StatusBadge, TextArea, TextField } from "./shared";
import { formatDate, groupBy, isString, items, objectValue, timestamp, titleCase, unique } from "./utils";

export function CmsView({ live }: { live: AdminLive }) {
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

export function AuditView({ live }: { live: AdminLive }) {
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

export function MonitoringView({ live }: { live: AdminLive }) {
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

export function SettingsView({ live }: { live: AdminLive }) {
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

export function SeoView({ live }: { live: AdminLive }) {
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
