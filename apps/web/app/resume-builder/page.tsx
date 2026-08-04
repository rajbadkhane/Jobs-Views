import type { Metadata } from "next";

import { buildMetadata } from "@career-os/shared";

import { CandidateResourceAccess } from "../components/candidate-resource-access";

export const metadata: Metadata = buildMetadata(
  "Resume Builder Preview | Jobs View",
  "See how Jobs View helps candidates create a clear, job-ready resume before opening the member workspace.",
  "/resume-builder"
);

export default function Page() {
  return <CandidateResourceAccess
    title="Build a simple, job-ready resume"
    description="See the information a strong resume should include. Your saved resume workspace opens after candidate login and plan activation."
    memberHref="/resume"
    renderMemberExperience={false}
    samples={[
      { title: "Contact and job goal", description: "Add accurate contact details, location, and a short headline for the work you want." },
      { title: "Education and experience", description: "List your 10th, 12th, ITI, diploma, degree, training, internships, and previous work clearly." },
      { title: "Skills and documents", description: "Highlight relevant skills, languages, certificates, licences, projects, and achievements." }
    ]}
  />;
}
