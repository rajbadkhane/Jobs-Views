import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("monitoring", "system");

export default function Page() {
  return <AdminRoute view="monitoring" />;
}
