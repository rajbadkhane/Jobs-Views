import type { Metadata } from "next";

import { seoPageMetadata } from "../seo-utils";
import { PlansClient } from "./plans-client";

type Props = { searchParams?: { job?: string; next?: string; selected?: string } };

export const metadata: Metadata = seoPageMetadata(
  "Jobs View Subscription Plans",
  "Choose a Jobs View plan for priority apply, resume score, career insights, interview prep, and premium support.",
  "/plans"
);

export default function PlansPage({ searchParams }: Props) {
  return <PlansClient job={searchParams?.job} next={searchParams?.next} initialPlan={searchParams?.selected} />;
}
