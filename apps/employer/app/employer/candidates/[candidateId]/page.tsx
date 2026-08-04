import { EmployerRoute, employerMetadata } from "../../route-adapter";

type Props = { params: { candidateId: string } };

export function generateMetadata({ params }: Props) {
  return employerMetadata("candidates", params.candidateId);
}

export default function Page() {
  return <EmployerRoute view="candidates" />;
}
