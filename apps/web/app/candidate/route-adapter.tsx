import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform, type CandidateView } from "../components/candidate-platform";

const titles: Record<CandidateView, string> = {
  dashboard: "Candidate Dashboard",
  profile: "Candidate Profile",
  resume: "Candidate Resume",
  applications: "Candidate Applications",
  saved: "Saved Jobs",
  recent: "Recently Viewed Jobs",
  alerts: "Job Alerts",
  recommended: "Recommended Jobs",
  notifications: "Notifications",
  messages: "Messages",
  interviews: "Interviews",
  offers: "Offers",
  strength: "Career Health",
  growth: "Career Guidance",
  settings: "Candidate Settings",
  public: "Public Candidate Profile"
};

export function candidateMetadata(view: CandidateView, detail?: string): Metadata {
  const suffix = detail ? ` - ${titleCase(detail)}` : "";
  return {
    title: `${titles[view]}${suffix} | Jobs View`,
    description: `Bookmarkable Jobs View candidate workspace for ${titles[view].toLowerCase()}${detail ? `: ${titleCase(detail)}` : ""}.`,
    robots: { index: false, follow: false }
  };
}

export function CandidateRoute({ view }: { view: CandidateView }) {
  return <CandidatePlatform view={view} />;
}

export function candidateJobsView(section?: string): CandidateView {
  if (section === "applied") return "applications";
  if (section === "history") return "recent";
  if (section === "saved") return "saved";
  if (section === "recommended") return "recommended";
  return "recommended";
}


function titleCase(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
