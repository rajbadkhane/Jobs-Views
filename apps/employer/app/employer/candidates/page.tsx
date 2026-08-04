import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("candidates");

export default function Page() {
  return <EmployerRoute view="candidates" />;
}
