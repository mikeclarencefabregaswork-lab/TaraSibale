import { useState } from "react";

export function PortfolioNotice() {
  const [reset, setReset] = useState(false);
  return (
    <aside aria-label="Portfolio information" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 print:block">
      <div className="rounded-2xl border border-amber-400/40 bg-amber-50 p-4 text-sm text-amber-950 dark:bg-slate-900 dark:text-amber-100">
        <p className="font-bold">Independent portfolio prototype — not an official municipal website.</p>
        <p className="mt-1">Sample routes, schedules and prices demonstrate features. Do not use this demo for navigation, emergencies or reservations. No municipal endorsement is claimed.</p>
        <details className="mt-2">
          <summary className="cursor-pointer font-semibold">Demo data, privacy & credits</summary>
          <div className="mt-2 space-y-2 text-xs leading-relaxed">
            <p>Use fictitious information only. Accounts, uploads, bookings and publishing are unavailable in portfolio mode. Personal IDs and travel documents must not be submitted.</p>
            <p>Theme, navigation, sample itineraries and checklists may be saved in this browser. Existing account records are not exposed by portfolio mode. Hosting infrastructure may process connection information; hosting notices must be completed before deployment.</p>
            <p>Destination photos and illustrative images retain their available source credits. Map layers use Esri, OpenTopoMap and CARTO imagery with provider attribution on the map. Sample routes are unverified. Reference positions may come from <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors (ODbL)</a>.</p>
            <p>User content must be owned or appropriately licensed, factual and respectful. Public posting is disabled; there is no active booking, guide dispatch or municipal service.</p>
            <p><a className="underline" href="/THIRD_PARTY_NOTICES.txt" target="_blank" rel="noreferrer">Third-party software notices</a> · TaraSibale project logo; third-party photographs retain their own rights.</p>
            <button type="button" className="rounded-lg border border-current px-3 py-2" onClick={() => {
              for (const key of ["tara_sibale_portfolio_state", "tara_sibale_theme", "tara_sibale_active_tab", "concepcion_offline_map_cached"]) localStorage.removeItem(key);
              setReset(true);
              window.location.reload();
            }}>Clear this browser’s demo preferences</button>
            {reset && <p role="status">Demo preferences cleared.</p>}
          </div>
        </details>
      </div>
    </aside>
  );
}

export function PortfolioCollectionNotice({ kind = "account", onContinue }: { kind?: "account" | "documents"; onContinue?: () => void }) {
  return <section className="mx-auto max-w-2xl rounded-3xl border border-teal-500/30 bg-white p-6 text-slate-900 shadow-lg dark:bg-slate-900 dark:text-white">
    <h2 className="text-xl font-bold">{kind === "documents" ? "Sample document vault" : "Explore without an account"}</h2>
    <p className="mt-3 text-sm">This is a portfolio demonstration. {kind === "documents" ? "File selection and uploads are disabled. Do not provide IDs, tickets or personal documents." : "Login and registration are disabled. No email address or password is needed."}</p>
    <div className="my-4 rounded-xl border border-dashed border-teal-500/50 p-4">
      <p className="font-semibold">{kind === "documents" ? "SAMPLE TICKET — DEMO ONLY" : "Sample traveler: Alex Demo"}</p>
      <p className="mt-1 text-xs">Fictitious example • no valid reservation, identity document or account</p>
    </div>
    <p className="text-xs">You can explore the catalog, create a sample itinerary and try the map simulation. Use fictitious details only.</p>
    {onContinue && <button type="button" onClick={onContinue} className="mt-4 rounded-xl bg-teal-500 px-4 py-3 font-bold text-slate-950">Continue exploring</button>}
  </section>;
}
