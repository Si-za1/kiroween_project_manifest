import { useState } from "react";
import { addEntry, setCheckIn } from "../data/actions.ts";
import type { AppApi } from "../data/useApp.ts";
import type { Model } from "../data/selectors.ts";
import { formatLong } from "../lib/dates.ts";
import { shortHash } from "../lib/ids.ts";
import { periodLabel } from "../lib/score.ts";
import { TarotCard } from "./TarotCard.tsx";
import { Welcome } from "./Welcome.tsx";
import { Section, SOURCE_LABEL } from "./ui.tsx";
import type { View } from "./ui.tsx";

interface Props {
  app: AppApi;
  model: Model;
  today: string;
  goTo: (v: View) => void;
}

const MOODS = ["Heavy", "Low", "Steady", "Bright", "Radiant"] as const;

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function TodayView({ app, model, today, goTo }: Props) {
  const { state } = app;
  const [text, setText] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [committed, setCommitted] = useState<string | null>(null);

  const isBlank = state.goals.length === 0 && state.entries.length === 0;
  if (isBlank) {
    return <Welcome onStart={() => goTo("charter")} onDemo={() => app.setDemo(true)} />;
  }

  const todaysCount = state.entries.filter((e) => e.date === today).length;

  function commit() {
    const clean = text.trim();
    if (!clean) return;
    const now = new Date();
    const hash = shortHash(`${today}|${clean}|${now.toISOString()}`);
    app.update((s) => addEntry(s, { date: today, card: model.card, text: clean, mood }, now));
    setText("");
    setCommitted(hash);
  }

  return (
    <div className="today">
      <p className="kicker">{formatLong(today)}</p>
      <h1 className="page-title">Today&apos;s card</h1>

      <div className="today-grid">
        <TarotCard card={model.card} />

        <div className="entry">
          <label className="field-label" htmlFor="entry-text">
            Your entry
          </label>
          <textarea
            id="entry-text"
            className="textarea"
            rows={7}
            maxLength={2000}
            placeholder="Write a few honest lines. No one is grading this."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setCommitted(null);
            }}
          />

          <fieldset className="moods">
            <legend className="field-label">How does today feel?</legend>
            <div className="mood-row">
              {MOODS.map((label, i) => {
                const value = (i + 1) as 1 | 2 | 3 | 4 | 5;
                return (
                  <button
                    key={label}
                    type="button"
                    className={`mood${mood === value ? " is-active" : ""}`}
                    aria-pressed={mood === value}
                    onClick={() => setMood(value)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="entry-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!text.trim()}
              onClick={commit}
            >
              Commit entry
            </button>
            {committed ? (
              <span className="committed" role="status">
                Committed <code>{committed}</code>
              </span>
            ) : todaysCount > 0 ? (
              <span className="muted">
                {todaysCount} {todaysCount === 1 ? "entry" : "entries"} committed today
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <Section title="Quick check-in" kicker="What did you do today?">
        {model.results.length === 0 ? (
          <p className="muted">
            No confirmed claims yet.{" "}
            <button type="button" className="link" onClick={() => goTo("charter")}>
              Confirm a claim in your Charter
            </button>{" "}
            to track it here.
          </p>
        ) : (
          <ul className="checkins">
            {model.results.map((r) => {
              const todayAmount =
                state.checkins.find((c) => c.claimId === r.claim.id && c.date === today)?.amount ??
                0;
              return (
                <li key={r.claim.id} className="checkin">
                  <div>
                    <p className="checkin-name">{r.claim.metric}</p>
                    <p className="muted small">
                      {fmt(r.actual)} of {fmt(r.target)} · {periodLabel(r.claim.period)} ·{" "}
                      {SOURCE_LABEL[r.claim.source]}
                    </p>
                  </div>
                  <div
                    className="stepper"
                    role="group"
                    aria-label={`Today's count for ${r.claim.metric}`}
                  >
                    <button
                      type="button"
                      className="step-btn"
                      aria-label="Decrease"
                      disabled={todayAmount <= 0}
                      onClick={() =>
                        app.update((s) => setCheckIn(s, r.claim.id, today, todayAmount - 1))
                      }
                    >
                      −
                    </button>
                    <span className="step-value" aria-live="polite">
                      {fmt(todayAmount)}
                    </span>
                    <button
                      type="button"
                      className="step-btn"
                      aria-label="Increase"
                      onClick={() =>
                        app.update((s) => setCheckIn(s, r.claim.id, today, todayAmount + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="muted small">
          This is your own count. For GitHub and calendar claims, the Report compares it with the
          evidence.
        </p>
      </Section>
    </div>
  );
}
