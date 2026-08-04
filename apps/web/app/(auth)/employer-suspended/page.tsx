import React from "react";

import { AuthStatusPage } from "../auth-status";

export default function Page() {
  return (
    <AuthStatusPage
      tone="warning"
      eyebrow="Employer suspended"
      title="Employer access is temporarily restricted"
      description="This workspace is paused for security or compliance review. Contact support to understand the reason and submit an appeal."
      primaryHref="/unauthorized"
      primaryLabel="Start appeal"
      secondaryHref="/login"
      secondaryLabel="Back to login"
      details={["Jobs are protected", "Team access limited", "Audit trail preserved", "Appeal available"]}
    />
  );
}
