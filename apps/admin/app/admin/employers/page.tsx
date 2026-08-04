import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("employers");

export default function Page() {
  return <AdminRoute view="employers" />;
}
