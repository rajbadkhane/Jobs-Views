import { CandidateRoute, candidateMetadata } from "../../route-adapter";

type Props = { params: { section: string } };

export function generateMetadata({ params }: Props) {
  return candidateMetadata("interviews", params.section);
}

export default function Page() {
  return <CandidateRoute view="interviews" />;
}
