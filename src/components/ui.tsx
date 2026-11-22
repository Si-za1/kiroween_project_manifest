import type { ReactNode } from "react";
import type { Status } from "../lib/score.ts";

export type View = "today" | "charter" | "report" | "council" | "log";

export const VIEWS: { id: View; label: string; hint: string }[] = [
  { id: "today", label: "Today", hint: "Draw a card and write" },
  { id: "charter", label: "Charter", hint: "Your goals and claims" },
  { id: "report", label: "Report", hint: "Your results and evidence" },
  { id: "council", label: "Council", hint: "Letters from future you" },
  { id: "log", label: "Log", hint: "Your timeline" },
];

const STATUS_LABEL: Record<Status, string> = {
  met: "Passing",
  close: "Almost there",
  behind: "Not yet",
  no_data: "No evidence",
};

export function StatusChip({ status }: { status: Status }) {
  return <span className={`chip chip-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Meter({ value, status }: { value: number; status: Status }) {
  const pct = Math.round(value * 100);
  return (
    <div
      className="meter"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className={`meter-fill meter-${status}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <section className="section">
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}

export function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

export const SOURCE_LABEL = {
  checkin: "Check-in",
  github: "GitHub",
  calendar: "Calendar",
} as const;

export const VALUE_LABEL = {
  ambition: "Ambition",
  connection: "Connection",
  peace: "Peace",
} as const;
