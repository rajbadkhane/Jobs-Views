import React from "react";

import { AuthStatusPage, employerReviewTimeline } from "../auth-status";

export default function Page() {
  return (
    <AuthStatusPage
      tone="pending"
      eyebrow="Account pending"
      title="Your account is under review"
      description="Jobs View is checking the details required for your workspace. You will be notified when access is ready."
      primaryHref="/login"
      primaryLabel="Check again"
      secondaryHref="/"
      secondaryLabel="Explore Jobs View"
      details={["Expected review: 24-48 hours", "Email updates enabled", "Profile data saved", "No duplicate registration needed"]}
      timeline={employerReviewTimeline}
    />
  );
}
