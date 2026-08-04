import { EmployerRoute, employerMetadata } from "../route-adapter";

export const metadata = employerMetadata("notifications", "messages");

export default function Page() {
  return <EmployerRoute view="notifications" />;
}
