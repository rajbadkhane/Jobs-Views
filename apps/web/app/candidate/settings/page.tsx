import { CandidateRoute, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata("settings");

export default function Page() {
  return <CandidateRoute view="settings" />;
}
