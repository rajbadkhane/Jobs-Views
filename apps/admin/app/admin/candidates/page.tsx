import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("candidates");

export default function Page() {
  return <AdminRoute view="candidates" />;
}
