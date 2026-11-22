export const PERIODS = ["day", "week", "month"] as const;
export type Period = (typeof PERIODS)[number];

export const SOURCES = ["checkin", "github", "calendar"] as const;
export type Source = (typeof SOURCES)[number];

export const VALUES = ["ambition", "connection", "peace"] as const;
export type Value = (typeof VALUES)[number];

/** Calendar date as YYYY-MM-DD in the user's local time. */
export type ISODate = string;

export interface Goal {
  id: string;
  text: string;
  value: Value;
  createdAt: string;
  archived: boolean;
}

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

/** A self-reported amount for one claim on one day. */
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

export interface EvidenceData {
  githubUser: string;
  githubDays: Record<ISODate, number>;
  githubSyncedAt: string | null;
  events: CalendarEvent[];
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
}

export interface AppState {
  goals: Goal[];
  claims: Claim[];
  entries: Entry[];
  checkins: CheckIn[];
  evidence: EvidenceData;
  letters: Letter[];
}
