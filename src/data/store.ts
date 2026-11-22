import type { AppState } from "../lib/types.ts";
import { createDemoState } from "./demo.ts";

const KEY_REAL = "manifest.v1";
const KEY_DEMO = "manifest.demo.v1";
const KEY_MODE = "manifest.mode";

export function emptyState(): AppState {
  return {
    goals: [],
    claims: [],
    entries: [],
    checkins: [],
    evidence: { githubUser: "", githubDays: {}, githubSyncedAt: null, events: [] },
    letters: [],
  };
}

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function normalize(raw: unknown): AppState | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Partial<AppState>;
  const base = emptyState();
  return {
    goals: Array.isArray(o.goals) ? o.goals : base.goals,
    claims: Array.isArray(o.claims) ? o.claims : base.claims,
    entries: Array.isArray(o.entries) ? o.entries : base.entries,
    checkins: Array.isArray(o.checkins) ? o.checkins : base.checkins,
    letters: Array.isArray(o.letters) ? o.letters : base.letters,
    evidence:
      typeof o.evidence === "object" && o.evidence !== null
        ? { ...base.evidence, ...o.evidence }
        : base.evidence,
  };
}

export function getMode(): boolean {
  return storage()?.getItem(KEY_MODE) === "demo";
}

export function setMode(demo: boolean): void {
  storage()?.setItem(KEY_MODE, demo ? "demo" : "real");
}

export function loadState(demo: boolean, today: string): AppState {
  const s = storage();
  const raw = s?.getItem(demo ? KEY_DEMO : KEY_REAL);
  if (raw) {
    try {
      const parsed = normalize(JSON.parse(raw));
      if (parsed) return parsed;
    } catch {
      // fall through to a fresh state
    }
  }
  return demo ? createDemoState(today) : emptyState();
}

export function saveState(demo: boolean, state: AppState): void {
  try {
    storage()?.setItem(demo ? KEY_DEMO : KEY_REAL, JSON.stringify(state));
  } catch {
    // Storage full or blocked. The app keeps working in memory.
  }
}

export function eraseAll(): void {
  const s = storage();
  s?.removeItem(KEY_REAL);
  s?.removeItem(KEY_DEMO);
  s?.removeItem(KEY_MODE);
}

export function resetDemo(): void {
  storage()?.removeItem(KEY_DEMO);
}
