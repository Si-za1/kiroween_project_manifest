import { addDays, inRange } from "./dates.ts";
import type { Entry, ISODate } from "./types.ts";

/** Consecutive days with at least one journal entry, ending today (or yesterday, if today is empty). */
export function streak(entries: Entry[], today: ISODate): number {
  const days = new Set(entries.map((e) => e.date));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function entriesBetween(entries: Entry[], start: ISODate, end: ISODate): Entry[] {
  return entries.filter((e) => inRange(e.date, start, end));
}

export function averageMood(entries: Entry[]): number | null {
  if (entries.length === 0) return null;
  return entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
}

/** Average mood per day, or null on days with no entry. */
export function moodSeries(entries: Entry[], dates: ISODate[]): (number | null)[] {
  return dates.map((d) => averageMood(entries.filter((e) => e.date === d)));
}
