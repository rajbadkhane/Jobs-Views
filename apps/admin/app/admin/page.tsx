import React from "react";

import { AdminRoute, adminMetadata } from "./route-adapter";

export const metadata = adminMetadata("dashboard");

export default function Page() {
  return <AdminRoute view="dashboard" />;
}
