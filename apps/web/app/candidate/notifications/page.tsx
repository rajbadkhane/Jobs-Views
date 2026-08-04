import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("notifications");

export default function Page() {
  return <CandidateRoute view="notifications" />;
}
