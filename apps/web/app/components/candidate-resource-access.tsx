"use client";

import React from "react";
import { ArrowRight, BookOpenCheck, CheckCircle2, FileText, GraduationCap, LockKeyhole } from "lucide-react";

import { useCandidateSubscription, useSession } from "@career-os/hooks";
import { Badge, Button, Card, SkeletonCard } from "@career-os/ui";

import { CareerIntelligencePlatform } from "./career-intelligence-platform";

type CareerView = "guides" | "learning";

export function CandidateResourceAccess({
  view,
  title,
  description,
  samples,
  memberHref,
  renderMemberExperience = true
}: {
  view?: CareerView;
  title: string;
  description: string;
  samples: Array<{ title: string; description: string }>;
  memberHref: string;
  renderMemberExperience?: boolean;
}) {
  const session = useSession();
  const subscription = useCandidateSubscription(session.data?.role === "JOB_SEEKER");
  const active = subscription.data?.active === true;

  if (active && renderMemberExperience && view) return <CareerIntelligencePlatform view={view} />;

  const plansPath = `/plans?next=${encodeURIComponent(memberHref)}`;
  const actionHref = active
    ? memberHref
    : session.data?.role === "JOB_SEEKER"
      ? plansPath
      : `/login?next=${encodeURIComponent(plansPath)}`;

  return (
    <main id="main-content" className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <section className="border-b border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Badge tone="premium"><BookOpenCheck size={13} /> Free introduction</Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--cos-on-surface-variant)] sm:text-lg">{description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {samples.map((sample, index) => (
            <Card key={sample.title} className="h-full">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--cos-primary)] text-white">
                {index === 0 ? <FileText size={18} /> : index === 1 ? <GraduationCap size={18} /> : <CheckCircle2 size={18} />}
              </span>
              <h2 className="mt-4 text-lg font-bold">{sample.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--cos-on-surface-variant)]">{sample.description}</p>
            </Card>
          ))}
        </div>

        {session.isPending || (session.data?.role === "JOB_SEEKER" && subscription.isPending) ? (
          <SkeletonCard lines={3} className="mt-6" />
        ) : (
          <Card className="mt-6 border-2 border-[var(--cos-primary)] bg-[var(--cos-surface-container-low)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold"><LockKeyhole size={17} /> {active ? "Your access is active" : "Continue with a candidate plan"}</div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cos-on-surface-variant)]">
                  {active ? "Open the complete member experience included with your plan." : "Unlock complete guidance, learning, interview, salary, and resume resources for 30 days."}
                </p>
              </div>
              <a href={actionHref} className="shrink-0"><Button>{active ? "Open full experience" : "Subscribe to continue"}<ArrowRight size={16} /></Button></a>
            </div>
          </Card>
        )}
      </section>
    </main>
  );
}
