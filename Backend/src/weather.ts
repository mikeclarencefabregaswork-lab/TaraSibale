import { z } from "zod";

const HOUR = 3_600_000;
const island = { name: "Sibale Island (Concepcion)", latitude: 12.9131, longitude: 121.7204 };
// Offshore west of Sibale, toward Mindoro; a reference point, not a surveyed ferry route.
const offshore = { name: "Offshore west of Sibale", latitude: 12.93, longitude: 121.62 };
type Location = typeof island;
type Values = Record<string, number | null>;
export interface WeatherSection {
  status: "available" | "outdated" | "unavailable";
  retrievedAt: string | null;
  validAt: string | null;
  location: Location;
  grid: { latitude: number; longitude: number } | null;
  current: Values;
  hourly: { time: string; values: Values }[];
}
export interface WeatherReport {
  source: "Open-Meteo";
  weather: WeatherSection;
  marine: WeatherSection;
}
// The bounds reject malformed measurements; they are not travel-safety thresholds.
const weatherFields = {
  temperature_2m: ["°C", -100, 70],
  relative_humidity_2m: ["%", 0, 100],
  weather_code: ["wmo code", 0, 99],
  wind_speed_10m: ["km/h", 0, 500],
  wind_gusts_10m: ["km/h", 0, 500],
} satisfies Record<string, [string, number, number]>;
const marineFields = {
  wave_height: ["m", 0, 50],
  wave_period: ["s", 0, 100],
  wave_direction: ["°", 0, 360],
} satisfies Record<string, [string, number, number]>;
type Fields = Record<string, [string, number, number]>;
const record = z.record(z.string(), z.unknown());
const payload = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  current: record.optional(),
  current_units: record.optional(),
  hourly: record.optional(),
  hourly_units: record.optional(),
});
const isoTime = (value: unknown): string | null =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value < 8.64e12
    ? new Date(value * 1000).toISOString() : null;

function values(fields: Fields, input: Record<string, unknown>, units: Record<string, unknown>): Values {
  return Object.fromEntries(Object.entries(fields).map(([key, [unit, min, max]]) => {
    const value = input[key];
    return [key, units[key] === unit && typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
      && (key !== "weather_code" || Number.isInteger(value)) ? value : null];
  }));
}

function unavailable(location: Location): WeatherSection {
  return { status: "unavailable", location, grid: null, retrievedAt: null, validAt: null, current: {}, hourly: [] };
}

export function createWeatherService(options: {
  fetch?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
} = {}) {
  const request = options.fetch ?? globalThis.fetch;
  const now = options.now ?? Date.now;
  let cached: { until: number; report: WeatherReport } | undefined;
  let pending: Promise<WeatherReport> | undefined;

  async function section(marine: boolean): Promise<WeatherSection> {
    const location = marine ? offshore : island;
    const fields = marine ? marineFields : weatherFields;
    const hourlyFields = marine ? marineFields : {
      wind_speed_10m: weatherFields.wind_speed_10m,
      wind_gusts_10m: weatherFields.wind_gusts_10m,
    };
    const url = new URL(marine ? "https://marine-api.open-meteo.com/v1/marine" : "https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: String(location.latitude), longitude: String(location.longitude),
      current: Object.keys(fields).join(","), hourly: Object.keys(hourlyFields).join(","),
      forecast_hours: "25", timezone: "Asia/Manila", timeformat: "unixtime",
      ...(marine ? { cell_selection: "sea", length_unit: "metric" } : { wind_speed_unit: "kmh", temperature_unit: "celsius" }),
    }).toString();
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const body = await Promise.race([
        (async () => {
          const response = await request(url, { signal: controller.signal });
          if (!response.ok) throw new Error("Weather provider unavailable");
          return payload.parse(await response.json());
        })(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(new Error("Weather provider timed out")); }, options.timeoutMs ?? 8000);
        }),
      ]);
      const timestamp = now();
      const validAt = isoTime(body.current?.time);
      const current = values(fields, body.current ?? {}, body.current_units ?? {});
      const age = validAt ? timestamp - Date.parse(validAt) : Infinity;
      const hourStart = Math.floor(timestamp / HOUR) * HOUR;
      const seen = new Set<string>();
      const hourly = (Array.isArray(body.hourly?.time) ? body.hourly.time : []).flatMap((time, index) => {
        const iso = isoTime(time);
        if (!iso || seen.has(iso) || Date.parse(iso) < hourStart || Date.parse(iso) >= hourStart + 24 * HOUR) return [];
        seen.add(iso);
        const input = Object.fromEntries(Object.keys(hourlyFields).map(key => [key,
          Array.isArray(body.hourly?.[key]) ? body.hourly[key][index] : null]));
        return [{ time: iso, values: values(hourlyFields, input, body.hourly_units ?? {}) }];
      }).sort((a, b) => a.time.localeCompare(b.time));
      return {
        status: age < -30 * 60_000 || !validAt || !Object.values(current).some(value => value !== null)
          ? "unavailable" : age > 2 * HOUR ? "outdated" : "available",
        location, grid: { latitude: body.latitude, longitude: body.longitude },
        retrievedAt: new Date(timestamp).toISOString(), validAt, current, hourly,
      };
    } catch {
      return unavailable(location);
    } finally {
      clearTimeout(timer);
    }
  }

  return async function loadWeather(): Promise<WeatherReport> {
    if (cached && now() < cached.until) return cached.report;
    if (pending) return pending;
    pending = (async () => {
      const [weather, marine] = await Promise.all([section(false), section(true)]);
      const report: WeatherReport = { source: "Open-Meteo", weather, marine };
      cached = { report, until: now() + ([weather, marine].every(item => item.status === "available") ? 5 * 60_000 : 30_000) };
      return report;
    })();
    try { return await pending; }
    finally { pending = undefined; }
  };
}
