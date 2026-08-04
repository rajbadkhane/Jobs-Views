"use client";

import { Banknote, Briefcase, Building2, Command, Search, Settings, Users, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useAdminData } from "@career-os/hooks";
import type { PublicCompany, PublicJob } from "@career-os/shared";
import { Badge } from "@career-os/ui";
import { cn } from "@career-os/utils";

type User = { id?: string; email?: string; role?: string };
type Plan = { id?: number; name?: string; slug?: string };
type Result = { id: string; label: string; detail: string; group: string; href: string; icon: React.ReactNode };

export function AdminCommandCenter() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const data = useAdminData(undefined, { dashboard: false, businessDashboard: false, marketplace: false, users: open, companies: open, jobs: open, applications: false, plans: open, cms: false, settings: false, audit: false, health: false });
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen((value) => !value); } if (event.key === "Escape") setOpen(false); };
    const custom = () => setOpen(true);
    document.addEventListener("keydown", keyboard);
    window.addEventListener("jobsview:open-command-center", custom);
    return () => { document.removeEventListener("keydown", keyboard); window.removeEventListener("jobsview:open-command-center", custom); };
  }, []);
  useEffect(() => { if (open) { setQuery(""); setActive(0); window.setTimeout(() => inputRef.current?.focus(), 0); } }, [open]);
  const results = useMemo(() => {
    const navigation: Result[] = [
      ["nav-dashboard", "Dashboard", "Platform overview", "/admin", <Command key="dashboard" size={17} />],
      ["nav-jobs", "Post or review jobs", "Job moderation", "/admin/jobs", <Briefcase key="jobs" size={17} />],
      ["nav-companies", "Review companies", "Company moderation", "/admin/companies", <Building2 key="companies" size={17} />],
      ["nav-users", "Manage users", "Identity operations", "/admin/users", <Users key="users" size={17} />],
      ["nav-billing", "Subscriptions and plans", "Billing", "/admin/billing", <Banknote key="billing" size={17} />],
      ["nav-settings", "Platform settings", "Configuration", "/admin/settings", <Settings key="settings" size={17} />]
    ].map(([id, label, detail, href, icon]) => ({ id: id as string, label: label as string, detail: detail as string, href: href as string, icon: icon as React.ReactNode, group: "Navigation" }));
    const users = items<User>(data.users.data).map((item) => ({ id: `user-${item.id}`, label: item.email || "User", detail: item.role || "User", href: "/admin/users", icon: <Users key={item.id} size={17} />, group: "Users" }));
    const companies = items<PublicCompany>(data.companies.data).map((item) => ({ id: `company-${item.id}`, label: item.name, detail: item.industry || item.status || "Company", href: "/admin/companies", icon: <Building2 key={item.id} size={17} />, group: "Companies" }));
    const jobs = items<PublicJob>(data.jobs.data).map((item) => ({ id: `job-${item.id}`, label: item.title, detail: item.company_name, href: "/admin/jobs", icon: <Briefcase key={item.id} size={17} />, group: "Jobs" }));
    const plans = items<Plan>(data.plans.data).map((item) => ({ id: `plan-${item.id}`, label: item.name || item.slug || "Plan", detail: "Subscription plan", href: "/admin/billing", icon: <Banknote key={item.id} size={17} />, group: "Subscriptions" }));
    const needle = query.trim().toLowerCase();
    return [...navigation, ...jobs, ...companies, ...users, ...plans].filter((item) => !needle || `${item.label} ${item.detail} ${item.group}`.toLowerCase().includes(needle)).slice(0, 30);
  }, [data.companies.data, data.jobs.data, data.plans.data, data.users.data, query]);
  if (!open) return null;
  const pending = data.users.isPending || data.companies.isPending || data.jobs.isPending || data.plans.isPending;
  return <div className="fixed inset-0 z-[110] flex items-start justify-center bg-slate-950/45 p-3 pt-[8vh] backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section role="dialog" aria-modal="true" aria-label="Admin command center" className="w-full max-w-2xl overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] shadow-career-floating"><div className="flex items-center gap-3 border-b border-[var(--cos-outline-variant)] px-4"><Search size={19} /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(results.length - 1, value + 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(0, value - 1)); } if (event.key === "Enter" && results[active]) window.location.href = results[active].href; }} className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none" placeholder="Search jobs, companies, users, plans, or commands" aria-activedescendant={results[active]?.id} role="combobox" aria-expanded="true" aria-controls="admin-command-results" /><Badge>Ctrl K</Badge><button className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--cos-surface-container-low)]" aria-label="Close command center" onClick={() => setOpen(false)}><X size={18} /></button></div><div id="admin-command-results" role="listbox" className="max-h-[65vh] overflow-y-auto p-2">{pending ? <div className="grid gap-2 p-2" role="status" aria-live="polite">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded bg-[var(--cos-surface-container-low)]" />)}</div> : results.length ? results.map((result, index) => <a id={result.id} role="option" aria-selected={index === active} key={result.id} href={result.href} onMouseEnter={() => setActive(index)} className={cn("flex min-h-12 items-center gap-3 rounded-[var(--radius-career-button)] px-3 text-sm outline-none", index === active && "bg-[var(--cos-surface-container-low)]")}><span className="text-[var(--cos-primary)]">{result.icon}</span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{result.label}</span><span className="block truncate text-xs text-[var(--cos-on-surface-variant)]">{result.detail}</span></span><Badge>{result.group}</Badge></a>) : <div className="p-8 text-center"><p className="font-semibold">No admin results</p><p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">Try a job, company, user email, subscription plan, or page name.</p></div>}</div></section></div>;
}

function items<T>(value: unknown): T[] { if (Array.isArray(value)) return value as T[]; if (value && typeof value === "object" && "items" in value && Array.isArray((value as { items?: unknown }).items)) return (value as { items: T[] }).items; return []; }
