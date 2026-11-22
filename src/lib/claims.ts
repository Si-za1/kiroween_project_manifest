import { PERIODS, SOURCES, VALUES } from "./types.ts";
import type { Claim, Period, Source, Value } from "./types.ts";

/** A claim before it has an id or has been confirmed by the user. */
export interface ClaimDraft {
  metric: string;
  target: number;
  period: Period;
  source: Source;
  keyword: string;
  value: Value;
}

export function isPeriod(x: unknown): x is Period {
  return typeof x === "string" && (PERIODS as readonly string[]).includes(x);
}
export function isSource(x: unknown): x is Source {
  return typeof x === "string" && (SOURCES as readonly string[]).includes(x);
}
export function isValue(x: unknown): x is Value {
  return typeof x === "string" && (VALUES as readonly string[]).includes(x);
}

type ClaimCore = Pick<ClaimDraft, "metric" | "target" | "period" | "source" | "keyword">;

/** Validates the fields shared by drafts and stored claims. */
function validateCore(o: Record<string, unknown>): ClaimCore | null {
  const metric = typeof o.metric === "string" ? o.metric.trim() : "";
  const keyword = typeof o.keyword === "string" ? o.keyword.trim().toLowerCase() : "";
  const target = o.target;
  if (!metric || metric.length > 80) return null;
  if (keyword.length > 40) return null;
  if (typeof target !== "number" || !Number.isFinite(target) || target <= 0 || target > 10_000) {
    return null;
  }
  if (!isPeriod(o.period) || !isSource(o.source)) return null;
  return { metric, target, period: o.period, source: o.source, keyword };
}

export function validateDraft(x: unknown): ClaimDraft | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as Record<string, unknown>;
  const core = validateCore(o);
  if (!core || !isValue(o.value)) return null;
  return { ...core, value: o.value };
}

export function validateClaim(x: unknown): Claim | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as Record<string, unknown>;
  const core = validateCore(o);
  if (!core) return null;
  if (typeof o.id !== "string" || !o.id) return null;
  if (typeof o.goalId !== "string" || !o.goalId) return null;
  if (typeof o.confirmed !== "boolean") return null;
  return { id: o.id, goalId: o.goalId, ...core, confirmed: o.confirmed };
}

export function serializeClaim(claim: Claim): string {
  return JSON.stringify(claim);
}

export function parseClaim(json: string): Claim | null {
  try {
    return validateClaim(JSON.parse(json));
  } catch {
    return null;
  }
}

const NUM_WORDS: Record<string, number> = {
  once: 1,
  one: 1,
  twice: 2,
  two: 2,
  thrice: 3,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const STOP = new Set([
  "i",
  "me",
  "my",
  "to",
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "in",
  "on",
  "at",
  "for",
  "with",
  "want",
  "will",
  "would",
  "like",
  "be",
  "more",
  "less",
  "every",
  "each",
  "per",
  "times",
  "time",
  "day",
  "week",
  "month",
  "daily",
  "weekly",
  "monthly",
  "out",
  "up",
  "get",
  "going",
  "go",
  "do",
  "make",
  "some",
  "is",
  "it",
  "this",
  "that",
  "least",
  "about",
]);

const VALUE_WORDS: Record<Value, RegExp> = {
  connection:
    /\b(call|friend|friends|family|mom|mum|dad|partner|wife|husband|date|kids|sister|brother|visit|text|reach out|connect)\b/,
  peace:
    /\b(sleep|rest|meditat\w*|walk|calm|breath\w*|yoga|journal\w*|stretch|water|hydrat\w*|gym|workout|exercise|run|health\w*|relax\w*|nature)\b/,
  ambition:
    /\b(ship|build|launch|career|learn|code|coding|write|save|study|practice|project|business|startup|read|promotion|portfolio|commit\w*|deep work|focus)\b/,
};

export function inferValue(text: string): Value {
  const t = text.toLowerCase();
  const scores = VALUES.map((v) => ({
    v,
    n: (t.match(new RegExp(VALUE_WORDS[v], "g")) ?? []).length,
  }));
  scores.sort((a, b) => b.n - a.n);
  const top = scores[0];
  return top && top.n > 0 ? top.v : "peace";
}

/**
 * Local, offline fallback that turns a plain-English goal into a claim draft.
 * Used when the AI service is unavailable or not configured.
 */
export function draftFromGoal(text: string): ClaimDraft {
  const t = text
    .toLowerCase()
    .replace(/work(?:ing)? out/g, "workout")
    .replace(/deep work/g, "deepwork");

  let period: Period | null = null;
  let weekday = false;
  if (/\b(every ?day|daily|each day|per day|a day)\b/.test(t)) period = "day";
  else if (/\b(every month|monthly|per month|a month|each month)\b/.test(t)) period = "month";
  else if (/\b(every week|weekly|per week|a week|each week)\b/.test(t)) period = "week";
  else if (/\bevery (mon|tues|wednes|thurs|fri|satur|sun)day\b/.test(t)) {
    period = "week";
    weekday = true;
  }

  let target: number | null = null;
  const digit = /(\d+(?:\.\d+)?)/.exec(t);
  if (digit) target = Number(digit[1]);
  else {
    for (const [word, n] of Object.entries(NUM_WORDS)) {
      if (new RegExp(`\\b${word}\\b`).test(t)) {
        target = n;
        break;
      }
    }
  }

  const resolvedPeriod: Period = period ?? "week";
  if (target === null || !(target > 0) || target > 10_000) {
    target = resolvedPeriod === "day" ? 1 : resolvedPeriod === "week" ? (weekday ? 1 : 3) : 4;
  }

  let source: Source = "checkin";
  if (/\b(commit|commits|ship|push|pull request|coding|code)\b/.test(t)) source = "github";
  else if (
    /\b(meeting|meetings|class|lesson|appointment|calendar|deepwork|focus block)\b/.test(t)
  ) {
    source = "calendar";
  }

  const tokens = (t.match(/[a-z]+/g) ?? []).filter(
    (w) => w.length >= 3 && !STOP.has(w) && !(w in NUM_WORDS),
  );
  let keyword = tokens[0] ?? "";
  if (source === "github") keyword = "commit";
  if (source === "calendar" && t.includes("deepwork")) keyword = "deep work";

  let metric = text
    .replace(/^\s*(i (want|will|would like|'d like) to|to)\s+/i, "")
    .replace(
      /\b(\d+(\.\d+)?|once|twice|thrice|times?|more|a week|per week|every \w+|each \w+|daily|weekly|monthly|a day|a month|per day|per month)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, "");
  if (source === "github") metric = "commits";
  if (!metric) metric = keyword || "check-ins";
  if (metric.length > 48) metric = `${metric.slice(0, 47).trimEnd()}…`;

  return {
    metric: metric.charAt(0).toLowerCase() + metric.slice(1),
    target,
    period: resolvedPeriod,
    source,
    keyword: keyword.slice(0, 40),
    value: inferValue(text),
  };
}
