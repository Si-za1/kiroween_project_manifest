import { inRange } from "./dates.ts";
import type { ClaimResult } from "./score.ts";
import { periodLabel } from "./score.ts";
import type { Entry, Value } from "./types.ts";

export interface Conflict {
  id: string;
  claimId: string;
  kind: "said_vs_did" | "self_vs_evidence";
  title: string;
  detail: string;
  value: Value;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/**
 * Finds places where words and actions disagree. The result is sorted, so it does not depend on the
 * order of the inputs.
 */
export function findConflicts(results: ClaimResult[], entries: Entry[]): Conflict[] {
  const out: Conflict[] = [];

  for (const r of results) {
    const { claim } = r;
    const window = periodLabel(claim.period);

    // The user's own count is higher than what the outside evidence shows. This is the stronger
    // signal, so when it fires it replaces the softer "said vs. did" conflict for the same claim.
    const selfAhead = claim.source !== "checkin" && r.selfReported > r.actual;

    // The user wrote about it, but the evidence says they are behind.
    if (!selfAhead && r.status === "behind" && claim.keyword) {
      const mentions = entries.filter(
        (e) =>
          inRange(e.date, r.range.start, r.range.end) &&
          e.text.toLowerCase().includes(claim.keyword),
      ).length;
      if (mentions > 0) {
        out.push({
          id: `${claim.id}:said_vs_did`,
          claimId: claim.id,
          kind: "said_vs_did",
          value: r.value,
          title: `Said vs. did: ${claim.metric}`,
          detail: `You wrote about "${claim.keyword}" ${mentions} ${mentions === 1 ? "time" : "times"} in the ${window}. The evidence shows ${fmt(r.actual)} of ${fmt(r.target)}. What got in the way?`,
        });
      }
    }

    if (selfAhead) {
      out.push({
        id: `${claim.id}:self_vs_evidence`,
        claimId: claim.id,
        kind: "self_vs_evidence",
        value: r.value,
        title: `Self vs. evidence: ${claim.metric}`,
        detail: `You reported ${fmt(r.selfReported)} in the ${window}, but ${claim.source === "github" ? "GitHub" : "your calendar"} shows ${fmt(r.actual)}. One of them is off. Which one do you trust?`,
      });
    }
  }

  return out.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
