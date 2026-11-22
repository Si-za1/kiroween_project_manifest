import { useState } from "react";
import { addGoal, deleteGoal, setGoalValue, updateClaim } from "../data/actions.ts";
import type { ClaimPatch } from "../data/actions.ts";
import type { AppApi } from "../data/useApp.ts";
import { suggestClaim } from "../lib/api.ts";
import { draftFromGoal, isPeriod, isSource, isValue, validateClaim } from "../lib/claims.ts";
import { PERIODS, SOURCES, VALUES } from "../lib/types.ts";
import type { Claim, Goal } from "../lib/types.ts";
import { SOURCE_LABEL, VALUE_LABEL } from "./ui.tsx";

function ClaimEditor({ claim, onChange }: { claim: Claim; onChange: (p: ClaimPatch) => void }) {
  const [targetText, setTargetText] = useState(String(claim.target));
  const [error, setError] = useState("");

  function confirm() {
    if (claim.confirmed) {
      onChange({ confirmed: false });
      return;
    }
    if (!validateClaim({ ...claim, confirmed: true })) {
      setError("Check the metric and target. The target must be above zero.");
      return;
    }
    setError("");
    onChange({ confirmed: true });
  }

  return (
    <div className={`claim${claim.confirmed ? " is-confirmed" : ""}`}>
      <div className="claim-grid">
        <label className="field">
          <span className="field-label">What is measured</span>
          <input
            className="input"
            value={claim.metric}
            maxLength={80}
            onChange={(e) => onChange({ metric: e.target.value })}
          />
        </label>
        <label className="field field-narrow">
          <span className="field-label">Target</span>
          <input
            className="input"
            inputMode="decimal"
            value={targetText}
            onChange={(e) => {
              setTargetText(e.target.value);
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n > 0 && n <= 10_000) onChange({ target: n });
            }}
          />
        </label>
        <label className="field field-narrow">
          <span className="field-label">Per</span>
          <select
            className="input"
            value={claim.period}
            onChange={(e) => isPeriod(e.target.value) && onChange({ period: e.target.value })}
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p === "day" ? "day" : p === "week" ? "7 days" : "30 days"}
              </option>
            ))}
          </select>
        </label>
        <label className="field field-narrow">
          <span className="field-label">Evidence</span>
          <select
            className="input"
            value={claim.source}
            onChange={(e) => isSource(e.target.value) && onChange({ source: e.target.value })}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field field-narrow">
          <span className="field-label">Keyword</span>
          <input
            className="input"
            value={claim.keyword}
            maxLength={40}
            onChange={(e) => onChange({ keyword: e.target.value.toLowerCase() })}
          />
        </label>
      </div>
      <div className="claim-actions">
        <button
          type="button"
          className={`btn ${claim.confirmed ? "btn-ghost" : "btn-primary"}`}
          onClick={confirm}
        >
          {claim.confirmed ? "Confirmed · tap to edit" : "Confirm claim"}
        </button>
        {error ? <span className="error">{error}</span> : null}
      </div>
    </div>
  );
}

function GoalCard({ app, goal }: { app: AppApi; goal: Goal }) {
  const claims = app.state.claims.filter((c) => c.goalId === goal.id);
  return (
    <li className="goal stitched">
      <div className="goal-head">
        <p className="goal-text">{goal.text}</p>
        <button
          type="button"
          className="link danger"
          onClick={() => {
            if (window.confirm("Delete this goal and its claims?")) {
              app.update((s) => deleteGoal(s, goal.id));
            }
          }}
        >
          Delete
        </button>
      </div>
      <label className="field field-inline">
        <span className="field-label">Matters most to your</span>
        <select
          className="input"
          value={goal.value}
          onChange={(e) =>
            isValue(e.target.value) &&
            app.update((s) => setGoalValue(s, goal.id, e.target.value as Goal["value"]))
          }
        >
          {VALUES.map((v) => (
            <option key={v} value={v}>
              {VALUE_LABEL[v]}
              {v === "ambition"
                ? " (The Builder)"
                : v === "connection"
                  ? " (The Keeper)"
                  : " (The Elder)"}
            </option>
          ))}
        </select>
      </label>
      {claims.map((c) => (
        <ClaimEditor
          key={c.id}
          claim={c}
          onChange={(patch) => app.update((s) => updateClaim(s, c.id, patch))}
        />
      ))}
    </li>
  );
}

export function CharterView({ app }: { app: AppApi }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function stitch() {
    const goal = text.trim();
    if (!goal || busy) return;
    setBusy(true);
    setNotice("");
    const ai = await suggestClaim(goal);
    const draft = ai ?? draftFromGoal(goal);
    app.update((s) => addGoal(s, goal, draft, new Date()));
    setNotice(
      ai
        ? "Suggested by AI. Review the claim below, then confirm it."
        : "Drafted on your device. Review the claim below, then confirm it.",
    );
    setText("");
    setBusy(false);
  }

  const goals = app.state.goals.filter((g) => !g.archived);

  return (
    <div>
      <p className="kicker">Step one</p>
      <h1 className="page-title">Your Charter</h1>
      <p className="lede">
        Write a goal in your own words. It becomes a claim you can check: a number, a window of
        time, and where the evidence comes from. You stay in charge. Nothing counts until you
        confirm it.
      </p>

      <div className="goal-form stitched">
        <label className="field-label" htmlFor="goal-text">
          A goal
        </label>
        <div className="goal-input-row">
          <input
            id="goal-text"
            className="input input-lg"
            maxLength={280}
            placeholder="e.g. Work out 3 times a week"
            value={text}
            disabled={busy}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void stitch();
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!text.trim() || busy}
            onClick={() => void stitch()}
          >
            {busy ? "Stitching…" : "Stitch it"}
          </button>
        </div>
        {notice ? (
          <p className="muted small" role="status">
            {notice}
          </p>
        ) : null}
      </div>

      {goals.length === 0 ? (
        <p className="muted">
          No goals yet. Try “Call a friend every week” or “Ship 5 commits a week”.
        </p>
      ) : (
        <ul className="goals">
          {goals.map((g) => (
            <GoalCard key={g.id} app={app} goal={g} />
          ))}
        </ul>
      )}
    </div>
  );
}
