import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("company");

export default function Page() {
  return <EmployerRoute view="company" />;
}
