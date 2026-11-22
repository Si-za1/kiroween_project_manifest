import { useState } from "react";
import { addDream, addStep, deleteDream, deleteStep, updateClaim } from "../data/actions.ts";
import type { DreamInput } from "../data/actions.ts";
import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { suggestClaim } from "../lib/api.ts";
import { draftFromGoal, inferValue } from "../lib/claims.ts";
import type { ClaimDraft } from "../lib/claims.ts";
import {
  addMonths,
  dayOfMonth,
  formatMonthYear,
  formatShort,
  monthGrid,
  relativeDay,
  startOfMonth,
} from "../lib/dates.ts";
import { dreamProgress } from "../lib/score.ts";
import { TINTS, VALUES } from "../lib/types.ts";
import type { Goal, Tint, Value } from "../lib/types.ts";
import { Icon } from "./Icons.tsx";
import { StepRow } from "./Steps.tsx";
import { AREA, Ring } from "./ui.tsx";

const EMPTY: DreamInput = {
  text: "",
  why: "",
  where: "",
  byDate: "",
  tint: "peach",
  value: "ambition",
};

async function draftStep(text: string): Promise<ClaimDraft> {
  return (await suggestClaim(text)) ?? draftFromGoal(text);
}

/** The journal-style page for writing a new dream. */
function Composer({ app, onDone }: { app: AppApi; onDone: () => void }) {
  const [form, setForm] = useState<DreamInput>(EMPTY);
  const [step, setStep] = useState("");
  const [areaTouched, setAreaTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof DreamInput>(key: K, value: DreamInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!form.text.trim() || busy) return;
    setBusy(true);
    const steps = step.trim() ? [await draftStep(step.trim())] : [];
    const value = areaTouched ? form.value : inferValue(`${form.text} ${form.why} ${step}`);
    app.update((s) => addDream(s, { ...form, value }, steps, new Date()));
    setForm(EMPTY);
    setStep("");
    setAreaTouched(false);
    setBusy(false);
    onDone();
  }

  return (
    <div className={`composer paper tint-${form.tint}`}>
      <p className="hand composer-hello">Dear universe, I'm manifesting…</p>
      <input
        id="dream-text"
        className="composer-title"
        placeholder="a cozy little studio of my own"
        maxLength={200}
        value={form.text}
        onChange={(e) => set("text", e.target.value)}
      />

      <div className="composer-grid">
        <label className="field">
          <span className="field-label">
            <Icon name="calendar" size={14} /> By when?
          </span>
          <input
            className="input"
            type="date"
            value={form.byDate}
            onChange={(e) => set("byDate", e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">
            <Icon name="pin" size={14} /> Where will it happen?
          </span>
          <input
            className="input"
            placeholder="optional"
            maxLength={120}
            value={form.where}
            onChange={(e) => set("where", e.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span className="field-label">
          <Icon name="heart" size={14} /> Why does it matter to me?
        </span>
        <textarea
          className="textarea lined"
          rows={3}
          placeholder="Write it like a diary entry. No one else will read it."
          maxLength={1000}
          value={form.why}
          onChange={(e) => set("why", e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">
          <Icon name="step" size={14} /> One little step that gets me there
        </span>
        <input
          className="input"
          placeholder="e.g. Practice 3 times a week"
          maxLength={280}
          value={step}
          onChange={(e) => setStep(e.target.value)}
        />
        <span className="hint">
          We'll turn this into something you can tick off. You can add more later.
        </span>
      </label>

      <div className="composer-foot">
        <div className="chip-picker" role="group" aria-label="Life area">
          {VALUES.map((v: Value) => (
            <button
              key={v}
              type="button"
              className={`pick tint-${AREA[v].tint}${form.value === v && areaTouched ? " is-active" : ""}`}
              aria-pressed={form.value === v && areaTouched}
              onClick={() => {
                set("value", v);
                setAreaTouched(true);
              }}
            >
              {AREA[v].label}
            </button>
          ))}
        </div>
        <div className="swatches" role="group" aria-label="Card color">
          {TINTS.map((t: Tint) => (
            <button
              key={t}
              type="button"
              className={`swatch tint-${t}${form.tint === t ? " is-active" : ""}`}
              aria-label={`${t} color`}
              aria-pressed={form.tint === t}
              onClick={() => set("tint", t)}
            />
          ))}
        </div>
      </div>

      <div className="composer-actions">
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!form.text.trim() || busy}
          onClick={() => void save()}
        >
          {busy ? "Saving…" : "Add to my dreams"}
        </button>
      </div>
    </div>
  );
}

function DreamCard({
  app,
  model,
  goal,
  today,
}: {
  app: AppApi;
  model: Model;
  goal: Goal;
  today: string;
}) {
  const [stepText, setStepText] = useState("");
  const [busy, setBusy] = useState(false);
  const steps = app.state.claims.filter((c) => c.goalId === goal.id);
  const progress = dreamProgress(goal.id, model.results);

  async function add() {
    const text = stepText.trim();
    if (!text || busy) return;
    setBusy(true);
    const draft = await draftStep(text);
    app.update((s) => addStep(s, goal.id, draft));
    setStepText("");
    setBusy(false);
  }

  return (
    <article className={`dream tint-${goal.tint} stitched`}>
      <header className="dream-top">
        <div className="dream-tags">
          <span className="tag tag-plain">{AREA[goal.value].label}</span>
          {goal.byDate ? (
            <span className="tag tag-plain">
              <Icon name="clock" size={13} /> {formatShort(goal.byDate)} ·{" "}
              {relativeDay(goal.byDate, today)}
            </span>
          ) : (
            <span className="tag tag-plain">Someday</span>
          )}
        </div>
        <div className="dream-head">
          <h3 className="dream-title">{goal.text}</h3>
          {progress !== null ? (
            <Ring value={progress} size={50} label="Progress this week" />
          ) : null}
        </div>
        {goal.where ? (
          <p className="dream-where">
            <Icon name="pin" size={13} /> {goal.where}
          </p>
        ) : null}
      </header>

      <div className="dream-body">
        {goal.why ? <p className="dream-why hand">“{goal.why}”</p> : null}

        <p className="mini-label">Little steps</p>
        {steps.length > 0 ? (
          <ul className="steps-list">
            {steps.map((c) => (
              <StepRow
                key={c.id}
                claim={c}
                result={model.results.find((r) => r.claim.id === c.id)}
                onChange={(patch) => app.update((s) => updateClaim(s, c.id, patch))}
                onDelete={() => app.update((s) => deleteStep(s, c.id))}
              />
            ))}
          </ul>
        ) : (
          <p className="muted small">
            No steps yet. What's one small thing you could do each week?
          </p>
        )}

        <div className="add-step">
          <input
            className="input input-quiet"
            placeholder="+ Add a little step"
            maxLength={280}
            value={stepText}
            onChange={(e) => setStepText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void add();
            }}
          />
          {stepText.trim() ? (
            <button
              type="button"
              className="btn btn-small"
              disabled={busy}
              onClick={() => void add()}
            >
              Add
            </button>
          ) : null}
        </div>

        <footer className="dream-foot">
          <button
            type="button"
            className="link danger small"
            onClick={() => {
              if (window.confirm("Let this dream go? Its steps will be removed too.")) {
                app.update((s) => deleteDream(s, goal.id));
              }
            }}
          >
            <Icon name="trash" size={14} /> Let go
          </button>
        </footer>
      </div>
    </article>
  );
}

function CalendarView({ app, today }: { app: AppApi; today: string }) {
  const [month, setMonth] = useState(startOfMonth(today));
  const grid = monthGrid(month);
  const goals = app.state.goals.filter((g) => !g.archived);
  const written = new Set(app.state.entries.map((e) => e.date));
  const tintByGoal = new Map(goals.map((g) => [g.id, g.tint] as const));
  const goalByClaim = new Map(app.state.claims.map((c) => [c.id, c.goalId] as const));
  const ticks = new Map<string, Tint[]>();
  for (const c of app.state.checkins) {
    const tint = tintByGoal.get(goalByClaim.get(c.claimId) ?? "");
    if (tint) ticks.set(c.date, [...(ticks.get(c.date) ?? []), tint]);
  }
  const ym = month.slice(0, 7);
  const upcoming = goals.filter((g) => g.byDate).sort((a, b) => (a.byDate < b.byDate ? -1 : 1));

  return (
    <div className="calendar-wrap">
      <div className="calendar paper">
        <div className="calendar-head">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous month"
            onClick={() => setMonth(addMonths(month, -1))}
          >
            <Icon name="chevron-left" size={18} />
          </button>
          <h3>{formatMonthYear(month)}</h3>
          <button
            type="button"
            className="icon-btn"
            aria-label="Next month"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <Icon name="chevron-right" size={18} />
          </button>
        </div>
        <div className="calendar-grid" role="grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="cal-dow">
              {d}
            </div>
          ))}
          {grid.map((d) => {
            const due = goals.filter((g) => g.byDate === d);
            return (
              <div
                key={d}
                className={`cal-day${d.slice(0, 7) !== ym ? " is-out" : ""}${d === today ? " is-today" : ""}`}
              >
                <span className="cal-num">{dayOfMonth(d)}</span>
                {written.has(d) ? (
                  <span className="cal-written" title="Journal page written" />
                ) : null}
                {ticks.has(d) ? (
                  <span className="cal-ticks" aria-label={`${ticks.get(d)?.length} steps done`}>
                    {(ticks.get(d) ?? []).map((t, i) => (
                      <span key={i} className={`cal-tick tint-${t}`} />
                    ))}
                  </span>
                ) : null}
                {due.map((g) => (
                  <span key={g.id} className={`cal-pill tint-${g.tint}`} title={g.text}>
                    {g.text}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
        <p className="muted small calendar-legend">
          <span className="cal-written inline" /> you wrote in your journal
          <span className="cal-tick inline tint-sage" /> a little step you ticked off
          <span className="cal-pill inline tint-peach">Dream</span> a dream's big day
        </p>
      </div>

      <aside className="upcoming">
        <p className="mini-label">Coming up</p>
        {upcoming.length === 0 ? (
          <p className="muted small">Give a dream a date and it shows up here.</p>
        ) : (
          <ul>
            {upcoming.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  className={`upcoming-item tint-${g.tint}`}
                  onClick={() => setMonth(startOfMonth(g.byDate))}
                >
                  <span className="upcoming-date">{formatShort(g.byDate)}</span>
                  <span className="upcoming-text">{g.text}</span>
                  <span className="upcoming-rel">{relativeDay(g.byDate, today)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

export function DreamsView({ app, model, today }: { app: AppApi; model: Model; today: string }) {
  const goals = app.state.goals.filter((g) => !g.archived);
  const [writing, setWriting] = useState(goals.length === 0);
  const [mode, setMode] = useState<"board" | "calendar">("board");

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="kicker">What you're calling in</p>
          <h1 className="page-title">My Dreams</h1>
        </div>
        <div className="page-actions">
          <div className="segmented" role="group" aria-label="View">
            <button
              type="button"
              className={mode === "board" ? "is-active" : ""}
              aria-pressed={mode === "board"}
              onClick={() => setMode("board")}
            >
              <Icon name="board" size={15} /> Board
            </button>
            <button
              type="button"
              className={mode === "calendar" ? "is-active" : ""}
              aria-pressed={mode === "calendar"}
              onClick={() => setMode("calendar")}
            >
              <Icon name="calendar" size={15} /> Calendar
            </button>
          </div>
          {!writing ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setWriting(true);
                setMode("board");
              }}
            >
              <Icon name="plus" size={16} /> New dream
            </button>
          ) : null}
        </div>
      </div>

      {writing && mode === "board" ? <Composer app={app} onDone={() => setWriting(false)} /> : null}

      {mode === "calendar" ? (
        <CalendarView app={app} today={today} />
      ) : goals.length === 0 && !writing ? (
        <p className="muted">No dreams yet. Tap “New dream” to write your first one.</p>
      ) : (
        <div className="dream-board">
          {goals.map((g) => (
            <DreamCard key={g.id} app={app} model={model} goal={g} today={today} />
          ))}
        </div>
      )}
    </div>
  );
}
