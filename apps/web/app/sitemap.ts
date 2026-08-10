import type { MetadataRoute } from "next";

import { appConfig } from "@career-os/config";
import { companyApi, contentPath, jobsApi, listPublishedContent, type PublicCompany, type PublicJob } from "@career-os/shared";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicPaths = ["/", "/jobs", "/companies", "/career-guides", "/guidance", "/interview-hub", "/learning-center", "/salary", "/salary/calculator", "/salary/methodology", "/salary/india-report-2026", "/resume-builder", "/plans", "/help", "/contact", "/privacy", "/terms", "/cookies", "/accessibility"];
  const [jobs, companies] = await Promise.all([loadJobs(), loadCompanies()]);
  const now = new Date();
  const entries: MetadataRoute.Sitemap = publicPaths.map((path) => entry(path, now, path === "/" ? 1 : 0.7));
  for (const job of jobs) {
    if (job.expiry_date && new Date(job.expiry_date) < now) continue;
    entries.push(entry(`/jobs/${job.slug}`, new Date(job.updated_at || job.published_at || now), 0.9));
  }
  for (const company of companies) entries.push(entry(`/companies/${company.slug}`, new Date(company.updated_at || now), 0.8));
  for (const path of listPublishedContent().map(contentPath)) entries.push(entry(path, now, 0.7));

  // Programmatic SEO Pages
  const roles = [
    "iti", "nursing", "react-developer", "frontend-developer", "backend-developer", "data-scientist", "sales",
    "driver", "delivery-boy", "backoffice", "data-entry", "security-guard", "receptionist", "telecaller", "customer-support"
  ];
  const locations = ["bhopal", "bengaluru", "hyderabad", "pune", "mumbai", "delhi", "remote", "india"];
  
  for (const role of roles) {
    entries.push(entry(`/jobs/${role}-jobs`, now, 0.9));
    for (const location of locations) {
      entries.push(entry(`/jobs/${role}-jobs-in-${location}`, now, 0.8));
    }
  }
  for (const location of locations) {
    entries.push(entry(`/jobs/jobs-in-${location}`, now, 0.9));
  }

  return Array.from(new Map(entries.map((item) => [item.url, item])).values());
}

async function loadJobs() { try { return items<PublicJob>(await jobsApi.search({ limit: 100, sort: "latest" })); } catch { return []; } }
async function loadCompanies() { try { return items<PublicCompany>(await companyApi.search({ limit: 100 })); } catch { return []; } }
function items<T>(value: unknown): T[] { if (Array.isArray(value)) return value as T[]; if (value && typeof value === "object" && "items" in value && Array.isArray((value as { items: unknown }).items)) return (value as { items: T[] }).items; return []; }
function entry(path: string, lastModified: Date, priority: number): MetadataRoute.Sitemap[number] { return { url: new URL(path, appConfig.siteUrl).toString(), lastModified, changeFrequency: path.startsWith("/jobs") ? "daily" : "weekly", priority }; }
