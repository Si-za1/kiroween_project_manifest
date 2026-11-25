import { moonFor, moonGroup, MOON_GROUP_LABEL } from "./moon.ts";
import type { MoonGroup } from "./moon.ts";
import { weatherKind, WEATHER_LABEL } from "./weather.ts";
import type { WeatherKind } from "./weather.ts";
import type { CheckIn, Entry, ISODate, WeatherDay } from "./types.ts";

/** A plain-language finding that comes from stitching two sources together. */
export interface Pattern {
  id: string;
  sources: string[];
  headline: string;
  detail: string;
}

/** Minimum days in each group before we say anything. Small samples make silly claims. */
export const MIN_DAYS = 2;
/** Mood points (out of 5) a gap must reach before it counts as a pattern. */
export const MIN_GAP = 0.5;

interface Bucket {
  sum: number;
  days: number;
}

/** Average mood per day first, so a day with three entries doesn't count three times. */
function moodByDay(entries: Entry[]): Map<ISODate, number> {
  const acc = new Map<ISODate, Bucket>();
  for (const e of entries) {
    const b = acc.get(e.date) ?? { sum: 0, days: 0 };
    b.sum += e.mood;
    b.days += 1;
    acc.set(e.date, b);
  }
  return new Map([...acc].map(([d, b]) => [d, b.sum / b.days]));
}

function group<K extends string>(days: Map<ISODate, number>, keyOf: (d: ISODate) => K | null) {
  const out = new Map<K, Bucket>();
  for (const [d, mood] of days) {
    const k = keyOf(d);
    if (k === null) continue;
    const b = out.get(k) ?? { sum: 0, days: 0 };
    b.sum += mood;
    b.days += 1;
    out.set(k, b);
  }
  return [...out]
    .filter(([, b]) => b.days >= MIN_DAYS)
    .map(([k, b]) => ({ key: k, avg: b.sum / b.days, days: b.days }))
    .sort((a, b) => b.avg - a.avg || (a.key < b.key ? -1 : 1));
}

function compare<K extends string>(
  groups: { key: K; avg: number; days: number }[],
): {
  best: { key: K; avg: number; days: number };
  worst: { key: K; avg: number; days: number };
} | null {
  const best = groups[0];
  const worst = groups[groups.length - 1];
  if (!best || !worst || best === worst || best.avg - worst.avg < MIN_GAP) return null;
  return { best, worst };
}

const f1 = (n: number) => n.toFixed(1);

export function moodWeatherPattern(
  entries: Entry[],
  weather: Record<ISODate, WeatherDay>,
): Pattern | null {
  const groups = group<WeatherKind>(moodByDay(entries), (d) => {
    const w = weather[d];
    return w ? weatherKind(w.code) : null;
  });
  const c = compare(groups);
  if (!c) return null;
  return {
    id: "mood-weather",
    sources: ["Journal", "Weather"],
    headline: `You glow on ${WEATHER_LABEL[c.best.key].toLowerCase()} days`,
    detail: `Your mood averages ${f1(c.best.avg)}/5 on ${WEATHER_LABEL[c.best.key].toLowerCase()} days and ${f1(c.worst.avg)}/5 on ${WEATHER_LABEL[c.worst.key].toLowerCase()} days (${c.best.days} and ${c.worst.days} days of pages). On grey days, plan something gentle.`,
  };
}

export function moodMoonPattern(entries: Entry[]): Pattern | null {
  const groups = group<MoonGroup>(moodByDay(entries), (d) => moonGroup(moonFor(d).phase));
  const c = compare(groups);
  if (!c) return null;
  return {
    id: "mood-moon",
    sources: ["Journal", "Moon"],
    headline: `Your brightest pages come under a ${MOON_GROUP_LABEL[c.best.key]}`,
    detail: `Mood averages ${f1(c.best.avg)}/5 under a ${MOON_GROUP_LABEL[c.best.key]} and ${f1(c.worst.avg)}/5 under a ${MOON_GROUP_LABEL[c.worst.key]}. Just for fun, not science.`,
  };
}

const WEEKDAYS = [
  "Sundays",
  "Mondays",
  "Tuesdays",
  "Wednesdays",
  "Thursdays",
  "Fridays",
  "Saturdays",
];

export function stepsWeekdayPattern(checkins: CheckIn[]): Pattern | null {
  const counts = new Array<number>(7).fill(0);
  for (const c of checkins) {
    const [y, m, d] = c.date.split("-").map(Number) as [number, number, number];
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    counts[wd] = (counts[wd] ?? 0) + c.amount;
  }
  const total = counts.reduce((a, b) => a + b, 0);
  if (total < 7) return null;
  const best = counts.indexOf(Math.max(...counts));
  const quiet = counts.indexOf(Math.min(...counts));
  if (best === quiet) return null;
  return {
    id: "steps-weekday",
    sources: ["Little steps"],
    headline: `${WEEKDAYS[best]} are your power days`,
    detail: `You tick off the most steps on ${WEEKDAYS[best]} and the fewest on ${WEEKDAYS[quiet]}. Put the hardest step on a ${(WEEKDAYS[best] ?? "").slice(0, -1)}.`,
  };
}

export function findPatterns(
  entries: Entry[],
  checkins: CheckIn[],
  weather: Record<ISODate, WeatherDay>,
): Pattern[] {
  return [
    moodWeatherPattern(entries, weather),
    moodMoonPattern(entries),
    stepsWeekdayPattern(checkins),
  ].filter((p): p is Pattern => p !== null);
}
