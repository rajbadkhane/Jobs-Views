import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("notifications");

export default function Page() {
  return <EmployerRoute view="notifications" />;
}
