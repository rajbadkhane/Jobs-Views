import { AdminRoute, adminMetadata } from "../../route-adapter";

type Props = { params: { segments: string[] } };

export function generateMetadata({ params }: Props) {
  return adminMetadata("jobs", params.segments.join(" / "));
}

export default function Page() {
  return <AdminRoute view="jobs" />;
}
