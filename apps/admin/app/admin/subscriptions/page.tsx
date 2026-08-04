import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("subscriptions");

export default function Page() {
  return <AdminRoute view="subscriptions" />;
}
