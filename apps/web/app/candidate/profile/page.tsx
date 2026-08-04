import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("profile");

export default function Page() {
  return <CandidateRoute view="profile" />;
}
