import type { ISODate } from "./types.ts";

/** Average length of a lunar cycle, in days. */
export const SYNODIC_MONTH = 29.530588853;
/** A known new moon: 2000-01-06 18:14 UTC, as a Julian Day. */
const NEW_MOON_JD = 2451550.26;

export type MoonPhase =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export interface Moon {
  phase: MoonPhase;
  name: string;
  /** Days since the last new moon, 0 to 29.5. */
  age: number;
  /** Fraction of the moon that is lit, 0 to 1. */
  illumination: number;
  /** "growing" between new and full, "releasing" between full and new. */
  energy: "growing" | "releasing";
}

const NAMES: Record<MoonPhase, string> = {
  new: "New Moon",
  "waxing-crescent": "Waxing Crescent",
  "first-quarter": "First Quarter",
  "waxing-gibbous": "Waxing Gibbous",
  full: "Full Moon",
  "waning-gibbous": "Waning Gibbous",
  "last-quarter": "Last Quarter",
  "waning-crescent": "Waning Crescent",
};

function julianDay(date: ISODate): number {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  // Noon UTC on that calendar day.
  return Date.UTC(y, m - 1, d, 12) / 86_400_000 + 2440587.5;
}

/** Moon phase for a calendar date, using the mean lunar cycle (accurate to about a day). */
export function moonFor(date: ISODate): Moon {
  const raw = (julianDay(date) - NEW_MOON_JD) % SYNODIC_MONTH;
  const age = raw < 0 ? raw + SYNODIC_MONTH : raw;
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2;
  const eighth = SYNODIC_MONTH / 8;
  // Centre each named phase on its exact point, so "new" covers about 1.8 days either side.
  const index = Math.floor((age + eighth / 2) / eighth) % 8;
  const phase = (
    [
      "new",
      "waxing-crescent",
      "first-quarter",
      "waxing-gibbous",
      "full",
      "waning-gibbous",
      "last-quarter",
      "waning-crescent",
    ] as const
  )[index] as MoonPhase;
  return {
    phase,
    name: NAMES[phase],
    age,
    illumination,
    energy: age < SYNODIC_MONTH / 2 ? "growing" : "releasing",
  };
}

/** Four broad groups, used for mood patterns so each group has enough days. */
export type MoonGroup = "new" | "waxing" | "full" | "waning";

export function moonGroup(phase: MoonPhase): MoonGroup {
  if (phase === "new") return "new";
  if (phase === "full") return "full";
  return phase.startsWith("waxing") || phase === "first-quarter" ? "waxing" : "waning";
}

export const MOON_GROUP_LABEL: Record<MoonGroup, string> = {
  new: "new moon",
  waxing: "waxing moon",
  full: "full moon",
  waning: "waning moon",
};

/** Short manifestation ritual for the phase, shown on the journal card. */
export function moonRitual(moon: Moon): string {
  switch (moon.phase) {
    case "new":
      return "New moon: a classic time to set an intention. Write one dream as if it already came true.";
    case "full":
      return "Full moon: a time to celebrate and let go. What are you proud of, and what can you release?";
    default:
      return moon.energy === "growing"
        ? "The moon is growing. A good time to take one small step."
        : "The moon is releasing. A good time to rest and reflect.";
  }
}
