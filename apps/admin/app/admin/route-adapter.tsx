import type { Metadata } from "next";
import React from "react";

import { AdminPortal, type AdminView } from "../components/admin-portal";

const titles: Record<AdminView | "system", string> = {
  dashboard: "Admin Dashboard",
  users: "Users",
  candidates: "Candidates",
  employers: "Employers",
  companies: "Companies",
  jobs: "Admin Jobs",
  recruitment: "Recruitment",
  billing: "Billing",
  subscriptions: "Subscriptions",
  marketplace: "Marketplace",
  cms: "CMS",
  seo: "SEO",
  reports: "Reports",
  support: "Support",
  audit: "Audit",
  monitoring: "System Monitoring",
  settings: "Settings",
  system: "System"
};

export function adminMetadata(view: AdminView, detail?: string): Metadata {
  return {
    title: `${titles[view]}${detail ? ` - ${titleCase(detail)}` : ""} | Jobs View Admin`,
    description: `Bookmarkable admin route for ${titles[view].toLowerCase()}${detail ? `: ${titleCase(detail)}` : ""}.`,
    robots: { index: false, follow: false }
  };
}

export function AdminRoute({ view }: { view: AdminView }) {
  return <AdminPortal view={view} />;
}

function titleCase(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
