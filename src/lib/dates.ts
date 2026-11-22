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

export function formatShort(d: ISODate): string {
  return new Date(toUTC(d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
