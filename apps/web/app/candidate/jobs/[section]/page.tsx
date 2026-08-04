import { CandidateRoute, candidateJobsView, candidateMetadata } from "../../route-adapter";

type Props = { params: { section: string } };

export function generateMetadata({ params }: Props) {
  return candidateMetadata(candidateJobsView(params.section), params.section);
}

export default function Page({ params }: Props) {
  return <CandidateRoute view={candidateJobsView(params.section)} />;
}
