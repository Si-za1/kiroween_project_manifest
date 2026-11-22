import { useState } from "react";
import type { ChangeEvent } from "react";
import { setEvents, setGithub } from "../data/actions.ts";
import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { fetchGithubDays } from "../lib/api.ts";
import {
  addDays,
  dayOfMonth,
  formatMonthYear,
  formatShort,
  lastNDays,
  relativeDay,
  weekdayLetter,
} from "../lib/dates.ts";
import { parseICS } from "../lib/ics.ts";
import { dailyAmounts, dreamProgress } from "../lib/score.ts";
import { averageMood, entriesBetween, moodSeries, streak } from "../lib/stats.ts";
import type { Goal } from "../lib/types.ts";
import { Icon, MoodFace } from "./Icons.tsx";
import type { UiIcon } from "./Icons.tsx";
import { AREA, fmt, Ring, Section, StatusChip } from "./ui.tsx";
import type { View } from "./ui.tsx";

interface Props {
  app: AppApi;
  model: Model;
  today: string;
  goTo: (v: View) => void;
}

function Stat({
  icon,
  value,
  label,
  tint,
}: {
  icon: UiIcon;
  value: string;
  label: string;
  tint: string;
}) {
  return (
    <li className={`stat tint-${tint}`}>
      <span className="stat-icon">
        <Icon name={icon} size={20} />
      </span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </li>
  );
}

/** Dreams placed on a vertical timeline by their target date. */
function Timeline({ goals, model, today }: { goals: Goal[]; model: Model; today: string }) {
  const dated = goals.filter((g) => g.byDate).sort((a, b) => (a.byDate < b.byDate ? -1 : 1));
  const someday = goals.filter((g) => !g.byDate);
  let lastMonth = "";

  return (
    <ol className="timeline">
      <li className="tl-now">
        <span className="tl-dot tl-dot-now" />
        <span className="tl-month">Today · {formatShort(today)}</span>
      </li>
      {dated.map((g) => {
        const month = formatMonthYear(g.byDate);
        const showMonth = month !== lastMonth;
        lastMonth = month;
        const progress = dreamProgress(g.id, model.results);
        return (
          <li key={g.id} className="tl-item">
            {showMonth ? <span className="tl-month">{month}</span> : null}
            <span className={`tl-dot tint-${g.tint}`} />
            <div className={`tl-card tint-${g.tint}`}>
              <div>
                <p className="tl-title">{g.text}</p>
                <p className="muted small">
                  {formatShort(g.byDate)} · {relativeDay(g.byDate, today)} · {AREA[g.value].label}
                </p>
              </div>
              {progress !== null ? (
                <Ring value={progress} size={40} label="Steps this week" />
              ) : null}
            </div>
          </li>
        );
      })}
      {someday.length > 0 ? (
        <li className="tl-item">
          <span className="tl-month">Someday</span>
          <span className="tl-dot tl-dot-open" />
          <div className="tl-someday">
            {someday.map((g) => (
              <span key={g.id} className={`tag tint-${g.tint}`}>
                {g.text}
              </span>
            ))}
          </div>
        </li>
      ) : null}
    </ol>
  );
}

/** A dot for every day in the last two weeks, filled when the step was done. */
function HabitGrid({ app, model, today }: { app: AppApi; model: Model; today: string }) {
  const days = lastNDays(today, 14);
  const tintOf = new Map(app.state.goals.map((g) => [g.id, g.tint] as const));
  return (
    <div className="habit-scroll">
      <table className="habits">
        <thead>
          <tr>
            <th scope="col" className="habit-name-col">
              <span className="sr-only">Step</span>
            </th>
            {days.map((d) => (
              <th key={d} scope="col" className={d === today ? "is-today" : ""}>
                <span className="dow">{weekdayLetter(d)}</span>
                <span className="dom">{dayOfMonth(d)}</span>
              </th>
            ))}
            <th scope="col" className="habit-week-col">
              This week
            </th>
          </tr>
        </thead>
        <tbody>
          {model.results.map((r) => {
            const amounts = dailyAmounts(r.claim, app.state, days);
            return (
              <tr key={r.claim.id}>
                <th scope="row" className="habit-name">
                  {r.claim.metric}
                </th>
                {amounts.map((n, i) => (
                  <td key={days[i]}>
                    <span
                      className={`habit-dot tint-${tintOf.get(r.claim.goalId) ?? "peach"}${n > 0 ? " is-on" : ""}`}
                      title={`${formatShort(days[i] ?? today)}: ${n > 0 ? `done${n > 1 ? ` ×${n}` : ""}` : "not yet"}`}
                    />
                  </td>
                ))}
                <td className="habit-week">
                  <span className="habit-count">
                    {fmt(r.actual)}/{fmt(r.target)}
                  </span>
                  <StatusChip status={r.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MoodChart({ app, today }: { app: AppApi; today: string }) {
  const days = lastNDays(today, 14);
  const series = moodSeries(app.state.entries, days);
  const W = 640;
  const H = 180;
  const pad = 28;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (days.length - 1);
  const y = (m: number) => H - pad - ((m - 1) * (H - pad * 2)) / 4;
  const points = series
    .map((m, i) => (m === null ? null : { x: x(i), y: y(m), m }))
    .filter((p): p is { x: number; y: number; m: number } => p !== null);
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area =
    points.length > 1
      ? `${line} L${points[points.length - 1]?.x.toFixed(1)} ${H - pad} L${points[0]?.x.toFixed(1)} ${H - pad} Z`
      : "";

  if (points.length === 0) {
    return <p className="muted">Save a journal page with a mood and your mood line starts here.</p>;
  }

  return (
    <div className="mood-chart paper">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mood over the last two weeks">
        {[1, 3, 5].map((m) => (
          <line key={m} x1={pad} x2={W - pad} y1={y(m)} y2={y(m)} className="grid-line" />
        ))}
        {area ? <path d={area} className="mood-area" /> : null}
        {line ? <path d={line} className="mood-line" /> : null}
        {points.map((p) => (
          <circle key={p.x} cx={p.x} cy={p.y} r={5} className="mood-point" />
        ))}
        {days.map((d, i) =>
          i % 2 === 1 || i === days.length - 1 ? (
            <text key={d} x={x(i)} y={H - 6} textAnchor="middle" className="axis-label">
              {d === today ? "today" : dayOfMonth(d)}
            </text>
          ) : null,
        )}
      </svg>
      <div className="mood-scale" aria-hidden="true">
        <MoodFace mood={5} size={20} />
        <MoodFace mood={3} size={20} />
        <MoodFace mood={1} size={20} />
      </div>
    </div>
  );
}

function Connect({ app }: { app: AppApi }) {
  const { evidence } = app.state;
  const [user, setUser] = useState(evidence.githubUser);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [icsMsg, setIcsMsg] = useState("");

  async function sync() {
    const name = user.trim();
    if (!name || busy) return;
    setBusy(true);
    setMsg("");
    const res = await fetchGithubDays(name);
    if (res.ok) {
      app.update((s) => setGithub(s, name, res.days, new Date()));
      setMsg(`Connected. Found ${Object.keys(res.days).length} active days.`);
    } else setMsg(res.message);
    setBusy(false);
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2_000_000) {
      setIcsMsg("That file is over 2 MB. Try exporting a shorter date range.");
      return;
    }
    const events = parseICS(await file.text());
    app.update((s) => setEvents(s, events));
    setIcsMsg(
      events.length ? `Added ${events.length} calendar events.` : "No events found in that file.",
    );
  }

  return (
    <div className="connect">
      <div className="connect-card paper">
        <h3>
          <Icon name="calendar" size={18} /> Your calendar
        </h3>
        <p className="muted small">
          Export your calendar as an <strong>.ics</strong> file (in Google Calendar, go to Settings,
          then Import & export) and add it here. Steps tracked "from my calendar" count matching
          events. The file stays on your device.
        </p>
        <input
          className="file"
          type="file"
          accept=".ics,text/calendar"
          aria-label="Add a calendar file"
          onChange={(e) => void onFile(e)}
        />
        {icsMsg ? (
          <p className="small" role="status">
            {icsMsg}
          </p>
        ) : null}
        {evidence.events.length > 0 ? (
          <p className="muted small">{evidence.events.length} events connected</p>
        ) : null}
      </div>
      <div className="connect-card paper">
        <h3>
          <Icon name="spark" size={18} /> GitHub, for coders
        </h3>
        <p className="muted small">
          If one of your dreams is about coding, add your public GitHub username to count your
          activity. No login needed.
        </p>
        <div className="row">
          <input
            className="input"
            placeholder="username"
            maxLength={39}
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-soft"
            disabled={!user.trim() || busy}
            onClick={() => void sync()}
          >
            {busy ? "Connecting…" : "Connect"}
          </button>
        </div>
        {msg ? (
          <p className="small" role="status">
            {msg}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ProgressView({ app, model, today, goTo }: Props) {
  const goals = app.state.goals.filter((g) => !g.archived);
  const week = entriesBetween(app.state.entries, addDays(today, -6), today);
  const mood = averageMood(week);
  const stepsDone = model.results.filter((r) => r.status === "met").length;
  const days = streak(app.state.entries, today);

  if (goals.length === 0 && app.state.entries.length === 0) {
    return (
      <div>
        <p className="kicker">How far you've come</p>
        <h1 className="page-title">Progress</h1>
        <div className="empty paper">
          <p>Your progress lives here once you add a dream and write a page or two.</p>
          <button type="button" className="btn btn-primary" onClick={() => goTo("dreams")}>
            Add my first dream
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="kicker">How far you've come</p>
      <h1 className="page-title">Progress</h1>

      <ul className="stats">
        <Stat
          icon="flame"
          value={String(days)}
          label={days === 1 ? "day in a row" : "days in a row"}
          tint="peach"
        />
        <Stat icon="book" value={String(week.length)} label="pages this week" tint="butter" />
        <Stat
          icon="check"
          value={`${stepsDone}/${model.results.length}`}
          label="steps on track"
          tint="sage"
        />
        <Stat
          icon="smile"
          value={mood === null ? "–" : `${mood.toFixed(1)}/5`}
          label="average mood"
          tint="lavender"
        />
      </ul>

      <div className="progress-grid">
        <Section title="Dream timeline" kicker="Where you're headed">
          {goals.length === 0 ? (
            <p className="muted">Add a dream with a date to see your timeline.</p>
          ) : (
            <Timeline goals={goals} model={model} today={today} />
          )}
        </Section>

        <div>
          <Section title="Mood" kicker="The last two weeks">
            <MoodChart app={app} today={today} />
          </Section>

          {model.conflicts.length > 0 ? (
            <Section title="Little nudges" kicker="Things worth a look">
              <ul className="nudges">
                {model.conflicts.map((c) => (
                  <li key={c.id} className="nudge">
                    <p className="nudge-title">{c.title}</p>
                    <p className="small">{c.detail}</p>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      </div>

      <Section title="Habit tracker" kicker="Every dot is a day you showed up">
        {model.results.length === 0 ? (
          <p className="muted">Add little steps to your dreams to track them here.</p>
        ) : (
          <HabitGrid app={app} model={model} today={today} />
        )}
      </Section>

      <Section title="Connect" kicker="Optional: let your calendar do the counting">
        <Connect app={app} />
      </Section>
    </div>
  );
}
