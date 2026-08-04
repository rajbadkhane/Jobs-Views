import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("seo");

export default function Page() {
  return <AdminRoute view="seo" />;
}
