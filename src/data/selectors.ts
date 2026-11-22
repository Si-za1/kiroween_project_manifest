import { drawCard } from "../lib/cards.ts";
import type { Card } from "../lib/cards.ts";
import { findConflicts } from "../lib/conflicts.ts";
import type { Conflict } from "../lib/conflicts.ts";
import { activeClaims, evaluateAll } from "../lib/score.ts";
import type { ClaimResult } from "../lib/score.ts";
import { buildVoice } from "../lib/voice.ts";
import type { VoiceProfile } from "../lib/voice.ts";
import type { AppState, ISODate } from "../lib/types.ts";

export interface Model {
  results: ClaimResult[];
  conflicts: Conflict[];
  card: Card;
  voice: VoiceProfile;
}

export function computeModel(state: AppState, today: ISODate): Model {
  const claims = activeClaims(state);
  const results = evaluateAll(claims, state.goals, state, today);
  const conflicts = findConflicts(results, state.entries);
  const card = drawCard({ date: today, results, conflicts });
  const voice = buildVoice(state.entries);
  return { results, conflicts, card, voice };
}
