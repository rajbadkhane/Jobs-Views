import type { Metadata } from "next";

import { seoPageMetadata, seoSchemas, StructuredSeoPage } from "../seo-utils";

export const metadata: Metadata = seoPageMetadata(
  "Career Guidance",
  "Jobs View guidance for resumes, interviews, freshers, experienced professionals, government jobs, career switching, salary negotiation, and workplace skills.",
  "/guidance"
);

export default function Page() {
  const description = "Jobs View guidance for resumes, interviews, freshers, experienced professionals, government jobs, career switching, salary negotiation, and workplace skills.";
  return <StructuredSeoPage title="Career Guidance" description={description} schemas={seoSchemas("CollectionPage", "Career Guidance", "/guidance", description)} />;
}
