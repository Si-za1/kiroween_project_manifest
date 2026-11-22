interface Props {
  onStart: () => void;
  onDemo: () => void;
}

const STEPS = [
  {
    n: "I",
    title: "Write your Charter",
    body: "Say what you want in plain words. Each goal becomes a claim you can check, like “3 workouts a week”.",
  },
  {
    n: "II",
    title: "Draw a card, commit an entry",
    body: "Each day a card gives you a prompt drawn from your own results. Write a few lines. They become a commit in your log.",
  },
  {
    n: "III",
    title: "Hear back from your futures",
    body: "Three future versions of you write to you, grounded in your real numbers and in your own words. They do not always agree.",
  },
];

const STITCHES = ["Tarot", "Git", "Unit tests", "Letters from your future self"];

export function Welcome({ onStart, onDemo }: Props) {
  return (
    <section className="welcome">
      <p className="kicker">A small experiment in honesty</p>
      <h1 className="hero">
        Manifestation, <em>with receipts.</em>
      </h1>
      <p className="lede">
        Manifest.git checks what you say you want against what you actually do, then lets future
        versions of you write back. Your journal stays in this browser.
      </p>

      <div className="stitch-row" aria-label="What is stitched together">
        {STITCHES.map((s, i) => (
          <span key={s} className="stitch-piece">
            {s}
            {i < STITCHES.length - 1 ? <span className="stitch-plus"> + </span> : null}
          </span>
        ))}
      </div>

      <div className="cta-row">
        <button type="button" className="btn btn-primary" onClick={onStart}>
          Begin your Charter
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDemo}>
          Explore the demo
        </button>
      </div>

      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.n} className="step stitched">
            <span className="step-n">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
