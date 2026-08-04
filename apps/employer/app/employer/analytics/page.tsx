import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("analytics");

export default function Page() {
  return <EmployerRoute view="analytics" />;
}
