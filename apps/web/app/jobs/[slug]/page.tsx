import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { appConfig } from "@career-os/config";
import { jobPostingSchema, jobsApi, type PublicJob } from "@career-os/shared";

import { JobDetailExperience } from "../../components/job-detail-experience";
import { JobSearchExperience } from "../../components/job-search-experience";
import { parseSeoSlug, seoPageMetadata, seoSchemas, itemListSchema } from "../../seo-utils";

type Props = { params: { slug: string } };
type JobLoadResult =
  | { status: "success"; job: PublicJob }
  | { status: "not-found" }
  | { status: "error" };

const loadJob = cache(async (slug: string): Promise<JobLoadResult> => {
  try {
    return { status: "success", job: await jobsApi.publicBySlug(slug) };
  } catch (error) {
    if (errorStatus(error) === 404) return { status: "not-found" };
    return { status: "error" };
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await loadJob(params.slug);
  if (result.status === "not-found") {
    const seo = parseSeoSlug(params.slug);
    if (seo.isValid) {
      return seoPageMetadata(seo.title, seo.description, `/jobs/${params.slug}`);
    }
    return { title: "Job Not Found | Jobs View", robots: { index: false, follow: false } };
  }
  if (result.status === "error") {
    return {
      ...seoPageMetadata("Job details unavailable", "This job could not be loaded right now.", `/jobs/${params.slug}`),
      robots: { index: false, follow: false }
    };
  }

  const { job } = result;
  const description = metadataDescription(job);
  return seoPageMetadata(
    job.meta_title?.trim() || `${job.title} at ${job.company_name} | Jobs View`,
    job.meta_description?.trim() || description,
    `/jobs/${job.slug}`,
    job.company_logo_url || undefined
  );
}

export default async function Page({ params }: Props) {
  const result = await loadJob(params.slug);
  
  if (result.status === "not-found") {
    const seo = parseSeoSlug(params.slug);
    if (seo.isValid) {
      // It's a programmatic SEO page
      let jobLinks: { name: string; url: string }[] = [];
      try {
        const keywordParts = [seo.role, seo.category].filter(Boolean);
        const searchResults = await jobsApi.search({
          limit: 10,
          q: keywordParts.join(" ") || undefined,
          city: seo.location,
          sort: "latest"
        });
        
        // Extract array if it's wrapped in { data: [] } or { items: [] }
        const jobsList = Array.isArray(searchResults) ? searchResults : (searchResults as any).data || (searchResults as any).items || [];
        
        jobLinks = jobsList.map((job: any) => ({
          name: job.title,
          url: `/jobs/${job.slug || job.id}`
        }));
      } catch (e) {
        // Silently fail search if API is down, but still render the SEO page
      }

      const schemas = [
        ...seoSchemas("CollectionPage", seo.title, `/jobs/${params.slug}`, seo.description),
        itemListSchema(seo.title, `/jobs/${params.slug}`, jobLinks) 
      ];
      return (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
          <JobSearchExperience />
        </>
      );
    }
    notFound();
  }

  const job = result.status === "success" ? result.job : undefined;
  const schemas = job
    ? [
        ...seoSchemas("WebPage", job.title, `/jobs/${job.slug}`, metadataDescription(job)),
        liveJobPostingSchema(job)
      ]
    : [];

  return (
    <>
      {schemas.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} /> : null}
      <JobDetailExperience slug={params.slug} initialJob={job} />
    </>
  );
}

function liveJobPostingSchema(job: PublicJob) {
  const description = job.full_description?.trim() || job.short_description?.trim() || metadataDescription(job);
  const location = [job.city, job.state, job.country].filter(Boolean).join(", ");
  const schema = jobPostingSchema({
    title: job.title,
    description,
    slug: job.slug,
    company: job.company_name,
    location,
    salaryMin: job.salary_min ?? 0,
    salaryMax: job.salary_max ?? 0,
    currency: job.currency || "",
    employmentType: job.job_type ? employmentType(job.job_type) : "",
    skills: (job.skills ?? []).map((skill) => skill.name).filter(Boolean),
    validThrough: job.expiry_date
  }) as Record<string, unknown>;

  schema.identifier = { "@type": "PropertyValue", name: job.company_name, value: job.id };
  schema.hiringOrganization = {
    "@type": "Organization",
    name: job.company_name,
    url: new URL(`/companies/${job.company_slug || job.company_id}`, appConfig.siteUrl).toString(),
    ...(job.company_logo_url ? { logo: job.company_logo_url } : {})
  };
  if (job.published_at || job.created_at) schema.datePosted = job.published_at || job.created_at;
  else delete schema.datePosted;
  if (!job.expiry_date) delete schema.validThrough;
  if (!job.job_type) delete schema.employmentType;
  delete schema.directApply;

  if ((job.salary_min || job.salary_max) && job.currency) {
    const salary = job.salary_min && job.salary_max
      ? { minValue: job.salary_min, maxValue: job.salary_max }
      : { value: job.salary_min || job.salary_max };
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: { "@type": "QuantitativeValue", ...salary, unitText: salaryUnit(job.salary_period) }
    };
  } else {
    delete schema.baseSalary;
  }

  if (job.work_mode === "remote") {
    schema.jobLocationType = "TELECOMMUTE";
    if (job.country) schema.applicantLocationRequirements = { "@type": "Country", name: job.country };
    delete schema.jobLocation;
  } else if (location) {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.city ? { addressLocality: job.city } : {}),
        ...(job.state ? { addressRegion: job.state } : {}),
        ...(job.country ? { addressCountry: job.country } : {})
      }
    };
    delete schema.jobLocationType;
    delete schema.applicantLocationRequirements;
  } else {
    delete schema.jobLocation;
    delete schema.jobLocationType;
    delete schema.applicantLocationRequirements;
  }

  assignList(schema, "skills", (job.skills ?? []).map((skill) => skill.name));
  assignList(schema, "responsibilities", job.responsibilities);
  assignList(schema, "qualifications", job.qualifications);
  assignList(schema, "experienceRequirements", job.requirements);
  assignList(schema, "benefits", job.benefits);
  return schema;
}

function salaryUnit(period?: PublicJob["salary_period"]) {
  if (period === "hourly") return "HOUR";
  if (period === "daily") return "DAY";
  if (period === "monthly") return "MONTH";
  return "YEAR";
}

function assignList(schema: Record<string, unknown>, key: string, values?: string[]) {
  const items = (values ?? []).map((value) => value.trim()).filter(Boolean);
  if (items.length) schema[key] = items.join("; ");
  else delete schema[key];
}

function metadataDescription(job: PublicJob) {
  const source = job.short_description?.trim() || job.full_description?.trim() || `${job.title} at ${job.company_name}`;
  const text = source.replace(/\s+/g, " ");
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

function employmentType(value?: string) {
  return value?.trim().replace(/[\s-]+/g, "_").toUpperCase() || "OTHER";
}

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) return undefined;
  return (error as { response?: { status?: number } }).response?.status;
}
