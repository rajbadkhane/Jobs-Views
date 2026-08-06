import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("interviews");

export default function Page() {
  return <CandidateRoute view="interviews" />;
}
