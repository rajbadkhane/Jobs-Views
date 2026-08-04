import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { appConfig } from "@career-os/config";

async function backend<T>(path: string, cookieHeader: string, authorization?: string | null) {
  try {
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      headers: {
        Cookie: cookieHeader,
        ...(authorization ? { Authorization: authorization } : {})
      },
      cache: "no-store"
    });
    if (!response.ok) return null;
    const body = await response.json();
    return (body.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieHeader = cookies().toString();
  const authorization = headers().get("authorization");
  const [profile, completion, skills, applications] = await Promise.all([
    backend<unknown>("/profiles/me", cookieHeader, authorization),
    backend<unknown>("/profiles/completion", cookieHeader, authorization),
    backend<unknown[]>("/profiles/skills", cookieHeader, authorization),
    backend<unknown>("/applications/me", cookieHeader, authorization)
  ]);

  return NextResponse.json({
    success: true,
    message: "Career Intelligence data loaded from backend sources.",
    data: {
      profile,
      completion,
      skills: skills ?? [],
      applications,
      source: "backend"
    }
  });
}
