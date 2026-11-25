import { inRange } from "./dates.ts";
import type { ClaimResult } from "./score.ts";
import { windowPhrase } from "./score.ts";
import type { Entry, Value } from "./types.ts";

/** A gentle nudge where what the user writes and what they do don't line up. */
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
 * Finds places where words and actions don't line up. The result is sorted, so it does not depend
 * on the order of the inputs.
 */
export function findConflicts(results: ClaimResult[], entries: Entry[]): Conflict[] {
  const out: Conflict[] = [];

  for (const r of results) {
    const { claim } = r;
    const when = windowPhrase(claim.period);

    // The user's own count is higher than what the calendar or GitHub shows. This is the stronger
    // signal, so when it fires it replaces the softer "you keep writing about it" nudge.
    const selfAhead = claim.source !== "checkin" && r.selfReported > r.actual;

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
          title: `You keep writing about "${claim.keyword}"`,
          detail: `It came up ${mentions} ${mentions === 1 ? "time" : "times"} in your journal ${when}, and your tracker shows ${fmt(r.actual)} of ${fmt(r.target)}. It clearly matters to you. What tiny version could you try tomorrow?`,
        });
      }
    }

    if (selfAhead) {
      const where = claim.source === "github" ? "GitHub" : "calendar";
      out.push({
        id: `${claim.id}:self_vs_evidence`,
        claimId: claim.id,
        kind: "self_vs_evidence",
        value: r.value,
        title: `Your notes and your ${where} remember it differently`,
        detail: `You ticked off ${fmt(r.selfReported)} for "${claim.metric}" ${when}, and your ${where} shows ${fmt(r.actual)}. Maybe a few never made it onto the ${where}? Either way, you're showing up.`,
      });
    }
  }

  return out.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
