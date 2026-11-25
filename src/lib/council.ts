import type { Conflict } from "./conflicts.ts";
import type { Moon } from "./moon.ts";
import type { Pattern } from "./patterns.ts";
import type { ClaimResult, Status } from "./score.ts";
import { windowPhrase } from "./score.ts";
import type { Entry, Goal, ISODate, SelfId, Value } from "./types.ts";
import type { VoiceProfile } from "./voice.ts";

/** A future version of the user who writes letters. Each one looks after one life area. */
export interface FutureSelf {
  id: SelfId;
  years: 1 | 5 | 20;
  name: string;
  value: Value;
  caresAbout: string;
}

export const SELVES: FutureSelf[] = [
  {
    id: "builder",
    years: 1,
    name: "Me, next year",
    value: "ambition",
    caresAbout: "my growth: work, learning, and the things I make",
  },
  {
    id: "keeper",
    years: 5,
    name: "Me, in five years",
    value: "connection",
    caresAbout: "my people: family, friends, and love",
  },
  {
    id: "elder",
    years: 20,
    name: "Me, in twenty years",
    value: "peace",
    caresAbout: "my wellbeing: health, rest, and joy",
  },
];

export function selfById(id: SelfId): FutureSelf {
  return SELVES.find((s) => s.id === id) ?? (SELVES[0] as FutureSelf);
}

export interface CouncilClaim {
  dream: string;
  step: string;
  target: number;
  actual: number;
  window: string;
  status: Status;
  value: Value;
}

/** Everything a letter may use. Letters must not state facts that are not in here. */
export interface CouncilContext {
  today: ISODate;
  dreams: { text: string; why: string; byDate: string; value: Value }[];
  claims: CouncilClaim[];
  conflicts: { title: string; detail: string; value: Value }[];
  /** Findings from stitching sources together, for example mood and weather. */
  patterns: { sources: string[]; headline: string; detail: string }[];
  moon: { name: string; energy: string };
  voice: { favoriteWords: string[]; phrases: string[]; sample: string; avgSentenceWords: number };
  recentEntries: { date: ISODate; text: string }[];
}

export function buildContext(
  today: ISODate,
  goals: Goal[],
  results: ClaimResult[],
  conflicts: Conflict[],
  entries: Entry[],
  voice: VoiceProfile,
  patterns: Pattern[] = [],
  moon?: Moon,
): CouncilContext {
  const live = goals.filter((g) => !g.archived);
  const dreamText = new Map(live.map((g) => [g.id, g.text] as const));
  const recent = [...entries]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)
    .map((e) => ({ date: e.date, text: e.text.slice(0, 400) }));
  return {
    today,
    dreams: live.map((g) => ({
      text: g.text.slice(0, 200),
      why: g.why.slice(0, 300),
      byDate: g.byDate,
      value: g.value,
    })),
    claims: results.map((r) => ({
      dream: dreamText.get(r.claim.goalId) ?? "",
      step: r.claim.metric,
      target: r.target,
      actual: r.actual,
      window: windowPhrase(r.claim.period),
      status: r.status,
      value: r.value,
    })),
    conflicts: conflicts.map((c) => ({ title: c.title, detail: c.detail, value: c.value })),
    patterns: patterns.map((p) => ({ sources: p.sources, headline: p.headline, detail: p.detail })),
    moon: { name: moon?.name ?? "", energy: moon?.energy ?? "" },
    voice: {
      favoriteWords: voice.favoriteWords,
      phrases: voice.phrases,
      sample: voice.sample,
      avgSentenceWords: voice.avgSentenceWords,
    },
    recentEntries: recent,
  };
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

const WIN: Record<SelfId, (c: CouncilClaim, nums: string) => string> = {
  builder: (c, nums) => `First things first: you did "${c.step}" ${nums}. I'm still proud of that.`,
  keeper: (c, nums) => `I saw you did "${c.step}" ${nums}. That made me smile.`,
  elder: (c, nums) => `You did "${c.step}" ${nums}. Little things like that add up to a life.`,
};

const QUESTION: Record<SelfId, string> = {
  builder: "What's the smallest next step?",
  keeper: "Who could do it with you?",
  elder: "Could you make it gentler, so it's easier to start?",
};

function growLine(self: SelfId, c: CouncilClaim, nums: string): string {
  if (c.status === "close") return `"${c.step}" is at ${nums}. You're so close. ${QUESTION[self]}`;
  if (c.status === "behind") return `"${c.step}" is at ${nums}, and that's okay. ${QUESTION[self]}`;
  return `I haven't seen "${c.step}" yet. ${QUESTION[self]}`;
}

const PERSPECTIVE: Record<SelfId, string> = {
  builder:
    "Me-in-five-years will say slow down and call someone you love. Fair. But your work matters too, and big dreams are allowed.",
  keeper:
    "Me-next-year is excited about what you're building. So am I. Just remember the people around you are part of the dream.",
  elder:
    "The other two sound so serious. Here's what I know: the days you rested and laughed are the ones I remember best.",
};

const EMPTY_LINE: Record<Value, string> = {
  ambition:
    "You haven't written a dream about growth yet. Is there something you'd love to learn or make? I'd love to see you try.",
  connection:
    "You haven't written a dream about your people yet. Maybe one call, one dinner, one letter? They matter more than you think.",
  peace:
    "You haven't written a dream about rest or health yet. Even one gentle habit would make me very happy.",
};

function numbers(c: CouncilClaim): string {
  return `${fmt(c.actual)} of ${fmt(c.target)} ${c.window}`;
}

/** Warm, offline letters built only from the context. Used when no AI service is set up. */
export function fallbackLetters(ctx: CouncilContext): { selfId: SelfId; text: string }[] {
  const year = Number(ctx.today.slice(0, 4));
  return SELVES.map((self) => {
    const mine = ctx.claims.filter((c) => c.value === self.value);
    const win = mine.find((c) => c.status === "met");
    const grow = mine
      .filter((c) => c.status !== "met")
      .sort((a, b) => a.actual / a.target - b.actual / b.target || (a.step < b.step ? -1 : 1))[0];

    let body: string;
    if (!win && !grow) {
      body = EMPTY_LINE[self.value];
    } else {
      body = [
        win ? WIN[self.id](win, numbers(win)) : "",
        grow
          ? `${grow.dream ? `As for your dream "${grow.dream}", ` : ""}${growLine(self.id, grow, numbers(grow))}`
          : "",
      ]
        .filter(Boolean)
        .join(" ");
    }

    // Each self picks up one stitched finding that suits what it looks after.
    const pattern =
      self.id === "elder"
        ? ctx.patterns.find((p) => p.sources.includes("Weather") || p.sources.includes("Moon"))
        : self.id === "builder"
          ? ctx.patterns.find((p) => p.sources.includes("Little steps"))
          : undefined;
    const patternLine = pattern
      ? `\n\nHere's something I noticed: ${pattern.headline}. Use that.`
      : "";
    const moonLine =
      self.id === "keeper" && ctx.moon.name
        ? `\n\nTonight is a ${ctx.moon.name.toLowerCase()}. Maybe a good night to call someone.`
        : "";

    const word = ctx.voice.phrases[0] ?? ctx.voice.favoriteWords[0];
    const voice = word ? `\n\nYou keep writing "${word}". I still say that sometimes.` : "";
    const away = self.years === 1 ? "one year" : self.years === 5 ? "five years" : "twenty years";
    return {
      selfId: self.id,
      text:
        `Dear you,\n\n` +
        `It's me, from ${away} away. ${body}` +
        patternLine +
        moonLine +
        `\n\n${PERSPECTIVE[self.id]}` +
        voice +
        `\n\nWith love,\nMe, ${year + self.years}`,
    };
  });
}
