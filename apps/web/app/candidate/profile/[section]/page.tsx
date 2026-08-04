import { CandidateRoute, candidateMetadata } from "../../route-adapter";

type Props = { params: { section: string } };

export function generateMetadata({ params }: Props) {
  return candidateMetadata("profile", params.section);
}

export default function Page() {
  return <CandidateRoute view="profile" />;
}
