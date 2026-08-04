import React from "react";
import type { Metadata } from "next";

import { CandidatePlatform } from "../components/candidate-platform";

export const metadata: Metadata = {
  title: "Messages | Jobs View",
  description: "Recruiter chat, interview messages, offer messages and system messages."
};

export default function Page() {
  return <CandidatePlatform view="messages" />;
}
