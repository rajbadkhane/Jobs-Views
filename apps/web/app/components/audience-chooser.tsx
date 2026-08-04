"use client";

import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, BriefcaseBusiness, Search } from "lucide-react";

import { appConfig } from "@career-os/config";
import { cn } from "@career-os/utils";

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3A7A] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export function AudienceChooser({ onContinue }: { onContinue: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const firstControl = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
    firstControl?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onContinue();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onContinue]);

  function chooseEmployer() {
    document.cookie = "jobsview_audience=employer; Path=/; SameSite=Lax";
    window.location.assign(`${appConfig.employerUrl.replace(/\/$/, "")}/employer/login`);
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/55 p-[max(1rem,env(safe-area-inset-top))] backdrop-blur-[3px]">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audience-title"
        aria-describedby="audience-description"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
        className="my-auto w-full max-w-5xl overflow-hidden rounded-lg border border-white/20 bg-white shadow-2xl"
      >
        <header className="px-5 pb-4 pt-6 text-center sm:px-8 sm:pt-8">
          <p className="text-xs font-bold uppercase text-[#F59E0B]">Welcome to Jobs View</p>
          <h2 id="audience-title" className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
            What would you like to do today?
          </h2>
          <p id="audience-description" className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Choose your path. You can browse jobs without signing in, while employers continue to their hiring workspace.
          </p>
        </header>

        <div className="grid gap-4 p-4 pt-0 sm:p-6 sm:pt-0 md:grid-cols-2">
          <ChoiceCard
            title="I want a job"
            description="Explore verified jobs for 10th pass, 12th pass, ITI, freshers, graduates, and experienced professionals."
            image="/images/audience/job-seeker.webp"
            imageAlt="A young Indian job seeker using a laptop"
            icon={<Search size={20} />}
            action="Browse jobs"
            onClick={onContinue}
          />
          <ChoiceCard
            title="I want to hire"
            description="Post jobs, manage applicants, and work with your hiring team in the employer portal."
            image="/images/audience/employer.webp"
            imageAlt="An Indian hiring team reviewing candidates together"
            icon={<BriefcaseBusiness size={20} />}
            action="Open employer portal"
            onClick={chooseEmployer}
          />
        </div>

        <p className="border-t border-slate-200 px-5 py-3 text-center text-xs text-slate-500">
          Press Escape to continue as a job seeker.
        </p>
      </motion.div>
    </div>
  );
}

function ChoiceCard({
  title,
  description,
  image,
  imageAlt,
  icon,
  action,
  onClick
}: {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: React.ReactNode;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition duration-160 hover:-translate-y-1 hover:border-[#0A3A7A] hover:shadow-xl active:scale-[0.99]",
        focusClass
      )}
    >
      <div className="relative aspect-[16/9] min-h-40 overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 767px) calc(100vw - 3rem), 470px"
          className="object-cover transition duration-300 group-hover:scale-[1.025]"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/50 to-transparent" />
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#0A3A7A] text-white">{icon}</span>
          <h3 className="text-xl font-bold text-slate-950">{title}</h3>
        </div>
        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{description}</p>
        <span className="mt-5 inline-flex items-center gap-2 font-bold text-[#0A3A7A]">
          {action}
          <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}
