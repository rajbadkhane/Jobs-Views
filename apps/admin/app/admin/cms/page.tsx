import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("cms");

export default function Page() {
  return <AdminRoute view="cms" />;
}
