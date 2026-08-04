import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("team");

export default function Page() {
  return <EmployerRoute view="team" />;
}
