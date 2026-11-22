import { toISODate } from "./dates.ts";
import type { CalendarEvent } from "./types.ts";

const DT_RE = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/;

interface ParsedDate {
  date: Date;
  allDay: boolean;
}

function parseDT(value: string): ParsedDate | null {
  const m = DT_RE.exec(value.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  const allDay = h === undefined;
  const parts = [
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h ?? 0),
    Number(mi ?? 0),
    Number(s ?? 0),
  ] as const;
  const date = z ? new Date(Date.UTC(...parts)) : new Date(...parts);
  return Number.isNaN(date.getTime()) ? null : { date, allDay };
}

function unescapeText(s: string): string {
  return s
    .replace(/\\n/gi, " ")
    .replace(/\\([,;\\])/g, "$1")
    .trim();
}

/**
 * Minimal iCalendar reader. Reads single events (SUMMARY, DTSTART, DTEND).
 * Recurring events (RRULE) are read once, not expanded.
 */
export function parseICS(text: string): CalendarEvent[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  const events: CalendarEvent[] = [];

  let current: { summary?: string; start?: ParsedDate; end?: ParsedDate } | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current?.start) {
        const minutes = current.end
          ? Math.max(
              0,
              Math.round((current.end.date.getTime() - current.start.date.getTime()) / 60_000),
            )
          : 0;
        events.push({
          date: toISODate(current.start.date),
          title: current.summary ?? "(untitled)",
          minutes,
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const name = (line.slice(0, idx).split(";")[0] ?? "").toUpperCase();
    const value = line.slice(idx + 1);
    if (name === "SUMMARY") current.summary = unescapeText(value);
    else if (name === "DTSTART") {
      const p = parseDT(value);
      if (p) current.start = p;
    } else if (name === "DTEND") {
      const p = parseDT(value);
      if (p) current.end = p;
    }
  }
  return events;
}
