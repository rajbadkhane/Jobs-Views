import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("resume");

export default function Page() {
  return <CandidateRoute view="resume" />;
}
