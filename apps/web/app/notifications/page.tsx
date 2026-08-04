import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Notifications | Jobs View",
  description: "Application, recruiter, offer, message and system notifications."
};

export default function Page() {
  return <CandidatePlatform view="notifications" />;
}
