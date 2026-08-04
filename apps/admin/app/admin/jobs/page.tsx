import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("jobs");

export default function Page() {
  return <AdminRoute view="jobs" />;
}
