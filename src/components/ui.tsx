import type { ReactNode } from "react";
import type { Status } from "../lib/score.ts";
import type { Source, Tint, Value } from "../lib/types.ts";
import type { UiIcon } from "./Icons.tsx";

export type View = "home" | "dreams" | "journal" | "progress" | "letters";

export const VIEWS: { id: View; label: string; icon: UiIcon }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "dreams", label: "My Dreams", icon: "star" },
  { id: "journal", label: "Journal", icon: "book" },
  { id: "progress", label: "Progress", icon: "chart" },
  { id: "letters", label: "Future Me", icon: "envelope" },
];

export const STATUS_LABEL: Record<Status, string> = {
  met: "Done!",
  close: "Almost there",
  behind: "Keep going",
  no_data: "Not started",
};

export function StatusChip({ status }: { status: Status }) {
  return <span className={`chip chip-${status}`}>{STATUS_LABEL[status]}</span>;
}

export const SOURCE_LABEL: Record<Source, string> = {
  checkin: "I'll tick it off",
  calendar: "From my calendar",
  github: "From GitHub",
};

export const AREA: Record<Value, { label: string; hint: string; tint: Tint }> = {
  ambition: { label: "Growth", hint: "work, learning, making", tint: "peach" },
  connection: { label: "Love", hint: "family, friends, people", tint: "rose" },
  peace: { label: "Wellbeing", hint: "health, rest, calm", tint: "sage" },
};

/** Circular progress ring, 0 to 1. */
export function Ring({
  value,
  size = 44,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <svg
      className="ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label ?? `${pct}%`}
    >
      <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} />
      <circle
        className="ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeDasharray={`${(c * pct) / 100} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="ring-text">
        {pct}%
      </text>
    </svg>
  );
}

export function Section({
  title,
  kicker,
  action,
  children,
}: {
  title: string;
  kicker?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-head">
        <div>
          {kicker ? <p className="kicker">{kicker}</p> : null}
          <h2 className="section-title">{title}</h2>
        </div>
        {action ?? null}
      </div>
      {children}
    </section>
  );
}

export function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>
          {p.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

export function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
