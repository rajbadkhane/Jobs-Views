import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("users");

export default function Page() {
  return <AdminRoute view="users" />;
}
