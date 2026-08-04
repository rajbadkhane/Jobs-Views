import { EmployerRoute, employerMetadata } from "../../route-adapter";

type Props = { params: { section: string } };

export function generateMetadata({ params }: Props) {
  return employerMetadata("company", params.section);
}

export default function Page() {
  return <EmployerRoute view="company" />;
}
