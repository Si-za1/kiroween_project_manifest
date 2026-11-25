import { useMemo, useState } from "react";
import { ConnectionsView } from "./components/ConnectionsView.tsx";
import { DreamsView } from "./components/DreamsView.tsx";
import { Header } from "./components/Header.tsx";
import { Home } from "./components/Home.tsx";
import { JournalView } from "./components/JournalView.tsx";
import { LettersView } from "./components/LettersView.tsx";
import { ProgressView } from "./components/ProgressView.tsx";
import type { View } from "./components/ui.tsx";
import { DEMO_PERSONA } from "./data/demo.ts";
import { computeModel } from "./data/selectors.ts";
import { useApp } from "./data/useApp.ts";
import { todayISO } from "./lib/dates.ts";

export default function App() {
  const app = useApp();
  const [view, setView] = useState<View>("home");
  const today = todayISO();
  const model = useMemo(() => computeModel(app.state, today), [app.state, today]);

  function go(v: View) {
    setView(v);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="app">
      <Header
        view={view}
        onView={go}
        demo={app.demo}
        persona={DEMO_PERSONA}
        onExitDemo={() => {
          app.setDemo(false);
          go("home");
        }}
      />
      <main className="main">
        {view === "home" && <Home app={app} model={model} today={today} goTo={go} />}
        {view === "dreams" && <DreamsView app={app} model={model} today={today} />}
        {view === "journal" && <JournalView app={app} model={model} today={today} goTo={go} />}
        {view === "progress" && <ProgressView app={app} model={model} today={today} goTo={go} />}
        {view === "letters" && <LettersView app={app} model={model} today={today} />}
        {view === "connections" && <ConnectionsView app={app} model={model} />}
      </main>
      <footer className="footer">
        <span>Dearly · stitched together with love. Your journal stays on this device.</span>
        <span className="footer-links">
          {app.demo ? (
            <button type="button" className="link" onClick={() => app.setDemo(true)}>
              Reset demo
            </button>
          ) : (
            <>
              <button type="button" className="link" onClick={() => app.setDemo(true)}>
                Peek at a demo
              </button>
              <button
                type="button"
                className="link danger"
                onClick={() => {
                  if (
                    window.confirm("Erase everything saved on this device? This can't be undone.")
                  ) {
                    app.erase();
                  }
                }}
              >
                Erase my data
              </button>
            </>
          )}
        </span>
      </footer>
    </div>
  );
}
