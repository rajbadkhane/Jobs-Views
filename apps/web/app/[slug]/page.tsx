import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findLandingContent } from "@career-os/shared";

import { ContentPage } from "../components/content-page";
import { seoPageMetadata } from "../seo-utils";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const item = findLandingContent(params.slug);
  if (!item) return { title: "Not Found | Jobs View", robots: { index: false, follow: false } };
  return seoPageMetadata(item.seo.title ?? item.title, item.seo.description ?? item.summary, `/${params.slug}`, item.seo.ogImage);
}

export default function Page({ params }: Props) {
  const item = findLandingContent(params.slug);
  if (!item) notFound();
  return <ContentPage item={item} />;
}
