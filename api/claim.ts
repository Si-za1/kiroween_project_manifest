import { fail, json, readJson } from "./_lib/http.js";
import { chatJson, llmConfigured } from "./_lib/llm.js";
import { CLAIM_SYSTEM } from "./_lib/prompts.js";

const PERIODS = ["day", "week", "month"];
const SOURCES = ["checkin", "github", "calendar"];
const VALUES = ["ambition", "connection", "peace"];

function validate(x: unknown) {
  if (typeof x !== "object" || x === null) return null;
  const o = x as Record<string, unknown>;
  const metric = typeof o.metric === "string" ? o.metric.trim() : "";
  const keyword = typeof o.keyword === "string" ? o.keyword.trim().toLowerCase() : "";
  const target = o.target;
  if (!metric || metric.length > 80 || keyword.length > 40) return null;
  if (typeof target !== "number" || !Number.isFinite(target) || target <= 0 || target > 10_000) {
    return null;
  }
  if (!PERIODS.includes(String(o.period))) return null;
  if (!SOURCES.includes(String(o.source))) return null;
  if (!VALUES.includes(String(o.value))) return null;
  return { metric, target, period: o.period, source: o.source, keyword, value: o.value };
}

// POST /api/claim  { goal: string }  ->  claim draft
export async function POST(request: Request): Promise<Response> {
  if (!llmConfigured()) return fail(503, "llm_not_configured");

  const body = (await readJson(request, 2_000)) as { goal?: unknown } | null;
  const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
  if (goal.length < 1 || goal.length > 280) return fail(400, "goal_must_be_1_to_280_characters");

  try {
    const out = await chatJson(
      [
        { role: "system", content: CLAIM_SYSTEM },
        { role: "user", content: JSON.stringify({ goal }) },
      ],
      300,
    );
    const draft = validate(out);
    return draft ? json(draft) : fail(502, "invalid_model_output");
  } catch {
    return fail(502, "llm_request_failed");
  }
}
