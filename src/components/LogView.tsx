import type { AppApi } from "../data/useApp.ts";
import { formatShort } from "../lib/dates.ts";

const MOOD = ["", "Heavy", "Low", "Steady", "Bright", "Radiant"];

export function LogView({ app }: { app: AppApi }) {
  const entries = [...app.state.entries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return (
    <div>
      <p className="kicker">Your timeline</p>
      <h1 className="page-title">Log</h1>
      <p className="lede">Every entry is a commit. Nothing here leaves your browser.</p>
      {entries.length === 0 ? (
        <p className="muted">No commits yet. Write your first entry on the Today page.</p>
      ) : (
        <ol className="log">
          {entries.map((e) => (
            <li key={e.id} className="log-item">
              <div className="log-meta">
                <code className="hash">{e.hash}</code>
                <span>{formatShort(e.date)}</span>
                <span>{e.cardTitle}</span>
                <span>{MOOD[e.mood]}</span>
              </div>
              <p className="log-prompt">{e.prompt}</p>
              <p className="log-text">{e.text}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
