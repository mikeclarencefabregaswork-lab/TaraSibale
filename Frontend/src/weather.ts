export interface WeatherSection {
  status: "available" | "outdated" | "unavailable";
  retrievedAt: string | null;
  validAt: string | null;
  location: { name: string; latitude: number; longitude: number };
  grid: { latitude: number; longitude: number } | null;
  current: Record<string, number | null>;
  hourly: { time: string; values: Record<string, number | null> }[];
}
export interface WeatherReport {
  source: "Open-Meteo";
  weather: WeatherSection;
  marine: WeatherSection;
}
const HOUR = 3_600_000;
export function sectionStatus(section: WeatherSection | undefined, now: number, failed = false) {
  if (!section || section.status === "unavailable") return "unavailable";
  const valid = Date.parse(section.validAt ?? "");
  const retrieved = Date.parse(section.retrievedAt ?? "");
  if (!Number.isFinite(valid) || !Number.isFinite(retrieved) || valid > now + 30 * 60_000 || retrieved > now + 60_000) return "unavailable";
  return failed || section.status === "outdated" || now - valid > 2 * HOUR || now - retrieved > 30 * 60_000 ? "outdated" : "available";
}
export const measurement = (value: number | null | undefined, unit: string) =>
  typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(1)} ${unit}` : "Unavailable";
export const manilaTime = (value: string | null | undefined) =>
  value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(value)) : "Unavailable";

const conditions: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle", 56: "Freezing drizzle", 57: "Freezing drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 66: "Freezing rain", 67: "Freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Light rain showers", 81: "Rain showers", 82: "Violent rain showers", 85: "Snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
};
export const condition = (code: number | null | undefined) => code == null ? "Conditions unavailable" : conditions[code] ?? "Conditions unavailable";

export function hourlyOutlook(report: WeatherReport, now: number, failed = false) {
  const start = Math.floor(now / HOUR) * HOUR;
  const weather = new Map(sectionStatus(report.weather, now, failed) === "available" ? report.weather.hourly.map(row => [row.time, row.values]) : []);
  const marine = new Map(sectionStatus(report.marine, now, failed) === "available" ? report.marine.hourly.map(row => [row.time, row.values]) : []);
  return Array.from({ length: 24 }, (_, index) => {
    const time = new Date(start + index * HOUR).toISOString();
    return { time, wind: weather.get(time)?.wind_speed_10m, gusts: weather.get(time)?.wind_gusts_10m,
      height: marine.get(time)?.wave_height, period: marine.get(time)?.wave_period, direction: marine.get(time)?.wave_direction };
  });
}

export async function fetchWeather(signal: AbortSignal): Promise<WeatherReport> {
  const response = await fetch("/api/weather", { signal, credentials: "omit", cache: "no-store" });
  if (!response.ok) throw new Error("Weather service unavailable");
  const report = await response.json() as WeatherReport;
  // Check the response envelope before rendering. Measurements are also guarded when displayed.
  for (const section of [report?.weather, report?.marine]) {
    if (!section || !["available", "outdated", "unavailable"].includes(section.status)
      || !section.location || typeof section.location.name !== "string"
      || !Number.isFinite(section.location.latitude) || !Number.isFinite(section.location.longitude)
      || (section.grid !== null && (!section.grid || !Number.isFinite(section.grid.latitude) || !Number.isFinite(section.grid.longitude)))
      || !section.current || typeof section.current !== "object" || !Array.isArray(section.hourly)
      || section.hourly.some(row => !row || typeof row.time !== "string" || !row.values || typeof row.values !== "object")) {
      throw new Error("Invalid weather response");
    }
  }
  return report;
}
