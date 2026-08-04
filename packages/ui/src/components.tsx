"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command as CommandIcon,
  Download,
  Eye,
  EyeOff,
  FileQuestion,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  LogOut,
  Maximize2,
  MessageCircle,
  Mic,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  TriangleAlert,
  Upload,
  UploadCloud,
  UserCircle,
  Users,
  WifiOff,
  X
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";

import { cn } from "@career-os/utils";
import { careerMotion } from "./design-tokens";

const tokens = {
  surface: "var(--cos-surface)",
  containerLowest: "var(--cos-surface-container-lowest)",
  containerLow: "var(--cos-surface-container-low)",
  container: "var(--cos-surface-container)",
  containerHigh: "var(--cos-surface-container-high)",
  onSurface: "var(--cos-on-surface)",
  onSurfaceVariant: "var(--cos-on-surface-variant)",
  outline: "var(--cos-outline)",
  outlineVariant: "var(--cos-outline-variant)",
  primary: "var(--cos-primary)",
  onPrimary: "var(--cos-on-primary)",
  primaryContainer: "var(--cos-primary-container)",
  secondary: "var(--cos-secondary)",
  error: "var(--cos-error)"
};

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cos-surface)]";
const controlMotion = "transition duration-150 ease-out";
const surfaceClass = "border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] text-[var(--cos-on-surface)]";
const mutedText = "text-[var(--cos-on-surface-variant)]";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning" | "info" | "gradient" | "floating";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "icon";
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({ className, variant = "primary", size = "md", loading = false, fullWidth = false, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-career-button)] border text-sm font-semibold leading-5 outline-none",
        controlMotion,
        focusRing,
        "min-h-12 touch-manipulation sm:min-h-0",
        "after:pointer-events-none after:absolute after:inset-0 after:scale-0 after:rounded-[inherit] after:bg-white/20 after:opacity-0 after:transition after:duration-[120ms] active:after:scale-100 active:after:opacity-100",
        "active:scale-[0.98]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:opacity-70 disabled:transition-opacity dark:disabled:border-slate-800 dark:disabled:bg-slate-800 dark:disabled:text-slate-500",
        variant === "primary" && "border-b-2 border-[#f59e0b] bg-gradient-to-r from-[#0a3a7a] via-[#104899] to-[#0a3a7a] text-white font-bold shadow-md hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg active:translate-y-0 transition-all duration-200",
        variant === "secondary" && "border border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-[#f59e0b]/5 text-amber-600 dark:text-amber-400 font-extrabold hover:-translate-y-px hover:border-amber-500 hover:bg-amber-500/20 active:translate-y-0 shadow-2xs transition-all",
        variant === "outline" && "border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] font-semibold text-[var(--cos-on-surface)] hover:-translate-y-px hover:border-[#0a3a7a] dark:hover:border-amber-400 hover:bg-[var(--cos-surface-container-low)] transition-all",
        variant === "ghost" && "border-transparent bg-transparent text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)] hover:text-[#0a3a7a] dark:hover:text-amber-400 transition-colors",
        variant === "danger" && "border-[var(--cos-error)] bg-[var(--cos-error)] text-white shadow-career-sm hover:brightness-95 active:translate-y-px",
        variant === "success" && "border-emerald-600 bg-emerald-600 text-white shadow-career-sm hover:-translate-y-px hover:bg-emerald-700",
        variant === "warning" && "border-amber-500 bg-amber-500 text-white shadow-career-sm hover:-translate-y-px hover:bg-amber-600",
        variant === "info" && "border-[#0A3A7A] bg-[#0A3A7A] text-white shadow-career-sm hover:-translate-y-px hover:bg-[#082E61]",
        variant === "gradient" && "border-transparent bg-gradient-to-r from-[#0a3a7a] via-indigo-600 to-[#f59e0b] text-white font-black shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:scale-95 transition-all duration-200",
        variant === "floating" && "rounded-full border border-amber-500/40 bg-gradient-to-r from-[#0a3a7a] via-indigo-900 to-[#f59e0b] text-white shadow-career-floating hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200",
        size === "xs" && "h-7 px-2.5 text-xs",
        size === "sm" && "h-8 px-3",
        size === "md" && "h-10 px-4",
        size === "lg" && "h-11 px-5",
        size === "xl" && "h-12 px-6 text-base",
        size === "icon" && "h-10 w-10 p-0 max-sm:h-12 max-sm:w-12",
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : null}
      <span className={cn("inline-flex items-center gap-2 transition-transform duration-[120ms]", !loading && "group-hover:translate-x-1")}>{children}</span>
    </button>
  );
}

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix" | "suffix"> & {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  loading?: boolean;
  success?: boolean;
};

export function Input({ label, error, helperText, prefix, suffix, loading, success, className, id, maxLength, value, defaultValue, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const currentLength = typeof value === "string" ? value.length : typeof defaultValue === "string" ? defaultValue.length : undefined;
  const reduceMotion = useReducedMotion();
  return (
    <motion.label
      animate={error && !reduceMotion ? { x: [0, -2, 2, -1, 1, 0] } : { x: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="grid gap-1.5 text-sm font-semibold text-[var(--cos-on-surface)]"
      htmlFor={inputId}
    >
      {label}
      <span
        className={cn(
          "flex h-10 items-center gap-2 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm leading-5 text-[var(--cos-on-surface)]",
          "max-sm:h-12",
          controlMotion,
          "hover:border-[var(--cos-border-hover)] focus-within:border-[var(--cos-border-focus)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--cos-primary-container)_28%,transparent)]",
          error && "border-[var(--cos-border-error)] focus-within:border-[var(--cos-border-error)] focus-within:ring-[color-mix(in_srgb,var(--cos-error)_20%,transparent)]",
          success && !error && "border-[var(--cos-border-success)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--cos-border-success)_12%,transparent)]",
          className
        )}
      >
        {prefix ? <span className="text-[var(--cos-on-surface-variant)]">{prefix}</span> : null}
        <input
          id={inputId}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--cos-outline)]"
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {loading ? <Loader2 className="animate-spin text-[var(--cos-outline)]" size={15} /> : null}
        {success && !error ? <motion.span initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={careerMotion.hover}><CheckCircle2 className="text-[var(--cos-success-text)]" size={15} /></motion.span> : null}
        {suffix ? <span className="text-[var(--cos-on-surface-variant)]">{suffix}</span> : null}
      </span>
      <span className="flex items-center justify-between gap-3">
        <span>
          {error ? (
            <span id={`${inputId}-error`} className="text-xs font-normal leading-4 text-[var(--cos-error-text)]">
              {error}
            </span>
          ) : helperText ? (
            <span id={`${inputId}-helper`} className={cn("text-xs font-normal leading-4", mutedText)}>{helperText}</span>
          ) : null}
        </span>
        {maxLength ? <span className={cn("text-xs font-normal", mutedText)}>{currentLength ?? 0}/{maxLength}</span> : null}
      </span>
    </motion.label>
  );
}

export function PasswordInput({ label = "Password", ...props }: Omit<InputProps, "type" | "suffix">) {
  const [visible, setVisible] = React.useState(false);
  return (
    <Input
      label={label}
      type={visible ? "text" : "password"}
      suffix={
        <button type="button" className={cn("rounded-full p-1 hover:bg-[var(--cos-surface-container-low)]", focusRing)} onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
      {...props}
    />
  );
}

export function SearchInput(props: Omit<InputProps, "prefix">) {
  return <Input prefix={<Search size={16} />} {...props} />;
}

export function Textarea({ label, error, helperText, className, id, maxLength, value, defaultValue, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; helperText?: string }) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const currentLength = typeof value === "string" ? value.length : typeof defaultValue === "string" ? defaultValue.length : undefined;
  const reduceMotion = useReducedMotion();
  return (
    <motion.label
      animate={error && !reduceMotion ? { x: [0, -2, 2, -1, 1, 0] } : { x: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="grid gap-1.5 text-sm font-semibold text-[var(--cos-on-surface)]"
      htmlFor={inputId}
    >
      {label}
      <textarea
        id={inputId}
        className={cn(
          "min-h-28 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 py-2 text-sm leading-5 text-[var(--cos-on-surface)] outline-none placeholder:text-[var(--cos-outline)]",
          "max-sm:min-h-36 max-sm:px-4 max-sm:py-3",
          controlMotion,
          "hover:border-[var(--cos-border-hover)] focus:border-[var(--cos-border-focus)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--cos-primary-container)_28%,transparent)]",
          error && "border-[var(--cos-border-error)] focus:border-[var(--cos-border-error)]",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        {...props}
      />
      <span className="flex items-center justify-between gap-3">
        <span>
          {error ? <span id={`${inputId}-error`} className="text-xs font-normal leading-4 text-[var(--cos-error-text)]">{error}</span> : helperText ? <span id={`${inputId}-helper`} className={cn("text-xs font-normal leading-4", mutedText)}>{helperText}</span> : null}
        </span>
        {maxLength ? <span className={cn("text-xs font-normal", mutedText)}>{currentLength ?? 0}/{maxLength}</span> : null}
      </span>
    </motion.label>
  );
}

export function Card({ className, ...props }: React.ComponentPropsWithoutRef<typeof motion.div>) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01, boxShadow: "0 12px 30px rgba(0,0,0,0.06)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 shadow-career-sm transition-all duration-200 ease-out hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 dark:shadow-none", surfaceClass, className)}
      {...props}
    />
  );
}

export function Badge({ className, tone = "neutral", pulse = false, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "warning" | "danger" | "info" | "pending" | "approved" | "rejected" | "premium" | "verified" | "urgent" | "featured" | "remote" | "hybrid" | "internship" | "contract" | "freelance"; pulse?: boolean }) {
  const normalizedTone = tone === "approved" || tone === "verified" ? "success" : tone === "rejected" || tone === "urgent" ? "danger" : tone === "pending" ? "warning" : tone;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-4 transition duration-[120ms] hover:scale-[1.05]",
        pulse && "animate-pulse",
        normalizedTone === "neutral" && "border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] text-[var(--cos-on-surface-variant)]",
        normalizedTone === "success" && "border-emerald-200 bg-emerald-50 text-[var(--cos-success-text)] dark:border-emerald-900/70 dark:bg-emerald-950/40",
        normalizedTone === "warning" && "border-amber-200 bg-amber-50 text-[var(--cos-warning-text)] dark:border-amber-900/70 dark:bg-amber-950/40",
        normalizedTone === "danger" && "border-rose-200 bg-rose-50 text-[var(--cos-error-text)] dark:border-rose-900/70 dark:bg-rose-950/40",
        normalizedTone === "info" && "border-[#0A3A7A]/20 bg-[#0A3A7A]/10 text-[#0A3A7A] dark:border-[#60A5FA]/40 dark:bg-[#0A3A7A]/30 dark:text-[#93C5FD]",
        tone === "premium" && "border-[color-mix(in_srgb,var(--cos-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--cos-primary)_8%,var(--cos-surface-container-lowest))] text-[var(--cos-primary)] font-bold",
        tone === "featured" && "border-[color-mix(in_srgb,var(--cos-secondary)_30%,transparent)] bg-[color-mix(in_srgb,var(--cos-secondary)_8%,var(--cos-surface-container-lowest))] text-[var(--cos-secondary)]",
        ["remote", "hybrid", "internship", "contract", "freelance"].includes(tone) && "border-blue-200 bg-blue-50 text-blue-800",
        className
      )}
      {...props}
    />
  );
}

export function Avatar({ name, src, className, presence, verified = false, shape = "circle" }: { name: string; src?: string; className?: string; presence?: "online" | "busy" | "offline"; verified?: boolean; shape?: "circle" | "company" }) {
  const [imageState, setImageState] = React.useState<"loading" | "loaded" | "failed">(src ? "loading" : "failed");
  React.useEffect(() => setImageState(src ? "loading" : "failed"), [src]);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const radius = shape === "company" ? "rounded-[var(--radius-career-button)]" : "rounded-full";
  return (
    <span className={cn("relative inline-flex h-9 w-9 shrink-0", className)}>
      {src && imageState !== "failed" ? (
        <span className={cn("relative h-full w-full overflow-hidden bg-[var(--cos-surface-container-high)] ring-1 ring-[var(--cos-outline-variant)]", radius)}>
          {imageState === "loading" ? <Skeleton className="absolute inset-0 h-full w-full rounded-none" /> : null}
          <img src={src} alt={name} className={cn("h-full w-full object-cover transition-opacity duration-200", imageState === "loaded" ? "opacity-100" : "opacity-0")} onLoad={() => setImageState("loaded")} onError={() => setImageState("failed")} />
        </span>
      ) : (
        <span role="img" aria-label={name} className={cn("inline-flex h-full w-full items-center justify-center bg-[var(--cos-primary)] text-xs font-semibold text-[var(--cos-on-primary)] ring-1 ring-[var(--cos-outline-variant)]", radius)}>
          {initials}
        </span>
      )}
      {presence ? <span className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--cos-surface-container-lowest)]", presence === "online" && "bg-emerald-500", presence === "busy" && "bg-amber-500", presence === "offline" && "bg-slate-400")} /> : null}
      {verified ? <ShieldCheck className="absolute -right-1 -top-1 rounded-full bg-white text-[var(--cos-primary)]" size={14} /> : null}
    </span>
  );
}

export function GroupAvatar({ users, className }: { users: { name: string; src?: string }[]; className?: string }) {
  return (
    <div className={cn("flex -space-x-2", className)}>
      {users.slice(0, 4).map((user) => <Avatar key={user.name} name={user.name} src={user.src} className="ring-2 ring-[var(--cos-surface-container-lowest)]" />)}
      {users.length > 4 ? <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--cos-surface-container-high)] text-xs font-semibold ring-2 ring-[var(--cos-surface-container-lowest)]">+{users.length - 4}</span> : null}
    </div>
  );
}

export function Table({ columns, rows, loading = false, selectable = false, emptyMessage = "No records found", emptyDescription = "Try changing filters or refreshing this view.", emptyAction, emptyIcon }: { columns: string[]; rows: React.ReactNode[][]; loading?: boolean; selectable?: boolean; emptyMessage?: string; emptyDescription?: string; emptyAction?: React.ReactNode; emptyIcon?: React.ReactNode }) {
  const renderedColumns = selectable ? ["", ...columns] : columns;
  return (
    <div className="overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] shadow-career-sm transition-all duration-300 hover:shadow-career-md dark:shadow-none">
      <div className="grid gap-3 p-3 sm:hidden">
        {loading ? (
          Array.from({ length: 4 }, (_, index) => <SkeletonCard key={index} lines={3} className="border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)]" />)
        ) : rows.length ? (
          rows.map((row, rowIndex) => {
            const renderedRow = selectable ? [<input key="select" type="checkbox" className="h-5 w-5 accent-[var(--cos-primary)]" aria-label={`Select row ${rowIndex + 1}`} />, ...row] : row;
            return (
              <details key={rowIndex} className="group rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3" open={rowIndex < 2}>
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-left">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{renderedRow[selectable ? 1 : 0]}</span>
                  <ChevronDown size={16} className="shrink-0 text-[var(--cos-on-surface-variant)] transition group-open:rotate-180" />
                </summary>
                <div className="mt-3 grid gap-2">
                  {renderedRow.map((cell, cellIndex) => (
                    <div key={cellIndex} className="grid gap-1 rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-lowest)] px-3 py-2">
                      <span className="text-[11px] font-bold uppercase text-[var(--cos-on-surface-variant)]">{renderedColumns[cellIndex] || "Value"}</span>
                      <span className="min-w-0 text-sm text-[var(--cos-on-surface)]">{cell}</span>
                    </div>
                  ))}
                </div>
              </details>
            );
          })
        ) : (
          <EmptyState title={emptyMessage} description={emptyDescription} action={emptyAction} icon={emptyIcon} compact />
        )}
      </div>
      <div className="hidden overflow-x-auto sm:block">
      <table className="min-w-full divide-y divide-[var(--cos-outline-variant)] text-sm leading-5">
        <thead className="sticky top-0 bg-[var(--cos-surface-container-low)] text-[var(--cos-on-surface-variant)]">
          <tr>{renderedColumns.map((column, index) => <th key={`${column}-${index}`} className={cn("px-3 py-2.5 text-left text-xs font-semibold uppercase", index === 0 && "sticky left-0 bg-[var(--cos-surface-container-low)]")}>{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-[var(--cos-outline-variant)]">
          {loading ? (
            Array.from({ length: 5 }, (_, index) => (
              <tr key={index}>
                {renderedColumns.map((column, cellIndex) => <td key={`${column}-${cellIndex}`} className="px-3 py-3"><Skeleton className="h-4 w-full" /></td>)}
              </tr>
            ))
          ) : rows.length ? (
            rows.map((row, index) => {
              const renderedRow = selectable ? [<input key="select" type="checkbox" className="h-4 w-4 accent-[var(--cos-primary)]" aria-label={`Select row ${index + 1}`} />, ...row] : row;
              return (
                <motion.tr key={index} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ ...careerMotion.default, delay: index * 0.015 }} className="transition-colors duration-[120ms] hover:bg-[color-mix(in_srgb,var(--cos-primary-container)_6%,var(--cos-surface-container-lowest))]">
                  {renderedRow.map((cell, cellIndex) => <td key={cellIndex} className={cn("px-3 py-2.5 align-middle text-[var(--cos-on-surface)]", cellIndex === 0 && "sticky left-0 bg-[var(--cos-surface-container-lowest)]")}>{cell}</td>)}
                </motion.tr>
              );
            })
          ) : (
            <tr><td colSpan={renderedColumns.length} className="p-3"><EmptyState title={emptyMessage} description={emptyDescription} action={emptyAction} icon={emptyIcon} compact /></td></tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function Dialog({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <motion.div
        initial={reduceMotion ? false : { scale: 0.98, y: 8 }}
        animate={reduceMotion ? undefined : { scale: 1, y: 0 }}
        transition={careerMotion.dialog}
        className="w-full max-w-lg rounded-[var(--radius-career-dialog)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 shadow-career-modal dark:shadow-none"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="dialog-title" className="text-base font-semibold leading-6">{title}</h2>
          <Button variant="ghost" size="icon" aria-label="Close dialog" onClick={onClose}><X size={18} /></Button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Sheet({ open, title, children, side = "right", onClose }: { open: boolean; title: string; children: React.ReactNode; side?: "left" | "right" | "bottom"; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <motion.aside
        initial={reduceMotion ? false : side === "bottom" ? { y: 28 } : { x: side === "right" ? 28 : -28 }}
        animate={reduceMotion ? undefined : side === "bottom" ? { y: 0 } : { x: 0 }}
        transition={careerMotion.drawer}
        aria-label={title}
        className={cn(
          "absolute w-full border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 shadow-career-drawer dark:shadow-none",
          side === "right" && "right-0 top-0 h-full max-w-sm rounded-l-[var(--radius-career-sheet)] border-l",
          side === "left" && "left-0 top-0 h-full max-w-sm rounded-r-[var(--radius-career-sheet)] border-r",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[min(86dvh,760px)] overflow-y-auto rounded-t-[var(--radius-career-sheet)] border-t pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold leading-6">{title}</h2>
          <Button variant="ghost" size="icon" aria-label="Close sheet" onClick={onClose}><X size={18} /></Button>
        </div>
        {children}
      </motion.aside>
    </motion.div>
  );
}

export const Drawer = Sheet;

export function Dropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative inline-block">
      <Button variant="secondary" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {label}
        <ChevronDown size={16} />
      </Button>
      {open ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -4 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={careerMotion.default}
          className="absolute right-0 z-20 mt-2 min-w-44 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-1 shadow-career-floating dark:shadow-none"
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", mutedText)}>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 ? <span className="mx-2 text-[var(--cos-outline)]">/</span> : null}
          {item.href ? <a className="font-medium hover:text-[var(--cos-primary)]" href={item.href}>{item.label}</a> : <span>{item.label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={16} /></Button>
      <span className={cn("text-sm", mutedText)}>Page {page} of {totalPages}</span>
      <Button variant="secondary" size="icon" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={16} /></Button>
    </div>
  );
}

export function Toast({ title, description, intent = "info", children }: { title: string; description?: string; intent?: "success" | "info" | "warning" | "error"; children?: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
      transition={careerMotion.toast}
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-career)] border bg-[var(--cos-surface-container-lowest)] p-3 shadow-career-md dark:shadow-none",
        intent === "success" && "border-emerald-300",
        intent === "warning" && "border-amber-300",
        intent === "error" && "border-rose-300",
        intent === "info" && "border-[#0A3A7A]/40"
      )}
    >
      <motion.span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--cos-primary-container)]" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 4, ease: "linear" }} style={{ transformOrigin: "left" }} />
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{title}</div>
          {description ? <div className={cn("mt-1 text-sm", mutedText)}>{description}</div> : null}
        </div>
        {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
      </div>
    </motion.div>
  );
}

export function Command({ placeholder = "Search commands" }: { placeholder?: string }) {
  return (
    <div className="rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-2 shadow-career-sm dark:shadow-none">
      <div className="flex items-center gap-2">
        <CommandIcon size={16} className="text-[var(--cos-outline)]" />
        <input className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--cos-outline)]" placeholder={placeholder} />
      </div>
    </div>
  );
}

export function Calendar() {
  return (
    <div className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><CalendarDays size={16} /> Calendar</div>
      <div className={cn("grid grid-cols-7 gap-1 text-center text-xs", mutedText)}>
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        {Array.from({ length: 35 }, (_, index) => <button key={index} className={cn("aspect-square rounded-[var(--radius-career-sm)] hover:bg-[var(--cos-surface-container-low)]", focusRing)}>{index + 1 <= 31 ? index + 1 : ""}</button>)}
      </div>
    </div>
  );
}

export function Chart({ data }: { data: readonly { name: string; value: number }[] }) {
  return (
    <motion.div className="h-56 w-full" role="img" aria-label={`Chart with ${data.length} data points`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={careerMotion.chart}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[...data]}>
          <CartesianGrid stroke={tokens.outlineVariant} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke={tokens.onSurfaceVariant} tickLine={false} axisLine={false} />
          <YAxis stroke={tokens.onSurfaceVariant} tickLine={false} axisLine={false} />
          <RechartsTooltip
            contentStyle={{
              background: tokens.containerLowest,
              border: `1px solid ${tokens.outlineVariant}`,
              borderRadius: "8px",
              color: tokens.onSurface,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)"
            }}
          />
          <Area type="monotone" dataKey="value" stroke={tokens.primaryContainer} fill={tokens.primaryContainer} fillOpacity={0.16} strokeWidth={2} isAnimationActive animationDuration={600} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function EmptyState({ title, description, action, icon, compact = false }: { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode; compact?: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={careerMotion.page}
      className={cn("grid place-items-center rounded-[var(--radius-career)] border border-dashed border-[var(--cos-outline)] bg-[var(--cos-surface-container-lowest)] text-center", compact ? "min-h-32 p-4" : "min-h-48 p-6")}
    >
      <div>
        <motion.div animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-[var(--cos-surface-container-low)] text-[var(--cos-primary)]">{icon ?? <Search size={18} />}</motion.div>
        <h3 className="font-semibold">{title}</h3>
        {description ? <p className={cn("mx-auto mt-1 max-w-xl text-sm", mutedText)}>{description}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </motion.div>
  );
}

type ErrorStateProps = {
  error?: unknown;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  backHref?: string;
  backLabel?: string;
  compact?: boolean;
};

export function ErrorState({ error, title, description, onRetry, retrying = false, backHref, backLabel = "Go back", compact = false }: ErrorStateProps) {
  const presentation = errorPresentation(error);
  const Icon = presentation.kind === "offline" ? WifiOff : presentation.kind === "missing" ? FileQuestion : presentation.kind === "forbidden" ? ShieldCheck : AlertCircle;
  return (
    <div role="alert" aria-live="assertive">
      <EmptyState
        compact={compact}
        icon={<Icon size={19} />}
        title={title ?? presentation.title}
        description={description ?? presentation.description}
        action={onRetry || backHref ? (
          <div className="flex flex-wrap justify-center gap-2">
            {onRetry ? <Button type="button" onClick={onRetry} loading={retrying}><RefreshCw size={16} /> Retry</Button> : null}
            {backHref ? <a href={backHref} className={cn("inline-flex min-h-12 items-center justify-center rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-4 text-sm font-semibold hover:border-[var(--cos-border-hover)] hover:bg-[var(--cos-surface-container-low)] sm:min-h-10", focusRing)}>{backLabel}</a> : null}
          </div>
        ) : undefined}
      />
    </div>
  );
}

function errorPresentation(error: unknown) {
  const candidate = error && typeof error === "object" ? error as { code?: string; message?: string; response?: { status?: number } } : undefined;
  const status = candidate?.response?.status;
  const message = `${candidate?.code ?? ""} ${candidate?.message ?? ""}`.toLowerCase();
  if (!status && (message.includes("network") || message.includes("offline") || message.includes("econn") || message.includes("failed to fetch"))) {
    return { kind: "offline", title: "You're offline", description: "Check your internet connection, then retry this page." };
  }
  if (!status && (message.includes("timeout") || message.includes("aborted"))) {
    return { kind: "timeout", title: "This is taking longer than expected", description: "The request timed out. Retry when your connection is stable." };
  }
  if (status === 401) return { kind: "unauthorized", title: "Sign in required", description: "Your session may have expired. Sign in again to continue." };
  if (status === 403) return { kind: "forbidden", title: "Access unavailable", description: "You do not have permission to view this information." };
  if (status === 404) return { kind: "missing", title: "Nothing found here", description: "This item may have moved, expired, or been removed." };
  if (status === 429) return { kind: "limited", title: "Too many requests", description: "Please wait a moment before trying again." };
  if (status && status >= 500) return { kind: "server", title: "Service temporarily unavailable", description: "The service could not complete this request. Your data is safe; please retry." };
  return { kind: "unknown", title: "Unable to load this content", description: "Something interrupted the request. Please retry." };
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-sm", mutedText)} aria-live="polite" aria-busy="true">
      <span className="h-2 w-20 animate-pulse rounded-full bg-[var(--cos-surface-container-high)]" />
      {label}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("relative overflow-hidden rounded-[var(--radius-career-input)] bg-[var(--cos-surface-container-high)] before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:animate-[pulse_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent", className)} />;
}

export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <Card className={cn("grid gap-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      {Array.from({ length: lines }, (_, index) => <Skeleton key={index} className="h-3 w-full" />)}
    </Card>
  );
}

export function UploadDropzone({ label, progress = 0 }: { label: string; progress?: number }) {
  return (
    <motion.label whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }} className={cn("grid cursor-pointer place-items-center rounded-[var(--radius-career-card)] border border-dashed border-[var(--cos-outline)] bg-[var(--cos-surface-container-lowest)] p-6 text-center hover:border-[var(--cos-primary-container)] hover:bg-[var(--cos-surface-container-low)]", controlMotion, focusRing)}>
      <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}><UploadCloud className="mb-2 text-[var(--cos-primary)]" size={24} /></motion.span>
      <span className="text-sm font-semibold">{label}</span>
      <input type="file" className="sr-only" />
      <div className="mt-3 h-2 w-full max-w-xs rounded-full bg-[var(--cos-surface-container-low)]">
        <motion.div className="h-2 rounded-full bg-[var(--cos-primary-container)]" initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} transition={careerMotion.progress} />
      </div>
    </motion.label>
  );
}

export function UploadManager({ title, description, progress = 0, fileName, onRetry, onDelete }: { title: string; description?: string; progress?: number; fileName?: string; onRetry?: () => void; onDelete?: () => void }) {
  return (
    <Card className="grid gap-4">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] text-[var(--cos-primary)]">
          {fileName ? <FileText size={19} /> : <Upload size={19} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{title}</div>
          {description ? <p className={cn("mt-1 text-sm", mutedText)}>{description}</p> : null}
          {fileName ? <div className="mt-2 truncate text-sm font-medium">{fileName}</div> : null}
        </div>
        <Button variant="ghost" size="icon" aria-label="More upload options"><MoreHorizontal size={16} /></Button>
      </div>
      <div className="h-2 rounded-full bg-[var(--cos-surface-container-low)]">
        <motion.div className="h-2 rounded-full bg-[var(--cos-primary-container)]" initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} transition={careerMotion.progress} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary"><UploadCloud size={15} /> Browse</Button>
        {onRetry ? <Button size="sm" variant="outline" onClick={onRetry}><RefreshCw size={15} /> Retry</Button> : null}
        {onDelete ? <Button size="sm" variant="danger" onClick={onDelete}><Trash2 size={15} /> Delete</Button> : null}
      </div>
    </Card>
  );
}

export function EnterpriseCard({ title, description, icon, badge, actions, children, className, disabled = true }: { title: string; description?: string; icon?: React.ReactNode; badge?: React.ReactNode; actions?: React.ReactNode; children?: React.ReactNode; className?: string; disabled?: boolean }) {
  return (
    <Card className={cn("group relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl", disabled && "cursor-default", className)} aria-disabled={disabled ? true : undefined}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0a3a7a] via-indigo-600 to-[#f59e0b] opacity-90 transition-all duration-200 group-hover:h-2 group-hover:opacity-100" aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3.5">
          {icon ? <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#0a3a7a]/20 bg-gradient-to-br from-[#0a3a7a]/10 via-[#0a3a7a]/5 to-[#f59e0b]/10 text-[#0a3a7a] dark:text-amber-400 dark:border-amber-500/30 transition-all duration-200 group-hover:bg-gradient-to-br group-hover:from-[#0a3a7a] group-hover:to-[#f59e0b] group-hover:text-white group-hover:shadow-md">{icon}</span> : null}
          <div className="min-w-0">
            <h3 className="truncate text-base font-black tracking-tight text-slate-950 dark:text-white group-hover:text-[#0a3a7a] dark:group-hover:text-amber-400 transition-colors">{title}</h3>
            {description ? <p className={cn("mt-1 text-sm font-medium", mutedText)}>{description}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">{badge}{actions}</div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}

export function JobCard({ title, company, location, salary, tags = [], status, bookmarked = false, actions, href = "/jobs" }: { title: string; company: string; location?: string; salary?: string; tags?: string[]; status?: React.ReactNode; bookmarked?: boolean; actions?: React.ReactNode; href?: string }) {
  const navigate = () => {
    if (typeof window !== "undefined") window.location.href = href;
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate();
    }
  };
  return (
    <div role="link" tabIndex={0} onClick={navigate} onKeyDown={onKeyDown} className={cn("block cursor-pointer rounded-[var(--radius-career-card)]", focusRing)} aria-label={`View ${title} at ${company}`}>
      <EnterpriseCard title={title} description={company} icon={<Briefcase size={18} />} badge={status ?? <Badge tone="remote">Open</Badge>} actions={<Button type="button" variant="ghost" size="icon" aria-label={bookmarked ? "Saved job" : "Save job"} onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}><Star size={16} className={bookmarked ? "fill-amber-400 text-amber-400" : undefined} /></Button>} disabled={false}>
        <div className={cn("grid gap-2 text-sm", mutedText)}>
          {location ? <span>{location}</span> : null}
          {salary ? <span>{salary}</span> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
        {actions ? <div className="mt-4 flex flex-wrap gap-2" onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>{actions}</div> : null}
      </EnterpriseCard>
    </div>
  );
}

export function PageSkeleton({ variant = "grid", cards = 6, className }: { variant?: "grid" | "list" | "detail" | "dashboard" | "form"; cards?: number; className?: string }) {
  const gridClass = variant === "list"
    ? "grid gap-3"
    : variant === "detail"
      ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"
      : variant === "dashboard"
        ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        : variant === "form"
          ? "grid gap-4 md:grid-cols-2"
          : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";
  return (
    <div className={cn("grid gap-5", className)} role="status" aria-live="polite" aria-busy="true" aria-label="Loading content">
      <span className="sr-only">Loading content</span>
      <div className="grid gap-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className={gridClass}>
        {Array.from({ length: Math.max(1, cards) }, (_, index) => <SkeletonCard key={index} lines={variant === "form" ? 2 : variant === "detail" ? 6 : 3} className={variant === "detail" && index > 1 ? "lg:col-span-2" : undefined} />)}
      </div>
    </div>
  );
}

export function ResilientImage({ src, alt, fallbackLabel, className, wrapperClassName, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fallbackLabel?: string; wrapperClassName?: string }) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(!src);
  React.useEffect(() => {
    setLoaded(false);
    setFailed(!src);
  }, [src]);
  return (
    <span className={cn("relative block overflow-hidden bg-[var(--cos-surface-container-low)]", wrapperClassName)}>
      {!loaded && !failed ? <Skeleton className="absolute inset-0 h-full w-full rounded-none" /> : null}
      {failed ? (
        <span role="img" aria-label={alt || fallbackLabel || "Image unavailable"} className="absolute inset-0 grid place-items-center bg-[var(--cos-surface-container-low)] p-3 text-center text-xs font-semibold text-[var(--cos-on-surface-variant)]">
          <Building2 size={22} className="mb-1 text-[var(--cos-primary)]" />
          {fallbackLabel || "Image unavailable"}
        </span>
      ) : (
        <img
          {...props}
          src={src}
          alt={alt}
          className={cn("h-full w-full transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0", className)}
          onLoad={(event) => { setLoaded(true); props.onLoad?.(event); }}
          onError={(event) => { setFailed(true); props.onError?.(event); }}
        />
      )}
    </span>
  );
}

export function CompanyCard({ name, industry, location, verified = false, openJobs, logo, href = "/companies" }: { name: string; industry?: string; location?: string; verified?: boolean; openJobs?: number; logo?: string; href?: string }) {
  const navigate = () => {
    if (typeof window !== "undefined") window.location.href = href;
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate();
    }
  };
  return (
    <div role="link" tabIndex={0} onClick={navigate} onKeyDown={onKeyDown} className={cn("block cursor-pointer rounded-[var(--radius-career-card)]", focusRing)} aria-label={`View ${name} company profile`}>
      <EnterpriseCard title={name} description={[industry, location].filter(Boolean).join(" / ")} icon={<Avatar name={name} src={logo} shape="company" verified={verified} />} badge={<Badge tone={verified ? "verified" : "neutral"}>{verified ? "Verified" : "Company"}</Badge>} disabled={false}>
        {typeof openJobs === "number" ? <div className="text-sm font-semibold text-[var(--cos-primary)]">{openJobs} open jobs</div> : null}
      </EnterpriseCard>
    </div>
  );
}

export function DashboardCard({ label, value, trend, icon }: { label: string; value: string; trend?: string; icon?: React.ReactNode }) {
  return (
    <EnterpriseCard title={label} icon={icon ?? <Info size={18} />}>
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={careerMotion.progress} className="text-3xl font-bold tracking-tight">{value}</motion.div>
      {trend ? <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={careerMotion.notification} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--cos-success-text)]"><CheckCircle2 size={15} /> {trend}</motion.div> : null}
    </EnterpriseCard>
  );
}

export const CandidateCard = EnterpriseCard;
export const InterviewCard = EnterpriseCard;
export const AnalyticsCard = DashboardCard;
export const SalaryCard = EnterpriseCard;
export const CareerGuideCard = EnterpriseCard;
export const NotificationCard = EnterpriseCard;
export const ResumeCard = EnterpriseCard;
export const ApplicationCard = EnterpriseCard;
export const OfferCard = EnterpriseCard;
export const InvoiceCard = EnterpriseCard;

export function SearchBar({ placeholder = "Search", suggestions = [], recent = [], trending = [], onSearch }: { placeholder?: string; suggestions?: string[]; recent?: string[]; trending?: string[]; onSearch?: (value: string) => void }) {
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const list = value ? suggestions : [...recent, ...trending];
  const reduceMotion = useReducedMotion();
  const submit = React.useCallback((next = value) => {
    setValue(next);
    setOpen(false);
    inputRef.current?.blur();
    onSearch?.(next);
  }, [onSearch, value]);
  return (
    <div className="relative">
      <motion.label animate={open && !reduceMotion ? { scale: 1.01 } : { scale: 1 }} transition={careerMotion.hover} className="flex h-12 items-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm focus-within:border-[var(--cos-primary)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--cos-primary)_14%,transparent)] sm:h-11">
        <Search size={16} className="text-[var(--cos-outline)]" />
        <input ref={inputRef} className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none ring-0 placeholder:text-[var(--cos-outline)] focus:border-0 focus:outline-none focus:ring-0 sm:text-sm" placeholder={placeholder} value={value} onChange={(event) => { setValue(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={(event) => event.key === "Enter" && submit(value)} />
        <motion.span animate={open && !reduceMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ duration: 1.6, repeat: open ? Infinity : 0, ease: "easeInOut" }}><Mic size={15} className="text-[var(--cos-outline)]" /></motion.span>
      </motion.label>
      {open && list.length ? (
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={careerMotion.default} className="absolute z-30 mt-2 max-h-[50dvh] w-full overflow-y-auto rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-2 shadow-career-floating dark:shadow-none">
          {list.slice(0, 6).map((item, index) => <motion.button key={item} type="button" initial={reduceMotion ? false : { opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ ...careerMotion.default, delay: index * 0.015 }} className="flex min-h-12 w-full touch-manipulation items-center gap-2 rounded-[var(--radius-career-button)] px-3 py-2 text-left text-sm transition duration-[150ms] hover:bg-[var(--cos-surface-container-low)]" onMouseDown={(event) => event.preventDefault()} onClick={() => submit(item)}><Search size={14} />{item}</motion.button>)}
        </motion.div>
      ) : null}
    </div>
  );
}

export function Timeline({ items, orientation = "vertical" }: { items: { title: string; description?: string; time?: string; tone?: "success" | "warning" | "danger" | "info" | "neutral" }[]; orientation?: "vertical" | "horizontal" }) {
  return (
    <div className={cn(orientation === "horizontal" ? "flex gap-4 overflow-x-auto" : "grid gap-4")}>
      {items.map((item, index) => (
        <motion.div key={`${item.title}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...careerMotion.page, delay: index * 0.03 }} className={cn("relative flex gap-3", orientation === "horizontal" && "min-w-56")}>
          <motion.span initial={{ scale: 0.75 }} animate={{ scale: 1 }} transition={careerMotion.notification} className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] text-xs font-semibold">{index + 1}</motion.span>
          <div>
            <div className="flex items-center gap-2"><span className="font-semibold">{item.title}</span>{item.tone ? <Badge tone={item.tone}>{item.tone}</Badge> : null}</div>
            {item.description ? <p className={cn("mt-1 text-sm", mutedText)}>{item.description}</p> : null}
            {item.time ? <div className={cn("mt-1 text-xs", mutedText)}>{item.time}</div> : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function FormStepper({ steps, current = 0 }: { steps: string[]; current?: number }) {
  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        {steps.map((step, index) => <motion.div key={step} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ ...careerMotion.progress, delay: index * 0.04 }} className={cn("h-2 flex-1 origin-left rounded-full", index <= current ? "bg-[var(--cos-primary-container)]" : "bg-[var(--cos-surface-container-high)]")} />)}
      </div>
      <div className={cn("text-sm", mutedText)}>Step {Math.min(current + 1, steps.length)} of {steps.length}: {steps[current]}</div>
    </div>
  );
}

export function ChartShell({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {actions}
          <Button variant="ghost" size="icon" aria-label="Export chart"><Download size={15} /></Button>
          <Button variant="ghost" size="icon" aria-label="Fullscreen chart"><Maximize2 size={15} /></Button>
        </div>
      </div>
      {children}
    </Card>
  );
}

export function ToastAction({ intent = "info", title, description, action, onDismiss }: { intent?: "success" | "info" | "warning" | "error"; title: string; description?: string; action?: React.ReactNode; onDismiss?: () => void }) {
  const Icon = intent === "success" ? CheckCircle2 : intent === "warning" ? TriangleAlert : intent === "error" ? AlertCircle : Info;
  return (
    <Toast title={title} description={description} intent={intent}>
      <Icon size={16} />
      {action}
      {onDismiss ? <Button variant="ghost" size="icon" onClick={onDismiss} aria-label="Dismiss toast"><X size={14} /></Button> : null}
    </Toast>
  );
}

type AppShellVariant = "candidate" | "employer" | "admin";

function navSectionFor(label: string, variant: AppShellVariant) {
  if (variant === "admin") {
    if (label === "Dashboard") return "Overview";
    if (["Users", "Candidates", "Employers"].includes(label)) return "People";
    if (["Companies", "Jobs", "Recruitment"].includes(label)) return "Hiring";
    if (["Billing", "Subscriptions", "Marketplace"].includes(label)) return "Business";
    if (["CMS", "SEO", "Reports"].includes(label)) return "Content";
    return "Operations";
  }
  if (variant === "employer") {
    if (["Dashboard", "Company", "Jobs", "Pipeline", "Candidates", "Interviews"].includes(label)) return "Hiring";
    if (["Team", "Analytics", "Billing"].includes(label)) return "Workspace";
    return "Support";
  }
  if (["Dashboard", "Profile", "Applications", "Resume", "Saved Jobs", "Job Alerts", "Messages"].includes(label)) return "Main";
  if (["Career Health", "Career Growth", "Career Intelligence", "Resume Insights", "Salary", "Salary Insights", "Skill Intelligence", "Roadmaps", "Guidance", "Interviews", "Interview Hub", "Learning Center", "Career Analytics"].includes(label)) return "Career";
  return "Account";
}

function iconForNav(label: string) {
  if (label.includes("Setting")) return <Settings size={18} />;
  if (label.includes("Message")) return <MessageCircle size={18} />;
  if (label.includes("Help") || label.includes("Center")) return <HelpCircle size={18} />;
  if (label.includes("Profile")) return <UserCircle size={18} />;
  if (label.includes("User") || label.includes("Candidate") || label.includes("Employer") || label.includes("Team")) return <Users size={18} />;
  if (label.includes("Compan")) return <Building2 size={18} />;
  if (label.includes("Report") || label === "CMS" || label === "SEO") return <FileText size={18} />;
  if (label.includes("Audit") || label.includes("Monitor")) return <ShieldCheck size={18} />;
  if (label.includes("Notification")) return <Bell size={18} />;
  return <Briefcase size={18} />;
}

export function AppShell({
  title,
  nav,
  children,
  actions,
  workspaceLabel = "Candidate Workspace",
  workspaceName = "My Career",
  workspaceDescription = "Profile workspace",
  planTitle = "Career plan",
  planDescription = "Profile tools unlocked",
  quickActionHref = "/resume",
  notificationItems = [],
  notificationUnread = 0,
  variant = "candidate"
}: {
  title: string;
  nav: { label: string; href: string }[];
  children: React.ReactNode;
  actions?: React.ReactNode;
  workspaceLabel?: string;
  workspaceName?: string;
  workspaceDescription?: string;
  planTitle?: string;
  planDescription?: string;
  quickActionHref?: string;
  notificationItems?: Array<{ label: string; href?: string }>;
  notificationUnread?: number;
  variant?: AppShellVariant;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activePath, setActivePath] = React.useState("");
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const groupedNav = React.useMemo(() => nav.reduce<Record<string, { label: string; href: string }[]>>((groups, item) => {
    const section = navSectionFor(item.label, variant);
    groups[section] = [...(groups[section] ?? []), item];
    return groups;
  }, {}), [nav, variant]);

  const rootHref = variant === "admin" ? "/admin" : variant === "employer" ? "/employer" : "/candidate";
  const settingsHref = `${rootHref}/settings`;
  const profileItems = variant === "admin"
    ? [{ label: "Admin dashboard", href: "/admin" }, { label: "Platform settings", href: settingsHref }]
    : variant === "employer"
      ? [{ label: "Employer workspace", href: "/employer" }, { label: "Employer settings", href: settingsHref }]
      : [{ label: "Candidate workspace", href: "/candidate" }, { label: "Candidate settings", href: settingsHref }];

  const closeTransient = React.useCallback(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
  }, []);

  React.useEffect(() => {
    setActivePath(window.location.pathname);
    const saved = window.localStorage.getItem(`jobsview:${variant}:sidebar-collapsed`);
    if (saved !== null) setCollapsed(saved === "true");
    const syncPath = () => {
      setActivePath(window.location.pathname);
      closeTransient();
    };
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, [closeTransient, variant]);

  React.useEffect(() => {
    window.localStorage.setItem(`jobsview:${variant}:sidebar-collapsed`, String(collapsed));
  }, [collapsed, variant]);

  React.useEffect(() => {
    function dismiss(event: PointerEvent) {
      const target = event.target as Node;
      if (notificationsOpen && !notificationRef.current?.contains(target)) setNotificationsOpen(false);
      if (profileOpen && !profileRef.current?.contains(target)) setProfileOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeTransient();
    }
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeTransient, notificationsOpen, profileOpen]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobileOpen]);

  const workspacePadding = collapsed ? "lg:pl-[112px]" : "lg:pl-[304px]";
  const openCommandCenter = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent("jobsview:open-command-center"));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <motion.aside
        animate={{ width: collapsed ? 88 : 280 }}
        transition={reduceMotion ? { duration: 0 } : careerMotion.sidebar}
        className="fixed inset-y-3 left-3 z-40 hidden overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-3 shadow-career-floating dark:shadow-none lg:flex lg:flex-col"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 shrink-0 overflow-hidden relative rounded-[var(--radius-career-button)]">
            <img
              src="/images/logo-mark.png"
              alt="Jobs View logo"
              className="h-full w-full object-contain"
            />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold tracking-tight text-[var(--cos-primary)]">Jobs View</div>
              <div className={cn("truncate text-[10px] font-semibold uppercase tracking-wider", mutedText)}>{workspaceLabel}</div>
            </div>
          ) : null}
          <button className={cn("ml-auto grid min-h-11 min-w-11 place-items-center rounded-full text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)]", focusRing)} onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>
        <div className="mt-4 flex w-full items-center gap-3 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3 text-left" aria-label="Current workspace">
          <Avatar name={workspaceName} />
          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{workspaceName}</span>
              <span className={cn("block truncate text-xs", mutedText)}>{workspaceDescription}</span>
            </span>
          ) : null}
        </div>
        <nav className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1" aria-label="Workspace navigation">
          {Object.entries(groupedNav).map(([section, items]) => (
            <div key={section} className="mb-5">
              {!collapsed ? <div className={cn("mb-2 px-3 text-[11px] font-semibold uppercase", mutedText)}>{section}</div> : null}
              <div className="grid gap-1">
                {items.map((item) => {
                  const active = activePath === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      onClick={closeTransient}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-[var(--radius-career-button)] px-3 py-2.5 text-sm font-medium text-[var(--cos-on-surface-variant)] transition duration-150 hover:-translate-y-px hover:bg-[var(--cos-surface-container-low)] hover:text-[var(--cos-on-surface)]",
                        focusRing,
                        active && "bg-[var(--cos-surface-container-low)] text-[var(--cos-on-surface)]"
                      )}
                    >
                      <span className={cn("absolute left-0 h-5 w-1 rounded-full bg-[var(--cos-primary-container)] transition", active ? "opacity-100" : "opacity-0")} aria-hidden="true" />
                      <span className="shrink-0 text-[var(--cos-outline)] group-hover:text-[var(--cos-primary)]">{iconForNav(item.label)}</span>
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="rounded-[var(--radius-career-card)] border border-[color-mix(in_srgb,var(--cos-secondary)_25%,transparent)] bg-[color-mix(in_srgb,var(--cos-secondary)_6%,var(--cos-surface-container-lowest))] p-3 text-sm text-[var(--cos-secondary)] dark:border-[color-mix(in_srgb,var(--cos-secondary)_25%,transparent)] dark:bg-[color-mix(in_srgb,var(--cos-secondary)_10%,var(--cos-surface-container-lowest))] dark:text-[var(--cos-secondary)]">
          {!collapsed ? (
            <>
              <div className="font-semibold">{planTitle}</div>
              <div className="mt-1 text-xs opacity-80">{planDescription}</div>
            </>
          ) : (
            <div className="grid place-items-center"><Check size={17} /></div>
          )}
        </div>
      </motion.aside>
      <main id="main-content" tabIndex={-1}>
        <header className={cn("sticky top-0 z-30 border-b border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] transition-[padding] duration-200", workspacePadding)}>
          <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-0 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open workspace navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><PanelLeftOpen size={19} /></Button>
            <div className="min-w-0">
              <div className="hidden sm:block"><Breadcrumb items={[{ label: "Jobs View", href: rootHref }, { label: title }]} /></div>
              <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
            </div>
            <button className={cn("ml-auto hidden h-10 w-full max-w-xl items-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] px-4 text-left text-sm text-[var(--cos-on-surface-variant)] hover:border-[var(--cos-border-hover)] md:flex", focusRing)} onClick={openCommandCenter}>
              <CommandIcon size={16} />
              <span className="min-w-0 flex-1 truncate">Search jobs, companies, people, guides, settings, commands</span>
              <span className="rounded-[var(--radius-career-sm)] border border-[var(--cos-outline-variant)] px-1.5 py-0.5 text-[11px]">Ctrl K</span>
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
              {actions}
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open search" onClick={openCommandCenter}><CommandIcon size={18} /></Button>
              <a href={quickActionHref} className={cn("hidden h-9 items-center justify-center gap-2 rounded-[var(--radius-career-button)] bg-[var(--cos-primary)] px-3 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--cos-primary-hover)] md:inline-flex", focusRing)}><Plus size={15} /> Quick action</a>
              <div className="relative" ref={notificationRef}>
                <Button variant="ghost" size="icon" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }}>
                  <motion.span animate={notificationsOpen && !reduceMotion ? { rotate: [0, -12, 12, -8, 8, 0] } : { rotate: 0 }} transition={careerMotion.notification}><Bell size={18} /></motion.span>
                  {notificationUnread > 0 ? <motion.span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" animate={reduceMotion ? undefined : { scale: [1, 1.35, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} /> : null}
                </Button>
                {notificationsOpen ? <FloatingPanel title="Notifications" items={notificationItems} emptyLabel="No new notifications" onNavigate={closeTransient} /> : null}
              </div>
              <div className="relative" ref={profileRef}>
                <Button variant="ghost" size="icon" aria-label="Profile menu" aria-expanded={profileOpen} onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }}><UserCircle size={19} /></Button>
                {profileOpen ? <FloatingPanel title="Profile" items={profileItems} onNavigate={closeTransient} /> : null}
              </div>
            </div>
          </div>
        </header>
        <div className={cn("transition-[padding] duration-200 flex flex-col min-h-[calc(100vh-4rem)]", workspacePadding)}>
          <div className="mx-auto w-full max-w-[1440px] flex-1 p-3 pb-[calc(7.25rem+env(safe-area-inset-bottom))] sm:p-4 md:p-6 lg:pb-12">{children}</div>
          <footer className="mx-auto w-full max-w-[1440px] px-3 sm:px-6 pb-24 lg:pb-8 pt-6 border-t border-[var(--cos-outline-variant)] text-xs sm:text-sm text-[var(--cos-on-surface-variant)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>&copy; {new Date().getFullYear()} Jobs View. All rights reserved.</div>
            <div className="font-medium">
              Powered By{" "}
              <a href="https://gautamenterprises.org" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--cos-primary)] hover:underline">
                Gautam Tech Studio
              </a>
            </div>
          </footer>
        </div>
      </main>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button type="button" className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" aria-label="Close workspace navigation" onClick={closeTransient} />
          <motion.aside initial={reduceMotion ? false : { x: "-100%" }} animate={{ x: 0 }} transition={reduceMotion ? { duration: 0 } : careerMotion.drawer} className="absolute inset-y-0 left-0 flex w-[min(88vw,22rem)] flex-col border-r border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-career-modal" role="dialog" aria-modal="true" aria-label="Workspace navigation">
            <div className="flex min-h-12 items-center gap-3">
              <img src="/images/logo-mark.png" alt="" className="h-10 w-10 object-contain" />
              <div className="min-w-0 flex-1"><div className="truncate text-sm font-extrabold text-[var(--cos-primary)]">Jobs View</div><div className={cn("truncate text-xs", mutedText)}>{workspaceLabel}</div></div>
              <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={closeTransient}><X size={19} /></Button>
            </div>
            <nav className="mt-4 min-h-0 flex-1 overflow-y-auto" aria-label="All workspace destinations">
              {Object.entries(groupedNav).map(([section, items]) => <div key={section} className="mb-5"><div className={cn("mb-2 px-3 text-[11px] font-bold uppercase", mutedText)}>{section}</div><div className="grid gap-1">{items.map((item) => <a key={item.href} href={item.href} onClick={closeTransient} aria-current={activePath === item.href ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-[var(--radius-career-button)] px-3 text-sm font-semibold", focusRing, activePath === item.href ? "bg-[var(--cos-surface-container-low)] text-[var(--cos-primary)]" : "text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)]")}><span className="shrink-0">{iconForNav(item.label)}</span><span>{item.label}</span></a>)}</div></div>)}
            </nav>
          </motion.aside>
        </div>
      ) : null}
      <nav className="fixed inset-x-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[color-mix(in_srgb,var(--cos-surface-container-lowest)_94%,transparent)] p-1 shadow-career-floating backdrop-blur-xl dark:shadow-none sm:inset-x-3 sm:bottom-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden" aria-label="Mobile workspace navigation">
        {nav.slice(0, 4).map((item) => {
          const active = activePath === item.href;
          return (
            <a key={item.href} href={item.href} onClick={closeTransient} aria-current={active ? "page" : undefined} className={cn("grid min-h-14 touch-manipulation place-items-center gap-1 rounded-[var(--radius-career-button)] px-1 py-2 text-[10px] font-medium text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)] sm:text-[11px]", active && "bg-[var(--cos-surface-container-low)] text-[var(--cos-primary)]", focusRing)}>
              {iconForNav(item.label)}
              <span className="max-w-full truncate">{item.label}</span>
            </a>
          );
        })}
        <button type="button" onClick={() => setMobileOpen(true)} className={cn("grid min-h-14 touch-manipulation place-items-center gap-1 rounded-[var(--radius-career-button)] px-1 py-2 text-[10px] font-medium text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)] sm:text-[11px]", focusRing)} aria-label="Open all navigation"><MoreHorizontal size={18} /><span>More</span></button>
      </nav>
      <a href={quickActionHref} className={cn("fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 grid h-14 w-14 touch-manipulation place-items-center rounded-full bg-[var(--cos-primary-container)] text-white shadow-career-floating lg:hidden", focusRing)} aria-label="Quick action">
        <Plus size={22} />
      </a>
    </div>
  );
}

function FloatingPanel({ title, items, emptyLabel = "Nothing to show", onNavigate }: { title: string; items: Array<{ label: string; href?: string }>; emptyLabel?: string; onNavigate?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={careerMotion.notification} className="absolute right-0 top-12 z-50 w-72 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-2 shadow-career-floating dark:shadow-none">
      <div className="px-3 py-2 text-sm font-semibold">{title}</div>
      <div className="grid gap-1">
        {items.length === 0 ? <p className={cn("px-3 py-4 text-sm", mutedText)}>{emptyLabel}</p> : null}
        {items.map((item) => item.href ? (
          <motion.a key={`${item.label}-${item.href}`} href={item.href} onClick={onNavigate} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} transition={careerMotion.notification} className={cn("rounded-[var(--radius-career-button)] px-3 py-2 text-left text-sm text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)] hover:text-[var(--cos-on-surface)]", focusRing)}>
            {item.label}
          </motion.a>
        ) : (
          <motion.div key={item.label} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} transition={careerMotion.notification} className="rounded-[var(--radius-career-button)] px-3 py-2 text-sm text-[var(--cos-on-surface-variant)]">
            {item.label}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

type CommandRole = "public" | "candidate" | "employer" | "admin";
type CommandItem = {
  id: string;
  label: string;
  description: string;
  group: "Jobs" | "Companies" | "People" | "Guides" | "Skills" | "Commands" | "Settings" | "Messages" | "Learning" | "Notifications" | "Salary";
  href?: string;
  icon: React.ReactNode;
  keywords: string[];
  action?: () => void;
};

type SearchHistoryItem = {
  id: string;
  label: string;
  group: string;
  createdAt: number;
  pinned?: boolean;
};

const searchHistoryKey = "jobsview:universal-search-history";

function dispatchCommandCenterOpen() {
  window.dispatchEvent(new CustomEvent("jobsview:open-command-center"));
}

export function UniversalCommandTrigger({ label = "Search Jobs View" }: { label?: string }) {
  return (
    <button type="button" className={cn("inline-flex h-10 items-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] px-3 text-sm text-[var(--cos-on-surface-variant)] transition hover:border-[var(--cos-border-hover)] hover:text-[var(--cos-on-surface)]", focusRing)} onClick={dispatchCommandCenterOpen}>
      <CommandIcon size={16} />
      <span className="hidden sm:inline">{label}</span>
      <span className="rounded-[var(--radius-career-sm)] border border-[var(--cos-outline-variant)] px-1.5 py-0.5 text-[11px]">Ctrl K</span>
    </button>
  );
}

export function UniversalCommandCenter({ nav = [], role = "candidate" }: { nav?: { label: string; href: string }[]; role?: CommandRole }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});
  const [history, setHistory] = React.useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  const items = React.useMemo(() => buildCommandItems(nav, role), [nav, role]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = React.useMemo(() => {
    if (!normalizedQuery) return items.slice(0, 18);
    return items.filter((item) => [item.label, item.description, item.group, ...item.keywords].join(" ").toLowerCase().includes(normalizedQuery));
  }, [items, normalizedQuery]);
  const visibleItems = filteredItems.filter((item) => !collapsedGroups[item.group]);
  const activeItem = visibleItems[selectedIndex];
  const groupedItems = React.useMemo(() => groupCommandItems(filteredItems), [filteredItems]);
  const groupedHistory = React.useMemo(() => groupHistory(history), [history]);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(searchHistoryKey);
    if (stored) {
      try {
        setHistory(JSON.parse(stored) as SearchHistoryItem[]);
      } catch {
        setHistory([]);
      }
    }

    function onOpen() {
      setOpen(true);
    }

    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    window.addEventListener("jobsview:open-command-center", onOpen);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("jobsview:open-command-center", onOpen);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setLoading(Boolean(normalizedQuery));
    const timer = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(timer);
  }, [normalizedQuery, open]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query, collapsedGroups]);

  function close() {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }

  function persistHistory(next: SearchHistoryItem[]) {
    setHistory(next);
    window.localStorage.setItem(searchHistoryKey, JSON.stringify(next.slice(0, 24)));
  }

  function remember(item: CommandItem | { label: string; group: string }) {
    const nextItem: SearchHistoryItem = {
      id: `${item.group}-${item.label}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: item.label,
      group: item.group,
      createdAt: Date.now(),
      pinned: history.find((entry) => entry.label === item.label)?.pinned
    };
    persistHistory([nextItem, ...history.filter((entry) => entry.label !== item.label)].slice(0, 24));
  }

  function runItem(item?: CommandItem) {
    if (!item) {
      if (query.trim()) remember({ label: query.trim(), group: "Search" });
      return;
    }
    remember(item);
    if (item.action) item.action();
    if (item.href) window.location.href = item.href;
    close();
  }

  function onPaletteKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((value) => Math.min(value + 1, Math.max(visibleItems.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((value) => Math.max(value - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      runItem(activeItem);
      return;
    }
  }

  if (!open) return null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed inset-0 z-[90] bg-slate-950/45 p-0 backdrop-blur-sm sm:grid sm:place-items-start sm:p-4 sm:pt-[8vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Universal command center"
      onKeyDown={onPaletteKeyDown}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed inset-x-0 bottom-0 flex h-[100dvh] max-h-none flex-col overflow-hidden rounded-t-[var(--radius-career-dialog)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] shadow-career-modal dark:shadow-none sm:relative sm:bottom-auto sm:mx-auto sm:h-auto sm:max-h-[92vh] sm:w-full sm:max-w-5xl sm:rounded-[var(--radius-career-dialog)]"
      >
        <div className="flex items-center gap-2 border-b border-[var(--cos-outline-variant)] p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:gap-3 sm:p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-career-button)] bg-[var(--cos-primary-container)] text-white">
            <CommandIcon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="jobsview-command-search">Search Jobs View</label>
            <div className="flex items-center gap-2 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] px-3 focus-within:border-[var(--cos-border-focus)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--cos-primary-container)_24%,transparent)]">
              <Search size={18} className="text-[var(--cos-outline)]" />
              <input
                id="jobsview-command-search"
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--cos-outline)] sm:text-sm"
                placeholder="Search jobs, companies, candidates, guides, skills, salary, messages, settings, commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="jobsview-command-results"
                aria-activedescendant={activeItem ? `command-item-${activeItem.id}` : undefined}
              />
              <button type="button" className={cn("rounded-full p-2 text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container)]", focusRing)} aria-label="Voice search placeholder">
                <span className="relative inline-flex">
                  <Mic size={17} />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500 motion-safe:animate-ping" />
                </span>
              </button>
            </div>
          </div>
          <button type="button" className={cn("rounded-[var(--radius-career-button)] p-2 text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)]", focusRing)} onClick={close} aria-label="Close command center">
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 border-[var(--cos-outline-variant)] p-3 lg:border-r sm:p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {["Remote React jobs", "Go candidates", "Highest salary Java", "Resume tips", "Career roadmap"].map((item, index) => (
                <motion.button key={item} type="button" initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ ...careerMotion.default, delay: index * 0.02 }} className={cn("min-h-10 touch-manipulation rounded-full border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] px-3 py-1.5 text-xs font-semibold text-[var(--cos-on-surface-variant)] transition duration-[150ms] hover:-translate-y-px hover:border-[var(--cos-border-hover)] hover:text-[var(--cos-on-surface)]", focusRing)} onClick={() => setQuery(item)}>
                  {item}
                </motion.button>
              ))}
            </div>

            <div className="mb-4 rounded-[var(--radius-career-card)] border border-[#0A3A7A]/20 bg-[#0A3A7A]/10 p-3 text-[#0A3A7A] dark:border-[#60A5FA]/40 dark:bg-[#0A3A7A]/30 dark:text-[#BFDBFE]">
              <div className="flex items-center gap-2 text-sm font-semibold"><SparkIcon /> Ask Jobs View</div>
              <p className="mt-1 text-xs opacity-80">AI natural language discovery enabled for intelligent career matching.</p>
            </div>

            <div id="jobsview-command-results" role="listbox" aria-label="Search results" className="grid gap-3">
              {loading ? <SearchSkeleton /> : null}
              {!loading && filteredItems.length === 0 ? <SearchEmptyState onPick={setQuery} /> : null}
              {!loading && filteredItems.length > 0 ? Object.entries(groupedItems).map(([group, groupItems]) => {
                const collapsed = collapsedGroups[group];
                return (
                  <section key={group} aria-labelledby={`command-group-${group}`}>
                    <button type="button" className={cn("mb-1 flex w-full items-center justify-between rounded-[var(--radius-career-button)] px-2 py-1 text-left text-xs font-bold uppercase tracking-wide text-[var(--cos-on-surface-variant)] hover:bg-[var(--cos-surface-container-low)]", focusRing)} onClick={() => setCollapsedGroups((value) => ({ ...value, [group]: !value[group] }))}>
                      <span id={`command-group-${group}`}>{group}</span>
                      <span>{collapsed ? "Show" : "Hide"}</span>
                    </button>
                    {!collapsed ? (
                      <div className="grid gap-1">
                        {groupItems.map((item) => {
                          const itemIndex = visibleItems.findIndex((entry) => entry.id === item.id);
                          const active = itemIndex === selectedIndex;
                          return (
                            <motion.button
                              key={item.id}
                              id={`command-item-${item.id}`}
                              type="button"
                              role="option"
                              aria-selected={active}
                              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0, scale: active && !reduceMotion ? 1.01 : 1 }}
                              transition={careerMotion.hover}
                              className={cn("group flex min-h-[4.5rem] touch-manipulation items-center gap-3 rounded-[var(--radius-career-card)] border border-transparent px-3 py-2 text-left transition duration-180 hover:-translate-y-px hover:border-[var(--cos-outline-variant)] hover:bg-[var(--cos-surface-container-low)] sm:min-h-16", active && "border-[var(--cos-border-focus)] bg-[var(--cos-surface-container-low)]")}
                              onMouseEnter={() => setSelectedIndex(Math.max(itemIndex, 0))}
                              onClick={() => runItem(item)}
                            >
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container)] text-[var(--cos-primary)]">{item.icon}</span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-[var(--cos-on-surface)]">{item.label}</span>
                                <span className="block truncate text-xs text-[var(--cos-on-surface-variant)]">{item.description}</span>
                              </span>
                              <span className="hidden rounded-[var(--radius-career-sm)] border border-[var(--cos-outline-variant)] px-2 py-1 text-[11px] text-[var(--cos-on-surface-variant)] sm:inline">Enter</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                );
              }) : null}
            </div>
          </div>

          <aside className="grid content-start gap-4 bg-[var(--cos-surface-container-low)] p-3 sm:p-4">
            <CommandSidePanel title="Smart Filters" items={["Recent", "Trending", "Saved", "Popular", "Frequently visited"]} />
            <section>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Search History</h2>
                <span className="rounded-full border border-[var(--cos-outline-variant)] px-2 py-0.5 text-[11px] text-[var(--cos-on-surface-variant)]">Local</span>
              </div>
              <div className="grid gap-2">
                {Object.entries(groupedHistory).map(([group, entries]) => entries.length ? (
                  <div key={group}>
                    <div className="mb-1 text-[11px] font-bold uppercase text-[var(--cos-on-surface-variant)]">{group}</div>
                    <div className="grid gap-1">
                      {entries.slice(0, 4).map((entry) => (
                        <motion.div key={`${entry.id}-${entry.createdAt}`} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={careerMotion.notification} className="flex items-center gap-2 rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-lowest)] px-2 py-2 text-xs">
                          <button type="button" className="min-w-0 flex-1 truncate text-left" onClick={() => setQuery(entry.label)}>{entry.label}</button>
                          <button type="button" className={cn("rounded-full p-1 text-[var(--cos-on-surface-variant)] hover:text-amber-600", focusRing)} aria-label={entry.pinned ? "Unpin search" : "Pin search"} onClick={() => persistHistory(history.map((item) => item.id === entry.id ? { ...item, pinned: !item.pinned } : item))}>
                            <Star size={14} fill={entry.pinned ? "currentColor" : "none"} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : null)}
                {history.length === 0 ? <p className="rounded-[var(--radius-career-card)] border border-dashed border-[var(--cos-outline-variant)] p-3 text-xs text-[var(--cos-on-surface-variant)]">Recent searches, pinned queries, and recent pages appear here after use.</p> : null}
              </div>
            </section>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-[var(--cos-on-surface-variant)]">
              <span className="rounded-[var(--radius-career-sm)] border border-[var(--cos-outline-variant)] py-1">↑↓ Move</span>
              <span className="rounded-[var(--radius-career-sm)] border border-[var(--cos-outline-variant)] py-1">Enter Open</span>
              <span className="rounded-[var(--radius-career-sm)] border border-[var(--cos-outline-variant)] py-1">Esc Close</span>
            </div>
          </aside>
        </div>
      </motion.div>
    </motion.div>
  );
}

function buildCommandItems(nav: { label: string; href: string }[], role: CommandRole): CommandItem[] {
  const navItems: CommandItem[] = nav.map((item) => ({
    id: `nav-${item.href}`.replace(/[^a-zA-Z0-9]+/g, "-"),
    label: item.label,
    description: `Open ${item.label}`,
    group: item.label.includes("Setting") ? "Settings" : item.label.includes("Message") ? "Messages" : item.label.includes("Learning") ? "Learning" : item.label.includes("Salary") ? "Salary" : item.label.includes("Guide") || item.label.includes("Roadmap") || item.label.includes("Interview") ? "Guides" : "Commands",
    href: item.href,
    icon: iconForNav(item.label),
    keywords: [item.label, item.href, role]
  }));
  const base: CommandItem[] = [
    commandItem("find-jobs", "Find jobs", "Search jobs by role, city, salary, skills, and work mode", "Jobs", "/jobs", <Briefcase size={18} />, ["remote", "hybrid", "salary", "role"]),
    commandItem("companies", "Discover companies", "Explore verified companies, open roles, and hiring teams", "Companies", "/companies", <Building2 size={18} />, ["employer", "verified", "open jobs"]),
    commandItem("guides", "Career guides", "Open interview, salary, learning, and roadmap resources", "Guides", "/career-guides", <BookOpen size={18} />, ["articles", "resources", "roadmap"]),
    commandItem("skills", "Skill intelligence", "Search skills, demand, learning paths, and certifications", "Skills", "/skill-intelligence", <ShieldCheck size={18} />, ["react", "go", "java", "certification"]),
    commandItem("salary", "Salary insights", "Compare salary by role, city, experience, and skill premium", "Salary", "/salary-insights", <Briefcase size={18} />, ["market", "city", "pay"]),
    commandItem("notifications", "Notification center", "Open unread alerts, messages, interviews, and system updates", "Notifications", "/notifications", <Bell size={18} />, ["alerts", "unread", "updates"]),
    commandItem("settings", "Go to settings", "Manage security, privacy, notifications, theme, and preferences", "Settings", "/settings", <Settings size={18} />, ["preferences", "privacy", "security"]),
    commandItem("theme", "Toggle theme", "Switch between light and dark mode instantly", "Commands", undefined, <Moon size={18} />, ["dark", "light", "system", "appearance"], () => document.documentElement.classList.toggle("dark")),
    commandItem("dashboard", "Open dashboard", "Return to your workspace dashboard", "Commands", "/dashboard", <CommandIcon size={18} />, ["home", "overview"]),
    commandItem("logout", "Logout", "Sign out through the existing authentication flow", "Commands", "/login", <LogOut size={18} />, ["sign out", "session"])
  ];
  const candidate = [
    commandItem("upload-resume", "Upload resume", "Open resume tools and upload workflow", "Commands", "/resume", <Upload size={18} />, ["candidate", "pdf", "docx"]),
    commandItem("messages", "Search messages", "Find recruiter chats, interview messages, and offer updates", "Messages", "/messages", <MessageCircle size={18} />, ["recruiter", "chat"])
  ];
  const employer = [
    commandItem("create-job", "Create job", "Start the existing job creation workflow", "Commands", "/jobs", <Plus size={18} />, ["post", "opening", "employer"]),
    commandItem("invite-recruiter", "Invite recruiter", "Open team invite and permissions", "Commands", "/team", <Users size={18} />, ["hr", "team", "permissions"]),
    commandItem("find-candidates", "Find candidates", "Search pipeline, applicants, skills, and interview state", "People", "/candidates", <Users size={18} />, ["candidate", "pipeline", "ats"])
  ];
  const admin = [
    commandItem("create-admin", "Create admin", "Open admin user management", "Commands", "/users", <UserCircle size={18} />, ["super admin", "roles"]),
    commandItem("create-guide", "Create guide", "Open CMS publishing workflow", "Commands", "/cms", <BookOpen size={18} />, ["cms", "publish"]),
    commandItem("moderate-jobs", "Moderate jobs", "Review pending, featured, urgent, and rejected jobs", "Jobs", "/jobs", <ShieldCheck size={18} />, ["approval", "moderation"])
  ];
  return [...navItems, ...base, ...(role === "candidate" || role === "public" ? candidate : []), ...(role === "employer" ? employer : []), ...(role === "admin" ? admin : [])];
}

function commandItem(id: string, label: string, description: string, group: CommandItem["group"], href: string | undefined, icon: React.ReactNode, keywords: string[], action?: () => void): CommandItem {
  return { id, label, description, group, href, icon, keywords, action };
}

function groupCommandItems(items: CommandItem[]) {
  return items.reduce<Record<string, CommandItem[]>>((groups, item) => {
    groups[item.group] = [...(groups[item.group] ?? []), item];
    return groups;
  }, {});
}

function groupHistory(items: SearchHistoryItem[]) {
  const now = Date.now();
  return {
    Pinned: items.filter((item) => item.pinned),
    Today: items.filter((item) => !item.pinned && now - item.createdAt < 86_400_000),
    Yesterday: items.filter((item) => !item.pinned && now - item.createdAt >= 86_400_000 && now - item.createdAt < 172_800_000),
    "Last Week": items.filter((item) => !item.pinned && now - item.createdAt >= 172_800_000)
  };
}

function CommandSidePanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-2.5 py-1 text-xs text-[var(--cos-on-surface-variant)]">{item}</span>
        ))}
      </div>
    </section>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid gap-2" aria-label="Loading search results">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] p-3">
          <span className="h-10 w-10 animate-pulse rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container)]" />
          <span className="grid flex-1 gap-2">
            <span className="h-3 w-2/5 animate-pulse rounded-full bg-[var(--cos-surface-container)]" />
            <span className="h-3 w-3/5 animate-pulse rounded-full bg-[var(--cos-surface-container)]" />
          </span>
        </div>
      ))}
    </div>
  );
}

function SearchEmptyState({ onPick }: { onPick: (value: string) => void }) {
  const suggestions = ["Remote React jobs", "Company verification", "Resume insights", "Interview prep"];
  return (
    <div className="rounded-[var(--radius-career-card)] border border-dashed border-[var(--cos-outline-variant)] p-6 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--cos-surface-container-low)] text-[var(--cos-primary)]"><Search size={24} /></div>
      <h2 className="mt-3 text-sm font-semibold">No exact match found</h2>
      <p className="mx-auto mt-1 max-w-md text-xs text-[var(--cos-on-surface-variant)]">Try a role, city, skill, guide, company, setting, message, or command.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {suggestions.map((item) => <button key={item} type="button" className={cn("rounded-full border border-[var(--cos-outline-variant)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--cos-surface-container-low)]", focusRing)} onClick={() => onPick(item)}>{item}</button>)}
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <span className="relative grid h-6 w-6 place-items-center rounded-full bg-[#0A3A7A] text-white">
      <Star size={13} fill="currentColor" />
      <span className="absolute inset-0 rounded-full bg-[#F59E0B] opacity-40 motion-safe:animate-ping" />
    </span>
  );
}

export function CheckItem({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-[var(--cos-success-text)]" /> {children}</div>;
}
