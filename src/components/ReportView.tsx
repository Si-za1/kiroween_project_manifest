import { useState } from "react";
import type { ChangeEvent } from "react";
import { setEvents, setGithub } from "../data/actions.ts";
import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { fetchGithubDays } from "../lib/api.ts";
import { formatShort } from "../lib/dates.ts";
import { parseICS } from "../lib/ics.ts";
import { periodLabel } from "../lib/score.ts";
import { Meter, Section, SOURCE_LABEL, StatusChip, VALUE_LABEL } from "./ui.tsx";
import type { View } from "./ui.tsx";

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function ReportView({
  app,
  model,
  goTo,
}: {
  app: AppApi;
  model: Model;
  goTo: (v: View) => void;
}) {
  const { evidence } = app.state;
  const [user, setUser] = useState(evidence.githubUser);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [icsMessage, setIcsMessage] = useState("");

  async function sync() {
    const name = user.trim();
    if (!name || syncing) return;
    setSyncing(true);
    setMessage("");
    const res = await fetchGithubDays(name);
    if (res.ok) {
      app.update((s) => setGithub(s, name, res.days, new Date()));
      setMessage(`Synced ${Object.keys(res.days).length} days of public activity.`);
    } else {
      setMessage(res.message);
    }
    setSyncing(false);
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2_000_000) {
      setIcsMessage("That file is over 2 MB. Export a shorter date range and try again.");
      return;
    }
    const events = parseICS(await file.text());
    app.update((s) => setEvents(s, events));
    setIcsMessage(
      events.length === 0
        ? "No events were found in that file."
        : `Imported ${events.length} events.`,
    );
  }

  const { results, conflicts } = model;

  return (
    <div>
      <p className="kicker">The nightly run</p>
      <h1 className="page-title">Report</h1>
      <p className="lede">
        Each confirmed claim is checked against your evidence over a rolling window. This is not a
        verdict. It is a mirror.
      </p>

      <Section title="Your claims">
        {results.length === 0 ? (
          <p className="muted">
            Nothing to check yet.{" "}
            <button type="button" className="link" onClick={() => goTo("charter")}>
              Confirm a claim in your Charter
            </button>
            .
          </p>
        ) : (
          <ul className="results">
            {results.map((r) => (
              <li key={r.claim.id} className="result stitched">
                <div className="result-head">
                  <div>
                    <p className="result-name">{r.claim.metric}</p>
                    <p className="muted small">
                      {SOURCE_LABEL[r.claim.source]} · {periodLabel(r.claim.period)} ·{" "}
                      {VALUE_LABEL[r.value]}
                    </p>
                  </div>
                  <StatusChip status={r.status} />
                </div>
                <Meter value={r.score} status={r.status} />
                <p className="result-nums">
                  <strong>{fmt(r.actual)}</strong> of {fmt(r.target)}
                  {r.claim.source !== "checkin" ? (
                    <span className="muted"> · you reported {fmt(r.selfReported)}</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Merge conflicts" kicker="Where words and actions disagree">
        {conflicts.length === 0 ? (
          <p className="muted">No conflicts right now. What you say and what you do line up.</p>
        ) : (
          <ul className="conflicts">
            {conflicts.map((c) => (
              <li key={c.id} className="conflict">
                <p className="conflict-title">{c.title}</p>
                <p>{c.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Evidence" kicker="Optional sources">
        <div className="evidence">
          <div className="evidence-card stitched">
            <h3>GitHub activity</h3>
            <p className="muted small">
              Counts commits you pushed publicly in the last 90 days or so. Enter a username. No
              login is needed.
            </p>
            <div className="goal-input-row">
              <input
                className="input"
                placeholder="github username"
                value={user}
                maxLength={39}
                onChange={(e) => setUser(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void sync();
                }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                disabled={!user.trim() || syncing}
                onClick={() => void sync()}
              >
                {syncing ? "Syncing…" : "Sync"}
              </button>
            </div>
            {message ? (
              <p className="muted small" role="status">
                {message}
              </p>
            ) : null}
            {evidence.githubSyncedAt ? (
              <p className="muted small">
                {evidence.githubUser}: {Object.keys(evidence.githubDays).length} days loaded
              </p>
            ) : null}
          </div>

          <div className="evidence-card stitched">
            <h3>Calendar file</h3>
            <p className="muted small">
              Export a calendar as .ics from Google Calendar or Outlook and upload it. The file is
              read in your browser and never uploaded. Claims count events whose title contains the
              keyword.
            </p>
            <input
              className="file"
              type="file"
              accept=".ics,text/calendar"
              aria-label="Upload a calendar .ics file"
              onChange={(e) => void onFile(e)}
            />
            {icsMessage ? (
              <p className="muted small" role="status">
                {icsMessage}
              </p>
            ) : null}
            {evidence.events.length > 0 ? (
              <p className="muted small">
                {evidence.events.length} events loaded
                {(() => {
                  const last = [...evidence.events].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
                  return last ? `, latest on ${formatShort(last.date)}` : "";
                })()}
              </p>
            ) : null}
          </div>
        </div>
      </Section>
    </div>
  );
}
