import type { Metadata } from "next";

import { findContent } from "@career-os/shared";

import { ContentPage } from "../../components/content-page";
import { seoPageMetadata, seoSchemas, StructuredSeoPage, titleCaseSlug } from "../../seo-utils";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const item = findContent("career", params.slug);
  if (item) return seoPageMetadata(item.seo.title ?? item.title, item.seo.description ?? item.summary, `/career/${params.slug}`, item.seo.ogImage);
  const title = titleCaseSlug(params.slug);
  return seoPageMetadata(`${title} Career Guide`, `Explore the ${title} career path with roadmap, skills, projects, interview preparation, and salary insights.`, `/career/${params.slug}`);
}

export default function Page({ params }: Props) {
  const item = findContent("career", params.slug);
  if (item) return <ContentPage item={item} />;
  const title = `${titleCaseSlug(params.slug)} Career Guide`;
  const description = `Explore this career path with roadmap, skills, projects, interview preparation, salary insights, and learning recommendations.`;
  return <StructuredSeoPage title={title} description={description} schemas={seoSchemas("Article", title, `/career/${params.slug}`, description)} />;
}
