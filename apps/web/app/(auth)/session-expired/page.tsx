import React from "react";

import { AuthStatusPage, accountSafetyDetails } from "../auth-status";

export default function Page() {
  return (
    <AuthStatusPage
      tone="warning"
      eyebrow="Session expired"
      title="Please login again"
      description="Your session expired to keep your Jobs View account secure. Login again to continue from a protected workspace."
      primaryHref="/login"
      primaryLabel="Login again"
      secondaryHref="/"
      secondaryLabel="Go home"
      details={accountSafetyDetails}
    />
  );
}
