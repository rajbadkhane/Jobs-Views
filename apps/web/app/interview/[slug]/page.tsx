import type { Metadata } from "next";

import { findContent } from "@career-os/shared";

import { ContentPage } from "../../components/content-page";
import { seoPageMetadata, seoSchemas, StructuredSeoPage, titleCaseSlug } from "../../seo-utils";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const item = findContent("interview", params.slug);
  if (item) return seoPageMetadata(item.seo.title ?? item.title, item.seo.description ?? item.summary, `/interview/${params.slug}`, item.seo.ogImage);
  const topic = titleCaseSlug(params.slug);
  return seoPageMetadata(`${topic} Interview Questions`, `Practice ${topic} interview questions, preparation tips, readiness signals, and hiring workflows on Jobs View.`, `/interview/${params.slug}`);
}

export default function Page({ params }: Props) {
  const item = findContent("interview", params.slug);
  if (item) return <ContentPage item={item} />;
  const topic = titleCaseSlug(params.slug);
  const description = `Practice ${topic} interview questions, preparation tips, readiness signals, and structured hiring workflows on Jobs View.`;
  return <StructuredSeoPage title={`${topic} Interview Questions`} description={description} schemas={seoSchemas("QAPage", `${topic} Interview Questions`, `/interview/${params.slug}`, description)} />;
}
