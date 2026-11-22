import type { Conflict } from "./conflicts.ts";
import type { ClaimResult, Status } from "./score.ts";
import { periodLabel } from "./score.ts";
import type { Entry, ISODate, SelfId, Value } from "./types.ts";
import type { VoiceProfile } from "./voice.ts";

export interface FutureSelf {
  id: SelfId;
  years: 1 | 5 | 20;
  name: string;
  value: Value;
  stance: string;
}

export const SELVES: FutureSelf[] = [
  {
    id: "builder",
    years: 1,
    name: "The Builder",
    value: "ambition",
    stance: "Wants momentum and finished work.",
  },
  {
    id: "keeper",
    years: 5,
    name: "The Keeper",
    value: "connection",
    stance: "Wants the people and the promises kept.",
  },
  {
    id: "elder",
    years: 20,
    name: "The Elder",
    value: "peace",
    stance: "Wants a life that felt good to live.",
  },
];

export interface CouncilClaim {
  metric: string;
  target: number;
  actual: number;
  window: string;
  status: Status;
  value: Value;
}

/** Everything a letter may use. Letters must not state facts that are not in here. */
export interface CouncilContext {
  today: ISODate;
  claims: CouncilClaim[];
  conflicts: { title: string; detail: string; value: Value }[];
  voice: { favoriteWords: string[]; phrases: string[]; sample: string; avgSentenceWords: number };
  recentEntries: { date: ISODate; text: string }[];
}

export function buildContext(
  today: ISODate,
  results: ClaimResult[],
  conflicts: Conflict[],
  entries: Entry[],
  voice: VoiceProfile,
): CouncilContext {
  const recent = [...entries]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)
    .map((e) => ({ date: e.date, text: e.text.slice(0, 400) }));
  return {
    today,
    claims: results.map((r) => ({
      metric: r.claim.metric,
      target: r.target,
      actual: r.actual,
      window: periodLabel(r.claim.period),
      status: r.status,
      value: r.value,
    })),
    conflicts: conflicts.map((c) => ({ title: c.title, detail: c.detail, value: c.value })),
    voice: {
      favoriteWords: voice.favoriteWords,
      phrases: voice.phrases,
      sample: voice.sample,
      avgSentenceWords: voice.avgSentenceWords,
    },
    recentEntries: recent,
  };
}

const STATUS_LINE: Record<Status, string> = {
  met: "That one is holding. Keep it quiet and steady.",
  close: "You are close. One small push would turn it green.",
  behind: "It is behind, and I will not pretend otherwise. What got in the way?",
  no_data: "I have no evidence either way yet. Give me something to read.",
};

const DISAGREE: Record<SelfId, string> = {
  builder:
    "The Keeper will tell you to slow down for the people around you. I would say finish the thing first, then rest. We have argued about this for years.",
  keeper:
    "The Builder wants speed. I would trade a shipped feature for a call you did not miss. Still, I admit the work matters too.",
  elder:
    "The Builder and the Keeper are both right about today, and both are loud. From here, I mostly remember how the days felt.",
};

const EMPTY_LINE: Record<Value, string> = {
  ambition:
    "You have not set an ambition claim yet. Write one. I would like something to be proud of.",
  connection:
    "You have not set a claim about the people in your life yet. Pick one person and one habit.",
  peace: "You have not set a claim about rest or health yet. Even one small, kind habit will do.",
};

function pickWorst(claims: CouncilClaim[]): CouncilClaim | undefined {
  return [...claims].sort(
    (a, b) => a.actual / a.target - b.actual / b.target || (a.metric < b.metric ? -1 : 1),
  )[0];
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** Deterministic, offline letters built only from the context. Used when no AI is configured. */
export function fallbackLetters(ctx: CouncilContext): { selfId: SelfId; text: string }[] {
  return SELVES.map((self) => {
    const mine = ctx.claims.filter((c) => c.value === self.value);
    const focus = pickWorst(mine);
    const body = focus
      ? `Your claim "${focus.metric}" stands at ${fmt(focus.actual)} of ${fmt(focus.target)} over the ${focus.window}. ${STATUS_LINE[focus.status]}`
      : EMPTY_LINE[self.value];

    const conflict = ctx.conflicts.find((c) => c.value === self.value);
    const conflictLine = conflict
      ? `\n\nThere is a conflict I keep noticing. ${conflict.detail}`
      : "";

    const word = ctx.voice.phrases[0] ?? ctx.voice.favoriteWords[0];
    const voiceLine = word ? `\n\nYou keep coming back to "${word}". I noticed.` : "";

    const yearsLabel = self.years === 1 ? "one year" : `${self.years} years`;
    return {
      selfId: self.id,
      text:
        `Dear you,\n\n` +
        `This is ${self.name}, writing from ${yearsLabel} on. ${body}` +
        conflictLine +
        `\n\n${DISAGREE[self.id]}` +
        voiceLine +
        `\n\n— You, ${yearsLabel} on`,
    };
  });
}
