import { useState } from "react";
import type { ClaimPatch } from "../data/actions.ts";
import { isPeriod, isSource } from "../lib/claims.ts";
import type { ClaimResult } from "../lib/score.ts";
import { periodLabel } from "../lib/score.ts";
import { PERIODS, SOURCES } from "../lib/types.ts";
import type { Claim } from "../lib/types.ts";
import { Icon } from "./Icons.tsx";
import { fmt, SOURCE_LABEL, StatusChip } from "./ui.tsx";

interface Props {
  claim: Claim;
  result: ClaimResult | undefined;
  onChange: (patch: ClaimPatch) => void;
  onDelete: () => void;
}

/** One little step on a dream card. Click "Edit" to change the details. */
export function StepRow({ claim, result, onChange, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(String(claim.target));

  return (
    <li className="step-row">
      <div className="step-line">
        <span className="step-dot" aria-hidden="true" />
        <span className="step-text">
          <span className="step-name">{claim.metric}</span>
          <span className="step-meta">
            {fmt(claim.target)}× {periodLabel(claim.period)} ·{" "}
            {SOURCE_LABEL[claim.source].toLowerCase()}
          </span>
        </span>
        {result ? <StatusChip status={result.status} /> : null}
        <button
          type="button"
          className="link small"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Done" : "Edit"}
        </button>
      </div>
      {open ? (
        <div className="step-edit">
          <label className="field">
            <span className="field-label">The step</span>
            <input
              className="input"
              value={claim.metric}
              maxLength={80}
              onChange={(e) => e.target.value.trim() && onChange({ metric: e.target.value })}
            />
          </label>
          <label className="field field-sm">
            <span className="field-label">How many</span>
            <input
              className="input"
              inputMode="decimal"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n > 0 && n <= 10_000) onChange({ target: n });
              }}
            />
          </label>
          <label className="field field-sm">
            <span className="field-label">Every</span>
            <select
              className="input"
              value={claim.period}
              onChange={(e) => isPeriod(e.target.value) && onChange({ period: e.target.value })}
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">How I'll track it</span>
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
          {claim.source === "calendar" ? (
            <label className="field">
              <span className="field-label">Calendar events containing</span>
              <input
                className="input"
                value={claim.keyword}
                maxLength={40}
                onChange={(e) => onChange({ keyword: e.target.value.toLowerCase() })}
              />
            </label>
          ) : null}
          <button type="button" className="link danger small" onClick={onDelete}>
            <Icon name="trash" size={14} /> Remove step
          </button>
        </div>
      ) : null}
    </li>
  );
}
