import { useEffect, useRef, useState } from "react";
import { addLetters, setReply } from "../data/actions.ts";
import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { writeLetters } from "../lib/api.ts";
import { buildContext, fallbackLetters, selfById, SELVES } from "../lib/council.ts";
import { formatLong } from "../lib/dates.ts";
import { canSpeak, speak } from "../lib/speech.ts";
import type { Letter } from "../lib/types.ts";
import { Icon } from "./Icons.tsx";
import { AREA, Paragraphs } from "./ui.tsx";

function LetterPaper({ letter, onReply }: { letter: Letter; onReply: (text: string) => void }) {
  const self = selfById(letter.selfId);
  const area = AREA[self.value];
  const [reply, setReplyText] = useState(letter.reply);
  const [reading, setReading] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => () => stopRef.current?.(), []);

  function toggleRead() {
    if (reading) {
      stopRef.current?.();
      return;
    }
    setReading(true);
    stopRef.current = speak(letter.text, () => {
      setReading(false);
      stopRef.current = null;
    });
  }

  return (
    <li className={`letter paper tint-${area.tint}`}>
      <header className="letter-head">
        <span className={`stamp tint-${area.tint}`}>
          <span className="stamp-year">{Number(letter.createdAt.slice(0, 4)) + letter.years}</span>
        </span>
        <div>
          <p className="letter-from">From {self.name.toLowerCase()}</p>
          <p className="muted small">Looks after {self.caresAbout}</p>
        </div>
        {canSpeak() ? (
          <button
            type="button"
            className={`listen${reading ? " is-on" : ""}`}
            aria-pressed={reading}
            onClick={toggleRead}
          >
            <Icon name={reading ? "stop" : "speaker"} size={15} />
            {reading ? "Stop" : "Listen"}
          </button>
        ) : null}
      </header>
      <div className="letter-body hand">
        <Paragraphs text={letter.text} />
      </div>
      <label className="field">
        <span className="field-label">Write back</span>
        <textarea
          className="textarea lined"
          rows={3}
          maxLength={4000}
          placeholder="Write back to future you…"
          value={reply}
          onChange={(e) => setReplyText(e.target.value)}
          onBlur={() => reply !== letter.reply && onReply(reply)}
        />
      </label>
      <p className="muted tiny">
        {formatLong(letter.createdAt.slice(0, 10))} ·{" "}
        {letter.origin === "ai" ? "written with AI" : "written on your device"}
      </p>
    </li>
  );
}

export function LettersView({ app, model, today }: { app: AppApi; model: Model; today: string }) {
  const [busy, setBusy] = useState(false);
  const letters = app.state.letters;
  const latestBatch = letters[letters.length - 1]?.batchId;
  const latest = SELVES.flatMap((s) =>
    letters.filter((l) => l.batchId === latestBatch && l.selfId === s.id),
  );
  const earlier = letters.filter((l) => l.batchId !== latestBatch).reverse();
  const year = Number(today.slice(0, 4));

  async function ask() {
    if (busy) return;
    setBusy(true);
    const ctx = buildContext(
      today,
      app.state.goals,
      model.results,
      model.conflicts,
      app.state.entries,
      model.voice,
      model.patterns,
      model.moon,
    );
    const ai = await writeLetters(ctx);
    app.update((s) => addLetters(s, ai ?? fallbackLetters(ctx), ai ? "ai" : "local", new Date()));
    setBusy(false);
  }

  return (
    <div>
      <p className="kicker">Letters from Future Me</p>
      <h1 className="page-title">Future Me</h1>
      <p className="lede">
        Imagine three future versions of you. They read your dreams, your journal, and your
        progress, then write you a letter. Each one looks after a different part of your life, so
        they won't always agree. That's the fun part.
      </p>

      <ul className="envelopes">
        {SELVES.map((s) => {
          const area = AREA[s.value];
          return (
            <li key={s.id} className={`envelope tint-${area.tint}`}>
              <span className="envelope-flap" aria-hidden="true" />
              <span className="envelope-year">{year + s.years}</span>
              <span className="envelope-name">{s.name}</span>
              <span className="envelope-area">Looks after {area.label.toLowerCase()}</span>
            </li>
          );
        })}
      </ul>

      <div className="ask">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          disabled={busy}
          onClick={() => void ask()}
        >
          <Icon name="envelope" size={18} />
          {busy
            ? " Future you is writing…"
            : latest.length > 0
              ? " Ask for new letters"
              : " Open my letters"}
        </button>
        <p className="muted small">
          With an AI service set up, a short summary of your progress and recent pages is sent to it
          to write the letters. Without one, they're written right here on your device.
        </p>
      </div>

      {latest.length > 0 ? (
        <ul className="letters">
          {latest.map((l) => (
            <LetterPaper
              key={l.id}
              letter={l}
              onReply={(t) => app.update((s) => setReply(s, l.id, t))}
            />
          ))}
        </ul>
      ) : null}

      {earlier.length > 0 ? (
        <details className="earlier">
          <summary>Older letters ({earlier.length})</summary>
          <ul className="letters">
            {earlier.map((l) => (
              <LetterPaper
                key={l.id}
                letter={l}
                onReply={(t) => app.update((s) => setReply(s, l.id, t))}
              />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
