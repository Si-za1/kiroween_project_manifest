import type { IconName } from "../lib/cards.ts";

export type UiIcon =
  | IconName
  | "home"
  | "star"
  | "book"
  | "chart"
  | "envelope"
  | "flame"
  | "calendar"
  | "pin"
  | "clock"
  | "plus"
  | "trash"
  | "check"
  | "board"
  | "chevron-left"
  | "chevron-right"
  | "heart"
  | "smile";

const PATHS: Record<UiIcon, string[]> = {
  seed: [
    "M12 21v-8",
    "M12 13c0-4 3-6 7-6 0 4-3 6-7 6z",
    "M12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5z",
    "M8 21h8",
  ],
  keepsake: [
    "M4 10h16v10H4z",
    "M3 7h18v3H3z",
    "M12 7v13",
    "M12 7c-2-3-6-3-6-1s4 1 6 1c2 0 6 1 6-1s-4-2-6 1z",
  ],
  crossroads: ["M12 3v18", "M12 6h6l2 2-2 2h-6", "M12 12H6l-2 2 2 2h6", "M9 21h6"],
  sunrise: [
    "M3 18h18",
    "M6 18a6 6 0 0 1 12 0",
    "M12 6V3",
    "M4.9 10.9 3.5 9.5",
    "M19.1 10.9l1.4-1.4",
    "M8 21h8",
  ],
  mend: ["M18 3 6 15", "M17 3h4v4", "M6 15c-2 2-3 4-1 5s3-1 5-3", "M14 14c2 1 4 3 3 5"],
  page: ["M6 3h9l3 3v15H6z", "M15 3v3h3", "M9 11h6", "M9 15h6"],
  whisper: ["M4 12a8 7 0 1 1 4 6l-4 2 1-4a7 7 0 0 1-1-4z", "M9 12h.01", "M12 12h.01", "M15 12h.01"],
  spark: [
    "M12 3v4",
    "M12 17v4",
    "M3 12h4",
    "M17 12h4",
    "M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z",
  ],
  mirror: [
    "M12 3c3.3 0 6 2.9 6 6.5S15.3 16 12 16s-6-2.9-6-6.5S8.7 3 12 3z",
    "M12 16v5",
    "M9 21h6",
    "M10 7c-1 1-1.5 2-1.5 3",
  ],
  step: [
    "M8 3c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5z",
    "M6 15h4v2a2 2 0 0 1-4 0z",
    "M16 8c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5z",
    "M14 20h4",
  ],
  sun: [
    "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
    "M12 2v2",
    "M12 20v2",
    "M2 12h2",
    "M20 12h2",
    "M4.9 4.9l1.4 1.4",
    "M17.7 17.7l1.4 1.4",
    "M4.9 19.1l1.4-1.4",
    "M17.7 6.3l1.4-1.4",
  ],
  home: ["M4 11 12 4l8 7", "M6 10v10h12V10", "M10 20v-5h4v5"],
  star: ["M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"],
  book: ["M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z", "M12 6v14"],
  chart: ["M4 20V4", "M4 20h16", "M8 16v-4", "M12 16V8", "M16 16v-6"],
  envelope: ["M3 6h18v12H3z", "M3 7l9 6 9-6"],
  flame: ["M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"],
  calendar: ["M4 6h16v14H4z", "M4 10h16", "M8 3v4", "M16 3v4"],
  pin: ["M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z", "M12 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"],
  clock: ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M12 7v5l3 2"],
  plus: ["M12 5v14", "M5 12h14"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 13h10l1-13"],
  check: ["M5 12l5 5 9-10"],
  board: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
  "chevron-left": ["M15 5l-7 7 7 7"],
  "chevron-right": ["M9 5l7 7-7 7"],
  heart: ["M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"],
  smile: [
    "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z",
    "M8.5 14c1 1.5 2 2 3.5 2s2.5-.5 3.5-2",
    "M9 9.5h.01",
    "M15 9.5h.01",
  ],
};

export function Icon({ name, size = 20 }: { name: UiIcon; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(PATHS[name] ?? []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const FACES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "M8 16.5c1-1.2 2.2-1.8 4-1.8s3 .6 4 1.8",
  2: "M8.5 16c1-.6 2-.9 3.5-.9s2.5.3 3.5.9",
  3: "M8.5 15.5h7",
  4: "M8.5 14.5c1 1.2 2 1.7 3.5 1.7s2.5-.5 3.5-1.7",
  5: "M8 13.5c.8 2.2 2.2 3.3 4 3.3s3.2-1.1 4-3.3z",
};

/** Small hand-drawn mood face, 1 (heavy) to 5 (radiant). */
export function MoodFace({ mood, size = 28 }: { mood: 1 | 2 | 3 | 4 | 5; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={9} />
      <path d="M9 10h.01M15 10h.01" strokeWidth={2.4} />
      <path d={FACES[mood]} />
    </svg>
  );
}
