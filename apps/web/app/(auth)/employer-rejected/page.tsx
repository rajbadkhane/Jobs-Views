import React from "react";

import { AuthStatusPage } from "../auth-status";

export default function Page() {
  return (
    <AuthStatusPage
      tone="danger"
      eyebrow="Employer rejected"
      title="Company registration needs changes"
      description="The submitted company details could not be approved. Review the reason from support, edit your information, and resubmit."
      primaryHref="/register"
      primaryLabel="Edit information"
      secondaryHref="/unauthorized"
      secondaryLabel="Contact support"
      details={["Reason available from admin", "Documents can be corrected", "Resubmission supported", "Candidate access is unaffected"]}
    />
  );
}
