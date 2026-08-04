import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("growth", "career intelligence");

export default function Page() {
  return <CandidateRoute view="growth" />;
}
