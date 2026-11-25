import type { Conflict } from "./conflicts.ts";
import { hashString } from "./ids.ts";
import type { ClaimResult } from "./score.ts";
import type { Moon } from "./moon.ts";
import type { ISODate, Tint } from "./types.ts";

export type IconName =
  | "seed"
  | "keepsake"
  | "crossroads"
  | "sunrise"
  | "mend"
  | "page"
  | "whisper"
  | "spark"
  | "mirror"
  | "step"
  | "sun"
  | "moon"
  | "full-moon";

export interface Card {
  id: string;
  numeral: string;
  title: string;
  icon: IconName;
  tint: Tint;
  prompt: string;
}

const BASE: Omit<Card, "numeral">[] = [
  {
    id: "seed",
    title: "The Seed",
    icon: "seed",
    tint: "navy",
    prompt: "What have you started that you'd love to see bloom?",
  },
  {
    id: "keepsake",
    title: "The Keepsake",
    icon: "keepsake",
    tint: "rose",
    prompt: "What are you saving for later that deserves a little love today?",
  },
  {
    id: "crossroads",
    title: "The Crossroads",
    icon: "crossroads",
    tint: "powder",
    prompt: "Where did you choose between two paths today? What made you pick yours?",
  },
  {
    id: "sunrise",
    title: "The Sunrise",
    icon: "sunrise",
    tint: "sand",
    prompt: "If tomorrow could begin any way you like, what would the first hour look like?",
  },
  {
    id: "mend",
    title: "The Mend",
    icon: "mend",
    tint: "blush",
    prompt: "What one small fix would make tomorrow feel lighter?",
  },
  {
    id: "page",
    title: "The Blank Page",
    icon: "page",
    tint: "mauve",
    prompt: "If you could start fresh today, what's the first thing you would keep?",
  },
  {
    id: "whisper",
    title: "The Whisper",
    icon: "whisper",
    tint: "mauve",
    prompt: "What's been quietly on your mind that you haven't said out loud yet?",
  },
  {
    id: "spark",
    title: "The Spark",
    icon: "spark",
    tint: "sand",
    prompt: "What gave you energy today, and what took it away?",
  },
];

const ROMAN = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
];

function numeral(n: number): string {
  return ROMAN[n] ?? String(n);
}

export const DECK_SIZE = BASE.length + 5;

interface DrawInput {
  date: ISODate;
  results: ClaimResult[];
  conflicts: Conflict[];
  moon?: Moon;
}

/**
 * Daily draw. The same date and the same state always give the same card, so the card does not
 * change on reload. Special cards come from the user's own progress.
 */
export function drawCard({ date, results, conflicts, moon }: DrawInput): Card {
  // New and full moons are manifestation rituals, so they take the day's card.
  if (moon?.phase === "new") {
    return {
      id: "new-moon",
      numeral: numeral(BASE.length + 4),
      title: "The New Moon",
      icon: "moon",
      tint: "mauve",
      prompt: "Set an intention. Write one dream as if it has already come true. How does it feel?",
    };
  }
  if (moon?.phase === "full") {
    return {
      id: "full-moon",
      numeral: numeral(BASE.length + 5),
      title: "The Full Moon",
      icon: "full-moon",
      tint: "sand",
      prompt:
        "Celebrate and let go. Name one thing you're proud of and one thing you're ready to release.",
    };
  }

  const firstConflict = conflicts[0];
  if (firstConflict) {
    return {
      id: "mirror",
      numeral: numeral(BASE.length + 1),
      title: "The Mirror",
      icon: "mirror",
      tint: "powder",
      prompt: `${firstConflict.title}. What would you tell a friend who said the same thing?`,
    };
  }

  const behind = results
    .filter((r) => r.status === "behind" || r.status === "no_data")
    .sort((a, b) => a.score - b.score || (a.claim.id < b.claim.id ? -1 : 1));
  const worst = behind[0];
  if (worst) {
    return {
      id: "tiny-step",
      numeral: numeral(BASE.length + 2),
      title: "The Tiny Step",
      icon: "step",
      tint: "blush",
      prompt: `What's the smallest, easiest version of "${worst.claim.metric}" you could do today?`,
    };
  }

  if (results.length > 0) {
    return {
      id: "sun",
      numeral: numeral(BASE.length + 3),
      title: "The Sun",
      icon: "sun",
      tint: "sand",
      prompt: "Every step is on track. What helped, and how can you keep it going?",
    };
  }

  const pick = BASE[hashString(date) % BASE.length];
  if (!pick) throw new Error("Deck is empty");
  return { ...pick, numeral: numeral(BASE.indexOf(pick) + 1) };
}
