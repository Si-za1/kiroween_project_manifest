import { fail, json, readJson } from "./_lib/http.js";
import { chatJson, llmConfigured } from "./_lib/llm.js";
import { COUNCIL_SYSTEM } from "./_lib/prompts.js";

const SELF_IDS = ["builder", "keeper", "elder"] as const;

// POST /api/council  { context }  ->  { letters: [{ selfId, text }] }
// The context is built by the browser from the user's own data. Nothing is stored or logged here.
export async function POST(request: Request): Promise<Response> {
  if (!llmConfigured()) return fail(503, "llm_not_configured");

  const body = (await readJson(request, 30_000)) as { context?: unknown } | null;
  const context = body?.context;
  if (typeof context !== "object" || context === null) return fail(400, "context_required");

  try {
    const out = (await chatJson(
      [
        { role: "system", content: COUNCIL_SYSTEM },
        { role: "user", content: JSON.stringify(context) },
      ],
      1500,
    )) as { letters?: unknown };

    if (!Array.isArray(out.letters)) return fail(502, "invalid_model_output");
    const letters = SELF_IDS.map((id) => {
      const found = (out.letters as unknown[]).find(
        (l) => typeof l === "object" && l !== null && (l as { selfId?: unknown }).selfId === id,
      ) as { text?: unknown } | undefined;
      return typeof found?.text === "string" && found.text.length <= 2_000
        ? { selfId: id, text: found.text.trim() }
        : null;
    });
    if (letters.some((l) => l === null)) return fail(502, "invalid_model_output");
    return json({ letters });
  } catch {
    return fail(502, "llm_request_failed");
  }
}
