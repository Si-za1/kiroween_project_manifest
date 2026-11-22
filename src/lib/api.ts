import { validateDraft } from "./claims.ts";
import type { ClaimDraft } from "./claims.ts";
import type { CouncilContext } from "./council.ts";
import type { ISODate, SelfId } from "./types.ts";

type Result<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

async function call<T>(url: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(30_000) });
    const body: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const error =
        typeof body === "object" && body !== null && "error" in body
          ? String((body as { error: unknown }).error)
          : `request_failed_${res.status}`;
      return { ok: false, status: res.status, error };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, status: 0, error: "network_error" };
  }
}

function post(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

/** Returns a validated draft, or null when the AI is unavailable. The caller then uses the local parser. */
export async function suggestClaim(goal: string): Promise<ClaimDraft | null> {
  const res = await call<unknown>("/api/claim", post({ goal }));
  return res.ok ? validateDraft(res.data) : null;
}

export async function writeLetters(
  context: CouncilContext,
): Promise<{ selfId: SelfId; text: string }[] | null> {
  const res = await call<{ letters?: unknown }>("/api/council", post({ context }));
  if (!res.ok || !Array.isArray(res.data.letters)) return null;
  const letters: { selfId: SelfId; text: string }[] = [];
  for (const l of res.data.letters as unknown[]) {
    if (typeof l !== "object" || l === null) return null;
    const { selfId, text } = l as Record<string, unknown>;
    if (
      (selfId !== "builder" && selfId !== "keeper" && selfId !== "elder") ||
      typeof text !== "string"
    ) {
      return null;
    }
    letters.push({ selfId, text });
  }
  return letters.length === 3 ? letters : null;
}

export type GithubResult =
  { ok: true; days: Record<ISODate, number> } | { ok: false; message: string };

export async function fetchGithubDays(user: string): Promise<GithubResult> {
  const res = await call<{ days?: Record<ISODate, number> }>(
    `/api/github?user=${encodeURIComponent(user)}`,
  );
  if (res.ok && res.data.days) return { ok: true, days: res.data.days };
  if (!res.ok && res.status === 404)
    return { ok: false, message: "That GitHub user was not found." };
  if (!res.ok && res.status === 429) {
    return { ok: false, message: "GitHub is rate limiting requests. Try again in a few minutes." };
  }
  return {
    ok: false,
    message: "Could not reach GitHub. This needs the deployed app or `vercel dev`.",
  };
}
