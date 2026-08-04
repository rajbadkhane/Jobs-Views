import { CandidateRoute, candidateMetadata } from "./route-adapter";

export const metadata = candidateMetadata("dashboard");

export default function Page() {
  return <CandidateRoute view="dashboard" />;
}
