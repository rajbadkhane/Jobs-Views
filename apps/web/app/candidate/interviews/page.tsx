import { CandidateRoute, candidateInterviewView, candidateMetadata } from "../route-adapter";

export const metadata = candidateMetadata(candidateInterviewView(), "interviews");

export default function Page() {
  return <CandidateRoute view={candidateInterviewView()} />;
}
