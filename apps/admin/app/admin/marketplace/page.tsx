import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("marketplace");

export default function Page() {
  return <AdminRoute view="marketplace" />;
}
