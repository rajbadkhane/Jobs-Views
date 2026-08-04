import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("growth", "salary");

export default function Page() {
  return <CandidateRoute view="growth" />;
}
