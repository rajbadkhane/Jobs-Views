import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("recruitment");

export default function Page() {
  return <AdminRoute view="recruitment" />;
}
