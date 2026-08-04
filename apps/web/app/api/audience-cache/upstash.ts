export function getUpstashConfig() {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) {
    return { url: restUrl.replace(/\/$/, ""), token: restToken, authHeader: `Bearer ${restToken}` };
  }
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && redisUrl.includes("upstash.io")) {
    try {
      const cleanUrl = redisUrl.replace(/^redis(s)?:\/\//, "");
      const [authPart, hostPort] = cleanUrl.split("@");
      if (hostPort && authPart) {
        const [hostname] = hostPort.split(":");
        const [username, ...passwordParts] = authPart.split(":");
        const password = passwordParts.join(":");
        const token = password || username;
        const authHeader = authPart.includes(":")
          ? `Basic ${Buffer.from(authPart).toString("base64")}`
          : `Bearer ${token}`;
        return { url: `https://${hostname}`, token, authHeader };
      }
    } catch {
      // fallback
    }
  }
  return null;
}

export async function getAudienceFromRedis(ip: string): Promise<string | null> {
  if (!ip || ip === "anonymous" || ip === "127.0.0.1" || ip === "::1") return null;
  const config = getUpstashConfig();
  if (!config) return null;
  try {
    const res = await fetch(`${config.url}/get/audience:cache:${encodeURIComponent(ip)}`, {
      headers: { Authorization: config.authHeader },
      cache: "no-store",
      signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(1500) : undefined,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result ? String(data.result) : null;
  } catch {
    return null;
  }
}

export async function saveAudienceToRedis(ip: string, audience: string): Promise<boolean> {
  if (!ip || ip === "anonymous") return false;
  const config = getUpstashConfig();
  if (!config) return false;
  try {
    const res = await fetch(`${config.url}/set/audience:cache:${encodeURIComponent(ip)}/${encodeURIComponent(audience)}/EX/31536000`, {
      method: "POST",
      headers: { Authorization: config.authHeader },
      cache: "no-store",
      signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined,
    });
    return res.ok;
  } catch {
    return false;
  }
}
