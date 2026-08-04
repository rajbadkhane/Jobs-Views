import { EmployerRoute, employerMetadata } from "./route-adapter";

export const metadata = employerMetadata("dashboard");

export default function Page() {
  return <EmployerRoute view="dashboard" />;
}
