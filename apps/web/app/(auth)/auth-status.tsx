import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Clock,
  HelpCircle,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import React from "react";

import { Badge, EnterpriseCard, Timeline } from "@career-os/ui";
import { cn } from "@career-os/utils";

type StatusTone = "success" | "pending" | "danger" | "warning" | "info";

const iconMap = {
  success: CheckCircle2,
  pending: Clock,
  danger: Ban,
  warning: ShieldAlert,
  info: Mail
};

export function AuthStatusPage({
  tone,
  eyebrow,
  title,
  description,
  primaryHref = "/login",
  primaryLabel = "Back to login",
  secondaryHref = "/",
  secondaryLabel = "Jobs View home",
  details = [],
  timeline
}: {
  tone: StatusTone;
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  details?: string[];
  timeline?: { title: string; description: string; tone?: "success" | "warning" | "danger" | "info" | "neutral" }[];
}) {
  const Icon = iconMap[tone];
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1180px] place-items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <EnterpriseCard
          title={title}
          description={description}
          icon={<Icon size={19} />}
          badge={<Badge tone={tone === "danger" ? "danger" : tone === "warning" ? "warning" : tone === "pending" ? "pending" : tone === "success" ? "success" : "info"}>{eyebrow}</Badge>}
          className="p-6 sm:p-8"
        >
          <div className="grid gap-6">
            {details.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {details.map((detail) => (
                  <div key={detail} className="flex items-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3 text-sm font-semibold">
                    <BadgeCheck size={16} className="text-[var(--cos-primary)]" />
                    {detail}
                  </div>
                ))}
              </div>
            ) : null}
            {timeline ? <Timeline items={timeline} /> : null}
            <div className="flex flex-wrap gap-3">
              <a href={primaryHref} className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-primary)] bg-[var(--cos-primary)] px-4 text-sm font-semibold text-white transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)]")}>
                {primaryLabel}<ArrowRight size={16} />
              </a>
              <a href={secondaryHref} className={cn("inline-flex h-11 items-center justify-center rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-4 text-sm font-semibold transition hover:-translate-y-px hover:border-[var(--cos-border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)]")}>
                {secondaryLabel}
              </a>
            </div>
            <div className="grid gap-3 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-4 text-sm text-[var(--cos-on-surface-variant)] sm:grid-cols-3">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} /> Secure flow</span>
              <span className="inline-flex items-center gap-2"><HelpCircle size={15} /> Support ready</span>
              <span className="inline-flex items-center gap-2"><RefreshCw size={15} /> Retry friendly</span>
            </div>
          </div>
        </EnterpriseCard>
      </div>
    </section>
  );
}

export const employerReviewTimeline = [
  { title: "Company submitted", description: "Your employer registration is safely received.", tone: "success" as const },
  { title: "Document review", description: "GST, CIN, website, and business identity are checked.", tone: "info" as const },
  { title: "Admin decision", description: "Approved companies can access the employer dashboard.", tone: "neutral" as const }
];

export const accountSafetyDetails = ["Enterprise security", "Role-aware access", "Session protection", "Verified support"];

export { AlertTriangle, LockKeyhole };
