import { CandidateRoute, candidateInterviewView, candidateMetadata } from "../../route-adapter";

type Props = { params: { section: string } };

export function generateMetadata({ params }: Props) {
  return candidateMetadata(candidateInterviewView(), params.section);
}

export default function Page() {
  return <CandidateRoute view={candidateInterviewView()} />;
}
