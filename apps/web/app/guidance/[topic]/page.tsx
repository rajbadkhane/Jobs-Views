import type { Metadata } from "next";

import { findContent } from "@career-os/shared";

import { ContentPage } from "../../components/content-page";
import { seoPageMetadata, seoSchemas, StructuredSeoPage, titleCaseSlug } from "../../seo-utils";

type Props = { params: { topic: string } };

export function generateMetadata({ params }: Props): Metadata {
  const item = findContent("guidance", params.topic);
  if (item) return seoPageMetadata(item.seo.title ?? item.title, item.seo.description ?? item.summary, `/guidance/${params.topic}`, item.seo.ogImage);
  const title = `${titleCaseSlug(params.topic)} Guidance`;
  return seoPageMetadata(title, `Jobs View guidance for ${title.toLowerCase()} with practical steps, FAQs, and career operating system context.`, `/guidance/${params.topic}`);
}

export default function Page({ params }: Props) {
  const item = findContent("guidance", params.topic);
  if (item) return <ContentPage item={item} />;
  const title = `${titleCaseSlug(params.topic)} Guidance`;
  const description = `Jobs View guidance for ${title.toLowerCase()} with practical steps, FAQs, and career operating system context.`;
  return <StructuredSeoPage title={title} description={description} schemas={seoSchemas("Article", title, `/guidance/${params.topic}`, description)} />;
}
