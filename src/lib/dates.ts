import type { ISODate } from "./types.ts";

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

/** Format a Date using its local calendar fields. */
export function toISODate(d: Date): ISODate {
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now);
}

export function isISODate(s: string): boolean {
  const m = ISO_RE.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

function toUTC(s: ISODate): number {
  const m = ISO_RE.exec(s);
  if (!m) throw new Error(`Invalid ISO date: ${s}`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Calendar-day arithmetic. Uses UTC internally so daylight saving never shifts the result. */
export function addDays(s: ISODate, n: number): ISODate {
  const d = new Date(toUTC(s) + n * 86_400_000);
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Whole days from a to b (b minus a). */
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}

export function inRange(d: ISODate, start: ISODate, end: ISODate): boolean {
  return d >= start && d <= end;
}

export function formatLong(d: ISODate): string {
  return new Date(toUTC(d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatMonthYear(d: ISODate): string {
  return new Date(toUTC(d)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function weekdayLetter(d: ISODate): string {
  return new Date(toUTC(d))
    .toLocaleDateString("en-US", { weekday: "narrow", timeZone: "UTC" })
    .slice(0, 1);
}

export function dayOfMonth(d: ISODate): number {
  return Number(d.slice(8, 10));
}

/** The last n days, oldest first, ending today. */
export function lastNDays(today: ISODate, n: number): ISODate[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
}

/** First day of the month containing d. */
export function startOfMonth(d: ISODate): ISODate {
  return `${d.slice(0, 7)}-01`;
}

/** Move by whole months, landing on the first of the month. */
export function addMonths(d: ISODate, n: number): ISODate {
  const y = Number(d.slice(0, 4));
  const m = Number(d.slice(5, 7)) - 1 + n;
  const date = new Date(Date.UTC(y, m, 1));
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-01`;
}

/** 42 dates (6 weeks, Monday first) covering the month that contains d. */
export function monthGrid(d: ISODate): ISODate[] {
  const first = startOfMonth(d);
  const weekday = new Date(toUTC(first)).getUTCDay(); // 0 = Sunday
  const offset = (weekday + 6) % 7; // days since Monday
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** Friendly distance from today, for example "in 3 months" or "2 days ago". */
export function relativeDay(target: ISODate, today: ISODate): string {
  const days = diffDays(today, target);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  const abs = Math.abs(days);
  let label: string;
  if (abs < 14) label = `${abs} days`;
  else if (abs < 60) label = `${Math.round(abs / 7)} weeks`;
  else if (abs < 730) label = `${Math.round(abs / 30.4)} months`;
  else label = `${Math.round(abs / 365)} years`;
  return days > 0 ? `in ${label}` : `${label} ago`;
}

export function formatShort(d: ISODate): string {
  return new Date(toUTC(d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
