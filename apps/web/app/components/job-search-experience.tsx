"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Filter,
  Grid2X2,
  IndianRupee,
  List,
  MapPin,
  Search,
  Share2,
  SlidersHorizontal,
  Trash2,
  X,
  Zap
} from "lucide-react";

import { useCandidateActions, useCandidateData, useJobsSearch, useSession } from "@career-os/hooks";
import type { PublicJob } from "@career-os/shared";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Sheet,
  SkeletonCard,
  AIFitBadge,
  ATSAdvisorDialog
} from "@career-os/ui";
import { cn } from "@career-os/utils";

type SearchJob = PublicJob & {
  applications?: number;
  company_verified?: boolean;
  verified_badge?: boolean;
};

type SearchFilters = {
  q: string;
  location: string;
  category: string;
  experience: string;
  salary: string;
  type: string;
  mode: string;
  notice_period: string;
  industry: string;
  company: string;
  education: string;
  skills: string;
  date: string;
  sort: SortValue;
  page: number;
};

type FilterKey = Exclude<keyof SearchFilters, "page" | "sort">;
type SortValue = "relevance" | "newest" | "salary_desc" | "salary_asc" | "company";
type ViewMode = "card" | "compact";
type SavedFilter = { id: string; name: string; params: string };
type Suggestion = { id: string; label: string; group: string; key: "q" | "location" | "company" | "skills"; value: string };

const PAGE_SIZE = 12;
const containerClass = "mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8";
const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cos-surface)]";
const primaryLinkClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-primary-container)] bg-[var(--cos-primary-container)] px-4 text-sm font-semibold text-white shadow-career-sm transition hover:-translate-y-px hover:bg-[var(--cos-primary)] hover:shadow-career-hover active:translate-y-0 active:scale-[0.98]";
const secondaryLinkClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-4 text-sm font-semibold text-[var(--cos-on-surface)] transition hover:-translate-y-px hover:border-[var(--cos-border-hover)] hover:bg-[var(--cos-surface-container-low)]";
const historyKey = "jobsview.job-search.history";
const savedFiltersKey = "jobsview.job-search.saved-filters";
const viewKey = "jobsview.job-search.view";
const expandedKey = "jobsview.job-search.expanded";
const savedJobsKey = "jobsview.saved-job-ids";

const quickSearches = ["React", "Next.js", "Java", "Python", "Remote", "AI", "Government", "Internship", "Freshers", "Experienced", "Nursing home care", "Staff nurse", "Doctors", "Work from home", "Data Science", "Product Manager", "UX Designer"];
const popularSkills = ["React", "Java", "Python", "SQL", "AWS", "Data Science", "Digital Marketing", "Sales"];
const popularCompanies = [
  { label: "TCS", value: "tcs" },
  { label: "Infosys", value: "infosys" },
  { label: "Wipro", value: "wipro" },
  { label: "Accenture", value: "accenture" },
  { label: "Amazon", value: "amazon" }
];
const popularLocations = ["Bengaluru", "Hyderabad", "Pune", "Mumbai", "Delhi", "Indore", "Remote"];

const sortOptions: { value: SortValue; label: string }[] = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "salary_desc", label: "Highest salary" },
  { value: "salary_asc", label: "Lowest salary" },
  { value: "company", label: "Company A-Z" }
];

const filterGroups: { id: string; title: string; key: FilterKey; options: { label: string; value: string }[] }[] = [
  { id: "category", title: "Categories", key: "category", options: ["Technology", "Government", "Healthcare", "Nursing home care", "Staff nurse", "Doctors", "Work from home", "Finance", "Sales", "Education"].map(valueOption) },
  { id: "location", title: "Location", key: "location", options: popularLocations.filter((item) => item !== "Remote").map(valueOption) },
  { id: "notice_period", title: "Notice Period & Availability", key: "notice_period", options: [{ label: "Immediate Joiner", value: "immediate" }, { label: "15 Days", value: "15-days" }, { label: "30 Days", value: "30-days" }, { label: "60+ Days", value: "60-plus-days" }] },
  { id: "experience", title: "Experience", key: "experience", options: [{ label: "Fresher", value: "0" }, { label: "Experienced (1+ years)", value: "1" }, { label: "Experienced (3+ years)", value: "3" }, { label: "Experienced (5+ years)", value: "5" }, { label: "Experienced (8+ years)", value: "8" }] },
  { id: "salary", title: "Salary", key: "salary", options: [{ label: "₹3L+", value: "300000" }, { label: "₹6L+", value: "600000" }, { label: "₹10L+", value: "1000000" }, { label: "₹15L+", value: "1500000" }, { label: "₹25L+", value: "2500000" }] },
  { id: "type", title: "Job Type", key: "type", options: [{ label: "Full time", value: "full-time" }, { label: "Part time", value: "part-time" }, { label: "Contract", value: "contract" }, { label: "Internship", value: "internship" }, { label: "Freelance", value: "freelance" }] },
  { id: "mode", title: "Work Mode", key: "mode", options: [{ label: "Remote", value: "remote" }, { label: "Hybrid", value: "hybrid" }, { label: "On-site", value: "on_site" }] },
  { id: "industry", title: "Industry", key: "industry", options: ["SaaS", "Fintech", "Healthcare", "Education", "Government", "Retail"].map(valueOption) },
  { id: "company", title: "Company", key: "company", options: popularCompanies },
  { id: "education", title: "Education", key: "education", options: ["10th pass", "12th pass", "Diploma", "Graduate", "Postgraduate"].map(valueOption) },
  { id: "skills", title: "Skills", key: "skills", options: popularSkills.map(valueOption) },
  { id: "date", title: "Date Posted", key: "date", options: [{ label: "Past 24 hours", value: "1" }, { label: "Past 3 days", value: "3" }, { label: "Past week", value: "7" }, { label: "Past month", value: "30" }] }
];

const defaultExpanded = Object.fromEntries(filterGroups.map((group) => [group.id, ["type", "mode", "notice_period"].includes(group.id)]));

function valueOption(label: string) {
  return { label, value: label.toLowerCase().replace(/\s+/g, "-") };
}

function readFilters(params: URLSearchParams): SearchFilters {
  const requestedSort = params.get("sort") as SortValue | null;
  return {
    q: params.get("q") ?? "",
    location: params.get("location") ?? "",
    category: params.get("category") ?? "",
    experience: params.get("experience") ?? "",
    salary: params.get("salary") ?? "",
    type: params.get("type") ?? "",
    mode: params.get("mode") ?? "",
    notice_period: params.get("notice_period") ?? "",
    industry: params.get("industry") ?? "",
    company: params.get("company") ?? "",
    education: params.get("education") ?? "",
    skills: params.get("skills") ?? "",
    date: params.get("date") ?? "",
    sort: sortOptions.some((option) => option.value === requestedSort) ? requestedSort! : "relevance",
    page: Math.max(1, Number(params.get("page")) || 1)
  };
}

function items<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)) return (value as { items: T[] }).items;
  if (value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)) return (value as { data: T[] }).data;
  return [];
}

function slugify(value?: string) {
  return (value || "job").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function jobSlug(job: SearchJob) {
  return job.slug || slugify(job.title);
}

function jobDetailHref(job: SearchJob) {
  return `/jobs/${jobSlug(job)}`;
}

function plansHref(job: SearchJob) {
  return `/plans?job=${encodeURIComponent(jobSlug(job))}&next=${encodeURIComponent(jobDetailHref(job))}`;
}

function companyName(job: SearchJob) {
  return job.company_name || "Company not disclosed";
}

function jobLocation(job: SearchJob) {
  return [job.city, job.state, job.country].filter(Boolean).join(", ") || (job.work_mode === "remote" ? "Remote" : "Location not disclosed");
}

function jobSalary(job: SearchJob) {
  if (!job.salary_min && !job.salary_max) return "Salary undisclosed";
  const format = (value?: number) => value ? `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value / 100000)}L` : "";
  return [format(job.salary_min), format(job.salary_max)].filter(Boolean).join(" – ");
}

function jobExperience(job: SearchJob) {
  if (job.experience_min === undefined && job.experience_max === undefined) return "Experience not specified";
  if (job.experience_max === undefined || job.experience_max === 0) return `${job.experience_min ?? 0}+ years`;
  return `${job.experience_min ?? 0}–${job.experience_max} years`;
}

/**
 * Only real, verifiable reasons a job appeared in these results — derived from the filters
 * actually applied, never a fabricated relevance score.
 */
function matchReasonsFor(job: SearchJob, filters: SearchFilters): string[] {
  const reasons: string[] = [];
  if (filters.q.trim()) reasons.push(`Matched your search for "${filters.q.trim()}"`);
  if (filters.skills) reasons.push(`Lists the skill "${filters.skills.replace(/-/g, " ")}"`);
  if (filters.location.trim()) reasons.push(`Located in ${filters.location.trim()}`);
  if (filters.mode) reasons.push(`${filters.mode === "remote" ? "Remote" : filters.mode === "hybrid" ? "Hybrid" : "On-site"} role as requested`);
  if (filters.salary) reasons.push(`Salary meets your ₹${(Number(filters.salary) / 100000).toLocaleString("en-IN")}L+ filter`);
  if (filters.type) reasons.push(`${job.job_type ? titleCaseWord(job.job_type) : "Matches"} employment type`);
  return reasons;
}

function titleCaseWord(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function postedLabel(job: SearchJob) {
  const source = job.published_at || job.created_at;
  if (!source) return "Posted date unavailable";
  const time = new Date(source).getTime();
  if (!Number.isFinite(time)) return "Posted date unavailable";
  const days = Math.max(0, Math.floor((Date.now() - time) / 86400000));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 30) return `Posted ${days} days ago`;
  return `Posted ${new Date(source).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

function storageArray<T>(key: string): T[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

export function JobSearchExperience() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const filters = useMemo(() => readFilters(new URLSearchParams(paramsKey)), [paramsKey]);
  const [draftQuery, setDraftQuery] = useState(filters.q);
  const [draftLocation, setDraftLocation] = useState(filters.location);
  const [selectedJob, setSelectedJob] = useState<SearchJob | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("card");
  const [history, setHistory] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [localSavedJobs, setLocalSavedJobs] = useState<string[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const session = useSession();
  const isCandidate = session.data?.role === "JOB_SEEKER";
  const candidateActions = useCandidateActions();
  const serverSavedJobs = useCandidateData({
    savedJobs: isCandidate,
    profile: false,
    completion: false,
    skills: false,
    education: false,
    experience: false,
    applications: false,
    notifications: false,
    notificationSummary: false
  }).savedJobs;
  // Signed-in candidates get their real, cross-device saved list; everyone else falls back to
  // a local-only list (and is nudged to sign in when they try to save) so guests can still browse.
  const savedJobs = isCandidate ? items<{ job_id?: string }>(serverSavedJobs.data).map((item) => item.job_id).filter((id): id is string => Boolean(id)) : localSavedJobs;

  const updateFilters = useCallback((patch: Partial<SearchFilters>, navigation: "push" | "replace" = "push") => {
    const next = new URLSearchParams(paramsKey);
    const changesSearch = Object.keys(patch).some((key) => key !== "page");
    Object.entries(patch).forEach(([key, value]) => {
      if (key === "sort" && value === "relevance") next.delete(key);
      else if (value === "" || value === undefined || value === null || (key === "page" && Number(value) <= 1)) next.delete(key);
      else next.set(key, String(value));
    });
    if (changesSearch && !("page" in patch)) next.delete("page");
    const href = next.size ? `${pathname}?${next.toString()}` : pathname;
    router[navigation](href, { scroll: false });
  }, [paramsKey, pathname, router]);

  const clearFilters = useCallback(() => {
    setDraftQuery("");
    setDraftLocation("");
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  useEffect(() => setDraftQuery(filters.q), [filters.q]);
  useEffect(() => setDraftLocation(filters.location), [filters.location]);

  useEffect(() => {
    if (draftQuery === filters.q && draftLocation === filters.location) return;
    const timer = window.setTimeout(() => updateFilters({ q: draftQuery.trim(), location: draftLocation.trim() }, "push"), 300);
    return () => window.clearTimeout(timer);
  }, [draftLocation, draftQuery, filters.location, filters.q, updateFilters]);

  useEffect(() => {
    setHistory(storageArray<string>(historyKey).slice(0, 10));
    setSavedFilters(storageArray<SavedFilter>(savedFiltersKey));
    setLocalSavedJobs(storageArray<string>(savedJobsKey));
    const storedView = window.localStorage.getItem(viewKey);
    if (storedView === "compact" || storedView === "card") setView(storedView);
  }, []);

  const apiQuery = useMemo(() => {
    const keywordParts = [filters.q, filters.skills.replace(/-/g, " "), filters.category.replace(/-/g, " ")].filter(Boolean);
    return {
      q: keywordParts.join(" ") || undefined,
      city: filters.location && filters.location.toLowerCase() !== "remote" ? filters.location : undefined,
      company: filters.company || undefined,
      industry: filters.industry ? filters.industry.replace(/-/g, " ") : undefined,
      education: filters.education ? filters.education.replace(/-/g, " ") : undefined,
      salary_min: filters.salary ? Number(filters.salary) : undefined,
      experience: filters.experience === "0" ? 0 : filters.experience ? Number(filters.experience) : undefined,
      job_type: filters.type || undefined,
      work_mode: filters.location.toLowerCase() === "remote" ? "remote" : filters.mode || undefined,
      posted_days: filters.date ? Number(filters.date) : undefined,
      sort: filters.sort === "newest" ? "latest" : filters.sort,
      limit: PAGE_SIZE,
      page: filters.page
    };
  }, [filters]);

  const jobsQuery = useJobsSearch(apiQuery);
  const jobs = items<SearchJob>(jobsQuery.data);
  const resultMeta = jobsQuery.data && typeof jobsQuery.data === "object" ? jobsQuery.data as { total?: number; has_more?: boolean } : {};

  const activeFilters = useMemo(() => activeFilterChips(filters), [filters]);
  const searchSummary = filters.q ? `for “${filters.q}”` : filters.location ? `in ${filters.location}` : "across India";

  const rememberSearch = useCallback((value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setHistory((current) => {
      const next = [normalized, ...current.filter((entry) => entry.toLowerCase() !== normalized.toLowerCase())].slice(0, 10);
      window.localStorage.setItem(historyKey, JSON.stringify(next));
      return next;
    });
  }, []);

  const setViewPreference = useCallback((next: ViewMode) => {
    setView(next);
    window.localStorage.setItem(viewKey, next);
  }, []);

  const toggleSavedJob = useCallback((job: SearchJob) => {
    const id = job.id || jobSlug(job);
    if (isCandidate && job.id) {
      if (savedJobs.includes(job.id)) candidateActions.removeSavedJob.mutate(job.id);
      else candidateActions.saveJob.mutate({ job_id: job.id });
      return;
    }
    if (!session.data) {
      router.push(`/login?next=${encodeURIComponent(`${pathname}${paramsKey ? `?${paramsKey}` : ""}`)}`);
      return;
    }
    setLocalSavedJobs((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem(savedJobsKey, JSON.stringify(next));
      return next;
    });
  }, [candidateActions.removeSavedJob, candidateActions.saveJob, isCandidate, paramsKey, pathname, router, savedJobs, session.data]);

  const shareJob = useCallback(async (job: SearchJob) => {
    const url = `${window.location.origin}${jobDetailHref(job)}`;
    try {
      if (navigator.share) await navigator.share({ title: job.title, text: `${job.title} at ${companyName(job)}`, url });
      else await navigator.clipboard.writeText(url);
      setShareMessage("Job link copied");
    } catch {
      setShareMessage("Sharing was cancelled");
    }
    window.setTimeout(() => setShareMessage(""), 2200);
  }, []);

  function openPreview(job: SearchJob) {
    setSelectedJob(job);
    setPreviewOpen(true);
  }

  function saveCurrentFilters() {
    const name = saveName.trim();
    if (!name) return;
    const params = new URLSearchParams(paramsKey);
    params.delete("page");
    const next = [{ id: `${Date.now()}`, name, params: params.toString() }, ...savedFilters].slice(0, 8);
    setSavedFilters(next);
    window.localStorage.setItem(savedFiltersKey, JSON.stringify(next));
    setSaveDialogOpen(false);
    setSaveName("");
  }

  function restoreSavedFilter(saved: SavedFilter) {
    router.push(saved.params ? `${pathname}?${saved.params}` : pathname, { scroll: false });
  }

  function removeSavedFilter(id: string) {
    const next = savedFilters.filter((saved) => saved.id !== id);
    setSavedFilters(next);
    window.localStorage.setItem(savedFiltersKey, JSON.stringify(next));
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <SearchHeader
        draftQuery={draftQuery}
        draftLocation={draftLocation}
        filters={filters}
        history={history}
        searching={jobsQuery.isFetching}
        setDraftQuery={setDraftQuery}
        setDraftLocation={setDraftLocation}
        rememberSearch={rememberSearch}
        setHistory={setHistory}
        updateFilters={updateFilters}
        clear={clearFilters}
        onMobileFilters={() => setFiltersOpen(true)}
        notificationsHref={isCandidate ? "/candidate/notifications" : "/login?next=/candidate/notifications"}
      />

      <section className={cn(containerClass, "py-4 sm:py-5")}>
        <QuickSearches updateFilters={updateFilters} rememberSearch={rememberSearch} />
        {savedFilters.length ? <SavedFiltersRail items={savedFilters} onRestore={restoreSavedFilter} onRemove={removeSavedFilter} /> : null}
        {activeFilters.length ? <ActiveFilterBar chips={activeFilters} onRemove={(key) => updateFilters({ [key]: "" })} onClear={clearFilters} /> : null}

        <div className="mt-4 grid gap-5 xl:grid-cols-[292px_minmax(0,1fr)_360px]">
          <aside className="hidden xl:block">
            <FilterSidebar filters={filters} updateFilters={updateFilters} clear={clearFilters} />
          </aside>

          <div className="grid min-w-0 content-start gap-5">
            <ResultsHeader
              count={resultMeta.total ?? jobs.length}
              searchSummary={searchSummary}
              filterCount={activeFilters.length}
              view={view}
              sort={filters.sort}
              searching={jobsQuery.isFetching}
              onSave={() => setSaveDialogOpen(true)}
              setView={setViewPreference}
              updateFilters={updateFilters}
              clear={clearFilters}
            />

            {jobsQuery.isPending ? (
              <div className="grid gap-4 lg:grid-cols-2" role="status" aria-live="polite" aria-busy="true" aria-label="Loading jobs">
                <span className="sr-only">Searching for jobs</span>
                {Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} lines={4} />)}
              </div>
            ) : jobsQuery.isError ? (
              <ErrorState error={jobsQuery.error} onRetry={() => void jobsQuery.refetch()} retrying={jobsQuery.isFetching} backHref="/" backLabel="Back to home" />
            ) : jobs.length ? (
              <div className={cn(view === "card" ? "grid gap-4 lg:grid-cols-2" : "grid gap-3")} aria-live="polite" aria-busy={jobsQuery.isFetching}>
                {jobs.map((job) => (
                  <SearchJobCard
                    key={job.id || jobSlug(job)}
                    job={job}
                    compact={view === "compact"}
                    saved={savedJobs.includes(job.id || jobSlug(job))}
                    matchReasons={matchReasonsFor(job, filters)}
                    onPreview={() => openPreview(job)}
                    onSave={() => toggleSavedJob(job)}
                    onShare={() => void shareJob(job)}
                  />
                ))}
              </div>
            ) : (
              <NoResults clear={clearFilters} updateFilters={updateFilters} />
            )}

            {jobs.length ? (
              <PaginationControls
                page={filters.page}
                totalPages={resultMeta.total ? Math.max(1, Math.ceil(resultMeta.total / PAGE_SIZE)) : undefined}
                hasNext={resultMeta.has_more ?? jobs.length === PAGE_SIZE}
                updateFilters={updateFilters}
              />
            ) : null}
          </div>

          {jobs.length ? <aside className="hidden xl:block"><PreviewPanel job={selectedJob ?? jobs[0]} saved={savedJobs.includes((selectedJob ?? jobs[0]).id || jobSlug(selectedJob ?? jobs[0]))} onSave={() => toggleSavedJob(selectedJob ?? jobs[0])} filters={filters} /></aside> : null}
        </div>
      </section>

      <Sheet open={filtersOpen} title="Filter jobs" side="bottom" onClose={() => setFiltersOpen(false)}>
        <FilterSidebar compact filters={filters} updateFilters={updateFilters} clear={clearFilters} onApply={() => setFiltersOpen(false)} />
      </Sheet>
      <Sheet open={previewOpen} title="Quick preview" onClose={() => setPreviewOpen(false)}>
        <PreviewPanel job={selectedJob ?? jobs[0]} compact saved={selectedJob ? savedJobs.includes(selectedJob.id || jobSlug(selectedJob)) : false} onSave={() => selectedJob && toggleSavedJob(selectedJob)} filters={filters} />
      </Sheet>
      <Dialog open={saveDialogOpen} title="Save this search" onClose={() => setSaveDialogOpen(false)}>
        <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); saveCurrentFilters(); }}>
          <label className="grid gap-1.5 text-sm font-semibold" htmlFor="saved-filter-name">
            Search name
            <input id="saved-filter-name" autoFocus value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Remote React jobs" className={cn("h-11 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 outline-none focus:border-[var(--cos-border-focus)]", focusClass)} />
          </label>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={!saveName.trim()}><Bookmark size={16} /> Save filters</Button></div>
        </form>
      </Dialog>
      <p className="sr-only" role="status" aria-live="polite">{shareMessage}</p>
    </main>
  );
}

function SearchHeader({ draftQuery, draftLocation, filters, history, searching, setDraftQuery, setDraftLocation, rememberSearch, setHistory, updateFilters, clear, onMobileFilters, notificationsHref }: {
  draftQuery: string;
  draftLocation: string;
  filters: SearchFilters;
  history: string[];
  searching: boolean;
  setDraftQuery: (value: string) => void;
  setDraftLocation: (value: string) => void;
  rememberSearch: (value: string) => void;
  setHistory: React.Dispatch<React.SetStateAction<string[]>>;
  updateFilters: (patch: Partial<SearchFilters>, navigation?: "push" | "replace") => void;
  clear: () => void;
  onMobileFilters: () => void;
  notificationsHref: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--cos-outline-variant)] bg-[color-mix(in_srgb,var(--cos-surface-container-lowest)_96%,transparent)] backdrop-blur-xl">
      <div className={cn(containerClass, "grid gap-3 py-3")}>
        <div className="flex items-center gap-3">
          <Link href="/" className={cn("flex items-center gap-2 rounded-[var(--radius-career-button)] font-bold", focusClass)}>
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-[var(--radius-career-button)]"><Image src="/images/logo-mark.png" alt="" width={44} height={44} priority className="h-full w-full object-contain" /></span>
            <span className="text-base font-extrabold text-[#0A3A7A]">Jobs <span className="text-[#F59E0B]">View</span></span>
          </Link>
          <Button variant="outline" size="sm" className="ml-auto xl:hidden" onClick={onMobileFilters}><Filter size={15} /> Filters</Button>
          <Link href={notificationsHref} aria-label="Notifications" className={cn("grid h-10 w-10 place-items-center rounded-[var(--radius-career-button)] text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)]", focusClass)}><Bell size={18} /></Link>
        </div>

        <div className="grid gap-2 md:grid-cols-[minmax(0,1.5fr)_minmax(210px,0.8fr)_auto]">
          <JobSearchCombobox
            value={draftQuery}
            history={history}
            onChange={setDraftQuery}
            onCommit={(value) => { setDraftQuery(value); rememberSearch(value); updateFilters({ q: value }); }}
            onSelect={(item) => {
              rememberSearch(item.label);
              if (item.key === "location") { setDraftQuery(""); setDraftLocation(item.label); updateFilters({ q: "", location: item.value }); }
              else if (item.key === "company") { setDraftQuery(""); updateFilters({ q: "", company: item.value }); }
              else if (item.key === "skills") { setDraftQuery(""); updateFilters({ q: "", skills: item.value.toLowerCase().replace(/\s+/g, "-") }); }
              else { setDraftQuery(item.label); updateFilters({ q: item.value }); }
            }}
            onHistoryChange={(next) => { setHistory(next); window.localStorage.setItem(historyKey, JSON.stringify(next)); }}
          />
          <label className="flex min-h-12 items-center gap-2 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm focus-within:border-[var(--cos-border-focus)]">
            <MapPin size={17} className="shrink-0 text-[var(--cos-outline)]" />
            <span className="sr-only">Location</span>
            <input value={draftLocation} onChange={(event) => setDraftLocation(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") updateFilters({ location: draftLocation.trim() }); }} placeholder="City, state, or remote" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--cos-outline)]" />
          </label>
          <div className="grid grid-cols-2 gap-2 md:flex">
            <Button loading={searching} disabled={searching} onClick={() => { rememberSearch(draftQuery); updateFilters({ q: draftQuery.trim(), location: draftLocation.trim() }); }}><Search size={16} /> Search</Button>
            <Button variant="outline" onClick={clear}><X size={16} /> Clear</Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Work mode filters">
          {[{ label: "Remote", value: "remote" }, { label: "Hybrid", value: "hybrid" }, { label: "On-site", value: "on_site" }].map((mode) => (
            <button key={mode.value} aria-pressed={filters.mode === mode.value} className={cn("shrink-0 rounded-full border border-[var(--cos-outline-variant)] px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--cos-primary-container)] hover:text-[var(--cos-primary)]", filters.mode === mode.value && "border-[var(--cos-primary)] bg-[color-mix(in_srgb,var(--cos-primary)_9%,var(--cos-surface-container-lowest))] text-[var(--cos-primary)]", focusClass)} onClick={() => updateFilters({ mode: filters.mode === mode.value ? "" : mode.value })}>{mode.label}</button>
          ))}
        </div>
      </div>
    </header>
  );
}

function JobSearchCombobox({ value, history, onChange, onCommit, onSelect, onHistoryChange }: { value: string; history: string[]; onChange: (value: string) => void; onCommit: (value: string) => void; onSelect: (item: Suggestion) => void; onHistoryChange: (history: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const suggestions = useMemo(() => buildSuggestions(value, history), [history, value]);

  useEffect(() => {
    function outside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function select(item: Suggestion) {
    onSelect(item);
    setOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label className="flex min-h-12 items-center gap-2 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 focus-within:border-[var(--cos-border-focus)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--cos-primary)_14%,transparent)]">
        <Search size={17} className="shrink-0 text-[var(--cos-outline)]" />
        <span className="sr-only">Search jobs, skills, keywords, or companies</span>
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls="job-search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `job-suggestion-${activeIndex}` : undefined}
          aria-autocomplete="list"
          value={value}
          placeholder="Job title, skill, keyword, or company"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--cos-outline)]"
          onFocus={() => setOpen(true)}
          onChange={(event) => { onChange(event.target.value); setOpen(true); setActiveIndex(-1); }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1)); }
            if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((current) => Math.max(current - 1, 0)); }
            if (event.key === "Escape") { event.preventDefault(); setOpen(false); setActiveIndex(-1); }
            if (event.key === "Enter") { event.preventDefault(); activeIndex >= 0 && suggestions[activeIndex] ? select(suggestions[activeIndex]) : onCommit(value); setOpen(false); }
          }}
        />
        {value ? <button type="button" aria-label="Clear search text" className={cn("rounded-full p-1 text-[var(--cos-outline)] hover:bg-[var(--cos-surface-container-low)]", focusClass)} onClick={() => onChange("")}><X size={15} /></button> : null}
      </label>

      <AnimatePresence>
        {open ? (
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -3 }} transition={{ duration: 0.15 }} className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(430px,62vh)] overflow-y-auto rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-2 shadow-career-floating">
            <div id="job-search-suggestions" role="listbox">
            {suggestions.length ? suggestions.map((item, index) => (
              <button id={`job-suggestion-${index}`} role="option" aria-selected={activeIndex === index} key={item.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => select(item)} className={cn("flex w-full items-center gap-3 rounded-[var(--radius-career-button)] px-3 py-2.5 text-left text-sm hover:bg-[var(--cos-surface-container-low)]", activeIndex === index && "bg-[var(--cos-surface-container-low)] text-[var(--cos-primary)]", focusClass)}>
                {item.group === "Recent searches" ? <Clock3 size={15} /> : item.group === "Companies" ? <Building2 size={15} /> : item.group === "Locations" ? <MapPin size={15} /> : <Search size={15} />}
                <span className="min-w-0 flex-1"><HighlightedText text={item.label} query={value} /></span>
                <span className="text-xs text-[var(--cos-outline)]">{item.group}</span>
              </button>
            )) : <p className="px-3 py-5 text-center text-sm text-[var(--cos-on-surface-variant)]">Type a role, skill, company, or location.</p>}
            </div>
            {history.length ? (
              <div className="mt-2 border-t border-[var(--cos-outline-variant)] px-2 pt-2 text-xs">
                <div className="flex items-center justify-between"><span className="text-[var(--cos-on-surface-variant)]">Search history</span><button type="button" className={cn("font-semibold text-[var(--cos-primary)]", focusClass)} onMouseDown={(event) => event.preventDefault()} onClick={() => onHistoryChange([])}>Clear history</button></div>
                <div className="mt-2 flex flex-wrap gap-1.5">{history.slice(0, 10).map((entry) => <span key={entry} className="inline-flex items-center rounded-full border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] pl-2.5"><button type="button" className={cn("py-1.5 font-medium", focusClass)} onMouseDown={(event) => event.preventDefault()} onClick={() => { onCommit(entry); setOpen(false); }}>{entry}</button><button type="button" aria-label={`Remove ${entry} from search history`} className={cn("m-0.5 rounded-full p-1 text-[var(--cos-outline)] hover:text-[var(--cos-error-text)]", focusClass)} onMouseDown={(event) => event.preventDefault()} onClick={() => onHistoryChange(history.filter((item) => item !== entry))}><X size={12} /></button></span>)}</div>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function buildSuggestions(query: string, history: string[]): Suggestion[] {
  const normalized = query.trim().toLowerCase();
  const matches = (label: string) => !normalized || label.toLowerCase().includes(normalized);
  return [
    ...history.filter(matches).slice(0, normalized ? 4 : 6).map((label) => ({ id: `recent-${label}`, label, value: label, key: "q" as const, group: "Recent searches" })),
    ...popularSkills.filter(matches).slice(0, 5).map((label) => ({ id: `skill-${label}`, label, value: label, key: "skills" as const, group: "Skills" })),
    ...popularCompanies.filter((item) => matches(item.label)).slice(0, 4).map((item) => ({ id: `company-${item.value}`, label: item.label, value: item.value, key: "company" as const, group: "Companies" })),
    ...popularLocations.filter(matches).slice(0, 4).map((label) => ({ id: `location-${label}`, label, value: label, key: "location" as const, group: "Locations" }))
  ].slice(0, 12);
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<mark className="bg-[color-mix(in_srgb,var(--cos-primary-container)_18%,transparent)] font-semibold text-inherit">{text.slice(index, index + query.length)}</mark>{text.slice(index + query.length)}</>;
}

function QuickSearches({ updateFilters, rememberSearch }: { updateFilters: (patch: Partial<SearchFilters>) => void; rememberSearch: (value: string) => void }) {
  return (
    <div className="flex snap-x gap-2 overflow-x-auto pb-1" aria-label="Popular searches">
      {quickSearches.map((chip) => <button key={chip} className={cn("snap-start whitespace-nowrap rounded-full border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-4 py-2 text-sm font-semibold text-[var(--cos-on-surface-variant)] shadow-career-xs transition duration-150 hover:-translate-y-px hover:border-[var(--cos-primary-container)] hover:text-[var(--cos-primary)]", focusClass)} onClick={() => { rememberSearch(chip); updateFilters(chip === "Remote" ? { mode: "remote" } : { q: chip }); }}>{chip}</button>)}
    </div>
  );
}

function SavedFiltersRail({ items: saved, onRestore, onRemove }: { items: SavedFilter[]; onRestore: (item: SavedFilter) => void; onRemove: (id: string) => void }) {
  return (
    <section className="mt-4 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Saved job filters">
      <span className="shrink-0 text-xs font-bold uppercase text-[var(--cos-outline)]">Saved</span>
      {saved.map((item) => <div key={item.id} className="flex shrink-0 items-center rounded-full border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] pl-1"><button className={cn("rounded-full px-3 py-1.5 text-sm font-semibold hover:text-[var(--cos-primary)]", focusClass)} onClick={() => onRestore(item)}>{item.name}</button><button className={cn("mr-1 rounded-full p-1.5 text-[var(--cos-outline)] hover:bg-[var(--cos-surface-container-low)] hover:text-[var(--cos-error-text)]", focusClass)} aria-label={`Delete saved filter ${item.name}`} onClick={() => onRemove(item.id)}><X size={13} /></button></div>)}
    </section>
  );
}

function activeFilterChips(filters: SearchFilters) {
  const labels = new Map<string, string>();
  filterGroups.forEach((group) => group.options.forEach((option) => labels.set(`${group.key}:${option.value}`, option.label)));
  return (Object.keys(filters) as (keyof SearchFilters)[]).flatMap((key) => {
    if (key === "page" || key === "sort" || !filters[key]) return [];
    const value = String(filters[key]);
    return [{ key: key as FilterKey, label: labels.get(`${key}:${value}`) ?? value.replace(/-/g, " ") }];
  });
}

function ActiveFilterBar({ chips, onRemove, onClear }: { chips: { key: FilterKey; label: string }[]; onRemove: (key: FilterKey) => void; onClear: () => void }) {
  return (
    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Active filters">
      <span className="shrink-0 text-xs font-bold uppercase text-[var(--cos-outline)]">Active</span>
      <AnimatePresence initial={false}>{chips.map((chip) => <motion.button layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} key={chip.key} className={cn("flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--cos-primary)] bg-[color-mix(in_srgb,var(--cos-primary)_8%,var(--cos-surface-container-lowest))] px-3 py-1.5 text-sm font-semibold text-[var(--cos-primary)]", focusClass)} onClick={() => onRemove(chip.key)}>{chip.label}<X size={13} aria-hidden="true" /></motion.button>)}</AnimatePresence>
      <button className={cn("shrink-0 px-2 py-1.5 text-sm font-semibold text-[var(--cos-error-text)]", focusClass)} onClick={onClear}>Clear all</button>
    </div>
  );
}

function FilterSidebar({ filters, updateFilters, clear, compact = false, onApply }: { filters: SearchFilters; updateFilters: (patch: Partial<SearchFilters>) => void; clear: () => void; compact?: boolean; onApply?: () => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpanded);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(expandedKey) ?? "{}");
      if (stored && typeof stored === "object") setExpanded({ ...defaultExpanded, ...stored });
    } catch {
      setExpanded(defaultExpanded);
    }
  }, []);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = { ...current, [id]: !current[id] };
      window.localStorage.setItem(expandedKey, JSON.stringify(next));
      return next;
    });
  }

  return (
    <Card className={cn("sticky top-40 grid gap-3", compact && "static border-0 p-0 shadow-none")}>
      <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Advanced filters</h2><p className="text-sm text-[var(--cos-on-surface-variant)]">Refine results without leaving the page.</p></div><SlidersHorizontal size={18} className="text-[var(--cos-outline)]" /></div>
      <div className={cn("grid gap-2", compact && "max-h-[58dvh] overflow-y-auto pr-1")}>
        {filterGroups.map((group) => (
          <section key={group.id} className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)]">
            <button type="button" aria-expanded={Boolean(expanded[group.id])} aria-controls={`filter-${group.id}`} className={cn("flex min-h-11 w-full items-center justify-between px-3 text-left text-sm font-semibold", focusClass)} onClick={() => toggle(group.id)}>{group.title}<ChevronDown size={15} className={cn("transition-transform", expanded[group.id] && "rotate-180")} /></button>
            {expanded[group.id] ? <div id={`filter-${group.id}`} className="grid gap-1 border-t border-[var(--cos-outline-variant)] p-2">{group.options.map((option) => { const active = filters[group.key] === option.value; return <button key={option.value} type="button" aria-pressed={active} className={cn("flex min-h-9 items-center justify-between rounded-[var(--radius-career-button)] px-2.5 text-left text-sm text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-lowest)] hover:text-[var(--cos-primary)]", active && "bg-[var(--cos-surface-container-lowest)] font-semibold text-[var(--cos-primary)]", focusClass)} onClick={() => updateFilters({ [group.key]: active ? "" : option.value })}><span>{option.label}</span>{active ? <Check size={15} /> : null}</button>; })}</div> : null}
          </section>
        ))}
        <section className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3"><label className="grid gap-2 text-sm font-semibold" htmlFor={compact ? "mobile-sort" : "desktop-sort"}>Sort<select id={compact ? "mobile-sort" : "desktop-sort"} value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as SortValue })} className="h-10 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 font-normal outline-none focus:border-[var(--cos-border-focus)]">{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></section>
      </div>
      <div className="sticky bottom-0 grid grid-cols-2 gap-2 bg-[var(--cos-surface-container-lowest)] pt-2"><Button variant="outline" size="sm" onClick={clear}>Reset</Button><Button size="sm" onClick={onApply}>Show results</Button></div>
    </Card>
  );
}

function ResultsHeader({ count, searchSummary, filterCount, view, sort, searching, onSave, setView, updateFilters, clear }: { count: number; searchSummary: string; filterCount: number; view: ViewMode; sort: SortValue; searching: boolean; onSave: () => void; setView: (view: ViewMode) => void; updateFilters: (patch: Partial<SearchFilters>) => void; clear: () => void }) {
  return (
    <Card className="grid gap-4 sm:flex sm:items-center sm:justify-between">
      <div><h1 className="text-xl font-bold">{count.toLocaleString("en-IN")} job{count === 1 ? "" : "s"} found {searchSummary}</h1><p className="text-sm text-[var(--cos-on-surface-variant)]" role="status" aria-live="polite">{searching ? "Updating results…" : filterCount ? `${filterCount} active filter${filterCount === 1 ? "" : "s"}` : "Explore current opportunities"}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSave}><Bookmark size={15} /> Save filters</Button>
        {filterCount ? <Button variant="ghost" size="sm" onClick={clear}>Clear filters</Button> : null}
        <label className="sr-only" htmlFor="results-sort">Sort jobs</label>
        <select id="results-sort" value={sort} className="h-9 max-w-44 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm outline-none focus:border-[var(--cos-border-focus)]" onChange={(event) => updateFilters({ sort: event.target.value as SortValue })}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        <div className="flex rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] p-0.5" aria-label="Result view"><Button variant={view === "card" ? "primary" : "ghost"} size="icon" aria-label="Card view" aria-pressed={view === "card"} onClick={() => setView("card")}><Grid2X2 size={16} /></Button><Button variant={view === "compact" ? "primary" : "ghost"} size="icon" aria-label="Compact list view" aria-pressed={view === "compact"} onClick={() => setView("compact")}><List size={16} /></Button></div>
      </div>
    </Card>
  );
}

const SearchJobCard = memo(function SearchJobCard({ job, compact, saved, matchReasons, onPreview, onSave, onShare }: { job: SearchJob; compact: boolean; saved: boolean; matchReasons: string[]; onPreview: () => void; onSave: () => void; onShare: () => void }) {
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const verified = Boolean(job.company_verified || job.verified_badge);
  const skills = (job.skills ?? []).map((skill) => skill.name).filter(Boolean).slice(0, compact ? 3 : 5);
  return (
    <motion.article whileHover={{ y: -2 }} transition={{ duration: 0.16 }}>
      <Card className={cn("group relative overflow-hidden", compact && "p-4")}>
        <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,#0A3A7A,#F59E0B)] opacity-80" />
        <div className={cn("grid gap-4", compact && "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center")}>
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <Avatar name={companyName(job)} src={job.company_logo_url} shape="company" verified={verified} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={jobDetailHref(job)} className={cn("text-lg font-bold hover:text-[var(--cos-primary)]", focusClass)}>{job.title}</Link>
                  <AIFitBadge matchReasons={matchReasons} />
                  {verified ? <Badge tone="verified"><BadgeCheck size={12} /> Verified Direct Employer</Badge> : <Badge tone="neutral">Recruiter Posted</Badge>}
                  {job.is_featured ? <Badge tone="premium">Premium</Badge> : null}
                  {job.is_urgent ? <Badge tone="urgent">Urgent</Badge> : null}
                  {job.recruiter_response_time ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 shadow-career-xs">
                      <Zap size={11} aria-hidden="true" /> Replies within {job.recruiter_response_time}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm font-medium text-[var(--cos-on-surface-variant)]">{companyName(job)}</p>
              </div>
            </div>
            <div className={cn("mt-4 grid gap-2 text-sm text-[var(--cos-on-surface-variant)]", !compact && "sm:grid-cols-2")}>
              <span className="inline-flex items-center gap-2"><MapPin size={15} /> {jobLocation(job)}</span>
              <span className="inline-flex items-center gap-2"><Briefcase size={15} /> {jobExperience(job)}</span>
              <span className="inline-flex items-center gap-2"><IndianRupee size={15} /> {jobSalary(job)}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays size={15} /> {postedLabel(job)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{job.work_mode ? <Badge tone={job.work_mode === "remote" ? "remote" : job.work_mode === "hybrid" ? "hybrid" : "neutral"}>{job.work_mode.replace(/_/g, " ")}</Badge> : null}{job.job_type ? <Badge>{job.job_type}</Badge> : null}{skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div>
          </div>
          <div className={cn("flex flex-wrap items-center gap-2", compact && "sm:justify-end")}>
            <Link href={jobDetailHref(job)} className={cn(primaryLinkClass, focusClass)}>View job</Link>
            <Button variant="outline" size="sm" onClick={() => setAdvisorOpen(true)} className="border-indigo-300 bg-indigo-50 text-indigo-950 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 font-semibold shadow-career-xs">
              ⚡ Easy Apply
            </Button>
            <Button variant="outline" size="sm" onClick={onPreview}>Quick preview</Button>
            <Button variant="ghost" size="icon" aria-label={saved ? "Remove saved job" : "Save job"} aria-pressed={saved} onClick={onSave}><Bookmark size={16} className={saved ? "fill-current text-[var(--cos-primary)]" : ""} /></Button>
            <Button variant="ghost" size="icon" aria-label="Share job" onClick={onShare}><Share2 size={16} /></Button>
          </div>
        </div>
        {!compact ? <div className="mt-4 flex items-center justify-between border-t border-[var(--cos-outline-variant)] pt-3 text-xs text-[var(--cos-on-surface-variant)]"><span>{verified ? "Company identity verified" : "Company verification not provided"}</span><Link href={plansHref(job)} className={cn("font-semibold text-[var(--cos-primary)] hover:underline", focusClass)}>Subscriber details</Link></div> : null}
      </Card>
      <ATSAdvisorDialog
        open={advisorOpen}
        onOpenChange={setAdvisorOpen}
        jobTitle={job.title}
        matchingSkills={(job.skills ?? []).map((skill) => skill.name).filter(Boolean)}
        onProceed={() => window.location.href = plansHref(job)}
      />
    </motion.article>
  );
});

function PreviewPanel({ job, saved, onSave, filters, compact = false }: { job?: SearchJob; saved: boolean; onSave: () => void; filters: SearchFilters; compact?: boolean }) {
  const [advisorOpen, setAdvisorOpen] = useState(false);
  if (!job) return <EmptyState compact icon={<Briefcase size={18} />} title="Select a job" description="Choose a result to open its quick preview." />;
  const verified = Boolean(job.company_verified || job.verified_badge);
  const skills = (job.skills ?? []).map((skill) => skill.name).filter(Boolean);
  return (
    <Card className={cn("sticky top-40 grid gap-5", compact && "static border-0 p-0 shadow-none")}>
      <div className="flex items-start gap-3">
        <Avatar name={companyName(job)} src={job.company_logo_url} shape="company" verified={verified} className="h-12 w-12" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <AIFitBadge matchReasons={matchReasonsFor(job, filters)} />
            {verified ? <Badge tone="verified">Verified Direct Employer</Badge> : <Badge tone="neutral">Recruiter Posted</Badge>}
            {job.is_featured ? <Badge tone="premium">Featured</Badge> : null}
          </div>
          <h2 className="mt-2 text-xl font-bold">{job.title}</h2>
          <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">{companyName(job)}</p>
        </div>
      </div>
      {job.short_description ? <p className="line-clamp-4 text-sm leading-6 text-[var(--cos-on-surface-variant)]">{job.short_description}</p> : null}
      <div className="grid grid-cols-2 gap-3">{[["Salary", jobSalary(job)], ["Experience", jobExperience(job)], ["Location", jobLocation(job)], ["Posted", postedLabel(job)]].map(([label, value]) => <div key={label} className="rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] p-3"><div className="text-xs text-[var(--cos-on-surface-variant)]">{label}</div><div className="mt-1 text-sm font-semibold">{value}</div></div>)}</div>
      {(job.skills ?? []).length ? <div><h3 className="text-sm font-semibold">Skills</h3><div className="mt-2 flex flex-wrap gap-2">{job.skills!.slice(0, 6).map((skill) => <Badge key={skill.name}>{skill.name}</Badge>)}</div></div> : null}
      <div className="grid grid-cols-[1fr_auto] gap-2"><Link href={jobDetailHref(job)} className={cn(primaryLinkClass, focusClass)}>View job details</Link><Button variant="outline" size="icon" aria-label={saved ? "Remove saved job" : "Save job"} aria-pressed={saved} onClick={onSave}><Bookmark size={16} className={saved ? "fill-current text-[var(--cos-primary)]" : ""} /></Button></div>
      <button type="button" onClick={() => setAdvisorOpen(true)} className={cn(secondaryLinkClass, "w-full bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-400/80 hover:border-amber-400 text-amber-900 dark:text-amber-200 font-bold", focusClass)}>
        <Zap size={16} className="text-amber-500 fill-current" /> View skill checklist &amp; apply
      </button>
      <Link href={plansHref(job)} className={cn(secondaryLinkClass, "w-full opacity-90 text-xs mt-0", focusClass)}>Apply directly with subscriber insights</Link>
      <ATSAdvisorDialog
        open={advisorOpen}
        onOpenChange={setAdvisorOpen}
        jobTitle={job.title}
        matchingSkills={skills}
        onProceed={() => window.location.href = plansHref(job)}
      />
    </Card>
  );
}

function PaginationControls({ page, totalPages, hasNext, updateFilters }: { page: number; totalPages?: number; hasNext: boolean; updateFilters: (patch: Partial<SearchFilters>) => void }) {
  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Job result pages"><Button variant="outline" disabled={page <= 1} onClick={() => updateFilters({ page: page - 1 })}>Previous</Button><span className="min-w-20 text-center text-sm font-semibold">Page {page}{totalPages ? ` of ${totalPages}` : ""}</span><Button variant="outline" disabled={!hasNext} onClick={() => updateFilters({ page: page + 1 })}>Next</Button></nav>
  );
}

function NoResults({ updateFilters, clear }: { updateFilters: (patch: Partial<SearchFilters>) => void; clear: () => void }) {
  return <EmptyState title="No jobs match your filters" description="Clear one or more filters, search a nearby city, or explore a popular role." icon={<Search size={20} />} action={<div className="flex flex-wrap justify-center gap-2"><Button size="sm" onClick={clear}>Clear filters</Button><Button variant="outline" size="sm" onClick={() => updateFilters({ q: "", sort: "newest" })}>Browse latest jobs</Button>{quickSearches.slice(0, 3).map((chip) => <Button key={chip} variant="ghost" size="sm" onClick={() => updateFilters({ q: chip })}>{chip}</Button>)}</div>} />;
}
