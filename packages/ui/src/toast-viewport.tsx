"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { useNotificationStore } from "@career-os/shared";
import { cn } from "@career-os/utils";

const toneStyles = {
  success: { icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-[var(--cos-success-text)] dark:border-emerald-900/70 dark:bg-emerald-950/40" },
  info: { icon: Info, className: "border-[#0A3A7A]/20 bg-[#0A3A7A]/10 text-[#0A3A7A] dark:border-[#60A5FA]/40 dark:bg-[#0A3A7A]/30 dark:text-[#93C5FD]" },
  warning: { icon: AlertTriangle, className: "border-amber-200 bg-amber-50 text-[var(--cos-warning-text)] dark:border-amber-900/70 dark:bg-amber-950/40" },
  error: { icon: XCircle, className: "border-rose-200 bg-rose-50 text-[var(--cos-error-text)] dark:border-rose-900/70 dark:bg-rose-950/40" }
} as const;

const AUTO_DISMISS_MS = 5000;

/**
 * useNotificationStore.notify() is called across every app (job posted,
 * settings saved, mutation failed, ...) but nothing ever rendered it - the
 * toast state just accumulated silently. Mount this once near the root of
 * each app's Providers to actually surface it.
 */
export function ToastViewport() {
  const items = useNotificationStore((state) => state.items);
  const dismiss = useNotificationStore((state) => state.dismiss);

  React.useEffect(() => {
    const timers = items.map((item) => window.setTimeout(() => dismiss(item.id), AUTO_DISMISS_MS));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [items, dismiss]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-3 z-[200] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const tone = toneStyles[item.intent ?? "info"];
          const Icon = tone.icon;
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              role={item.intent === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-career-card)] border p-3 shadow-career-lg backdrop-blur",
                tone.className
              )}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-5">{item.title}</p>
                {item.description ? <p className="mt-0.5 text-sm leading-5 opacity-90">{item.description}</p> : null}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-full p-1 opacity-70 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
