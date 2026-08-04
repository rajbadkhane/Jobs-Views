import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("applications", "offers");

export default function Page() {
  return <CandidateRoute view="applications" />;
}
