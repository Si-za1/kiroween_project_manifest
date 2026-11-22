import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { formatLong, relativeDay } from "../lib/dates.ts";
import { streak } from "../lib/stats.ts";
import { Icon } from "./Icons.tsx";
import type { UiIcon } from "./Icons.tsx";
import { JournalingGirl } from "./Illustration.tsx";
import { greeting } from "./ui.tsx";
import type { View } from "./ui.tsx";

interface Props {
  app: AppApi;
  model: Model;
  today: string;
  goTo: (v: View) => void;
}

const TILES: { view: View; icon: UiIcon; title: string; body: string; tint: string }[] = [
  {
    view: "dreams",
    icon: "star",
    title: "My Dreams",
    body: "Write what you want, by when, and why. Break it into little steps.",
    tint: "peach",
  },
  {
    view: "journal",
    icon: "book",
    title: "Journal",
    body: "Pull a card for a gentle prompt, write a few lines, tick off today's steps.",
    tint: "butter",
  },
  {
    view: "progress",
    icon: "chart",
    title: "Progress",
    body: "See your dreams on a timeline, your habits as dots, and your mood over time.",
    tint: "sage",
  },
  {
    view: "letters",
    icon: "envelope",
    title: "Future Me",
    body: "Get letters from you in 1, 5, and 20 years, written from your real progress.",
    tint: "lavender",
  },
];

const STITCHES = [
  "a journal",
  "a dream planner",
  "a habit tracker",
  "tarot cards",
  "letters from future you",
];

export function Home({ app, model, today, goTo }: Props) {
  const { state } = app;
  const isNew = state.goals.length === 0 && state.entries.length === 0;
  const done = model.results.filter((r) => r.status === "met").length;
  const nextDream = state.goals
    .filter((g) => !g.archived && g.byDate && g.byDate >= today)
    .sort((a, b) => (a.byDate < b.byDate ? -1 : 1))[0];
  const days = streak(state.entries, today);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">
            {greeting()} · {formatLong(today)}
          </p>
          <h1 className="hero-title">
            Write it down.
            <br />
            <span className="hero-accent">Watch it grow.</span>
          </h1>
          <p className="lede">
            A cozy journal that turns your dreams into little daily steps, shows how far you've
            come, and lets future you write back.
          </p>
          <div className="cta-row">
            {isNew ? (
              <>
                <button type="button" className="btn btn-primary" onClick={() => goTo("dreams")}>
                  Write my first dream
                </button>
                <button type="button" className="btn btn-soft" onClick={() => app.setDemo(true)}>
                  Peek at a demo
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary" onClick={() => goTo("journal")}>
                  Write today's page
                </button>
                <button type="button" className="btn btn-soft" onClick={() => goTo("progress")}>
                  See my progress
                </button>
              </>
            )}
          </div>

          {!isNew ? (
            <ul className="hero-stats" aria-label="At a glance">
              <li>
                <Icon name="flame" size={18} />
                <span>
                  <strong>{days}</strong> {days === 1 ? "day" : "days"} in a row
                </span>
              </li>
              <li>
                <Icon name="check" size={18} />
                <span>
                  <strong>
                    {done}/{model.results.length}
                  </strong>{" "}
                  steps on track
                </span>
              </li>
              {nextDream ? (
                <li>
                  <Icon name="star" size={18} />
                  <span>
                    Next dream <strong>{relativeDay(nextDream.byDate, today)}</strong>
                  </span>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
        <div className="hero-art">
          <JournalingGirl />
        </div>
      </section>

      <section className="tiles" aria-label="What's inside">
        {TILES.map((t) => (
          <button
            key={t.view}
            type="button"
            className={`tile tint-${t.tint} stitched`}
            onClick={() => goTo(t.view)}
          >
            <span className="tile-icon">
              <Icon name={t.icon} size={22} />
            </span>
            <span className="tile-title">{t.title}</span>
            <span className="tile-body">{t.body}</span>
            <span className="tile-go">
              Open <Icon name="chevron-right" size={14} />
            </span>
          </button>
        ))}
      </section>

      <p className="stitched-together">
        <span className="hand">Stitched together from </span>
        {STITCHES.map((s, i) => (
          <span key={s}>
            <span className="stitch-word">{s}</span>
            {i < STITCHES.length - 2 ? ", " : i === STITCHES.length - 2 ? " and " : "."}
          </span>
        ))}
      </p>
    </div>
  );
}
