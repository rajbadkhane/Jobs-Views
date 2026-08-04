import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("jobs");

export default function Page() {
  return <EmployerRoute view="jobs" />;
}
