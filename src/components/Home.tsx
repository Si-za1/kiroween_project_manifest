import { useState } from "react";
import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { formatLong, relativeDay } from "../lib/dates.ts";
import { streak } from "../lib/stats.ts";
import { weatherKind, WEATHER_LABEL } from "../lib/weather.ts";
import { Icon } from "./Icons.tsx";
import type { UiIcon } from "./Icons.tsx";
import { Sticker, Tape } from "./Doodles.tsx";
import type { StickerKind } from "./Doodles.tsx";
import { JournalingGirl } from "./Illustration.tsx";
import { greeting, weatherIcon } from "./ui.tsx";
import { VideoModal } from "./VideoModal.tsx";
import type { View } from "./ui.tsx";

interface Props {
  app: AppApi;
  model: Model;
  today: string;
  goTo: (v: View) => void;
}

const TILES: {
  view: View;
  icon: UiIcon;
  title: string;
  body: string;
  tint: string;
  sticker: StickerKind;
}[] = [
  {
    view: "dreams",
    icon: "star",
    title: "My Dreams",
    body: "Write what you want, by when, and why. Break it into little steps.",
    tint: "blush",
    sticker: "star",
  },
  {
    view: "journal",
    icon: "book",
    title: "Journal",
    body: "A daily card, a quiet page, and today's steps. Type it or say it.",
    tint: "sand",
    sticker: "flower",
  },
  {
    view: "progress",
    icon: "chart",
    title: "Progress",
    body: "Your timeline, your habits, your mood, and what the sky has to do with it.",
    tint: "navy",
    sticker: "cloud",
  },
  {
    view: "letters",
    icon: "envelope",
    title: "Future Me",
    body: "Letters from you in 1, 5, and 20 years, written from your real progress.",
    tint: "mauve",
    sticker: "heart",
  },
];

export function Home({ app, model, today, goTo }: Props) {
  const { state } = app;
  const isNew = state.goals.length === 0 && state.entries.length === 0;
  const done = model.results.filter((r) => r.status === "met").length;
  const nextDream = state.goals
    .filter((g) => !g.archived && g.byDate && g.byDate >= today)
    .sort((a, b) => (a.byDate < b.byDate ? -1 : 1))[0];
  const days = streak(state.entries, today);
  const ev = state.evidence;
  const [watching, setWatching] = useState(false);
  const watchButton = (
    <button type="button" className="btn btn-ghost btn-watch" onClick={() => setWatching(true)}>
      <span className="play-dot" aria-hidden="true">
        <Icon name="play" size={12} />
      </span>
      Watch the demo
    </button>
  );

  const stitches: { icon: UiIcon; label: string; on: boolean }[] = [
    { icon: "book", label: "Journal", on: true },
    {
      icon: ev.weatherPlace ? weatherIcon(model.weatherToday?.code ?? 0) : "sun",
      label: "Weather",
      on: Boolean(ev.weatherPlace),
    },
    { icon: "moon", label: "Moon", on: true },
    { icon: "calendar", label: "Calendar", on: ev.events.length > 0 },
    { icon: "spark", label: "GitHub", on: Boolean(ev.githubUser) },
    { icon: "sparkles", label: "AI", on: true },
    { icon: "mic", label: "Voice", on: true },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">
            {greeting()} · {formatLong(today)}
          </p>
          <p className="hero-dear">Dear me,</p>
          <h1 className="hero-title">
            write it down,
            <br />
            <em className="hero-accent">watch it bloom.</em>
          </h1>
          <p className="lede">
            A little journal for the life you're dreaming of. Turn wishes into tiny daily steps, let
            the sky and the moon keep you company, and get letters back from future you.
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
                {watchButton}
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary" onClick={() => goTo("journal")}>
                  Write today's page
                </button>
                <button type="button" className="btn btn-soft" onClick={() => goTo("progress")}>
                  See my progress
                </button>
                {watchButton}
              </>
            )}
          </div>

          <ul className="hero-stats" aria-label="Today at a glance">
            <li>
              <Icon name="moon" size={16} />
              <span>{model.moon.name}</span>
            </li>
            {model.weatherToday ? (
              <li>
                <Icon name={weatherIcon(model.weatherToday.code)} size={16} />
                <span>
                  {WEATHER_LABEL[weatherKind(model.weatherToday.code)]}
                  {model.weatherToday.tempC !== null ? ` ${model.weatherToday.tempC}°` : ""}
                  {ev.weatherPlace ? ` in ${ev.weatherPlace.name}` : ""}
                </span>
              </li>
            ) : null}
            {!isNew ? (
              <>
                <li>
                  <Icon name="flame" size={16} />
                  <span>
                    <strong>{days}</strong> {days === 1 ? "day" : "days"} in a row
                  </span>
                </li>
                <li>
                  <Icon name="check" size={16} />
                  <span>
                    <strong>
                      {done}/{model.results.length}
                    </strong>{" "}
                    steps on track
                  </span>
                </li>
                {nextDream ? (
                  <li>
                    <Icon name="star" size={16} />
                    <span>
                      Next dream <strong>{relativeDay(nextDream.byDate, today)}</strong>
                    </span>
                  </li>
                ) : null}
              </>
            ) : null}
          </ul>
        </div>
        <div className="hero-art">
          <figure className="polaroid">
            <Tape variant="check" className="tape-top" />
            <div className="polaroid-photo">
              <JournalingGirl />
            </div>
            <figcaption>me, on a slow sunday ♡</figcaption>
          </figure>
          <Sticker kind="heart" size={46} className="float-a" style={{ top: "4%", left: "-2%" }} />
          <Sticker
            kind="sparkle"
            size={36}
            className="float-b"
            style={{ top: "-3%", right: "14%" }}
          />
          <Sticker
            kind="flower"
            size={50}
            className="float-c"
            style={{ bottom: "16%", right: "-3%" }}
          />
          <Sticker
            kind="star"
            size={40}
            className="float-b"
            style={{ bottom: "8%", left: "-3%" }}
          />
          <Sticker kind="bow" size={44} className="float-a" style={{ top: "38%", right: "-5%" }} />
        </div>
      </section>

      <section className="tiles" aria-label="What's inside">
        {TILES.map((t, i) => (
          <button
            key={t.view}
            type="button"
            className={`tile tint-${t.tint}`}
            onClick={() => goTo(t.view)}
          >
            <Tape variant={i % 2 ? "dots" : "pink"} className="tape-top" />
            <span className="tile-top">
              <span className="tile-icon">
                <Icon name={t.icon} size={20} />
              </span>
              <Sticker kind={t.sticker} size={34} className="tile-sticker" />
            </span>
            <span className="tile-title">{t.title}</span>
            <span className="tile-body">{t.body}</span>
            <span className="tile-go">
              Open <Icon name="chevron-right" size={14} />
            </span>
          </button>
        ))}
      </section>

      <section className="stitch-strip paper" aria-label="What Dearly is stitched from">
        <div className="stitch-copy">
          <p className="kicker">Stitched together</p>
          <h2 className="stitch-title">
            Seven tiny pieces, <em>one sweet journal.</em>
          </h2>
          <p className="muted small">
            Your words, the weather, the moon, your calendar, your code, an AI, and your voice. Each
            piece makes the others smarter.
          </p>
          <button type="button" className="link" onClick={() => goTo("connections")}>
            See how it's stitched <Icon name="chevron-right" size={14} />
          </button>
        </div>
        <ol className="stitch-chain">
          {stitches.map((s) => (
            <li key={s.label} className={`stitch-node${s.on ? " is-on" : ""}`}>
              <span className="stitch-icon">
                <Icon name={s.icon} size={18} />
              </span>
              <span className="stitch-label">{s.label}</span>
            </li>
          ))}
        </ol>
      </section>

      {watching ? <VideoModal onClose={() => setWatching(false)} /> : null}
    </div>
  );
}
