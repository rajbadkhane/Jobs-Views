import type { Metadata } from "next";

import { findContent } from "@career-os/shared";

import { ContentPage } from "../../components/content-page";
import { seoPageMetadata, seoSchemas, StructuredSeoPage, titleCaseSlug } from "../../seo-utils";

type Props = { params: { skill: string } };

export function generateMetadata({ params }: Props): Metadata {
  const item = findContent("skill", params.skill);
  if (item) return seoPageMetadata(item.seo.title ?? item.title, item.seo.description ?? item.summary, `/skills/${params.skill}`, item.seo.ogImage);
  const skill = titleCaseSlug(params.skill);
  return seoPageMetadata(`${skill} Skill Guide, Jobs and Roadmap`, `Learn ${skill}, discover related jobs, certifications, salary signals, and career paths on Jobs View.`, `/skills/${params.skill}`);
}

export default function Page({ params }: Props) {
  const item = findContent("skill", params.skill);
  if (item) return <ContentPage item={item} />;
  const skill = titleCaseSlug(params.skill);
  const description = `Learn ${skill}, discover related jobs, certifications, salary signals, learning resources, and career paths on Jobs View.`;
  return <StructuredSeoPage title={`${skill} Skill Guide`} description={description} schemas={seoSchemas("DefinedTerm", skill, `/skills/${params.skill}`, description)} />;
}
