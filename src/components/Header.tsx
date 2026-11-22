import { Icon } from "./Icons.tsx";
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
      {demo ? (
        <div className="demo-bar">
          <span>
            You're peeking into <strong>{persona}'s</strong> demo journal.
          </span>
          <button type="button" className="link" onClick={onExitDemo}>
            Start my own
          </button>
        </div>
      ) : null}
      <div className="header-row">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onView("home");
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            <Icon name="spark" size={18} />
          </span>
          Manifest
        </a>
        <nav className="tabs" aria-label="Main">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`tab${view === v.id ? " is-active" : ""}`}
              aria-current={view === v.id ? "page" : undefined}
              onClick={() => onView(v.id)}
            >
              <Icon name={v.icon} size={17} />
              <span>{v.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
