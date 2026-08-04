import { AdminRoute, adminMetadata } from "../route-adapter";

export const metadata = adminMetadata("settings");

export default function Page() {
  return <AdminRoute view="settings" />;
}
