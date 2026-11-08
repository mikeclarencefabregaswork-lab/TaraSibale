import React, { useEffect, useRef } from "react";
import { RefreshCw, Waves, X } from "lucide-react";
import { condition, hourlyOutlook, manilaTime, measurement, sectionStatus } from "../weather";
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

interface WeatherState {
  report?: WeatherReport; loading: boolean; failed: boolean; now: number;
}

export function WeatherSummary({ report, loading, failed, now }: WeatherState) {
  const weatherStatus = sectionStatus(report?.weather, now, failed);
  const marineStatus = sectionStatus(report?.marine, now, failed);
  const summary = loading && !report ? "Loading weather…" : weatherStatus === "available"
    ? `${measurement(report?.weather.current.temperature_2m, "°C")} · ${condition(report?.weather.current.weather_code)}`
    : weatherStatus === "outdated" ? "Weather outdated" : "Weather unavailable";
  return <span role="status" className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-full border border-teal-300/70 bg-teal-400/90 px-3 py-1 text-xs font-semibold text-slate-950 shadow-sm backdrop-blur-md">
    <Waves className="h-3.5 w-3.5 shrink-0 text-teal-950" aria-hidden="true" />
    <span>{summary}</span>
    <span>· {marineStatus === "available" ? `Waves ${measurement(report?.marine.current.wave_height, "m")}` : marineStatus === "outdated" ? "Sea data outdated" : "Sea data unavailable"}</span>
  </span>;
}

export function WeatherView({ report, loading, failed, now, onRetry }: WeatherState & { onRetry: () => void }) {
  const rows = report ? hourlyOutlook(report, now, failed) : [];
  return <div className="text-white">
    <WeatherSummary report={report} loading={loading} failed={failed} now={now} />
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

export function WeatherDialog({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  return <dialog ref={dialogRef} aria-labelledby="weather-dialog-title" onClose={onClose}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    className="weather-dialog fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-cyan-200/25 bg-[#0b2d40] p-0 text-white shadow-2xl backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm">
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="weather-dialog-title" className="text-lg font-extrabold">Weather &amp; sea conditions</h2>
        <button type="button" autoFocus onClick={onClose} aria-label="Close weather details" className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cyan-200">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
  </dialog>;
}
