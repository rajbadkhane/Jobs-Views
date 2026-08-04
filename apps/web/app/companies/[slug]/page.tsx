import type { Metadata } from "next";

import { seoPageMetadata, seoSchemas, StructuredSeoPage, titleCaseSlug } from "../../seo-utils";
import { CompanyDetail } from "../../components/company-experience";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const company = titleCaseSlug(params.slug);
  return seoPageMetadata(`${company} Careers, Jobs and Company Profile`, `View ${company} jobs, company profile, verification signals, locations, and hiring information on Jobs View.`, `/companies/${params.slug}`);
}

export default function Page({ params }: Props) {
  const company = titleCaseSlug(params.slug);
  const description = `View ${company} jobs, company profile, verification signals, locations, benefits, and hiring information on Jobs View.`;
  return <StructuredSeoPage title={`${company} Careers`} description={description} schemas={seoSchemas("Organization", company, `/companies/${params.slug}`, description)}><CompanyDetail slug={params.slug} /></StructuredSeoPage>;
}
