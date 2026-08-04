import React from "react";
import type { Metadata } from "next";

import { breadcrumbSchema, personSchema } from "@career-os/shared";

import { CandidatePlatform } from "../../components/candidate-platform";
import { seoPageMetadata, titleCaseSlug } from "../../seo-utils";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const name = titleCaseSlug(params.slug);
  return seoPageMetadata(`${name} Candidate Profile | Jobs View`, `View ${name}'s public Jobs View candidate profile, resume highlights, portfolio, and career signals.`, `/candidate/${params.slug}`);
}

export default function Page({ params }: Props) {
  const name = titleCaseSlug(params.slug);
  const description = `View ${name}'s public Jobs View candidate profile, resume highlights, portfolio, and career signals.`;
  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Candidate Profile", path: `/candidate/${params.slug}` }
    ]),
    personSchema(name, description, `/candidate/${params.slug}`)
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <CandidatePlatform view="public" />
    </>
  );
}
