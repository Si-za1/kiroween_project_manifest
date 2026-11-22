import { useMemo, useState } from "react";
import { CharterView } from "./components/CharterView.tsx";
import { CouncilView } from "./components/CouncilView.tsx";
import { Header } from "./components/Header.tsx";
import { LogView } from "./components/LogView.tsx";
import { ReportView } from "./components/ReportView.tsx";
import { TodayView } from "./components/TodayView.tsx";
import type { View } from "./components/ui.tsx";
import { DEMO_PERSONA } from "./data/demo.ts";
import { computeModel } from "./data/selectors.ts";
import { useApp } from "./data/useApp.ts";
import { todayISO } from "./lib/dates.ts";

export default function App() {
  const app = useApp();
  const [view, setView] = useState<View>("today");
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
        onExitDemo={() => app.setDemo(false)}
      />
      <main className="main">
        {view === "today" && <TodayView app={app} model={model} today={today} goTo={go} />}
        {view === "charter" && <CharterView app={app} />}
        {view === "report" && <ReportView app={app} model={model} goTo={go} />}
        {view === "council" && <CouncilView app={app} model={model} today={today} />}
        {view === "log" && <LogView app={app} />}
      </main>
      <footer className="footer">
        <span>Your journal stays in this browser.</span>
        {app.demo ? (
          <button type="button" className="link" onClick={() => app.setDemo(true)}>
            Reset demo
          </button>
        ) : (
          <>
            <button type="button" className="link" onClick={() => app.setDemo(true)}>
              Try the demo
            </button>
            <button
              type="button"
              className="link danger"
              onClick={() => {
                if (
                  window.confirm("Erase everything saved in this browser? This cannot be undone.")
                ) {
                  app.erase();
                }
              }}
            >
              Erase my data
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
