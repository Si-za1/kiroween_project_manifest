import type { Conflict } from "./conflicts.ts";
import { hashString } from "./ids.ts";
import type { ClaimResult } from "./score.ts";
import type { ISODate } from "./types.ts";

export interface Card {
  id: string;
  numeral: string;
  title: string;
  glyph: string;
  prompt: string;
}

const BASE: Omit<Card, "numeral">[] = [
  {
    id: "unmerged-branch",
    title: "The Unmerged Branch",
    glyph: "⑂",
    prompt: "What have you started but not yet brought into your life?",
  },
  {
    id: "stash",
    title: "The Stash",
    glyph: "◫",
    prompt: "What are you holding aside for later that deserves some attention today?",
  },
  {
    id: "fork",
    title: "The Fork",
    glyph: "⑃",
    prompt: "Where did you face two paths today? Which one did you take, and why?",
  },
  {
    id: "rebase",
    title: "The Rebase",
    glyph: "↺",
    prompt: "If you could rewrite how today began, what would the first hour look like?",
  },
  {
    id: "hotfix",
    title: "The Hotfix",
    glyph: "✚",
    prompt: "What one small repair would make tomorrow easier?",
  },
  {
    id: "fresh-clone",
    title: "The Fresh Clone",
    glyph: "◌",
    prompt: "If you started from zero today, what is the first thing you would keep?",
  },
  {
    id: "quiet-daemon",
    title: "The Quiet Daemon",
    glyph: "☾",
    prompt: "What runs in the background of your mind that you have not named yet?",
  },
  {
    id: "lightning-rod",
    title: "The Lightning Rod",
    glyph: "⚡",
    prompt: "What gave you energy today, and what drained it?",
  },
];

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function numeral(n: number): string {
  return ROMAN[n] ?? String(n);
}

export const DECK_SIZE = BASE.length + 4;

interface DrawInput {
  date: ISODate;
  results: ClaimResult[];
  conflicts: Conflict[];
}

/**
 * Deterministic daily draw. The same date and the same state always give the same card, so the card
 * does not change when the page reloads. Special cards come from the user's own results.
 */
export function drawCard({ date, results, conflicts }: DrawInput): Card {
  const firstConflict = conflicts[0];
  if (firstConflict) {
    return {
      id: "merge-conflict",
      numeral: numeral(BASE.length + 1),
      title: "The Merge Conflict",
      glyph: "⚔",
      prompt: `${firstConflict.title}. Two versions of you disagree. Write down each one's side, then decide which one you want to merge in.`,
    };
  }

  const behind = results
    .filter((r) => r.status === "behind" || r.status === "no_data")
    .sort((a, b) => a.score - b.score || (a.claim.id < b.claim.id ? -1 : 1));
  const worst = behind[0];
  if (worst) {
    return {
      id: "broken-test",
      numeral: numeral(BASE.length + 2),
      title: "The Broken Test",
      glyph: "✕",
      prompt: `"${worst.claim.metric}" is not passing yet. Without blame: what is the smallest version of it you could do today?`,
    };
  }

  if (results.length > 0) {
    return {
      id: "green-build",
      numeral: numeral(BASE.length + 3),
      title: "The Green Build",
      glyph: "✓",
      prompt: "Everything is passing. What made that possible, and how do you protect it?",
    };
  }

  const pick = BASE[hashString(date) % BASE.length];
  if (!pick) throw new Error("Deck is empty");
  const index = BASE.indexOf(pick) + 1;
  return { ...pick, numeral: numeral(index) };
}
