"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Plus,
  ShieldCheck
} from "lucide-react";

import { cn } from "@career-os/utils";
import { Button, Dialog } from "./components";

/**
 * Shows why a job matched the candidate's current search/filters. Only renders reasons the
 * caller can actually substantiate from real data — no fabricated score or default copy,
 * since a made-up "AI Fit %" misleads candidates about how the match was determined.
 */
export function AIFitBadge({
  matchReasons = []
}: {
  matchReasons?: string[];
}) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  if (matchReasons.length === 0) return null;

  return (
    <div className="relative inline-block" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} onFocus={() => setShowTooltip(true)} onBlur={() => setShowTooltip(false)}>
      <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-950 shadow-sm transition-transform hover:scale-105 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300">
        <ShieldCheck size={12} /> Matches your search
      </button>
      {showTooltip && (
        <div className="absolute z-[100] left-0 top-full mt-1.5 w-64 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-2.5 text-xs shadow-career-floating">
          <p className="font-semibold text-[var(--cos-on-surface)] flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> Why this matched:
          </p>
          <ul className="mt-1.5 space-y-1 text-[var(--cos-on-surface-variant)]">
            {matchReasons.map((reason, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <Check size={12} className="text-emerald-500 shrink-0" /> {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Shows the skills listed on a job posting so a candidate can self-assess fit before applying.
 * Deliberately does not claim an "ATS callback probability" or AI profile comparison — the
 * underlying data is just the job's own listed skills, not anything computed from the
 * candidate's actual profile, so presenting it as a predictive score would be misleading.
 */
export function ATSAdvisorDialog({
  open,
  onOpenChange,
  jobTitle,
  matchingSkills = [],
  onProceed
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  matchingSkills?: string[];
  missingSkills?: string[];
  onProceed: () => void;
}) {
  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title={`Skill checklist: ${jobTitle}`}>
      <div className="space-y-4 pt-1">
        <p className="text-sm text-[var(--cos-on-surface-variant)]">
          These are the skills listed on this job posting. Compare them against your own experience before applying — Jobs View doesn&apos;t score or predict your callback chances.
        </p>

        {matchingSkills.length > 0 ? (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cos-on-surface-variant)] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" /> Skills listed for this role
            </h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {matchingSkills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Check size={11} /> {skill}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-[var(--cos-on-surface-variant)]"><AlertCircle size={14} /> The employer didn&apos;t list specific skills for this job.</p>
        )}

        <div className="mt-6 flex flex-wrap-reverse items-center justify-end gap-3 border-t border-[var(--cos-outline-variant)] pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Review job details first
          </Button>
          <Button variant="primary" size="sm" onClick={() => { onProceed(); onOpenChange(false); }}>
            Continue to apply
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
