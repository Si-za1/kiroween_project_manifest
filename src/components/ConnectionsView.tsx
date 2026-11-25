import { useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { disconnect, setEvents, setGithub, setWeather } from "../data/actions.ts";
import type { Model } from "../data/selectors.ts";
import type { AppApi } from "../data/useApp.ts";
import { aiStatus, fetchGithubDays } from "../lib/api.ts";
import { formatShort } from "../lib/dates.ts";
import { buildICS, parseICS } from "../lib/ics.ts";
import { canListen, canSpeak } from "../lib/speech.ts";
import { fetchWeatherDays, searchPlaces, weatherKind, WEATHER_LABEL } from "../lib/weather.ts";
import type { WeatherPlace } from "../lib/types.ts";
import { Icon } from "./Icons.tsx";
import type { UiIcon } from "./Icons.tsx";
import { weatherIcon } from "./ui.tsx";

type State = "on" | "off" | "local";

function Organ({
  icon,
  name,
  via,
  state,
  status,
  gives,
  children,
}: {
  icon: UiIcon;
  name: string;
  via: string;
  state: State;
  status: string;
  gives: string;
  children?: ReactNode;
}) {
  return (
    <article className={`organ paper is-${state}`}>
      <header className="organ-head">
        <span className="organ-icon">
          <Icon name={icon} size={20} />
        </span>
        <div className="organ-names">
          <h3>{name}</h3>
          <p className="organ-via">{via}</p>
        </div>
        <span className={`status-dot is-${state}`} aria-hidden="true" />
      </header>
      <p className="organ-status">{status}</p>
      <p className="organ-gives">{gives}</p>
      {children ? <div className="organ-body">{children}</div> : null}
    </article>
  );
}

function WeatherOrgan({ app, model }: { app: AppApi; model: Model }) {
  const { weatherPlace, weatherDays, weatherSyncedAt } = app.state.evidence;
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<WeatherPlace[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function find() {
    if (query.trim().length < 2 || busy) return;
    setBusy(true);
    setMsg("");
    try {
      const found = await searchPlaces(query);
      setPlaces(found);
      if (found.length === 0) setMsg("No places found. Try a nearby city.");
    } catch {
      setMsg("Couldn't reach the weather service. Check your connection and try again.");
    }
    setBusy(false);
  }

  async function choose(place: WeatherPlace) {
    setBusy(true);
    setMsg("");
    try {
      const days = await fetchWeatherDays(place);
      app.update((s) => setWeather(s, place, days, new Date()));
      setPlaces([]);
      setQuery("");
      setMsg(`Stitched in ${Object.keys(days).length} days of weather for ${place.name}.`);
    } catch {
      setMsg("Couldn't load the weather. Try again in a moment.");
    }
    setBusy(false);
  }

  const today = model.weatherToday;
  const count = Object.keys(weatherDays).length;
  return (
    <Organ
      icon="sun"
      name="Weather"
      via="Open-Meteo · free, no account"
      state={weatherPlace ? "on" : "off"}
      status={
        weatherPlace
          ? `${weatherPlace.name}: ${count} days${today ? `, today ${WEATHER_LABEL[weatherKind(today.code)].toLowerCase()}${today.tempC !== null ? ` ${today.tempC}°` : ""}` : ""}`
          : "Not connected"
      }
      gives="Lets you see how the sky and your mood move together, and shows today's weather on your journal page."
    >
      {weatherPlace ? (
        <div className="row-between">
          <span className="muted small">
            {weatherSyncedAt ? `Updated ${formatShort(weatherSyncedAt.slice(0, 10))}` : ""}
            {today ? (
              <>
                {" "}
                · <Icon name={weatherIcon(today.code)} size={14} />
              </>
            ) : null}
          </span>
          <span className="row">
            <button
              type="button"
              className="link small"
              disabled={busy}
              onClick={() => void choose(weatherPlace)}
            >
              Refresh
            </button>
            <button
              type="button"
              className="link danger small"
              onClick={() => app.update((s) => disconnect(s, "weather"))}
            >
              Disconnect
            </button>
          </span>
        </div>
      ) : (
        <>
          <div className="row">
            <input
              className="input"
              placeholder="Your city"
              maxLength={80}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void find();
              }}
            />
            <button
              type="button"
              className="btn btn-soft"
              disabled={query.trim().length < 2 || busy}
              onClick={() => void find()}
            >
              {busy ? "…" : "Find"}
            </button>
          </div>
          {places.length > 0 ? (
            <ul className="place-list">
              {places.map((p) => (
                <li key={`${p.latitude},${p.longitude}`}>
                  <button type="button" className="place" onClick={() => void choose(p)}>
                    <strong>{p.name}</strong> <span className="muted">{p.region}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="hint">
            Only the city's coordinates are sent. Your journal stays on this device.
          </p>
        </>
      )}
      {msg ? (
        <p className="small" role="status">
          {msg}
        </p>
      ) : null}
    </Organ>
  );
}

function CalendarOrgan({ app }: { app: AppApi }) {
  const { events } = app.state.evidence;
  const [msg, setMsg] = useState("");
  const dated = app.state.goals.filter((g) => !g.archived && g.byDate);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2_000_000) {
      setMsg("That file is over 2 MB. Try exporting a shorter date range.");
      return;
    }
    const found = parseICS(await file.text());
    app.update((s) => setEvents(s, found));
    setMsg(found.length ? `Stitched in ${found.length} events.` : "No events found in that file.");
  }

  return (
    <Organ
      icon="calendar"
      name="Calendar"
      via="Google, Apple, or Outlook · .ics file"
      state={events.length > 0 ? "on" : "off"}
      status={events.length > 0 ? `${events.length} events in` : "Not connected"}
      gives='Counts steps for you (any step set to "from my calendar"), and sends your dream dates back out as reminders.'
    >
      <label className="field">
        <span className="field-label">Bring events in</span>
        <input
          className="file"
          type="file"
          accept=".ics,text/calendar"
          onChange={(e) => void onFile(e)}
        />
        <span className="hint">
          In Google Calendar: Settings, then Import & export, then Export.
        </span>
      </label>
      <div className="row-between">
        <DownloadDreams
          app={app}
          label={`Send ${dated.length} dream ${dated.length === 1 ? "date" : "dates"} out`}
        />
        {events.length > 0 ? (
          <button
            type="button"
            className="link danger small"
            onClick={() => app.update((s) => disconnect(s, "calendar"))}
          >
            Disconnect
          </button>
        ) : null}
      </div>
      {msg ? (
        <p className="small" role="status">
          {msg}
        </p>
      ) : null}
    </Organ>
  );
}

/** Downloads dream dates as an .ics file, with a reminder a week before each. */
export function DownloadDreams({ app, label }: { app: AppApi; label: string }) {
  const dated = app.state.goals.filter((g) => !g.archived && g.byDate);
  function download() {
    const ics = buildICS(
      dated.map((g) => ({
        uid: g.id,
        date: g.byDate,
        title: `✦ ${g.text}`,
        description: g.why ? `Why it matters: ${g.why}` : "A dream from my Dearly journal.",
      })),
    );
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "manifest-dreams.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <button
      type="button"
      className="btn btn-soft btn-small-soft"
      disabled={dated.length === 0}
      onClick={download}
    >
      <Icon name="download" size={15} /> {label}
    </button>
  );
}

function GithubOrgan({ app }: { app: AppApi }) {
  const { githubUser, githubDays } = app.state.evidence;
  const [user, setUser] = useState(githubUser);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function sync() {
    const name = user.trim();
    if (!name || busy) return;
    setBusy(true);
    setMsg("");
    const res = await fetchGithubDays(name);
    if (res.ok) {
      app.update((s) => setGithub(s, name, res.days, new Date()));
      setMsg(`Stitched in ${Object.keys(res.days).length} active days.`);
    } else setMsg(res.message);
    setBusy(false);
  }
  return (
    <Organ
      icon="spark"
      name="GitHub"
      via="Public activity · for coders"
      state={githubUser ? "on" : "off"}
      status={
        githubUser
          ? `${githubUser}: ${Object.keys(githubDays).length} active days`
          : "Not connected"
      }
      gives='If a dream is about building software, steps set to "from GitHub" count your public activity.'
    >
      <div className="row">
        <input
          className="input"
          placeholder="username"
          maxLength={39}
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-soft"
          disabled={!user.trim() || busy}
          onClick={() => void sync()}
        >
          {busy ? "…" : "Connect"}
        </button>
      </div>
      {msg ? (
        <p className="small" role="status">
          {msg}
        </p>
      ) : null}
    </Organ>
  );
}

const SEAMS: { a: string; b: string; makes: string }[] = [
  { a: "Journal", b: "Weather", makes: "Mood and weather patterns" },
  { a: "Journal", b: "Moon", makes: "New and full moon rituals on your daily card" },
  { a: "Little steps", b: "Calendar + GitHub", makes: "Steps that count themselves" },
  { a: "Dreams", b: "Calendar", makes: "Dream dates and reminders in your own calendar" },
  { a: "Everything", b: "AI", makes: "Letters from Future Me, built from your real progress" },
  { a: "Journal + Letters", b: "Voice", makes: "Speak your pages and hear your letters" },
];

export function ConnectionsView({ app, model }: { app: AppApi; model: Model }) {
  const [ai, setAi] = useState<boolean | null | undefined>(undefined);
  useEffect(() => {
    void aiStatus().then(setAi);
  }, []);
  const listen = canListen();
  const talk = canSpeak();

  return (
    <div>
      <p className="kicker">How Dearly is stitched together</p>
      <h1 className="page-title">Connections</h1>
      <p className="lede">
        Dearly is a patchwork. A journal, the sky, the moon, your calendar, your code, an AI, and
        your own voice are stitched into one place, and each one makes the others smarter.
      </p>

      <section className="seams paper" aria-label="What each stitch makes">
        {SEAMS.map((s) => (
          <div key={s.makes} className="seam">
            <span className="seam-a">{s.a}</span>
            <span className="seam-x" aria-hidden="true">
              <Icon name="plus" size={12} />
            </span>
            <span className="seam-b">{s.b}</span>
            <span className="seam-arrow" aria-hidden="true">
              →
            </span>
            <span className="seam-makes">{s.makes}</span>
          </div>
        ))}
      </section>

      <div className="organs">
        <Organ
          icon="lock"
          name="Your journal"
          via="Stored on this device"
          state="local"
          status={`${app.state.entries.length} pages · ${app.state.goals.length} dreams`}
          gives="The heart of it. Nothing here is uploaded unless you ask for letters."
        />
        <WeatherOrgan app={app} model={model} />
        <Organ
          icon="moon"
          name="Moon"
          via="Astronomy, calculated on your device"
          state="local"
          status={`Tonight: ${model.moon.name}, ${Math.round(model.moon.illumination * 100)}% lit`}
          gives="Brings new and full moon rituals to your daily card, and looks for moon patterns in your mood."
        />
        <CalendarOrgan app={app} />
        <GithubOrgan app={app} />
        <Organ
          icon="sparkles"
          name="AI"
          via="Any OpenAI-compatible model · on the server"
          state={ai ? "on" : "local"}
          status={
            ai === undefined
              ? "Checking…"
              : ai
                ? "Connected"
                : "Not set up, so letters are written on your device"
          }
          gives="Turns plain goals into little steps and writes your Future Me letters. Only a short summary is sent."
        />
        <Organ
          icon="mic"
          name="Voice"
          via="Built into your browser"
          state={listen || talk ? "local" : "off"}
          status={
            listen && talk
              ? "Ready to listen and read aloud"
              : talk
                ? "Read-aloud ready (voice typing needs Chrome, Edge, or Safari)"
                : "Not available in this browser"
          }
          gives="Speak your journal page instead of typing, and hear your letters read aloud."
        />
      </div>
    </div>
  );
}
