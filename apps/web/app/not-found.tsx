import React from "react";

import { AuthStatusPage } from "./(auth)/auth-status";

export default function NotFound() {
  return (
    <AuthStatusPage
      tone="info"
      eyebrow="404"
      title="Page not found"
      description="This Jobs View page may have moved, expired, or never existed. Use the links below to get back to a safe route."
      primaryHref="/"
      primaryLabel="Go home"
      secondaryHref="/jobs"
      secondaryLabel="Browse jobs"
      details={["Search jobs", "Explore companies", "Review career guides", "Login securely"]}
    />
  );
}
