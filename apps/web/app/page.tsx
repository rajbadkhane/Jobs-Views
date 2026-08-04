import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { appConfig } from "@career-os/config";
import { breadcrumbSchema, buildMetadata, organizationSchema, webPageSchema, websiteSchema } from "@career-os/shared";

import { PublicHome } from "./components/public-home";
import { homepage } from "../content/homepage";

export const metadata: Metadata = {
  ...buildMetadata(homepage.seo.title, homepage.seo.description, homepage.seo.canonicalPath),
  openGraph: {
    title: homepage.seo.title,
    description: homepage.seo.description,
    url: new URL(homepage.seo.canonicalPath, appConfig.siteUrl).toString(),
    images: [homepage.seo.ogImage],
    siteName: homepage.nav.logo
  },
  twitter: {
    card: "summary_large_image",
    title: homepage.seo.title,
    description: homepage.seo.description,
    images: [homepage.seo.ogImage]
  }
};

export default function Page() {
  const showAudienceChooser = !cookies().has("jobsview_audience");
  const structuredData = [
    websiteSchema(),
    organizationSchema(),
    webPageSchema(homepage.seo.title, homepage.seo.description, homepage.seo.canonicalPath),
    breadcrumbSchema([{ name: "Home", path: "/" }])
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PublicHome showAudienceChooser={showAudienceChooser} />
    </>
  );
}
