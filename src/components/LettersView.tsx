import { useEffect, useRef, useState } from "react";
import { addLetters, openLetter, setReply } from "../data/actions.ts";
import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { writeLetters } from "../lib/api.ts";
import { buildContext, fallbackLetters, selfById, SELVES } from "../lib/council.ts";
import type { FutureSelf } from "../lib/council.ts";
import { formatLong } from "../lib/dates.ts";
import { canSpeak, speak } from "../lib/speech.ts";
import type { Letter } from "../lib/types.ts";
import { Icon } from "./Icons.tsx";
import { AREA, Paragraphs } from "./ui.tsx";

/** The letter itself: header, body, read-aloud, and a reply box. */
function LetterPaper({
  letter,
  onReply,
  className = "",
}: {
  letter: Letter;
  onReply: (text: string) => void;
  className?: string;
}) {
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
    <article className={`letter paper tint-${area.tint} ${className}`}>
      <header className="letter-head">
        <span className={`stamp tint-${area.tint}`}>
          <span className="stamp-year">{Number(letter.createdAt.slice(0, 4)) + letter.years}</span>
        </span>
        <div className="letter-who">
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
    </article>
  );
}

/** Full-screen moment: the envelope flies forward, the flap opens, and the letter unfolds. */
function OpenedLetter({
  letter,
  onClose,
  onReply,
}: {
  letter: Letter;
  onClose: () => void;
  onReply: (text: string) => void;
}) {
  const self = selfById(letter.selfId);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Runs once per opened letter, so saving a reply doesn't steal focus or replay anything.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      className="reveal"
      role="dialog"
      aria-modal="true"
      aria-label={`Letter from ${self.name.toLowerCase()}`}
    >
      <button
        type="button"
        className="reveal-backdrop"
        aria-label="Close letter"
        tabIndex={-1}
        onClick={onClose}
      />

      {/* Stage 1: the envelope comes forward and opens. Hidden once the letter is out. */}
      <div className="reveal-stage" aria-hidden="true">
        <div className="env3d">
          <span className="env3d-back" />
          <span className="env3d-sheet">
            <span className="env3d-line" />
            <span className="env3d-line" />
            <span className="env3d-line short" />
          </span>
          <span className="env3d-pocket" />
          <span className="env3d-flap">
            <span className="env3d-seal">
              <Icon name="heart" size={14} />
            </span>
          </span>
        </div>
      </div>

      {/* Stage 2: the letter unfolds into view. */}
      <div className="reveal-letter">
        <button
          ref={closeRef}
          type="button"
          className="reveal-close"
          aria-label="Close letter"
          onClick={onClose}
        >
          <Icon name="plus" size={18} />
        </button>
        <LetterPaper letter={letter} onReply={onReply} className="unfold" />
      </div>
    </div>
  );
}

function Envelope({
  self,
  year,
  letter,
  busy,
  onOpen,
}: {
  self: FutureSelf;
  year: number;
  letter: Letter | undefined;
  busy: boolean;
  onOpen: () => void;
}) {
  const area = AREA[self.value];
  const sealed = !letter?.openedAt;
  const hint = busy
    ? "Writing…"
    : !letter
      ? "Tap to receive"
      : sealed
        ? "Tap to open"
        : "Read again";
  return (
    <li className="envelope-slot">
      <button
        type="button"
        className={`envelope${sealed ? " is-sealed" : " is-read"}`}
        disabled={busy}
        aria-label={`${self.name}, ${year + self.years}. ${hint}.`}
        onClick={onOpen}
      >
        <span className="envelope-flap" aria-hidden="true">
          <span className="envelope-seal">
            <Icon name="heart" size={12} />
          </span>
        </span>
        <span className="envelope-year">{year + self.years}</span>
        <span className="envelope-name">{self.name}</span>
        <span className="envelope-area">Looks after {area.label.toLowerCase()}</span>
        <span className="envelope-hint">
          {sealed && letter ? <span className="envelope-new" /> : null}
          {hint}
        </span>
      </button>
    </li>
  );
}

export function LettersView({ app, model, today }: { app: AppApi; model: Model; today: string }) {
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const letters = app.state.letters;
  const latestBatch = letters[letters.length - 1]?.batchId;
  const latest = letters.filter((l) => l.batchId === latestBatch);
  const earlier = letters.filter((l) => l.batchId !== latestBatch).reverse();
  const year = Number(today.slice(0, 4));
  const open = letters.find((l) => l.id === openId);

  /** Writes a fresh set of three letters. Returns the new ones. */
  async function write(): Promise<Letter[]> {
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
    const now = new Date();
    const next = addLetters(app.state, ai ?? fallbackLetters(ctx), ai ? "ai" : "local", now);
    app.update(() => next);
    return next.letters.slice(app.state.letters.length);
  }

  async function ask() {
    if (busy) return;
    setBusy(true);
    await write();
    setBusy(false);
  }

  async function openFor(self: FutureSelf) {
    if (busy) return;
    let letter = latest.find((l) => l.selfId === self.id);
    if (!letter) {
      setBusy(true);
      letter = (await write()).find((l) => l.selfId === self.id);
      setBusy(false);
    }
    if (!letter) return;
    const id = letter.id;
    app.update((s) => openLetter(s, id, new Date()));
    setOpenId(id);
  }

  const reply = (id: string) => (text: string) => app.update((s) => setReply(s, id, text));

  return (
    <div>
      <p className="kicker">Letters from Future Me</p>
      <h1 className="page-title">Future Me</h1>
      <p className="lede">
        Three future versions of you read your dreams, your journal, and your progress, then write
        to you. Each one looks after a different part of your life, so they won't always agree. Tap
        an envelope to open it.
      </p>

      <ul className="envelopes">
        {SELVES.map((s) => (
          <Envelope
            key={s.id}
            self={s}
            year={year}
            letter={latest.find((l) => l.selfId === s.id)}
            busy={busy}
            onOpen={() => void openFor(s)}
          />
        ))}
      </ul>

      <div className="ask">
        {latest.length > 0 ? (
          <button type="button" className="btn btn-soft" disabled={busy} onClick={() => void ask()}>
            <Icon name="envelope" size={16} />
            {busy ? " Future you is writing…" : " Ask for new letters"}
          </button>
        ) : null}
        <p className="muted small">
          With an AI service set up, a short summary of your progress and recent pages is sent to it
          to write the letters. Without one, they're written right here on your device.
        </p>
      </div>

      {earlier.length > 0 ? (
        <details className="earlier">
          <summary>Older letters ({earlier.length})</summary>
          <ul className="letters">
            {earlier.map((l) => (
              <li key={l.id}>
                <LetterPaper letter={l} onReply={reply(l.id)} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {open ? (
        <OpenedLetter
          key={open.id}
          letter={open}
          onClose={() => setOpenId(null)}
          onReply={reply(open.id)}
        />
      ) : null}
    </div>
  );
}
