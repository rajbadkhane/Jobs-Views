import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("help");

export default function Page() {
  return <EmployerRoute view="help" />;
}
