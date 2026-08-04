import type { Metadata } from "next";

import { seoPageMetadata, seoSchemas, StructuredSeoPage } from "../seo-utils";

export const metadata: Metadata = seoPageMetadata(
  "Career Paths in India",
  "Explore Jobs View career paths with overview, eligibility, education, skills, growth, roadmap, salary, companies, demand, and future scope.",
  "/career"
);

export default function Page() {
  const description = "Explore Jobs View career paths with overview, eligibility, education, skills, growth, roadmap, salary, companies, demand, and future scope.";
  return <StructuredSeoPage title="Career Paths in India" description={description} schemas={seoSchemas("CollectionPage", "Career Paths in India", "/career", description)} />;
}
