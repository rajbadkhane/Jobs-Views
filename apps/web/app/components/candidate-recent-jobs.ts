import type { PublicJob } from "@career-os/shared";

export type RecentJob = Pick<PublicJob, "id" | "slug" | "title" | "company_name" | "company_logo_url" | "city" | "state" | "country" | "work_mode" | "job_type" | "salary_min" | "salary_max" | "currency" | "skills"> & { viewed_at: string };

export const recentJobsStorageKey = "jobsview.recent-jobs";

export function rememberRecentJob(job: PublicJob) {
  if (typeof window === "undefined") return;
  const entry: RecentJob = {
    id: job.id,
    slug: job.slug,
    title: job.title,
    company_name: job.company_name,
    company_logo_url: job.company_logo_url,
    city: job.city,
    state: job.state,
    country: job.country,
    work_mode: job.work_mode,
    job_type: job.job_type,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    currency: job.currency,
    skills: job.skills,
    viewed_at: new Date().toISOString()
  };
  try {
    const parsed = JSON.parse(localStorage.getItem(recentJobsStorageKey) || "[]") as unknown;
    const previous = Array.isArray(parsed) ? parsed : [];
    const next = [entry, ...previous.filter((value) => !sameJob(value, job.id, job.slug))].slice(0, 10);
    localStorage.setItem(recentJobsStorageKey, JSON.stringify(next));
  } catch {
    localStorage.setItem(recentJobsStorageKey, JSON.stringify([entry]));
  }
}

function sameJob(value: unknown, id: string, slug: string) {
  if (!value || typeof value !== "object") return false;
  const record = value as { id?: unknown; slug?: unknown };
  return record.id === id || record.slug === slug;
}
