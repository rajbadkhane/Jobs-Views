import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("pipeline");

export default function Page() {
  return <EmployerRoute view="pipeline" />;
}
