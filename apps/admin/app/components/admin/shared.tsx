"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { useAdminActions } from "@career-os/hooks";
import { Badge, Button, EnterpriseCard } from "@career-os/ui";
import { cn } from "@career-os/utils";

import { inputClass, type Confirmation, type UserItem } from "../admin-portal";
import { ConfirmDialog } from "../admin-overlays";

import { formatDate, titleCase } from "./utils";

export function ConfirmationDialog({
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
export function RoleEditor({
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
export function ActivityTimeline({
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
export function DetailArray({ title, values }: { title: string; values?: string[] }) {
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
export function FormCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
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
export function QuickLink({ href, label }: { href: string; label: string }) {
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
export function FilterGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
export function Select({
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
export function TextField({
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
export function TextArea({
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
export function StatusBadge({ value }: { value: string }) {
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

