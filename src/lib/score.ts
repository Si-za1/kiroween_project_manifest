import { addDays, inRange } from "./dates.ts";
import type {
  AppState,
  CalendarEvent,
  CheckIn,
  Claim,
  Goal,
  ISODate,
  Period,
  Value,
} from "./types.ts";

export interface Range {
  start: ISODate;
  end: ISODate;
}

/** Rolling windows ending today: day = today, week = last 7 days, month = last 30 days. */
export function rangeFor(period: Period, today: ISODate): Range {
  if (period === "day") return { start: today, end: today };
  if (period === "week") return { start: addDays(today, -6), end: today };
  return { start: addDays(today, -29), end: today };
}

export function periodLabel(period: Period): string {
  if (period === "day") return "today";
  if (period === "week") return "last 7 days";
  return "last 30 days";
}

export type Status = "met" | "close" | "behind" | "no_data";

export interface ClaimResult {
  claim: Claim;
  value: Value;
  range: Range;
  actual: number;
  /** Amount the user reported themselves through check-ins, regardless of source. */
  selfReported: number;
  target: number;
  /** Fraction of the target reached, between 0 and 1. */
  score: number;
  status: Status;
}

type Data = Pick<AppState, "checkins" | "evidence">;

function sumCheckins(checkins: CheckIn[], claimId: string, range: Range): number {
  let total = 0;
  for (const c of checkins) {
    if (c.claimId === claimId && inRange(c.date, range.start, range.end)) total += c.amount;
  }
  return total;
}

function matchesKeyword(event: CalendarEvent, keyword: string): boolean {
  return keyword === "" || event.title.toLowerCase().includes(keyword);
}

export function actualFor(claim: Claim, data: Data, range: Range): number {
  if (claim.source === "checkin") return sumCheckins(data.checkins, claim.id, range);
  if (claim.source === "github") {
    let total = 0;
    for (const [date, n] of Object.entries(data.evidence.githubDays)) {
      if (inRange(date, range.start, range.end)) total += n;
    }
    return total;
  }
  let count = 0;
  for (const e of data.evidence.events) {
    if (inRange(e.date, range.start, range.end) && matchesKeyword(e, claim.keyword)) count += 1;
  }
  return count;
}

function hasAnyEvidence(claim: Claim, data: Data): boolean {
  if (claim.source === "checkin") {
    return data.checkins.some((c) => c.claimId === claim.id && c.amount > 0);
  }
  if (claim.source === "github") {
    return data.evidence.githubUser !== "" && Object.keys(data.evidence.githubDays).length > 0;
  }
  return data.evidence.events.length > 0;
}

export function evaluateClaim(
  claim: Claim,
  data: Data,
  today: ISODate,
  value: Value = "peace",
): ClaimResult {
  const range = rangeFor(claim.period, today);
  const actual = actualFor(claim, data, range);
  const selfReported = sumCheckins(data.checkins, claim.id, range);
  const score = Math.min(Math.max(actual / claim.target, 0), 1);
  let status: Status;
  if (actual >= claim.target) status = "met";
  else if (!hasAnyEvidence(claim, data)) status = "no_data";
  else if (score >= 0.6) status = "close";
  else status = "behind";
  return { claim, value, range, actual, selfReported, target: claim.target, score, status };
}

export function activeClaims(state: Pick<AppState, "goals" | "claims">): Claim[] {
  const live = new Set(state.goals.filter((g) => !g.archived).map((g) => g.id));
  return state.claims.filter((c) => c.confirmed && live.has(c.goalId));
}

export function evaluateAll(
  claims: Claim[],
  goals: Goal[],
  data: Data,
  today: ISODate,
): ClaimResult[] {
  const valueByGoal = new Map(goals.map((g) => [g.id, g.value] as const));
  return claims.map((c) => evaluateClaim(c, data, today, valueByGoal.get(c.goalId) ?? "peace"));
}
