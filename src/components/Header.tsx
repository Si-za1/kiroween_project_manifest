import { VIEWS } from "./ui.tsx";
import type { View } from "./ui.tsx";

interface Props {
  view: View;
  onView: (v: View) => void;
  demo: boolean;
  persona: string;
  onExitDemo: () => void;
}

export function Header({ view, onView, demo, persona, onExitDemo }: Props) {
  return (
    <header className="header">
      <div className="header-row">
        <a
          className="wordmark"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onView("today");
          }}
        >
          Manifest<span className="wordmark-git">.git</span>
        </a>
        {demo ? (
          <div className="demo-pill">
            <span>Demo mode · {persona}</span>
            <button type="button" className="link" onClick={onExitDemo}>
              Exit demo
            </button>
          </div>
        ) : null}
      </div>
      <nav className="nav" aria-label="Main">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            title={v.hint}
            className={`nav-item${view === v.id ? " is-active" : ""}`}
            aria-current={view === v.id ? "page" : undefined}
            onClick={() => onView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </nav>
      <div className="spark-line" aria-hidden="true" />
    </header>
  );
}
