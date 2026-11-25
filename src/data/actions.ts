import type { Card } from "../lib/cards.ts";
import type { ClaimDraft } from "../lib/claims.ts";
import { isPeriod, isSource, isValue } from "../lib/claims.ts";
import { selfById } from "../lib/council.ts";
import { newId, shortHash } from "../lib/ids.ts";
import { TINTS } from "../lib/types.ts";
import type {
  AppState,
  CalendarEvent,
  Claim,
  Goal,
  ISODate,
  Letter,
  SelfId,
  WeatherDay,
  WeatherPlace,
} from "../lib/types.ts";

export type DreamInput = Pick<Goal, "text" | "why" | "where" | "byDate" | "tint" | "value">;

function makeStep(goalId: string, draft: ClaimDraft): Claim {
  return {
    id: newId("claim"),
    goalId,
    metric: draft.metric,
    target: draft.target,
    period: draft.period,
    source: draft.source,
    keyword: draft.keyword,
    confirmed: true,
  };
}

export function addDream(
  state: AppState,
  input: DreamInput,
  steps: ClaimDraft[],
  now: Date,
): AppState {
  const goalId = newId("goal");
  const goal: Goal = {
    id: goalId,
    text: input.text.trim().slice(0, 200),
    why: input.why.trim().slice(0, 1000),
    where: input.where.trim().slice(0, 120),
    byDate: input.byDate,
    tint: (TINTS as readonly string[]).includes(input.tint) ? input.tint : "blush",
    value: isValue(input.value) ? input.value : "peace",
    createdAt: now.toISOString(),
    archived: false,
  };
  return {
    ...state,
    goals: [...state.goals, goal],
    claims: [...state.claims, ...steps.map((s) => makeStep(goalId, s))],
  };
}

export function updateDream(state: AppState, goalId: string, patch: Partial<DreamInput>): AppState {
  return {
    ...state,
    goals: state.goals.map((g) => (g.id === goalId ? { ...g, ...patch } : g)),
  };
}

export function addStep(state: AppState, goalId: string, draft: ClaimDraft): AppState {
  return { ...state, claims: [...state.claims, makeStep(goalId, draft)] };
}

export type ClaimPatch = Partial<
  Pick<Claim, "metric" | "target" | "period" | "source" | "keyword" | "confirmed">
>;

export function updateClaim(state: AppState, claimId: string, patch: ClaimPatch): AppState {
  if (patch.period !== undefined && !isPeriod(patch.period)) return state;
  if (patch.source !== undefined && !isSource(patch.source)) return state;
  if (patch.target !== undefined && !(patch.target > 0 && patch.target <= 10_000)) return state;
  return {
    ...state,
    claims: state.claims.map((c) => (c.id === claimId ? { ...c, ...patch } : c)),
  };
}

export function deleteStep(state: AppState, claimId: string): AppState {
  return {
    ...state,
    claims: state.claims.filter((c) => c.id !== claimId),
    checkins: state.checkins.filter((c) => c.claimId !== claimId),
  };
}

export function deleteDream(state: AppState, goalId: string): AppState {
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

export function setWeather(
  state: AppState,
  place: WeatherPlace,
  days: Record<ISODate, WeatherDay>,
  now: Date,
): AppState {
  return {
    ...state,
    evidence: {
      ...state.evidence,
      weatherPlace: place,
      // Keep older days the API no longer returns, so patterns keep their history.
      weatherDays: { ...state.evidence.weatherDays, ...days },
      weatherSyncedAt: now.toISOString(),
    },
  };
}

export function disconnect(state: AppState, what: "weather" | "calendar" | "github"): AppState {
  const e = state.evidence;
  if (what === "weather") {
    return {
      ...state,
      evidence: { ...e, weatherPlace: null, weatherDays: {}, weatherSyncedAt: null },
    };
  }
  if (what === "calendar") return { ...state, evidence: { ...e, events: [] } };
  return { ...state, evidence: { ...e, githubUser: "", githubDays: {}, githubSyncedAt: null } };
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
  const created = letters.map((l): Letter => {
    const self = selfById(l.selfId);
    return {
      id: newId("letter"),
      batchId,
      selfId: self.id,
      years: self.years,
      name: self.name,
      text: l.text,
      origin,
      createdAt: now.toISOString(),
      reply: "",
    };
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
