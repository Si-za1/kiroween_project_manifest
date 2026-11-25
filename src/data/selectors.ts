import { drawCard } from "../lib/cards.ts";
import type { Card } from "../lib/cards.ts";
import { findConflicts } from "../lib/conflicts.ts";
import type { Conflict } from "../lib/conflicts.ts";
import { activeClaims, evaluateAll } from "../lib/score.ts";
import type { ClaimResult } from "../lib/score.ts";
import { buildVoice } from "../lib/voice.ts";
import type { VoiceProfile } from "../lib/voice.ts";
import { moonFor } from "../lib/moon.ts";
import type { Moon } from "../lib/moon.ts";
import { findPatterns } from "../lib/patterns.ts";
import type { Pattern } from "../lib/patterns.ts";
import type { AppState, ISODate, WeatherDay } from "../lib/types.ts";

export interface Model {
  results: ClaimResult[];
  conflicts: Conflict[];
  card: Card;
  voice: VoiceProfile;
  moon: Moon;
  weatherToday: WeatherDay | null;
  patterns: Pattern[];
}

export function computeModel(state: AppState, today: ISODate): Model {
  const claims = activeClaims(state);
  const results = evaluateAll(claims, state.goals, state, today);
  const conflicts = findConflicts(results, state.entries);
  const moon = moonFor(today);
  const card = drawCard({ date: today, results, conflicts, moon });
  const voice = buildVoice(state.entries);
  const weatherToday = state.evidence.weatherDays[today] ?? null;
  const patterns = findPatterns(state.entries, state.checkins, state.evidence.weatherDays);
  return { results, conflicts, card, voice, moon, weatherToday, patterns };
}
