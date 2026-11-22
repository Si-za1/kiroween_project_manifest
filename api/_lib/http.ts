export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export function fail(status: number, error: string): Response {
  return json({ error }, status);
}

/** Reads a JSON body with a size limit. Returns null if the body is missing, too large, or invalid. */
export async function readJson(request: Request, maxBytes = 40_000): Promise<unknown> {
  try {
    const text = await request.text();
    if (text.length === 0 || text.length > maxBytes) return null;
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
