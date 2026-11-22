import { useState } from "react";
import { addLetters, setReply } from "../data/actions.ts";
import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { writeLetters } from "../lib/api.ts";
import { buildContext, fallbackLetters, SELVES } from "../lib/council.ts";
import type { Letter } from "../lib/types.ts";
import { Paragraphs, VALUE_LABEL } from "./ui.tsx";

function LetterCard({ letter, onReply }: { letter: Letter; onReply: (text: string) => void }) {
  const self = SELVES.find((s) => s.id === letter.selfId);
  const [reply, setReplyText] = useState(letter.reply);
  return (
    <li className="letter stitched">
      <header className="letter-head">
        <p className="letter-years">
          {letter.years} {letter.years === 1 ? "year" : "years"} on
        </p>
        <h3>{letter.name}</h3>
        {self ? (
          <p className="muted small">
            {VALUE_LABEL[self.value]} · {self.stance}
          </p>
        ) : null}
      </header>
      <div className="letter-body">
        <Paragraphs text={letter.text} />
      </div>
      <label className="field">
        <span className="field-label">Write back</span>
        <textarea
          className="textarea"
          rows={3}
          maxLength={4000}
          placeholder="Reply to them. They will keep it."
          value={reply}
          onChange={(e) => setReplyText(e.target.value)}
          onBlur={() => reply !== letter.reply && onReply(reply)}
        />
      </label>
      <p className="muted small">
        {letter.origin === "ai" ? "Written with AI" : "Written on your device"}
      </p>
    </li>
  );
}

export function CouncilView({ app, model, today }: { app: AppApi; model: Model; today: string }) {
  const [busy, setBusy] = useState(false);
  const letters = app.state.letters;
  const latestBatch = letters[letters.length - 1]?.batchId;
  const latest = SELVES.flatMap((s) =>
    letters.filter((l) => l.batchId === latestBatch && l.selfId === s.id),
  );
  const earlier = letters.filter((l) => l.batchId !== latestBatch).reverse();

  async function convene() {
    if (busy) return;
    setBusy(true);
    const ctx = buildContext(today, model.results, model.conflicts, app.state.entries, model.voice);
    const ai = await writeLetters(ctx);
    app.update((s) => addLetters(s, ai ?? fallbackLetters(ctx), ai ? "ai" : "local", new Date()));
    setBusy(false);
  }

  return (
    <div>
      <p className="kicker">Three futures, three opinions</p>
      <h1 className="page-title">The Council</h1>
      <p className="lede">
        Future versions of you write back. Each one cares about something different, so they will
        not always agree. They only use your real results and your own words.
      </p>

      <div className="convene">
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => void convene()}
        >
          {busy
            ? "The Council is writing…"
            : latest.length > 0
              ? "Convene again"
              : "Convene the Council"}
        </button>
        <p className="muted small">
          If an AI service is set up, a short summary of your results and recent entries is sent to
          it to write the letters. Otherwise the letters are written on your device.
        </p>
      </div>

      {latest.length > 0 ? (
        <ul className="letters">
          {latest.map((l) => (
            <LetterCard
              key={l.id}
              letter={l}
              onReply={(text) => app.update((s) => setReply(s, l.id, text))}
            />
          ))}
        </ul>
      ) : null}

      {earlier.length > 0 ? (
        <details className="earlier">
          <summary>Earlier letters ({earlier.length})</summary>
          <ul className="letters">
            {earlier.map((l) => (
              <LetterCard
                key={l.id}
                letter={l}
                onReply={(text) => app.update((s) => setReply(s, l.id, text))}
              />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
