import React from "react";
import type { CultureItem } from "../types";

export function FiestasAndCustoms({ cultureItems }: { cultureItems: CultureItem[] }): React.ReactElement {
  const barangayFiestas = cultureItems
    .filter((item) => item.category === "fiesta-directory")
    .sort((a, b) => (a.barangay ?? a.title).localeCompare(b.barangay ?? b.title));
  const events = cultureItems
    .filter((c) => c.category === "event" || c.category === "tradition")
    .sort(
      (a, b) => Number(b.category === "event") - Number(a.category === "event"),
    );

  return (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-950 dark:text-amber-100">
            <strong>Planning a fiesta visit?</strong> December 8 is the town’s patronal
            feast date. The customs below are documented in older local
            reporting; confirm the current year’s program with the parish or
            municipality.
          </div>
          <section aria-labelledby="barangay-fiestas-heading" className="space-y-4">
            <div className="space-y-2">
              <h2 id="barangay-fiestas-heading" className="text-xl font-black text-slate-900 dark:text-white">Barangay Fiestas</h2>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {barangayFiestas.length} barangays listed. This directory covers barangays, not a verified fiesta calendar.
                Dates, patron saints and celebration details await local confirmation.
                PSA confirms barangay names only. Confirm details with the barangay or local chapel before planning a visit.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {barangayFiestas.map((item) => (
                <article key={item.id} aria-labelledby={`${item.id}-heading`} className="min-w-0 rounded-2xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 p-5 shadow-sm">
                  <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-900 dark:text-amber-200">Details pending</span>
                  <h3 id={`${item.id}-heading`} className="mt-3 text-lg font-black text-slate-900 dark:text-white">{item.barangay ?? item.title}</h3>
                  <dl className="mt-4 space-y-3 text-xs">
                    <div className="space-y-1"><dt className="text-slate-500 dark:text-slate-400">Fiesta date</dt><dd className="font-semibold text-slate-800 dark:text-slate-100">{item.dateLabel || "To be confirmed"}</dd></div>
                    <div className="space-y-1"><dt className="text-slate-500 dark:text-slate-400">Patron saint</dt><dd className="font-semibold text-slate-800 dark:text-slate-100">{item.patronSaint || "To be confirmed"}</dd></div>
                  </dl>
                  {item.sources?.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" title={source.title} className="mt-4 block text-xs underline text-teal-700 dark:text-teal-300">Barangay-name source (PSA)</a>)}
                  {item.verifiedAt && <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Barangay-name source checked {item.verifiedAt}.</p>}
                </article>
              ))}
            </div>
          </section>
          <h2 className="pt-4 text-xl font-black text-slate-900 dark:text-white">Town Fiesta &amp; Documented Customs</h2>
          {events.map((event) => (
            <div
              key={event.id}
              className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white space-y-4 hover:border-teal-500/60 transition-all shadow-sm">
              {event.image && (
                <div className="h-56 rounded-2xl overflow-hidden bg-slate-900/40">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">
                  {event.category === "tradition"
                    ? "Documented Local Custom"
                    : "Patronal Feast"}
                </span>
                <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">
                  {event.title}
                </h3>
                {event.dateLabel && (
                  <p className="text-sm font-bold mt-2 text-teal-800 dark:text-teal-200">
                    {event.dateLabel}
                  </p>
                )}
                {event.evidenceLabel && (
                  <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
                    {event.evidenceLabel}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {event.description}
                </p>
                <div className="mt-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200 backdrop-blur-md">
                  {event.detailText}
                </div>
                {event.sources && (
                  <div className="mt-4 border-t border-slate-200 dark:border-white/10 pt-3 text-xs space-y-2">
                    <p className="font-bold">Sources</p>
                    {event.sources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block underline text-teal-700 dark:text-teal-300">
                        {source.title}
                      </a>
                    ))}
                    <p className="text-[10px] text-slate-500">
                      Sources checked {event.verifiedAt}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
  );
}
