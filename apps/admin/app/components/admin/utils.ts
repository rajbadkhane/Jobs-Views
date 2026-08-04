import type { ReactNode } from "react";

import type { PublicJob } from "@career-os/shared";

export function metric(
  label: string,
  value: number | undefined,
  icon: ReactNode,
) {
  return value === undefined
    ? null
    : { label, value: Number(value).toLocaleString("en-IN"), icon };
}
export function moneyMetric(
  label: string,
  value: number | undefined,
  icon: ReactNode,
) {
  return value === undefined
    ? null
    : { label, value: `INR ${Number(value).toLocaleString("en-IN")}`, icon };
}
export function salary(job: PublicJob) {
  if (job.salary_min == null && job.salary_max == null) return undefined;
  return `${job.currency || "INR"} ${Number(job.salary_min ?? job.salary_max).toLocaleString("en-IN")}${job.salary_min != null && job.salary_max != null ? ` - ${Number(job.salary_max).toLocaleString("en-IN")}` : ""}`;
}
export function experience(job: PublicJob) {
  if (job.experience_min == null && job.experience_max == null) return "";
  return `${job.experience_min ?? 0}-${job.experience_max ?? job.experience_min ?? 0} years`;
}
export function formatDate(value?: string) {
  if (!value || !timestamp(value)) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
export function timestamp(value?: string) {
  const parsed = value ? Date.parse(value) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}
export function isWithinDays(value: string | undefined, days: number) {
  return Boolean(value) && Date.now() - timestamp(value) <= days * 86_400_000;
}
export function matchesExperience(job: PublicJob, filter: string) {
  const minimum = job.experience_min ?? 0;
  if (filter === "entry") return minimum <= 2;
  if (filter === "mid") return minimum >= 3 && minimum <= 5;
  if (filter === "senior") return minimum >= 6;
  return true;
}
export function items<T>(value: unknown): T[] {
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
export function objectValue<T>(value: unknown): T | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as T)
    : undefined;
}
export function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
export function groupBy<T>(values: T[], key: (value: T) => string) {
  return values.reduce<Record<string, T[]>>((groups, value) => {
    const group = key(value);
    groups[group] = [...(groups[group] || []), value];
    return groups;
  }, {});
}
export function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
export function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
export function notNull<T>(value: T | null): value is T {
  return value !== null;
}
