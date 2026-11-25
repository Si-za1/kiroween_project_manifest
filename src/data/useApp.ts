import { useCallback, useEffect, useState } from "react";
import { todayISO } from "../lib/dates.ts";
import type { AppState } from "../lib/types.ts";
import { eraseAll, getMode, loadState, resetDemo, saveState, setMode } from "./store.ts";

interface Store {
  demo: boolean;
  state: AppState;
}

/** Holds the app state, persists it to localStorage, and switches between real and demo data. */
export function useApp() {
  const [store, setStore] = useState<Store>(() => {
    const demo = getMode();
    return { demo, state: loadState(demo, todayISO()) };
  });

  useEffect(() => {
    saveState(store.demo, store.state);
  }, [store]);

  const update = useCallback((fn: (s: AppState) => AppState) => {
    setStore((prev) => ({ ...prev, state: fn(prev.state) }));
  }, []);

  const setDemo = useCallback((demo: boolean) => {
    setMode(demo);
    if (demo) resetDemo(); // always start the demo from a fresh, date-relative persona
    setStore({ demo, state: loadState(demo, todayISO()) });
  }, []);

  const erase = useCallback(() => {
    eraseAll();
    setStore({ demo: false, state: loadState(false, todayISO()) });
  }, []);

  return { demo: store.demo, state: store.state, update, setDemo, erase };
}

export type AppApi = ReturnType<typeof useApp>;
