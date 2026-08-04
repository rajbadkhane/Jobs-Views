import React from "react";
import type { Metadata } from "next";
import { buildMetadata, webPageSchema } from "@career-os/shared";
import { SellPurchasingClient } from "./client";

export const metadata: Metadata = buildMetadata(
  "Sell / Purchasing & Asset Exchange | Jobs View Commercial",
  "India's specialized commercial marketplace to securely buy, sell, or merge recruitment staffing agencies, HR tech software IP, and client portfolios.",
  "/our-services/sell-purchasing"
);

export default function SellPurchasingPage() {
  const schemas = [
    webPageSchema(
      "Sell / Purchasing & Asset Exchange | Jobs View Commercial",
      "India's specialized commercial marketplace to securely buy, sell, or merge recruitment staffing agencies, HR tech software IP, and client portfolios.",
      "/our-services/sell-purchasing"
    )
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <SellPurchasingClient />
    </>
  );
}
