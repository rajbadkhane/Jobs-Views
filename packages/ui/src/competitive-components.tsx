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

export function AIFitBadge({
  score = 92,
  matchReasons = ["Strong skill overlap & experience fit", "Within salary expectation", "Immediate joiner verified"]
}: {
  score?: number;
  matchReasons?: string[];
}) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const colorClass =
    score >= 85
      ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300"
      : score >= 70
        ? "border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-700/60 dark:bg-sky-950/40 dark:text-sky-300"
        : "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300";

  return (
    <div className="relative inline-block" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-pointer", colorClass)}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
        🎯 {score}% AI Fit
      </span>
      {showTooltip && (
        <div className="absolute z-[100] left-0 top-full mt-1.5 w-64 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-2.5 text-xs shadow-career-floating">
          <p className="font-semibold text-[var(--cos-on-surface)] flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> AI Compatibility Analysis:
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

export function ATSAdvisorDialog({
  open,
  onOpenChange,
  jobTitle,
  matchingSkills = ["React", "TypeScript", "JavaScript", "Redux"],
  missingSkills = ["GraphQL", "Tailwind CSS", "Docker"],
  onProceed
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  matchingSkills?: string[];
  missingSkills?: string[];
  onProceed: () => void;
}) {
  const [addedSkills, setAddedSkills] = React.useState<string[]>([]);
  const currentMissing = missingSkills.filter((s) => !addedSkills.includes(s));
  const callbackBoost = Math.min(95, 68 + addedSkills.length * 9);

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title={`💡 Pre-Apply ATS Advisor: ${jobTitle}`}>
      <div className="space-y-4 pt-1">
        <div className="rounded-[var(--radius-career-card)] border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 text-xs dark:border-indigo-800/60 dark:from-indigo-950/40 dark:to-purple-950/40">
          <p className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">🚀</span>
            ATS Callback Probability: <span className="underline decoration-indigo-500 underline-offset-2 font-extrabold">{callbackBoost}%</span>
          </p>
          <p className="mt-1.5 text-indigo-800 dark:text-indigo-300">
            Our AI compared your candidate profile against verified recruiter keywords for this role. Add any matching skills you possess to bypass automated ATS rejection screens before applying.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cos-on-surface-variant)] flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" /> Matched Keywords ({matchingSkills.length + addedSkills.length})
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[...matchingSkills, ...addedSkills].map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Check size={11} /> {skill}
              </span>
            ))}
          </div>
        </div>

        {currentMissing.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle size={14} /> Recommended ATS Keywords to Add
            </h4>
            <p className="text-xs text-[var(--cos-on-surface-variant)] mb-2">Click to instantly attach any skill you have experience with to this application:</p>
            <div className="flex flex-wrap gap-1.5">
              {currentMissing.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setAddedSkills((prev) => [...prev, skill])}
                  className="group inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-950 transition hover:border-amber-400 hover:bg-amber-100 active:scale-95 dark:border-amber-700/70 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60"
                >
                  <Plus size={12} className="transition-transform group-hover:rotate-90 text-amber-600 dark:text-amber-400" /> + Add &quot;{skill}&quot;
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap-reverse items-center justify-end gap-3 border-t border-[var(--cos-outline-variant)] pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Review Profile First
          </Button>
          <Button variant="primary" size="sm" onClick={() => { onProceed(); onOpenChange(false); }}>
            ⚡ Proceed & Apply Now ({callbackBoost}% Match)
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
