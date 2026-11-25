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

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/([,;])/g, "\\$1")
    .replace(/\r?\n/g, "\\n");
}

/** Folds long lines to 75 octets, as the iCalendar format requires. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

export interface ExportEvent {
  uid: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
}

/**
 * Builds an .ics file of all-day events, each with a reminder one week before. Imports into
 * Google Calendar, Apple Calendar, and Outlook.
 */
export function buildICS(events: ExportEvent[], stamp: Date = new Date()): string {
  const dtstamp = stamp
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dearly//Dream journal//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of events) {
    const start = e.date.replace(/-/g, "");
    const next = new Date(`${e.date}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    const end = next.toISOString().slice(0, 10).replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@manifest`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      fold(`SUMMARY:${escapeText(e.title)}`),
      fold(`DESCRIPTION:${escapeText(e.description)}`),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-P7D",
      fold(`DESCRIPTION:${escapeText(`One week to go: ${e.title}`)}`),
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
