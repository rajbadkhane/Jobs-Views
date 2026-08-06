"use client";

import { Plus } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { apiErrorMessage, type PublicJob } from "@career-os/shared";
import { Badge, Button } from "@career-os/ui";
import { cn } from "@career-os/utils";

import type { AdminLive, ApplicationItem, Confirmation } from "../admin-portal";
import { inputClass, publicSiteURL } from "../admin-portal";
import { AdminColumn, AdminDataTable } from "../admin-data-table";
import { AdminDrawer, DetailList, PublicLink } from "../admin-overlays";

import { ConfirmationDialog, DetailArray, ActivityTimeline, FilterGroup, Select, StatusBadge, TextArea, TextField } from "./shared";
import { experience, formatDate, isString, isWithinDays, items, matchesExperience, salary, timestamp, titleCase, unique } from "./utils";

export function JobsView({ live }: { live: AdminLive }) {
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
          (jobType === "all" || job.job_type === jobType || (Array.isArray(job.job_types) && job.job_types.includes(jobType)) || (Array.isArray(job.job_types_list) && job.job_types_list.includes(jobType))) &&
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
        const list = Array.isArray(row.job_types) && row.job_types.length ? row.job_types : Array.isArray(row.job_types_list) && row.job_types_list.length ? row.job_types_list : row.job_type ? [row.job_type] : [];
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
                  all.flatMap((item) => [item.job_type, ...(Array.isArray(item.job_types) ? item.job_types : []), ...(Array.isArray(item.job_types_list) ? item.job_types_list : [])]).filter(isString),
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
  const submit = async (event: FormEvent) => {
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

export function RecruitmentView({ live }: { live: AdminLive }) {
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

