import { EmployerRoute, employerJobView, employerMetadata } from "../../route-adapter";

type Props = { params: { segments: string[] } };

export function generateMetadata({ params }: Props) {
  return employerMetadata(employerJobView(params.segments[0]), params.segments.join(" / "));
}

export default function Page({ params }: Props) {
  return <EmployerRoute view={employerJobView(params.segments[0])} />;
}
