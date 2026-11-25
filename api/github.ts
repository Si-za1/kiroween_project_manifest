import { fail, json } from "./_lib/http.js";

// GitHub usernames: 1 to 39 characters, letters, digits and single hyphens, not starting with a hyphen.
const USER_RE = /^[a-z\d](?:[a-z\d-]{0,38})$/i;

interface PushEvent {
  type?: string;
  created_at?: string;
  payload?: { size?: number; commits?: unknown[] };
}

// GET /api/github?user=name  ->  { days: { "YYYY-MM-DD": commitCount } }
// Reads public activity only. Set GITHUB_TOKEN to raise the rate limit. The GitHub events feed
// covers recent activity (roughly the last 90 days, up to 300 events).
export async function GET(request: Request): Promise<Response> {
  const user = new URL(request.url).searchParams.get("user") ?? "";
  if (!USER_RE.test(user)) return fail(400, "invalid_username");

  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "manifest-git",
  };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const days: Record<string, number> = {};
  try {
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=100&page=${page}`,
        { headers, signal: AbortSignal.timeout(10_000) },
      );
      if (res.status === 404) return fail(404, "user_not_found");
      if (res.status === 403 || res.status === 429) return fail(429, "rate_limited");
      if (!res.ok) return fail(502, "github_error");

      const events = (await res.json()) as PushEvent[];
      for (const e of events) {
        if (e.type !== "PushEvent" || !e.created_at) continue;
        const count = e.payload?.size ?? e.payload?.commits?.length ?? 1;
        const day = e.created_at.slice(0, 10);
        days[day] = (days[day] ?? 0) + Math.max(1, Number(count) || 1);
      }
      if (events.length < 100) break;
    }
  } catch {
    return fail(502, "github_unreachable");
  }
  return json({ days });
}
