import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("billing");

export default function Page() {
  return <AdminRoute view="billing" />;
}
