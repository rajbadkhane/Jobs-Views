import React from "react";

import { AuthStatusPage, accountSafetyDetails } from "../auth-status";

export default function Page() {
  return (
    <AuthStatusPage
      tone="danger"
      eyebrow="Unauthorized"
      title="You do not have access to this workspace"
      description="Jobs View could not confirm the required role, permission, or account status for this page."
      primaryHref="/login"
      primaryLabel="Switch account"
      secondaryHref="/"
      secondaryLabel="Jobs View home"
      details={accountSafetyDetails}
    />
  );
}
