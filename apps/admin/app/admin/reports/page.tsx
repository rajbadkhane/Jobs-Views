import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("reports");

export default function Page() {
  return <AdminRoute view="reports" />;
}
