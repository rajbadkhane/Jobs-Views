import React from "react";
import type { Metadata } from "next";
import { buildMetadata, webPageSchema } from "@career-os/shared";
import { DigitalMarketingClient } from "./client";

export const metadata: Metadata = buildMetadata(
  "Digital Marketing & Employer Branding | Jobs View Growth Engine",
  "Supercharge your talent attraction engine with precision targeted social funnels, developer brand documentaries, and reputation optimization on Jobs View.",
  "/our-services/digital-marketing"
);

export default function DigitalMarketingPage() {
  const schemas = [
    webPageSchema(
      "Digital Marketing & Employer Branding | Jobs View Growth Engine",
      "Supercharge your talent attraction engine with precision targeted social funnels, developer brand documentaries, and reputation optimization on Jobs View.",
      "/our-services/digital-marketing"
    )
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <DigitalMarketingClient />
    </>
  );
}
