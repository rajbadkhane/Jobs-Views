import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("strength");

export default function Page() {
  return <CandidateRoute view="strength" />;
}
