import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("interviews");

export default function Page() {
  return <EmployerRoute view="interviews" />;
}
