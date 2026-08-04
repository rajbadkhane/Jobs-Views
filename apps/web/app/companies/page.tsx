import type { Metadata } from "next";

import { seoPageMetadata, seoSchemas, StructuredSeoPage } from "../seo-utils";
import { CompanyDirectory } from "../components/company-experience";

export const metadata: Metadata = seoPageMetadata(
  "Companies Hiring in India",
  "Discover verified companies, open jobs, locations, industries, and hiring signals on Jobs View.",
  "/companies"
);

export default function Page() {
  const description = "Discover verified companies, open jobs, locations, industries, and hiring signals on Jobs View.";
  return (
    <StructuredSeoPage
      title="Companies Hiring in India"
      description={description}
      schemas={seoSchemas("CollectionPage", "Companies Hiring in India", "/companies", description)}
    >
      <CompanyDirectory />
    </StructuredSeoPage>
  );
}
