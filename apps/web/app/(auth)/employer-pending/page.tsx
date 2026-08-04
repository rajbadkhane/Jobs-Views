import React from "react";

import { AuthStatusPage, employerReviewTimeline } from "../auth-status";

export default function Page() {
  return (
    <AuthStatusPage
      tone="pending"
      eyebrow="Employer pending"
      title="Company verification is in progress"
      description="Your employer workspace will unlock after admin approval. This protects candidates and keeps the marketplace trustworthy."
      primaryHref="/login"
      primaryLabel="Refresh status"
      secondaryHref="/unauthorized"
      secondaryLabel="Contact support"
      details={["GST and CIN review", "Domain and website check", "Manual approval", "Dashboard unlock after approval"]}
      timeline={employerReviewTimeline}
    />
  );
}
