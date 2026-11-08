import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, RefreshCw, Waves } from "lucide-react";
import { condition, fetchWeather, hourlyOutlook, manilaTime, measurement, sectionStatus } from "../weather";
import type { WeatherReport, WeatherSection } from "../weather";

function Conditions({ title, section, marine, now, failed }: {
  title: string; section?: WeatherSection; marine?: boolean; now: number; failed: boolean;
}): React.ReactElement {
  const status = sectionStatus(section, now, failed);
  const current = status === "available" ? section?.current ?? {} : {};
  const fields = marine ? [
    ["Significant wave height", measurement(current.wave_height, "m")],
    ["Wave period", measurement(current.wave_period, "s")],
    ["Waves coming from", measurement(current.wave_direction, "°")],
  ] : [
    ["Temperature", measurement(current.temperature_2m, "°C")],
    ["Conditions", condition(current.weather_code)],
    ["Humidity", measurement(current.relative_humidity_2m, "%")],
    ["Wind at 10 m", measurement(current.wind_speed_10m, "km/h")],
    ["Wind gusts at 10 m", measurement(current.wind_gusts_10m, "km/h")],
  ];
  return <section className="rounded-xl border border-white/15 bg-white/5 p-4 min-w-0">
    <h3 className="font-bold text-white">{title}</h3>
    <p className="mt-1 text-xs text-cyan-100">{status === "available" ? "Model estimates" : status === "outdated" ? "Outdated — refresh before use" : "Data unavailable"}</p>
    <dl className="mt-3 space-y-2 text-xs">
      {fields.map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt className="text-slate-300">{label}</dt><dd className="font-semibold text-white">{value}</dd></div>)}
    </dl>
    <p className="mt-3 text-xs text-slate-300">Valid: {manilaTime(section?.validAt)} PHT<br />Retrieved: {manilaTime(section?.retrievedAt)} PHT</p>
    {section && <p className="mt-2 text-xs text-slate-300 break-words">
      Reference: {section.location.name} ({section.location.latitude.toFixed(3)}° N, {section.location.longitude.toFixed(3)}° E).
      {section.grid && <> Model grid: {section.grid.latitude.toFixed(3)}° N, {section.grid.longitude.toFixed(3)}° E.</>}
    </p>}
  </section>;
}

export function WeatherView({ report, loading, failed, now, onRetry }: {
  report?: WeatherReport; loading: boolean; failed: boolean; now: number; onRetry: () => void;
}) {
  const weatherStatus = sectionStatus(report?.weather, now, failed);
  const marineStatus = sectionStatus(report?.marine, now, failed);
  const summary = loading && !report ? "Loading weather…" : weatherStatus === "available"
    ? `${measurement(report?.weather.current.temperature_2m, "°C")} · ${condition(report?.weather.current.weather_code)}`
    : weatherStatus === "outdated" ? "Weather outdated" : "Weather unavailable";
  const rows = report ? hourlyOutlook(report, now, failed) : [];
  return <div className="mb-6 w-full max-w-3xl rounded-2xl border border-cyan-200/25 bg-slate-950/70 p-3 sm:p-4 backdrop-blur-md">
    <details>
      <summary className="cursor-pointer list-none flex flex-wrap items-center gap-2 text-sm font-semibold text-cyan-100 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">
        <Waves className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span role="status">{summary}</span>
        <span className="text-xs text-slate-200">· {marineStatus === "available" ? `Waves ${measurement(report?.marine.current.wave_height, "m")}` : marineStatus === "outdated" ? "Sea data outdated" : "Sea data unavailable"}</span>
        <span className="ml-auto inline-flex items-center gap-1 text-xs underline underline-offset-4">Sea conditions <ChevronDown className="h-3 w-3" aria-hidden="true" /></span>
      </summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Conditions title="Sibale weather" section={report?.weather} now={now} failed={failed} />
        <Conditions title="Nearby offshore sea" section={report?.marine} marine now={now} failed={failed} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-200">Significant wave height is the average height of the highest third of waves; individual waves can be higher. Period is the time between waves, not wave force. Direction is where waves come from (0° north, 90° east). One offshore model point does not cover the entire ferry crossing or conditions at the port.</p>
      {rows.length > 0 && <div className="mt-4">
        <h3 className="text-sm font-bold">24-hour model outlook</h3>
        <p className="mt-1 text-xs text-slate-300">All times Asia/Manila (PHT). Wind is for Sibale; waves are for the offshore point. Missing values are unavailable.</p>
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-white/15 focus-visible:outline-2 focus-visible:outline-cyan-200" tabIndex={0} role="region" aria-label="Hourly wind and wave forecast">
          <table className="w-full min-w-[660px] text-left text-xs">
            <caption className="sr-only">Hourly model estimates for Sibale wind and nearby offshore waves; no ferry clearance implied</caption>
            <thead className="sticky top-0 bg-slate-900 text-cyan-100"><tr>{["Time (PHT)", "Wave height", "Period", "Waves from", "Island wind", "Island gusts"].map(label => <th key={label} scope="col" className="p-2 font-semibold">{label}</th>)}</tr></thead>
            <tbody>{rows.map(row => <tr key={row.time} className="border-t border-white/10 text-slate-100">
              <th scope="row" className="p-2 font-normal whitespace-nowrap">{manilaTime(row.time)}</th>
              {[measurement(row.height, "m"), measurement(row.period, "s"), measurement(row.direction, "°"), measurement(row.wind, "km/h"), measurement(row.gusts, "km/h")].map((value, index) => <td key={index} className="p-2 whitespace-nowrap">{value}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
      </div>}
      <p className="mt-3 text-xs text-slate-300">Weather data by <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> (<a className="underline" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>). Model estimates, not local observations or navigation guidance. Refreshes every 15 minutes.</p>
    </details>
    <div className="mt-3 flex flex-wrap items-start justify-between gap-3 border-t border-white/15 pt-3">
      <div className="min-w-0 flex-1 basis-60 text-xs leading-relaxed text-amber-100">
        <p className="font-bold">Ferry safety not assessed</p>
        <p>Check <a href="https://www.pagasa.dost.gov.ph/marine/gale-warning" target="_blank" rel="noreferrer" className="underline underline-offset-2">PAGASA gale warnings</a> and <a href="https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin" target="_blank" rel="noreferrer" className="underline underline-offset-2">cyclone bulletins</a>. Confirm sailing status with the local Coast Guard/port and ferry operator before travel. Official advisories are not checked automatically here.</p>
      </div>
      <button type="button" onClick={onRetry} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/25 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />{loading ? "Refreshing…" : "Refresh weather"}
      </button>
    </div>
    {failed && <p role="status" className="mt-2 text-xs text-amber-100">Could not refresh. Previous values are withheld; retry when connected.</p>}
  </div>;
}

export function LiveWeather() {
  const [report, setReport] = useState<WeatherReport>();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(Date.now);
  const active = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const next = await fetchWeather(controller.signal);
      if (active.current === controller) { setReport(next); setFailed(false); }
    } catch {
      if (active.current === controller) setFailed(true);
    } finally {
      clearTimeout(timer);
      if (active.current === controller) { active.current = null; setLoading(false); setNow(Date.now()); }
    }
  }, []);
  useEffect(() => {
    // Only async network completion updates state; no derived state is synchronized here.
    // oxlint-disable-next-line react/set-state-in-effect
    void refresh();
    const poll = setInterval(() => { setLoading(true); void refresh(); }, 15 * 60_000);
    const clock = setInterval(() => setNow(Date.now()), 30_000);
    return () => { const controller = active.current; active.current = null; controller?.abort(); clearInterval(poll); clearInterval(clock); };
  }, [refresh]);
  return <WeatherView report={report} loading={loading} failed={failed} now={now} onRetry={() => { setLoading(true); void refresh(); }} />;
}
