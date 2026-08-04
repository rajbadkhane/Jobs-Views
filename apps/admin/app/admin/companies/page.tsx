import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("companies");

export default function Page() {
  return <AdminRoute view="companies" />;
}
