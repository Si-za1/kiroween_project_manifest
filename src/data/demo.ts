import { addDays } from "../lib/dates.ts";
import { shortHash } from "../lib/ids.ts";
import type { AppState, Entry, Goal, Claim, CheckIn, ISODate } from "../lib/types.ts";

export const DEMO_PERSONA = "Maya";

/**
 * A pre-filled persona so anyone can explore the app with no setup. All dates are relative to
 * today, so the report always looks alive. It is designed to show one honest conflict:
 * "workout" appears in the journal often, but check-ins and evidence say otherwise.
 */
export function createDemoState(today: ISODate): AppState {
  const day = (back: number): ISODate => addDays(today, -back);
  const iso = (back: number, hour = 21): string =>
    `${day(back)}T${String(hour).padStart(2, "0")}:00:00.000Z`;

  const goals: Goal[] = [
    {
      id: "g_ship",
      text: "Ship my side project, 5 commits a week",
      value: "ambition",
      createdAt: iso(20),
      archived: false,
    },
    {
      id: "g_move",
      text: "Work out 3 times a week",
      value: "peace",
      createdAt: iso(20),
      archived: false,
    },
    {
      id: "g_mom",
      text: "Call mom every Sunday",
      value: "connection",
      createdAt: iso(20),
      archived: false,
    },
    {
      id: "g_deep",
      text: "Protect 4 deep work blocks a week",
      value: "ambition",
      createdAt: iso(20),
      archived: false,
    },
  ];

  const claims: Claim[] = [
    {
      id: "c_ship",
      goalId: "g_ship",
      metric: "commits",
      target: 5,
      period: "week",
      source: "github",
      keyword: "commit",
      confirmed: true,
    },
    {
      id: "c_move",
      goalId: "g_move",
      metric: "workouts",
      target: 3,
      period: "week",
      source: "checkin",
      keyword: "workout",
      confirmed: true,
    },
    {
      id: "c_mom",
      goalId: "g_mom",
      metric: "calls with mom",
      target: 1,
      period: "week",
      source: "checkin",
      keyword: "mom",
      confirmed: true,
    },
    {
      id: "c_deep",
      goalId: "g_deep",
      metric: "deep work blocks",
      target: 4,
      period: "week",
      source: "calendar",
      keyword: "deep work",
      confirmed: true,
    },
  ];

  const githubDays: Record<ISODate, number> = {
    [day(6)]: 0,
    [day(5)]: 1,
    [day(3)]: 1,
    [day(9)]: 4,
    [day(10)]: 3,
  };

  const checkins: CheckIn[] = [
    // Maya reports shipping every day, but GitHub shows 2 commits in 7 days.
    { claimId: "c_ship", date: day(5), amount: 1 },
    { claimId: "c_ship", date: day(4), amount: 1 },
    { claimId: "c_ship", date: day(3), amount: 1 },
    { claimId: "c_ship", date: day(2), amount: 1 },
    { claimId: "c_ship", date: day(1), amount: 1 },
    { claimId: "c_move", date: day(4), amount: 1 },
    { claimId: "c_mom", date: day(2), amount: 1 },
  ];

  const texts: {
    back: number;
    mood: 1 | 2 | 3 | 4 | 5;
    text: string;
    card: [string, string, string];
  }[] = [
    {
      back: 6,
      mood: 3,
      card: ["fork", "The Fork", "Where did you face two paths today?"],
      text: "Slow start. I keep saying I will do a workout in the morning, then the quiet mornings slip by. Small steps, though. I did make coffee and sit with the project for a while.",
    },
    {
      back: 5,
      mood: 4,
      card: ["lightning-rod", "The Lightning Rod", "What gave you energy today?"],
      text: "Good energy after lunch. Small steps worked: one commit, one tiny fix. I told myself the workout can wait until tomorrow.",
    },
    {
      back: 4,
      mood: 4,
      card: ["hotfix", "The Hotfix", "What one small repair would make tomorrow easier?"],
      text: "Finally did a workout. Short, but it counted. The quiet mornings feel better when I move first. Small steps again.",
    },
    {
      back: 3,
      mood: 2,
      card: ["quiet-daemon", "The Quiet Daemon", "What runs in the background of your mind?"],
      text: "Tired. I thought about the workout and the project all day and did neither properly. I worry I say the right things and do the wrong ones.",
    },
    {
      back: 2,
      mood: 5,
      card: ["stash", "The Stash", "What are you holding aside for later?"],
      text: "Called mom. Long and warm. Honestly this is the part of the week that matters most. Small steps toward being someone who shows up.",
    },
    {
      back: 1,
      mood: 3,
      card: ["rebase", "The Rebase", "If you could rewrite how today began?"],
      text: "Planned a workout, skipped it. The quiet mornings are where I decide who I am. I want tomorrow to start differently.",
    },
  ];

  const entries: Entry[] = texts.map((t, i) => ({
    id: `e_demo_${i}`,
    date: day(t.back),
    cardId: t.card[0],
    cardTitle: t.card[1],
    prompt: t.card[2],
    text: t.text,
    mood: t.mood,
    createdAt: iso(t.back),
    hash: shortHash(`${day(t.back)}|${t.text}`),
  }));

  const events = [
    { back: 5, title: "Deep work: side project" },
    { back: 3, title: "Deep work: design" },
    { back: 1, title: "Deep work: writing" },
    { back: 2, title: "Team sync" },
  ].map((e) => ({ date: day(e.back), title: e.title, minutes: 90 }));

  return {
    goals,
    claims,
    entries,
    checkins,
    letters: [],
    evidence: {
      githubUser: "demo-maya",
      githubDays,
      githubSyncedAt: iso(0),
      events,
    },
  };
}
