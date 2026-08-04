import React from "react";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";

import { getAudienceFromRedis } from "./api/audience-cache/upstash";

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

export default async function Page() {
  let showAudienceChooser = !cookies().has("jobsview_audience");
  if (showAudienceChooser) {
    try {
      const h = headers();
      const xForwardedFor = h.get("x-forwarded-for");
      const ip = xForwardedFor ? xForwardedFor.split(",")[0]?.trim() : (h.get("cf-connecting-ip") || h.get("x-real-ip") || "anonymous");
      if (ip && ip !== "anonymous" && ip !== "127.0.0.1" && ip !== "::1") {
        const cached = await getAudienceFromRedis(ip);
        if (cached) showAudienceChooser = false;
      }
    } catch {
      // Fallback if Redis is unreachable
    }
  }
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
