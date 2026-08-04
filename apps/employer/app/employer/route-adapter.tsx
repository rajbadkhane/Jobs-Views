import type { Metadata } from "next";

import { EmployerPortal, type EmployerView } from "../components/employer-portal";

const titles: Record<EmployerView, string> = {
  dashboard: "Employer Dashboard",
  company: "Company Workspace",
  jobs: "Employer Jobs",
  pipeline: "Candidate Pipeline",
  candidates: "Candidates",
  interviews: "Interviews",
  team: "Team",
  analytics: "Employer Analytics",
  billing: "Billing",
  notifications: "Notifications",
  settings: "Settings",
  help: "Help Center"
};

export function employerMetadata(view: EmployerView, detail?: string): Metadata {
  return {
    title: `${titles[view]}${detail ? ` - ${titleCase(detail)}` : ""} | Jobs View Employer`,
    description: `Bookmarkable employer workspace route for ${titles[view].toLowerCase()}${detail ? `: ${titleCase(detail)}` : ""}.`,
    robots: { index: false, follow: false }
  };
}

export function EmployerRoute({ view }: { view: EmployerView }) {
  return <EmployerPortal view={view} />;
}

export function employerJobView(_segment?: string): EmployerView {
  return "jobs";
}

function titleCase(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
