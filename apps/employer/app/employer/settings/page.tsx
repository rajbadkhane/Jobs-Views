import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("settings");

export default function Page() {
  return <EmployerRoute view="settings" />;
}
