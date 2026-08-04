import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("messages");

export default function Page() {
  return <CandidateRoute view="messages" />;
}
