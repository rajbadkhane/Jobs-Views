import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("recommended");

export default function Page() {
  return <CandidateRoute view="recommended" />;
}
