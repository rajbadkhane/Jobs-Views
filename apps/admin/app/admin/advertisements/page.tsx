import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("advertisements");

export default function Page() {
  return <AdminRoute view="advertisements" />;
}
