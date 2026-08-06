import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("offers");

export default function Page() {
  return <CandidateRoute view="offers" />;
}
