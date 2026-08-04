import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("audit");

export default function Page() {
  return <AdminRoute view="audit" />;
}
