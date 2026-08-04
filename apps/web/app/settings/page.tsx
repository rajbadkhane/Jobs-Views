import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Candidate Settings | Jobs View",
  description: "Manage privacy, security, notifications, language, theme and account settings."
};

export default function Page() {
  return <CandidatePlatform view="settings" />;
}
