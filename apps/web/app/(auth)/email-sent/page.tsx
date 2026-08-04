import React from "react";

import { AuthStatusPage } from "../auth-status";

export default function Page() {
  return (
    <AuthStatusPage
      tone="success"
      eyebrow="Email sent"
      title="Check your inbox"
      description="Jobs View has sent the next account step to your email address. Keep this tab open if you want to return after verification."
      primaryHref="/login"
      primaryLabel="Return to login"
      secondaryHref="/forgot-password"
      secondaryLabel="Send again"
      details={["Open your mail app", "Check spam if needed", "Link expires for safety", "Support can help"]}
    />
  );
}
