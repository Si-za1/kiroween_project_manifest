export const PERIODS = ["day", "week", "month"] as const;
export type Period = (typeof PERIODS)[number];

export const SOURCES = ["checkin", "github", "calendar"] as const;
export type Source = (typeof SOURCES)[number];

/** Life areas. Shown to users as Growth, Love, and Wellbeing. */
export const VALUES = ["ambition", "connection", "peace"] as const;
export type Value = (typeof VALUES)[number];

export const TINTS = ["blush", "navy", "sand", "mauve", "powder", "rose"] as const;
export type Tint = (typeof TINTS)[number];

/** Calendar date as YYYY-MM-DD in the user's local time. */
export type ISODate = string;

/** A dream: something the user wants to manifest. */
export interface Goal {
  id: string;
  text: string;
  why: string;
  where: string;
  /** Target date, or "" for "someday". */
  byDate: ISODate | "";
  tint: Tint;
  value: Value;
  createdAt: string;
  archived: boolean;
}

/** A little step toward a dream: a habit with a number, a time window, and a way to track it. */
export interface Claim {
  id: string;
  goalId: string;
  metric: string;
  target: number;
  period: Period;
  source: Source;
  /** Lowercase word used to match journal entries and calendar event titles. */
  keyword: string;
  confirmed: boolean;
}

export interface Entry {
  id: string;
  date: ISODate;
  cardId: string;
  cardTitle: string;
  prompt: string;
  text: string;
  mood: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  hash: string;
}

/** A self-reported amount for one step on one day. */
export interface CheckIn {
  claimId: string;
  date: ISODate;
  amount: number;
}

export interface CalendarEvent {
  date: ISODate;
  title: string;
  minutes: number;
}

export interface WeatherPlace {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

/** One day of weather. `code` is a WMO weather code, as returned by Open-Meteo. */
export interface WeatherDay {
  code: number;
  tempC: number | null;
}

export interface EvidenceData {
  githubUser: string;
  githubDays: Record<ISODate, number>;
  githubSyncedAt: string | null;
  events: CalendarEvent[];
  weatherPlace: WeatherPlace | null;
  weatherDays: Record<ISODate, WeatherDay>;
  weatherSyncedAt: string | null;
}

export type SelfId = "builder" | "keeper" | "elder";

export interface Letter {
  id: string;
  batchId: string;
  selfId: SelfId;
  years: 1 | 5 | 20;
  name: string;
  text: string;
  origin: "ai" | "local";
  createdAt: string;
  reply: string;
  /** When the envelope was first opened. Missing means it's still sealed. */
  openedAt?: string;
}

export interface AppState {
  goals: Goal[];
  claims: Claim[];
  entries: Entry[];
  checkins: CheckIn[];
  evidence: EvidenceData;
  letters: Letter[];
}
