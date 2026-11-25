import type { Entry } from "./types.ts";

export interface VoiceProfile {
  avgSentenceWords: number;
  favoriteWords: string[];
  phrases: string[];
  sample: string;
}

const STOP = new Set(
  (
    "the and that this with have from they were been would could should there their about which " +
    "what when where your just like into than then them very much some more also only over such " +
    "being because while still really today yesterday tomorrow went felt feel made make doing done " +
    "dont didnt cant wont isnt wasnt im ive its was for you but not are had has his her she him " +
    "our out can all any get got one two too off who why how did does"
  ).split(" "),
);

function words(text: string): string[] {
  return (
    text
      .toLowerCase()
      .replace(/['’]/g, "")
      .match(/[a-z]+/g) ?? []
  ).filter(Boolean);
}

function topByCount(counts: Map<string, number>, min: number, limit: number): string[] {
  return [...counts.entries()]
    .filter(([, n]) => n >= min)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, limit)
    .map(([w]) => w);
}

/** Summarizes how the user writes, so letters can echo their own words. */
export function buildVoice(entries: Entry[]): VoiceProfile {
  const single = new Map<string, number>();
  const pairs = new Map<string, number>();
  let sentences = 0;
  let totalWords = 0;

  for (const e of entries) {
    const parts = e.text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    sentences += parts.length;
    const ws = words(e.text);
    totalWords += ws.length;
    for (const w of ws) {
      if (w.length >= 4 && !STOP.has(w)) single.set(w, (single.get(w) ?? 0) + 1);
    }
    for (let i = 0; i < ws.length - 1; i++) {
      const a = ws[i];
      const b = ws[i + 1];
      if (a && b && !STOP.has(a) && !STOP.has(b) && a.length >= 3 && b.length >= 3) {
        const key = `${a} ${b}`;
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
      }
    }
  }

  const last = [...entries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  const sampleSentence =
    last?.text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .find((s) => s.length >= 20) ?? "";

  return {
    avgSentenceWords: sentences === 0 ? 0 : Math.round(totalWords / sentences),
    favoriteWords: topByCount(single, 2, 5),
    phrases: topByCount(pairs, 2, 3),
    sample: sampleSentence.slice(0, 140),
  };
}
