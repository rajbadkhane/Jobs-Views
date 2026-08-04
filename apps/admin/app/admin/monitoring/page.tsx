import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("monitoring");

export default function Page() {
  return <AdminRoute view="monitoring" />;
}
