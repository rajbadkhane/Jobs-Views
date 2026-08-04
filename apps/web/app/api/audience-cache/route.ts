import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { saveAudienceToRedis, getAudienceFromRedis } from "./upstash";

function getClientIp(): string {
  const h = headers();
  const xForwardedFor = h.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return h.get("cf-connecting-ip") || h.get("x-real-ip") || h.get("remote-addr") || "anonymous";
}

export async function GET() {
  const ip = getClientIp();
  const cached = await getAudienceFromRedis(ip);
  return NextResponse.json({ success: true, audience: cached, ip_cached: !!cached });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const audience = body.audience || "job";
    const ip = getClientIp();
    await saveAudienceToRedis(ip, audience);

    cookies().set("jobsview_audience", audience, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax"
    });

    return NextResponse.json({ success: true, audience, ip_cached: ip !== "anonymous" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to cache audience" }, { status: 500 });
  }
}
