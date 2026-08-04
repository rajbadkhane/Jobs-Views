"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  Filter,
  Globe2,
  Heart,
  MapPin,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  X
} from "lucide-react";

import { useCompaniesSearch, useCompanyBranches, useCompanyBySlug, useJobsSearch } from "@career-os/hooks";
import type { PublicCompany, PublicJob } from "@career-os/shared";
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, JobCard, ResilientImage, Sheet, SkeletonCard } from "@career-os/ui";
import { cn } from "@career-os/utils";

type CompanyItem = PublicCompany & {
  open_jobs?: number;
  rating?: number;
  views?: number;
};

type Branch = {
  id: string;
  name?: string;
  address?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  google_maps_url?: string;
  is_headquarters?: boolean;
};

type DirectoryFilters = {
  q: string;
  industry: string;
  location: string;
  size: string;
  verified: string;
  sort: "newest" | "name";
  page: number;
};

type FilterKey = "industry" | "location" | "size" | "verified";

const PAGE_SIZE = 18;
const containerFocus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cos-surface)]";
const followedCompaniesKey = "jobsview.followed-companies";
const companyFiltersExpandedKey = "jobsview.company-filters.expanded";
const industries = ["Technology", "SaaS", "Fintech", "Healthcare", "Education", "Government", "Retail", "Manufacturing"];
const locations = ["Bengaluru", "Hyderabad", "Pune", "Mumbai", "Delhi", "Gurugram", "Chennai", "Indore"];
const sizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const filterGroups: { id: FilterKey; title: string; options: { label: string; value: string }[] }[] = [
  { id: "industry", title: "Industry", options: industries.map((value) => ({ label: value, value })) },
  { id: "size", title: "Company Size", options: sizes.map((value) => ({ label: `${value} employees`, value })) },
  { id: "location", title: "Location", options: locations.map((value) => ({ label: value, value })) },
  { id: "verified", title: "Verification", options: [{ label: "Verified companies only", value: "true" }] }
];

function companyItems(value: unknown): CompanyItem[] {
  if (Array.isArray(value)) return value as CompanyItem[];
  if (value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)) return (value as { items: CompanyItem[] }).items;
  if (value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)) return (value as { data: CompanyItem[] }).data;
  return [];
}

function branchItems(value: unknown): Branch[] {
  if (Array.isArray(value)) return value as Branch[];
  if (value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)) return (value as { items: Branch[] }).items;
  return [];
}

function jobItems(value: unknown): PublicJob[] {
  if (Array.isArray(value)) return value as PublicJob[];
  if (value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)) return (value as { items: PublicJob[] }).items;
  return [];
}

function readFilters(params: URLSearchParams): DirectoryFilters {
  return {
    q: params.get("q") ?? "",
    industry: params.get("industry") ?? "",
    location: params.get("location") ?? "",
    size: params.get("size") ?? "",
    verified: params.get("verified") === "true" ? "true" : "",
    sort: params.get("sort") === "name" ? "name" : "newest",
    page: Math.max(1, Number(params.get("page")) || 1)
  };
}

function companyWebsite(value?: string) {
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function compactDescription(company: CompanyItem) {
  return company.description?.trim() || company.about?.trim();
}

function isVerified(company: PublicCompany) {
  return Boolean(company.is_verified || company.verified_badge);
}

function jobLocation(job: PublicJob) {
  return [job.city, job.state, job.country].filter(Boolean).join(", ") || (job.work_mode === "remote" ? "Remote" : undefined);
}

function jobSalary(job: PublicJob) {
  if (!job.salary_min && !job.salary_max) return undefined;
  const format = (value?: number) => value ? `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value / 100000)}L` : "";
  return [format(job.salary_min), format(job.salary_max)].filter(Boolean).join(" – ");
}

function useFollowedCompanies() {
  const [followed, setFollowed] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(followedCompaniesKey) ?? "[]");
      if (Array.isArray(stored)) setFollowed(stored);
    } catch {
      setFollowed([]);
    }
  }, []);
  const toggle = useCallback((id: string) => {
    setFollowed((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem(followedCompaniesKey, JSON.stringify(next));
      return next;
    });
  }, []);
  return { followed, toggle };
}

export function CompanyDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const filters = useMemo(() => readFilters(new URLSearchParams(paramsKey)), [paramsKey]);
  const [draftQuery, setDraftQuery] = useState(filters.q);
  const [draftLocation, setDraftLocation] = useState(filters.location);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { followed, toggle } = useFollowedCompanies();

  const updateFilters = useCallback((patch: Partial<DirectoryFilters>) => {
    const next = new URLSearchParams(paramsKey);
    const resetsPage = Object.keys(patch).some((key) => key !== "page");
    Object.entries(patch).forEach(([key, value]) => {
      if ((key === "sort" && value === "newest") || value === "" || value === undefined || value === null || (key === "page" && Number(value) <= 1)) next.delete(key);
      else next.set(key, String(value));
    });
    if (resetsPage && !("page" in patch)) next.delete("page");
    router.push(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
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
    const timer = window.setTimeout(() => updateFilters({ q: draftQuery.trim(), location: draftLocation.trim() }), 300);
    return () => window.clearTimeout(timer);
  }, [draftLocation, draftQuery, filters.location, filters.q, updateFilters]);

  const apiQuery = useMemo(() => ({
    q: filters.q || undefined,
    industry: filters.industry || undefined,
    location: filters.location || undefined,
    verified: filters.verified === "true" ? true : undefined,
    sort: filters.sort === "name" ? "name" : undefined,
    limit: PAGE_SIZE,
    page: filters.page
  }), [filters]);

  const companiesQuery = useCompaniesSearch(apiQuery);
  const apiCompanies = companyItems(companiesQuery.data);
  const companies = useMemo(() => filters.size ? apiCompanies.filter((company) => company.size_range === filters.size) : apiCompanies, [apiCompanies, filters.size]);
  const activeFilters = useMemo(() => directoryFilterChips(filters), [filters]);

  return (
    <section className="grid gap-5" aria-labelledby="company-directory-title">
      <div className="sticky top-0 z-30 -mx-4 border-b border-[var(--cos-outline-variant)] bg-[color-mix(in_srgb,var(--cos-surface-container-lowest)_96%,transparent)] px-4 py-3 backdrop-blur-xl sm:static sm:mx-0 sm:rounded-[var(--radius-career-card)] sm:border sm:p-4">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.7fr)_auto]">
          <CompanySearchCombobox value={draftQuery} companies={apiCompanies} onChange={setDraftQuery} onCommit={(value) => { setDraftQuery(value); updateFilters({ q: value }); }} />
          <label className="flex min-h-12 items-center gap-2 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 focus-within:border-[var(--cos-border-focus)]">
            <MapPin size={17} className="text-[var(--cos-outline)]" aria-hidden="true" />
            <span className="sr-only">Company location</span>
            <input value={draftLocation} onChange={(event) => setDraftLocation(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") updateFilters({ location: draftLocation.trim() }); }} placeholder="Headquarters or city" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          <div className="grid grid-cols-2 gap-2 md:flex"><Button loading={companiesQuery.isFetching} disabled={companiesQuery.isFetching} onClick={() => updateFilters({ q: draftQuery.trim(), location: draftLocation.trim() })}><Search size={16} /> Search</Button><Button variant="outline" className="xl:hidden" onClick={() => setMobileFiltersOpen(true)}><Filter size={16} /> Filters</Button></div>
        </div>
      </div>

      {activeFilters.length ? <ActiveCompanyFilters filters={activeFilters} onRemove={(key) => updateFilters({ [key]: "" })} onClear={clearFilters} /> : null}

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden xl:block"><CompanyFilterPanel filters={filters} updateFilters={updateFilters} clear={clearFilters} /></aside>
        <div className="grid min-w-0 content-start gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 id="company-directory-title" className="text-xl font-bold">Company directory</h2><p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]" role="status" aria-live="polite">{companiesQuery.isFetching ? "Updating companies…" : `${companies.length} ${companies.length === 1 ? "company" : "companies"} shown on page ${filters.page}`}</p></div>
            <label className="flex items-center gap-2 text-sm font-semibold" htmlFor="company-sort"><ArrowUpDown size={15} /><span className="sr-only sm:not-sr-only">Sort</span><select id="company-sort" value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as DirectoryFilters["sort"] })} className="h-10 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 font-normal outline-none focus:border-[var(--cos-border-focus)]"><option value="newest">Newest</option><option value="name">A–Z</option></select></label>
          </div>

          {companiesQuery.isPending ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" role="status" aria-label="Loading companies" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} lines={5} />)}</div>
          ) : companiesQuery.isError ? (
            <ErrorState error={companiesQuery.error} onRetry={() => void companiesQuery.refetch()} retrying={companiesQuery.isFetching} backHref="/" backLabel="Back to home" />
          ) : companies.length ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{companies.map((company) => <DirectoryCompanyCard key={company.id} company={company} followed={followed.includes(company.id)} onFollow={() => toggle(company.id)} />)}</div>
          ) : (
            <EmptyState icon={<Building2 size={20} />} title={activeFilters.length ? "No companies match your filters" : "No companies available"} description={activeFilters.length ? "Try a broader industry, nearby location, or clear the current filters." : "Published company profiles will appear here when they are available."} action={<div className="flex flex-wrap justify-center gap-2">{activeFilters.length ? <Button onClick={clearFilters}>Clear filters</Button> : null}<Link href="/jobs" className={cn("inline-flex min-h-12 items-center rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] px-4 text-sm font-semibold sm:min-h-10", containerFocus)}>Browse jobs</Link></div>} />
          )}

          {companies.length ? <nav className="flex items-center justify-center gap-3" aria-label="Company result pages"><Button variant="outline" disabled={filters.page <= 1} onClick={() => updateFilters({ page: filters.page - 1 })}>Previous</Button><span className="min-w-20 text-center text-sm font-semibold">Page {filters.page}</span><Button variant="outline" disabled={apiCompanies.length < PAGE_SIZE} onClick={() => updateFilters({ page: filters.page + 1 })}>Next</Button></nav> : null}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} title="Filter companies" side="bottom" onClose={() => setMobileFiltersOpen(false)}><CompanyFilterPanel compact filters={filters} updateFilters={updateFilters} clear={clearFilters} onApply={() => setMobileFiltersOpen(false)} /></Sheet>
    </section>
  );
}

function CompanySearchCombobox({ value, companies, onChange, onCommit }: { value: string; companies: CompanyItem[]; onChange: (value: string) => void; onCommit: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const suggestions = useMemo(() => {
    const term = value.trim().toLowerCase();
    const companyNames = companies.map((company) => company.name);
    return [...new Set([...companyNames, ...industries, ...locations])].filter((item) => !term || item.toLowerCase().includes(term)).slice(0, 10);
  }, [companies, value]);

  useEffect(() => {
    function close(event: MouseEvent) { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function select(valueToSelect: string) {
    onCommit(valueToSelect);
    setOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label className="flex min-h-12 items-center gap-2 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 focus-within:border-[var(--cos-border-focus)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--cos-primary)_14%,transparent)]">
        <Search size={17} className="text-[var(--cos-outline)]" aria-hidden="true" />
        <span className="sr-only">Search company name, industry, or keyword</span>
        <input role="combobox" aria-expanded={open} aria-controls="company-suggestions" aria-activedescendant={activeIndex >= 0 ? `company-suggestion-${activeIndex}` : undefined} aria-autocomplete="list" value={value} onFocus={() => setOpen(true)} onChange={(event) => { onChange(event.target.value); setOpen(true); setActiveIndex(-1); }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((current) => Math.max(current - 1, 0)); } if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); } if (event.key === "Enter") { event.preventDefault(); select(activeIndex >= 0 && suggestions[activeIndex] ? suggestions[activeIndex] : value); } }} placeholder="Company name, industry, or keyword" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        {value ? <button type="button" aria-label="Clear company search" className={cn("rounded-full p-1 text-[var(--cos-outline)] hover:bg-[var(--cos-surface-container-low)]", containerFocus)} onClick={() => onChange("")}><X size={15} /></button> : null}
      </label>
      <AnimatePresence>{open && suggestions.length ? <motion.div id="company-suggestions" role="listbox" initial={reduceMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -3 }} transition={{ duration: 0.15 }} className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-80 overflow-y-auto rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-2 shadow-career-floating">{suggestions.map((suggestion, index) => <button id={`company-suggestion-${index}`} role="option" aria-selected={activeIndex === index} key={suggestion} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => select(suggestion)} className={cn("flex w-full items-center gap-2 rounded-[var(--radius-career-button)] px-3 py-2.5 text-left text-sm hover:bg-[var(--cos-surface-container-low)]", activeIndex === index && "bg-[var(--cos-surface-container-low)] text-[var(--cos-primary)]", containerFocus)}><Building2 size={15} /> {suggestion}</button>)}</motion.div> : null}</AnimatePresence>
    </div>
  );
}

function directoryFilterChips(filters: DirectoryFilters) {
  const chips: { key: FilterKey | "q"; label: string }[] = filterGroups.flatMap((group) => {
    const value = filters[group.id];
    if (!value) return [];
    return [{ key: group.id, label: group.options.find((option) => option.value === value)?.label ?? value }];
  });
  if (filters.q) chips.push({ key: "q", label: filters.q });
  return chips;
}

function ActiveCompanyFilters({ filters, onRemove, onClear }: { filters: { key: FilterKey | "q"; label: string }[]; onRemove: (key: FilterKey | "q") => void; onClear: () => void }) {
  return <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Active company filters"><span className="shrink-0 text-xs font-bold uppercase text-[var(--cos-outline)]">Active</span><AnimatePresence initial={false}>{filters.map((filter) => <motion.button layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} key={filter.key} onClick={() => onRemove(filter.key)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--cos-primary)] bg-[color-mix(in_srgb,var(--cos-primary)_8%,var(--cos-surface-container-lowest))] px-3 py-1.5 text-sm font-semibold text-[var(--cos-primary)]", containerFocus)}>{filter.label}<X size={13} /></motion.button>)}</AnimatePresence><button onClick={onClear} className={cn("shrink-0 px-2 py-1.5 text-sm font-semibold text-[var(--cos-error-text)]", containerFocus)}>Clear all</button></div>;
}

function CompanyFilterPanel({ filters, updateFilters, clear, compact = false, onApply }: { filters: DirectoryFilters; updateFilters: (patch: Partial<DirectoryFilters>) => void; clear: () => void; compact?: boolean; onApply?: () => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ industry: true, size: true, location: false, verified: true });
  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(companyFiltersExpandedKey) ?? "{}");
      if (stored && typeof stored === "object") setExpanded((current) => ({ ...current, ...stored }));
    } catch { /* deterministic defaults remain */ }
  }, []);
  function toggle(id: string) { setExpanded((current) => { const next = { ...current, [id]: !current[id] }; window.localStorage.setItem(companyFiltersExpandedKey, JSON.stringify(next)); return next; }); }
  return (
    <Card className={cn("sticky top-24 grid gap-3", compact && "static border-0 p-0 shadow-none")}>
      <div><h2 className="font-semibold">Filter companies</h2><p className="text-sm text-[var(--cos-on-surface-variant)]">Use available company profile fields.</p></div>
      <div className={cn("grid gap-2", compact && "max-h-[58dvh] overflow-y-auto pr-1")}>{filterGroups.map((group) => <section key={group.id} className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)]"><button type="button" aria-expanded={Boolean(expanded[group.id])} aria-controls={`company-filter-${group.id}`} className={cn("flex min-h-11 w-full items-center justify-between px-3 text-left text-sm font-semibold", containerFocus)} onClick={() => toggle(group.id)}>{group.title}<ChevronDown size={15} className={cn("transition-transform", expanded[group.id] && "rotate-180")} /></button>{expanded[group.id] ? <div id={`company-filter-${group.id}`} className="grid gap-1 border-t border-[var(--cos-outline-variant)] p-2">{group.options.map((option) => { const active = filters[group.id] === option.value; return <button key={option.value} type="button" aria-pressed={active} className={cn("flex min-h-9 items-center justify-between rounded-[var(--radius-career-button)] px-2.5 text-left text-sm text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-lowest)] hover:text-[var(--cos-primary)]", active && "bg-[var(--cos-surface-container-lowest)] font-semibold text-[var(--cos-primary)]", containerFocus)} onClick={() => updateFilters({ [group.id]: active ? "" : option.value })}>{option.label}{active ? <Check size={15} /> : null}</button>; })}</div> : null}</section>)}</div>
      <div className="sticky bottom-0 grid grid-cols-2 gap-2 bg-[var(--cos-surface-container-lowest)] pt-2"><Button variant="outline" size="sm" onClick={clear}>Reset</Button><Button size="sm" onClick={onApply}>Show companies</Button></div>
    </Card>
  );
}

const DirectoryCompanyCard = memo(function DirectoryCompanyCard({ company, followed, onFollow }: { company: CompanyItem; followed: boolean; onFollow: () => void }) {
  const description = compactDescription(company);
  const website = companyWebsite(company.website);
  const openJobs = typeof company.open_jobs === "number" ? company.open_jobs : undefined;
  return (
    <motion.article whileHover={{ y: -2 }} transition={{ duration: 0.16 }} className="[content-visibility:auto] [contain-intrinsic-size:360px]">
      <Card className="grid h-full content-start gap-4 overflow-hidden">
        <div className="flex items-start gap-3"><Avatar name={company.name} src={company.logo_url} shape="company" verified={isVerified(company)} className="h-12 w-12 shrink-0" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={`/companies/${company.slug}`} className={cn("text-lg font-bold hover:text-[var(--cos-primary)]", containerFocus)}>{company.name}</Link>{isVerified(company) ? <Badge tone="verified"><BadgeCheck size={12} /> Verified</Badge> : null}{typeof openJobs === "number" && openJobs > 0 ? <Badge tone="success">Hiring</Badge> : null}</div>{company.industry ? <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">{company.industry}</p> : null}</div></div>
        <div className="grid gap-2 text-sm text-[var(--cos-on-surface-variant)]">{company.headquarters ? <span className="inline-flex items-center gap-2"><MapPin size={15} /> {company.headquarters}</span> : null}{company.size_range ? <span className="inline-flex items-center gap-2"><Users size={15} /> {company.size_range} employees</span> : null}{company.founded_year ? <span className="inline-flex items-center gap-2"><CalendarDays size={15} /> Founded {company.founded_year}</span> : null}{typeof openJobs === "number" ? <span className="inline-flex items-center gap-2 font-semibold text-[var(--cos-primary)]"><Briefcase size={15} /> {openJobs} open {openJobs === 1 ? "job" : "jobs"}</span> : null}{typeof company.rating === "number" ? <span className="inline-flex items-center gap-2"><Sparkles size={15} /> {company.rating.toFixed(1)} rating</span> : null}</div>
        {description ? <p className="line-clamp-3 text-sm leading-6 text-[var(--cos-on-surface-variant)]">{description}</p> : null}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1"><Link href={`/companies/${company.slug}`} className={cn("inline-flex min-h-10 items-center justify-center rounded-[var(--radius-career-button)] bg-[var(--cos-primary-container)] px-4 text-sm font-semibold text-white hover:bg-[var(--cos-primary)]", containerFocus)}>View company</Link><Button variant="outline" size="sm" aria-pressed={followed} onClick={onFollow}><Heart size={15} className={followed ? "fill-current text-[var(--cos-primary)]" : ""} /> {followed ? "Following" : "Follow"}</Button>{website ? <a href={website} target="_blank" rel="noreferrer" aria-label={`Visit ${company.name} website`} className={cn("ml-auto rounded-full p-2 text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)] hover:text-[var(--cos-primary)]", containerFocus)}><ExternalLink size={17} /></a> : null}</div>
      </Card>
    </motion.article>
  );
});

export function CompanyDetail({ slug }: { slug: string }) {
  const query = useCompanyBySlug(slug);
  if (query.isPending) return <CompanyDetailSkeleton />;
  if (query.isError) return <ErrorState error={query.error} title={errorStatus(query.error) === 404 ? "Company not found" : undefined} onRetry={errorStatus(query.error) === 404 ? undefined : () => void query.refetch()} retrying={query.isFetching} backHref="/companies" backLabel="Browse companies" />;
  if (!query.data) return <EmptyState icon={<Building2 size={19} />} title="Company not found" description="This company profile is unavailable." action={<Link href="/companies" className="font-semibold text-[var(--cos-primary)]">Browse companies</Link>} />;
  return <CompanyProfile company={query.data} />;
}

function CompanyProfile({ company }: { company: PublicCompany }) {
  const jobsQuery = useJobsSearch({ company: company.slug, sort: "latest", limit: 100 });
  const branchesQuery = useCompanyBranches(company.id);
  const relatedQuery = useCompaniesSearch({ industry: company.industry || undefined, limit: 12, sort: "name" });
  const jobs = jobItems(jobsQuery.data);
  const branches = branchItems(branchesQuery.data);
  const related = useMemo(() => companyItems(relatedQuery.data).filter((item) => item.id !== company.id).sort((a, b) => similarityScore(company, b) - similarityScore(company, a)).slice(0, 4), [company, relatedQuery.data]);
  const { followed, toggle } = useFollowedCompanies();
  const [shareMessage, setShareMessage] = useState("");
  const website = companyWebsite(company.website);
  const overview = company.about?.trim() || company.description?.trim();

  const share = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: company.name, text: `Explore careers at ${company.name}`, url });
      else await navigator.clipboard.writeText(url);
      setShareMessage("Company link copied");
    } catch { setShareMessage("Sharing was cancelled"); }
    window.setTimeout(() => setShareMessage(""), 2200);
  }, [company.name]);

  const copy = useCallback(async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShareMessage("Company link copied"); }
    catch { setShareMessage("Unable to copy the link"); }
    window.setTimeout(() => setShareMessage(""), 2200);
  }, []);

  return (
    <section className="grid gap-6" aria-labelledby="company-name">
      <Card className="overflow-hidden p-0">
        {company.banner_url ? <ResilientImage src={company.banner_url} alt={`${company.name} banner`} fallbackLabel={company.name} wrapperClassName="h-44 w-full sm:h-64" className="object-cover" loading="lazy" /> : <div className="h-28 bg-[linear-gradient(120deg,#0A3A7A,#0A3A7A_68%,#F59E0B)] sm:h-40" aria-hidden="true" />}
        <div className="flex flex-wrap items-end gap-4 p-5 sm:p-6"><Avatar name={company.name} src={company.logo_url} shape="company" verified={isVerified(company)} className="h-16 w-16 sm:h-20 sm:w-20" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 id="company-name" className="text-2xl font-bold sm:text-3xl">{company.name}</h2>{isVerified(company) ? <Badge tone="verified"><ShieldCheck size={13} /> Verified</Badge> : null}{jobs.length > 0 ? <Badge tone="success">Actively hiring</Badge> : null}</div><p className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--cos-on-surface-variant)]">{company.industry ? <span>{company.industry}</span> : null}{company.headquarters ? <span className="inline-flex items-center gap-1"><MapPin size={14} /> {company.headquarters}</span> : null}{company.size_range ? <span className="inline-flex items-center gap-1"><Users size={14} /> {company.size_range} employees</span> : null}{company.founded_year ? <span>Founded {company.founded_year}</span> : null}{!jobsQuery.isPending ? <span className="font-semibold text-[var(--cos-primary)]">{jobs.length} open {jobs.length === 1 ? "job" : "jobs"}</span> : null}</p></div><div className="flex flex-wrap gap-2">{website ? <a href={website} target="_blank" rel="noreferrer" className={cn("inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] px-4 text-sm font-semibold hover:border-[var(--cos-primary)]", containerFocus)}><ExternalLink size={15} /> Website</a> : null}<Button variant="outline" aria-pressed={followed.includes(company.id)} onClick={() => toggle(company.id)}><Heart size={16} className={followed.includes(company.id) ? "fill-current text-[var(--cos-primary)]" : ""} /> {followed.includes(company.id) ? "Following" : "Follow"}</Button></div></div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-6">
          <ProfileSection title="Overview" icon={<Building2 size={18} />}>{overview ? <p className="whitespace-pre-line text-sm leading-7 text-[var(--cos-on-surface-variant)]">{overview}</p> : <EmptyState compact icon={<Building2 size={18} />} title="Overview not provided" description="This employer has not published a company overview yet." />}</ProfileSection>
          {company.mission ? <ProfileSection title="Mission" icon={<Sparkles size={18} />}><p className="whitespace-pre-line text-sm leading-7 text-[var(--cos-on-surface-variant)]">{company.mission}</p></ProfileSection> : null}
          {company.culture ? <ProfileSection title="Culture" icon={<Users size={18} />}><p className="whitespace-pre-line text-sm leading-7 text-[var(--cos-on-surface-variant)]">{company.culture}</p></ProfileSection> : null}
          {company.benefits?.length ? <ProfileSection title="Benefits" icon={<CheckCircle2 size={18} />}><ul className="grid gap-2 sm:grid-cols-2">{company.benefits.map((benefit) => <li key={benefit} className="flex items-start gap-2 rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] px-3 py-2.5 text-sm"><Check size={15} className="mt-0.5 shrink-0 text-[var(--cos-success-text)]" />{benefit}</li>)}</ul></ProfileSection> : null}
          <OfficeLocations company={company} query={branchesQuery} branches={branches} />
          <OpenCompanyJobs company={company} query={jobsQuery} jobs={jobs} />
          <RelatedCompanies query={relatedQuery} companies={related} />
        </div>
        <CompanySidebar company={company} openJobs={jobsQuery.isPending ? undefined : jobs.length} website={website} onShare={() => void share()} onCopy={() => void copy()} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{shareMessage}</p>
    </section>
  );
}

function ProfileSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <Card><div className="mb-4 flex items-center gap-2"><span className="text-[var(--cos-primary)]">{icon}</span><h3 className="text-lg font-bold">{title}</h3></div>{children}</Card>;
}

function OfficeLocations({ company, query, branches }: { company: PublicCompany; query: ReturnType<typeof useCompanyBranches>; branches: Branch[] }) {
  if (query.isPending) return <section aria-labelledby="office-locations-title"><h3 id="office-locations-title" className="mb-3 text-lg font-bold">Office locations</h3><div className="grid gap-3 sm:grid-cols-2"><SkeletonCard lines={3} /><SkeletonCard lines={3} /></div></section>;
  if (query.isError) return <ProfileSection title="Office locations" icon={<MapPin size={18} />}><ErrorState compact error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} /></ProfileSection>;
  const locationsToShow = branches.length ? branches : company.headquarters ? [{ id: "headquarters", name: "Headquarters", location: company.headquarters, is_headquarters: true }] : [];
  if (!locationsToShow.length) return null;
  return <ProfileSection title="Office locations" icon={<MapPin size={18} />}><div className="grid gap-3 sm:grid-cols-2">{locationsToShow.map((branch) => <div key={branch.id} className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-4"><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold">{branch.name || "Office"}</h4>{branch.is_headquarters ? <Badge>Headquarters</Badge> : null}</div><p className="mt-2 text-sm leading-6 text-[var(--cos-on-surface-variant)]">{[branch.address, branch.location, branch.city, branch.state, branch.country].filter(Boolean).join(", ")}</p>{branch.google_maps_url ? <a href={branch.google_maps_url} target="_blank" rel="noreferrer" className={cn("mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--cos-primary)]", containerFocus)}><ExternalLink size={14} /> Open map</a> : null}</div>)}</div></ProfileSection>;
}

function OpenCompanyJobs({ company, query, jobs }: { company: PublicCompany; query: ReturnType<typeof useJobsSearch>; jobs: PublicJob[] }) {
  return <section className="grid gap-4" aria-labelledby="company-open-jobs"><div className="flex flex-wrap items-end justify-between gap-2"><div><h3 id="company-open-jobs" className="text-lg font-bold">Current open jobs</h3><p className="text-sm text-[var(--cos-on-surface-variant)]">Published opportunities from {company.name}</p></div>{jobs.length ? <Link href={`/jobs?company=${encodeURIComponent(company.slug)}`} className={cn("text-sm font-semibold text-[var(--cos-primary)] hover:underline", containerFocus)}>View in job search</Link> : null}</div>{query.isPending ? <div className="grid gap-4 md:grid-cols-2" role="status" aria-label="Loading company jobs"><SkeletonCard lines={4} /><SkeletonCard lines={4} /></div> : query.isError ? <ErrorState error={query.error} compact onRetry={() => void query.refetch()} retrying={query.isFetching} /> : jobs.length ? <div className="grid gap-4 md:grid-cols-2">{jobs.map((job) => <div key={job.id} className="[content-visibility:auto] [contain-intrinsic-size:280px]"><JobCard title={job.title} company={job.company_name} location={jobLocation(job)} salary={jobSalary(job)} tags={(job.skills ?? []).map((skill) => skill.name).slice(0, 4)} status={job.is_featured ? <Badge tone="featured">Featured</Badge> : job.is_urgent ? <Badge tone="urgent">Urgent</Badge> : <Badge>Open</Badge>} href={`/jobs/${job.slug}`} /></div>)}</div> : <EmptyState icon={<Briefcase size={19} />} title="No open jobs" description={`${company.name} has no published openings right now.`} action={<Link href="/jobs" className={cn("font-semibold text-[var(--cos-primary)]", containerFocus)}>Browse all jobs</Link>} />}</section>;
}

function RelatedCompanies({ query, companies }: { query: ReturnType<typeof useCompaniesSearch>; companies: CompanyItem[] }) {
  if (query.isPending) return <section aria-labelledby="related-companies-title"><h3 id="related-companies-title" className="mb-3 text-lg font-bold">Related companies</h3><div className="grid gap-3 sm:grid-cols-2"><SkeletonCard lines={3} /><SkeletonCard lines={3} /></div></section>;
  if (query.isError || !companies.length) return null;
  return <section className="grid gap-3" aria-labelledby="related-companies-title"><h3 id="related-companies-title" className="text-lg font-bold">Related companies</h3><div className="grid gap-3 sm:grid-cols-2">{companies.map((company) => <Link key={company.id} href={`/companies/${company.slug}`} className={cn("flex items-center gap-3 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-4 transition hover:-translate-y-px hover:border-[var(--cos-primary-container)] hover:shadow-career-sm", containerFocus)}><Avatar name={company.name} src={company.logo_url} shape="company" verified={isVerified(company)} /><span className="min-w-0"><span className="flex flex-wrap items-center gap-2 font-semibold">{company.name}{isVerified(company) ? <Badge tone="verified">Verified</Badge> : null}</span><span className="mt-1 block text-sm text-[var(--cos-on-surface-variant)]">{[company.industry, company.headquarters].filter(Boolean).join(" · ")}</span></span></Link>)}</div></section>;
}

function CompanySidebar({ company, openJobs, website, onShare, onCopy }: { company: PublicCompany; openJobs?: number; website?: string; onShare: () => void; onCopy: () => void }) {
  const rows = [
    { label: "Website", value: website ? company.website : undefined, icon: <Globe2 size={15} /> },
    { label: "Industry", value: company.industry, icon: <Building2 size={15} /> },
    { label: "Company size", value: company.size_range ? `${company.size_range} employees` : undefined, icon: <Users size={15} /> },
    { label: "Founded", value: company.founded_year ? String(company.founded_year) : undefined, icon: <CalendarDays size={15} /> },
    { label: "Location", value: company.headquarters, icon: <MapPin size={15} /> },
    { label: "Hiring status", value: openJobs !== undefined ? openJobs > 0 ? "Actively hiring" : "No published openings" : undefined, icon: <Briefcase size={15} /> },
    { label: "Open jobs", value: openJobs !== undefined ? String(openJobs) : undefined, icon: <Briefcase size={15} /> }
  ].filter((row) => row.value);
  return <aside><Card className="sticky top-24"><details open className="group"><summary className={cn("flex cursor-pointer list-none items-center justify-between gap-3", containerFocus)}><span><span className="block text-lg font-bold">Company information</span><span className="block text-sm font-normal text-[var(--cos-on-surface-variant)]">Published profile details</span></span><ChevronDown size={17} className="transition-transform group-open:rotate-180 lg:hidden" /></summary><div className="mt-4 grid gap-4"><dl className="grid gap-3">{rows.map((row) => <div key={row.label} className="grid grid-cols-[20px_1fr] gap-2 border-b border-[var(--cos-outline-variant)] pb-3 last:border-0 last:pb-0"><span className="mt-0.5 text-[var(--cos-primary)]">{row.icon}</span><div><dt className="text-xs text-[var(--cos-on-surface-variant)]">{row.label}</dt><dd className="mt-0.5 break-words text-sm font-semibold">{row.value}</dd></div></div>)}</dl><div className="grid grid-cols-2 gap-2"><Button variant="outline" size="sm" onClick={onShare}><Share2 size={15} /> Share</Button><Button variant="outline" size="sm" onClick={onCopy}><Copy size={15} /> Copy link</Button></div>{website ? <a href={website} target="_blank" rel="noreferrer" className={cn("inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-career-button)] bg-[var(--cos-primary-container)] px-4 text-sm font-semibold text-white", containerFocus)}><ExternalLink size={15} /> Company website</a> : null}</div></details></Card></aside>;
}

function similarityScore(source: PublicCompany, candidate: PublicCompany) {
  let score = 0;
  if (source.industry && candidate.industry?.toLowerCase() === source.industry.toLowerCase()) score += 3;
  if (source.headquarters && candidate.headquarters?.toLowerCase() === source.headquarters.toLowerCase()) score += 2;
  if (source.size_range && candidate.size_range === source.size_range) score += 1;
  return score;
}

function CompanyDetailSkeleton() {
  return <div className="grid gap-6" role="status" aria-label="Loading company profile" aria-busy="true"><SkeletonCard lines={6} /><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="grid gap-5"><SkeletonCard lines={5} /><SkeletonCard lines={4} /><SkeletonCard lines={5} /></div><SkeletonCard lines={7} /></div></div>;
}

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) return undefined;
  return (error as { response?: { status?: number } }).response?.status;
}
