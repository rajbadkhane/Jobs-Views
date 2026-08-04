"use client";

import { ExternalLink, X } from "lucide-react";
import React, { useEffect, useRef } from "react";

import { Button } from "@career-os/ui";

export function AdminDrawer({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children: React.ReactNode; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeHandler = useRef(onClose);
  useEffect(() => { closeHandler.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeHandler.current();
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[90]" role="presentation"><button aria-label="Close detail drawer" className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" onClick={onClose} /><aside ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="admin-drawer-title" className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 shadow-career-floating sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 id="admin-drawer-title" className="text-xl font-bold">{title}</h2>{description ? <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">{description}</p> : null}</div><button ref={closeRef} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-[var(--cos-surface-container-low)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)]" aria-label="Close drawer" onClick={onClose}><X size={19} /></button></div><div className="mt-6">{children}</div></aside></div>;
}

export function ConfirmDialog({ open, title, description, confirmLabel, intent = "default", busy, onCancel, onConfirm }: { open: boolean; title: string; description: string; confirmLabel: string; intent?: "default" | "danger"; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = React.useState(false);
  useEffect(() => { if (!open) setSubmitting(false); }, [open]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting && !busy) onCancel();
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])');
      if (!controls?.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [busy, onCancel, open, submitting]);
  if (!open) return null;
  const working = Boolean(busy || submitting);
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !working) onCancel(); }}><div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" className="w-full max-w-md rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 shadow-career-floating"><h2 id="confirm-title" className="text-lg font-bold">{title}</h2><p id="confirm-description" className="mt-2 text-sm leading-6 text-[var(--cos-on-surface-variant)]">{description}</p><div className="mt-5 flex justify-end gap-2"><Button variant="secondary" disabled={working} onClick={onCancel}>Cancel</Button><button ref={confirmRef} className={intent === "danger" ? "min-h-10 rounded-[var(--radius-career-button)] bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-60" : "min-h-10 rounded-[var(--radius-career-button)] bg-[var(--cos-primary)] px-4 text-sm font-semibold text-white disabled:opacity-60"} disabled={working} onClick={() => { setSubmitting(true); onConfirm(); }}>{working ? "Working..." : confirmLabel}</button></div></div></div>;
}

export function DetailList({ items }: { items: Array<{ label: string; value?: React.ReactNode }> }) {
  const available = items.filter((item) => item.value !== undefined && item.value !== null && item.value !== "");
  return <dl className="grid gap-3 sm:grid-cols-2">{available.map((item) => <div key={item.label} className="rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] p-3"><dt className="text-xs font-bold uppercase text-[var(--cos-on-surface-variant)]">{item.label}</dt><dd className="mt-1 break-words text-sm font-medium">{item.value}</dd></div>)}</dl>;
}

export function PublicLink({ href, children }: { href: string; children: React.ReactNode }) { return <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] px-3 text-sm font-semibold hover:border-[var(--cos-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)]">{children}<ExternalLink size={15} /></a>; }
