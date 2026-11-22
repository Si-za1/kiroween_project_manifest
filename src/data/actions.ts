import type { ClaimDraft } from "../lib/claims.ts";
import { isPeriod, isSource, isValue } from "../lib/claims.ts";
import { newId, shortHash } from "../lib/ids.ts";
import type { Card } from "../lib/cards.ts";
import type {
  AppState,
  CalendarEvent,
  Claim,
  ISODate,
  Letter,
  SelfId,
  Value,
} from "../lib/types.ts";
import { SELVES } from "../lib/council.ts";

export function addGoal(state: AppState, text: string, draft: ClaimDraft, now: Date): AppState {
  const goalId = newId("goal");
  return {
    ...state,
    goals: [
      ...state.goals,
      {
        id: goalId,
        text: text.trim(),
        value: draft.value,
        createdAt: now.toISOString(),
        archived: false,
      },
    ],
    claims: [
      ...state.claims,
      {
        id: newId("claim"),
        goalId,
        metric: draft.metric,
        target: draft.target,
        period: draft.period,
        source: draft.source,
        keyword: draft.keyword,
        confirmed: false,
      },
    ],
  };
}

export type ClaimPatch = Partial<
  Pick<Claim, "metric" | "target" | "period" | "source" | "keyword" | "confirmed">
>;

export function updateClaim(state: AppState, claimId: string, patch: ClaimPatch): AppState {
  return {
    ...state,
    claims: state.claims.map((c) => {
      if (c.id !== claimId) return c;
      const next = { ...c, ...patch };
      if (patch.period !== undefined && !isPeriod(patch.period)) return c;
      if (patch.source !== undefined && !isSource(patch.source)) return c;
      return next;
    }),
  };
}

export function setGoalValue(state: AppState, goalId: string, value: Value): AppState {
  if (!isValue(value)) return state;
  return { ...state, goals: state.goals.map((g) => (g.id === goalId ? { ...g, value } : g)) };
}

export function deleteGoal(state: AppState, goalId: string): AppState {
  const removed = new Set(state.claims.filter((c) => c.goalId === goalId).map((c) => c.id));
  return {
    ...state,
    goals: state.goals.filter((g) => g.id !== goalId),
    claims: state.claims.filter((c) => c.goalId !== goalId),
    checkins: state.checkins.filter((c) => !removed.has(c.claimId)),
  };
}

export function addEntry(
  state: AppState,
  input: { date: ISODate; card: Card; text: string; mood: 1 | 2 | 3 | 4 | 5 },
  now: Date,
): AppState {
  const createdAt = now.toISOString();
  return {
    ...state,
    entries: [
      ...state.entries,
      {
        id: newId("entry"),
        date: input.date,
        cardId: input.card.id,
        cardTitle: input.card.title,
        prompt: input.card.prompt,
        text: input.text.trim(),
        mood: input.mood,
        createdAt,
        hash: shortHash(`${input.date}|${input.text}|${createdAt}`),
      },
    ],
  };
}

export function setCheckIn(
  state: AppState,
  claimId: string,
  date: ISODate,
  amount: number,
): AppState {
  const rest = state.checkins.filter((c) => !(c.claimId === claimId && c.date === date));
  const clean = Math.max(0, Math.min(10_000, Number.isFinite(amount) ? amount : 0));
  return {
    ...state,
    checkins: clean > 0 ? [...rest, { claimId, date, amount: clean }] : rest,
  };
}

export function setGithub(
  state: AppState,
  user: string,
  days: Record<ISODate, number>,
  now: Date,
): AppState {
  return {
    ...state,
    evidence: {
      ...state.evidence,
      githubUser: user,
      githubDays: days,
      githubSyncedAt: now.toISOString(),
    },
  };
}

export function setEvents(state: AppState, events: CalendarEvent[]): AppState {
  return { ...state, evidence: { ...state.evidence, events } };
}

export function addLetters(
  state: AppState,
  letters: { selfId: SelfId; text: string }[],
  origin: "ai" | "local",
  now: Date,
): AppState {
  const batchId = newId("batch");
  const created = letters.flatMap((l): Letter[] => {
    const self = SELVES.find((s) => s.id === l.selfId);
    if (!self) return [];
    return [
      {
        id: newId("letter"),
        batchId,
        selfId: self.id,
        years: self.years,
        name: self.name,
        text: l.text,
        origin,
        createdAt: now.toISOString(),
        reply: "",
      },
    ];
  });
  return { ...state, letters: [...state.letters, ...created] };
}

export function setReply(state: AppState, letterId: string, reply: string): AppState {
  return {
    ...state,
    letters: state.letters.map((l) =>
      l.id === letterId ? { ...l, reply: reply.slice(0, 4000) } : l,
    ),
  };
}
