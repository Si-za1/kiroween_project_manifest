import type { ISODate, WeatherDay, WeatherPlace } from "./types.ts";

// Open-Meteo: free, no API key, CORS enabled, so the browser calls it directly.
// Only the chosen city's coordinates are sent. No journal text ever leaves the device here.
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export type WeatherKind = "sunny" | "cloudy" | "rainy" | "snowy" | "stormy";

/** Groups WMO weather codes (used by Open-Meteo) into a few everyday kinds. */
export function weatherKind(code: number): WeatherKind {
  if (code <= 1) return "sunny";
  if (code <= 48) return "cloudy";
  if (code >= 95) return "stormy";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snowy";
  return "rainy";
}

export const WEATHER_LABEL: Record<WeatherKind, string> = {
  sunny: "Sunny",
  cloudy: "Cloudy",
  rainy: "Rainy",
  snowy: "Snowy",
  stormy: "Stormy",
};

type Fetch = typeof fetch;

export async function searchPlaces(query: string, f: Fetch = fetch): Promise<WeatherPlace[]> {
  const name = query.trim();
  if (name.length < 2 || name.length > 80) return [];
  const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=5&language=en&format=json`;
  const res = await f(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`geocoding_${res.status}`);
  const body = (await res.json()) as {
    results?: {
      name?: unknown;
      country?: unknown;
      admin1?: unknown;
      latitude?: unknown;
      longitude?: unknown;
    }[];
  };
  return (body.results ?? []).flatMap((r) => {
    if (
      typeof r.name !== "string" ||
      typeof r.latitude !== "number" ||
      typeof r.longitude !== "number"
    ) {
      return [];
    }
    const region = [r.admin1, r.country]
      .filter((x): x is string => typeof x === "string")
      .join(", ");
    return [{ name: r.name, region, latitude: r.latitude, longitude: r.longitude }];
  });
}

/** Daily weather for the last 92 days plus today, keyed by local date. */
export async function fetchWeatherDays(
  place: WeatherPlace,
  f: Fetch = fetch,
): Promise<Record<ISODate, WeatherDay>> {
  const params = new URLSearchParams({
    latitude: place.latitude.toFixed(4),
    longitude: place.longitude.toFixed(4),
    daily: "weather_code,temperature_2m_max",
    past_days: "92",
    forecast_days: "1",
    timezone: "auto",
  });
  const res = await f(`${FORECAST_URL}?${params}`, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`forecast_${res.status}`);
  const body = (await res.json()) as {
    daily?: { time?: unknown[]; weather_code?: unknown[]; temperature_2m_max?: unknown[] };
  };
  const time = body.daily?.time ?? [];
  const codes = body.daily?.weather_code ?? [];
  const temps = body.daily?.temperature_2m_max ?? [];
  const days: Record<ISODate, WeatherDay> = {};
  time.forEach((t, i) => {
    const code = codes[i];
    const temp = temps[i];
    if (typeof t === "string" && typeof code === "number") {
      days[t] = { code, tempC: typeof temp === "number" ? Math.round(temp) : null };
    }
  });
  return days;
}
