import React from "react";
import type { Metadata } from "next";
import { buildMetadata, collectionPageSchema } from "@career-os/shared";
import { OurServicesClient } from "./client";

export const metadata: Metadata = buildMetadata(
  "Our Services | Jobs View Commercial & Career Solutions",
  "Explore commercial recruitment asset exchanges, breaking job news intelligence, upskilling seminars, and targeted digital marketing solutions on Jobs View.",
  "/our-services"
);

export default function OurServicesPage() {
  const schemas = [
    collectionPageSchema(
      "Jobs View Commercial & Career Solutions",
      "Explore commercial recruitment asset exchanges, breaking job news intelligence, upskilling seminars, and targeted digital marketing solutions.",
      "/our-services",
      [
        { name: "Sell / Purchasing & Asset Exchange", path: "/our-services/sell-purchasing" },
        { name: "Latest Jobs News & Market Intelligence", path: "/our-services/latest-jobs-news" },
        { name: "Seminars & Training Programs", path: "/our-services/seminars-training" },
        { name: "Digital Marketing & Employer Branding", path: "/our-services/digital-marketing" }
      ]
    )
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <OurServicesClient />
    </>
  );
}
