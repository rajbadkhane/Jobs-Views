import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("support");

export default function Page() {
  return <AdminRoute view="support" />;
}
