import { useEffect, useRef, useState } from "react";
import { addEntry, setCheckIn } from "../data/actions.ts";
import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { formatLong } from "../lib/dates.ts";
import { moonFor, moonRitual } from "../lib/moon.ts";
import { windowPhrase } from "../lib/score.ts";
import { appendDictation, canListen, listen } from "../lib/speech.ts";
import { weatherKind, WEATHER_LABEL } from "../lib/weather.ts";
import { Icon, MoodFace } from "./Icons.tsx";
import { TarotCard } from "./TarotCard.tsx";
import { fmt, Section, weatherIcon } from "./ui.tsx";
import type { View } from "./ui.tsx";

const MOODS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: "Heavy" },
  { value: 2, label: "Low" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Glowing" },
];

interface Props {
  app: AppApi;
  model: Model;
  today: string;
  goTo: (v: View) => void;
}

export function JournalView({ app, model, today, goTo }: Props) {
  const { state } = app;
  const [text, setText] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [saved, setSaved] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState("");
  const stopRef = useRef<(() => void) | null>(null);
  const weather = app.state.evidence.weatherDays;
  const place = app.state.evidence.weatherPlace;

  useEffect(() => () => stopRef.current?.(), []);

  function toggleVoice() {
    if (listening) {
      stopRef.current?.();
      return;
    }
    setVoiceMsg("");
    setListening(true);
    stopRef.current = listen(
      (spoken) => {
        setText((t) => appendDictation(t, spoken));
        setSaved(false);
      },
      () => {
        setListening(false);
        stopRef.current = null;
      },
      setVoiceMsg,
    );
  }
  const goalText = new Map(state.goals.map((g) => [g.id, g] as const));
  const pages = [...state.entries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  function save() {
    const clean = text.trim();
    if (!clean) return;
    app.update((s) =>
      addEntry(s, { date: today, card: model.card, text: clean, mood }, new Date()),
    );
    setText("");
    setSaved(true);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="kicker">{formatLong(today)}</p>
          <h1 className="page-title">Journal</h1>
        </div>
      </div>

      <div className="journal-grid">
        <TarotCard card={model.card} moon={model.moon} />

        <div className="diary paper">
          <div className="sky-line">
            <span>
              <Icon name="moon" size={15} /> {moonRitual(model.moon)}
            </span>
            {model.weatherToday ? (
              <span>
                <Icon name={weatherIcon(model.weatherToday.code)} size={15} />{" "}
                {WEATHER_LABEL[weatherKind(model.weatherToday.code)]}
                {model.weatherToday.tempC !== null ? ` ${model.weatherToday.tempC}°` : ""}
                {place ? ` in ${place.name}` : ""}
              </span>
            ) : (
              <button type="button" className="link small" onClick={() => goTo("connections")}>
                <Icon name="sun" size={15} /> Add your weather
              </button>
            )}
          </div>
          <p className="hand diary-hello">Dear diary,</p>
          <label className="sr-only" htmlFor="entry-text">
            Today's page
          </label>
          <textarea
            id="entry-text"
            className="diary-text lined"
            rows={8}
            maxLength={2000}
            placeholder="Start with the card's question, or write whatever is on your mind…"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSaved(false);
            }}
          />
          <div className="diary-foot">
            <div className="moods" role="group" aria-label="How do you feel today?">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`mood mood-${m.value}${mood === m.value ? " is-active" : ""}`}
                  aria-pressed={mood === m.value}
                  title={m.label}
                  onClick={() => setMood(m.value)}
                >
                  <MoodFace mood={m.value} size={26} />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
            <div className="diary-actions">
              {canListen() ? (
                <button
                  type="button"
                  className={`mic${listening ? " is-on" : ""}`}
                  aria-pressed={listening}
                  aria-label={listening ? "Stop voice typing" : "Speak your page"}
                  title={listening ? "Stop" : "Speak your page"}
                  onClick={toggleVoice}
                >
                  <Icon name={listening ? "stop" : "mic"} size={18} />
                  {listening ? <span>Listening…</span> : null}
                </button>
              ) : null}
              {saved ? (
                <span className="saved" role="status">
                  <Icon name="check" size={16} /> Saved to your journal
                </span>
              ) : null}
              <button
                type="button"
                className="btn btn-primary"
                disabled={!text.trim()}
                onClick={save}
              >
                Save page
              </button>
            </div>
          </div>
          {voiceMsg ? (
            <p className="small muted" role="status">
              {voiceMsg}
            </p>
          ) : null}
        </div>
      </div>

      <Section title="Today's little steps" kicker="Tick off what you did">
        {model.results.length === 0 ? (
          <p className="muted">
            No steps yet.{" "}
            <button type="button" className="link" onClick={() => goTo("dreams")}>
              Add a dream with a little step
            </button>{" "}
            and it shows up here.
          </p>
        ) : (
          <ul className="today-steps">
            {model.results.map((r) => {
              const amount =
                state.checkins.find((c) => c.claimId === r.claim.id && c.date === today)?.amount ??
                0;
              const goal = goalText.get(r.claim.goalId);
              return (
                <li
                  key={r.claim.id}
                  className={`today-step tint-${goal?.tint ?? "blush"}${amount > 0 ? " is-done" : ""}`}
                >
                  <button
                    type="button"
                    className="tick"
                    aria-pressed={amount > 0}
                    aria-label={
                      amount > 0 ? `Undo ${r.claim.metric}` : `Mark ${r.claim.metric} done`
                    }
                    onClick={() =>
                      app.update((s) => setCheckIn(s, r.claim.id, today, amount > 0 ? 0 : 1))
                    }
                  >
                    {amount > 0 ? <Icon name="check" size={16} /> : null}
                  </button>
                  <div className="today-step-text">
                    <p className="today-step-name">{r.claim.metric}</p>
                    <p className="muted small">
                      {fmt(r.actual)} of {fmt(r.target)} {windowPhrase(r.claim.period)} ·{" "}
                      {goal?.text}
                    </p>
                  </div>
                  {amount > 0 ? (
                    <div
                      className="stepper"
                      role="group"
                      aria-label={`How many times: ${r.claim.metric}`}
                    >
                      <button
                        type="button"
                        className="step-btn"
                        aria-label="One less"
                        onClick={() =>
                          app.update((s) => setCheckIn(s, r.claim.id, today, amount - 1))
                        }
                      >
                        −
                      </button>
                      <span className="step-value">{fmt(amount)}</span>
                      <button
                        type="button"
                        className="step-btn"
                        aria-label="One more"
                        onClick={() =>
                          app.update((s) => setCheckIn(s, r.claim.id, today, amount + 1))
                        }
                      >
                        +
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Past pages" kicker="Your story so far">
        {pages.length === 0 ? (
          <p className="muted">Your saved pages will appear here.</p>
        ) : (
          <ol className="pages">
            {pages.map((e) => (
              <li key={e.id} className="page-card paper">
                <div className="page-meta">
                  <span className="page-date">{formatLong(e.date)}</span>
                  <span className="page-sky">
                    {weather[e.date] ? (
                      <span title={WEATHER_LABEL[weatherKind(weather[e.date]?.code ?? 0)]}>
                        <Icon name={weatherIcon(weather[e.date]?.code ?? 0)} size={15} />
                      </span>
                    ) : null}
                    <span title={moonFor(e.date).name}>
                      <Icon name="moon" size={14} />
                    </span>
                  </span>
                  <span className={`page-mood mood-${e.mood}`}>
                    <MoodFace mood={e.mood} size={20} />
                  </span>
                </div>
                <p className="page-prompt">
                  {e.cardTitle} · {e.prompt}
                </p>
                <p className="page-text">{e.text}</p>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}
