import { addDays } from "../lib/dates.ts";
import { shortHash } from "../lib/ids.ts";
import type { AppState, CheckIn, Claim, Entry, Goal, ISODate } from "../lib/types.ts";

export const DEMO_PERSONA = "Maya";

/**
 * A ready-made journal so anyone can explore the app with no setup. Dates are relative to today, so
 * it always looks current. It is built to show a mix of wins, near misses, and two gentle nudges:
 * Maya writes about running a lot but has only run once, and she ticked off more studio sessions
 * than her calendar shows.
 */
export function createDemoState(today: ISODate): AppState {
  const day = (back: number): ISODate => addDays(today, -back);
  const iso = (back: number, hour = 21): string =>
    `${day(back)}T${String(hour).padStart(2, "0")}:00:00.000Z`;

  const goals: Goal[] = [
    {
      id: "g_shop",
      text: "Open my little pottery shop online",
      why: "I want my hands and my work to finally meet. Every bowl I make feels like a tiny piece of who I am.",
      where: "My corner studio at home",
      byDate: addDays(today, 120),
      tint: "peach",
      value: "ambition",
      createdAt: iso(20),
      archived: false,
    },
    {
      id: "g_run",
      text: "Run my first 10K",
      why: "To feel strong in my own body, and to prove to myself that I can finish things.",
      where: "The river path, early mornings",
      byDate: addDays(today, 200),
      tint: "sage",
      value: "peace",
      createdAt: iso(20),
      archived: false,
    },
    {
      id: "g_family",
      text: "Feel close to my family again",
      why: "Life got busy and I miss them. I want Sunday calls to feel normal, not rare.",
      where: "",
      byDate: "",
      tint: "rose",
      value: "connection",
      createdAt: iso(20),
      archived: false,
    },
    {
      id: "g_sleep",
      text: "Sleep like it's a priority",
      why: "Everything feels easier when I'm rested.",
      where: "",
      byDate: addDays(today, 45),
      tint: "lavender",
      value: "peace",
      createdAt: iso(14),
      archived: false,
    },
  ];

  const claims: Claim[] = [
    {
      id: "c_studio",
      goalId: "g_shop",
      metric: "studio sessions",
      target: 4,
      period: "week",
      source: "calendar",
      keyword: "studio",
      confirmed: true,
    },
    {
      id: "c_list",
      goalId: "g_shop",
      metric: "list a new piece",
      target: 1,
      period: "week",
      source: "checkin",
      keyword: "list",
      confirmed: true,
    },
    {
      id: "c_run",
      goalId: "g_run",
      metric: "runs",
      target: 3,
      period: "week",
      source: "checkin",
      keyword: "run",
      confirmed: true,
    },
    {
      id: "c_mom",
      goalId: "g_family",
      metric: "call mom",
      target: 1,
      period: "week",
      source: "checkin",
      keyword: "mom",
      confirmed: true,
    },
    {
      id: "c_dinner",
      goalId: "g_family",
      metric: "dinner with friends",
      target: 2,
      period: "month",
      source: "checkin",
      keyword: "dinner",
      confirmed: true,
    },
    {
      id: "c_bed",
      goalId: "g_sleep",
      metric: "in bed by 11",
      target: 5,
      period: "week",
      source: "checkin",
      keyword: "bed",
      confirmed: true,
    },
  ];

  const ticks: [string, number[]][] = [
    ["c_studio", [1, 2, 4, 5, 8, 10, 12]], // 4 in the last 7 days, but the calendar shows 2
    ["c_list", [3, 10]],
    ["c_run", [4, 9, 11, 13]],
    ["c_mom", [2, 9]],
    ["c_dinner", [6]],
    ["c_bed", [0, 1, 3, 5, 6, 8, 9, 12]],
  ];
  const checkins: CheckIn[] = ticks.flatMap(([claimId, backs]) =>
    backs.map((b) => ({ claimId, date: day(b), amount: 1 })),
  );

  const pages: {
    back: number;
    mood: 1 | 2 | 3 | 4 | 5;
    card: [string, string, string];
    text: string;
  }[] = [
    {
      back: 12,
      mood: 3,
      card: ["seed", "The Seed", "What have you started that you'd love to see bloom?"],
      text: "Threw three bowls today. One of them is actually good. Small steps, but the shop feels a little more real.",
    },
    {
      back: 10,
      mood: 4,
      card: ["spark", "The Spark", "What gave you energy today?"],
      text: "Listed my first piece! I refreshed the page way too many times. Quiet mornings in the studio are my favorite thing.",
    },
    {
      back: 8,
      mood: 3,
      card: ["crossroads", "The Crossroads", "Where did you choose between two paths today?"],
      text: "I wanted to run this morning, but I stayed in bed. I keep telling myself I'll run tomorrow.",
    },
    {
      back: 6,
      mood: 2,
      card: ["whisper", "The Whisper", "What's been quietly on your mind?"],
      text: "Tired today. I thought about my run and the shop all day and did neither. Sometimes I worry I say the right things and do the wrong ones.",
    },
    {
      back: 4,
      mood: 4,
      card: ["mend", "The Mend", "What one small fix would make tomorrow lighter?"],
      text: "Finally went for a run! Short, slow, and wonderful. Quiet mornings feel better when I move first.",
    },
    {
      back: 3,
      mood: 4,
      card: ["keepsake", "The Keepsake", "What are you saving for later?"],
      text: "Studio day. Glazed six mugs. Small steps again, and I'm proud of them.",
    },
    {
      back: 2,
      mood: 5,
      card: ["sunrise", "The Sunrise", "If tomorrow could begin any way you like?"],
      text: "Called mom. We talked for an hour and laughed so much. This is the part of the week that matters most.",
    },
    {
      back: 1,
      mood: 3,
      card: ["page", "The Blank Page", "If you could start fresh today?"],
      text: "Planned a run, skipped it again. Quiet mornings are where I decide who I am. Tomorrow I want to start differently.",
    },
  ];

  const entries: Entry[] = pages.map((p, i) => ({
    id: `e_demo_${i}`,
    date: day(p.back),
    cardId: p.card[0],
    cardTitle: p.card[1],
    prompt: p.card[2],
    text: p.text,
    mood: p.mood,
    createdAt: iso(p.back),
    hash: shortHash(`${day(p.back)}|${p.text}`),
  }));

  const events = [
    { back: 3, title: "Studio time" },
    { back: 5, title: "Studio time: glazing" },
    { back: 9, title: "Studio time" },
    { back: 2, title: "Call with mom" },
  ].map((e) => ({ date: day(e.back), title: e.title, minutes: 120 }));

  return {
    goals,
    claims,
    entries,
    checkins,
    letters: [],
    evidence: { githubUser: "", githubDays: {}, githubSyncedAt: null, events },
  };
}
