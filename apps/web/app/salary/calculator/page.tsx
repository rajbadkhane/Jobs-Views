import type { Metadata } from "next";

import { seoPageMetadata, seoSchemas } from "../../seo-utils";
import { SalaryCalculatorClient } from "./salary-calculator-client";

export const metadata: Metadata = seoPageMetadata(
  "Salary Calculator",
  "Estimate salary by education, experience, role, industry, city, skills, certificates, company type, company size, languages, work mode, and shift.",
  "/salary/calculator"
);

export default function Page() {
  const description = "Estimate salary by education, experience, role, industry, city, skills, certificates, company type, company size, languages, work mode, and shift.";
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchemas("Dataset", "Salary Calculator", "/salary/calculator", description)) }} />
      <SalaryCalculatorClient />
    </>
  );
}
