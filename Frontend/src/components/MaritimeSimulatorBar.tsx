import { ChevronDown, ChevronUp, Radio } from "lucide-react";
import { useState } from "react";
import { errorText } from "../api";
import type { FerryRoute } from "../types";

interface MaritimeSimulatorBarProps {
  ferryRoutes: FerryRoute[];
  onUpdateFerryStatus: (
    ferryId: string,
    status: FerryRoute["status"],
    advisoryReason?: string,
    delayDuration?: string,
  ) => Promise<void>;
  isDarkMode: boolean;
}

/** Administrator publishing controls. Statuses are entered from operator reports. */
export function MaritimeSimulatorBar({
  ferryRoutes,
  onUpdateFerryStatus,
  isDarkMode,
}: MaritimeSimulatorBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [routeId, setRouteId] = useState("");
  const [status, setStatus] = useState<FerryRoute["status"]>("SCHEDULED");
  const [advisory, setAdvisory] = useState("");
  const [delay, setDelay] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selected =
    ferryRoutes.find((route) => route.id === routeId) || ferryRoutes[0];
  const fieldClass =
    "w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs";
  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 max-w-sm pointer-events-auto">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="min-h-[44px] px-3.5 py-2 rounded-2xl border shadow-xl flex items-center gap-2 text-xs font-bold bg-white text-teal-800 dark:bg-slate-900 dark:text-teal-300 border-teal-500/30">
          <Radio className="w-4 h-4" /> Ferry Schedule Updates{" "}
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div
          className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl space-y-3 ${isDarkMode ? "bg-slate-950 text-white border-slate-700" : "bg-white text-slate-900 border-slate-200"}`}>
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-xs font-black uppercase">
              Publish Ferry Status
            </h4>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Minimize ferry updates">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Publish confirmed operator information to the shared schedule.
          </p>
          {error && (
            <p role="alert" className="text-xs text-rose-600">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="text-xs text-teal-600">
              {message}
            </p>
          )}
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!selected || saving) return;
              setSaving(true);
              setError(null);
              setMessage(null);
              try {
                await onUpdateFerryStatus(
                  selected.id,
                  status,
                  advisory || undefined,
                  status === "DELAYED" ? delay || undefined : undefined,
                );
                setMessage("Ferry status published.");
              } catch (error) {
                setError(errorText(error));
              } finally {
                setSaving(false);
              }
            }}>
            <label className="block text-xs font-bold">
              Ferry
              <select
                className={fieldClass}
                value={selected?.id || ""}
                onChange={(event) => {
                  const route = ferryRoutes.find(
                    (item) => item.id === event.target.value,
                  );
                  setRouteId(event.target.value);
                  if (route) {
                    setStatus(route.status);
                    setAdvisory(route.advisoryReason || "");
                    setDelay(route.delayDuration || "");
                  }
                }}>
                {ferryRoutes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.boatName}: {route.origin} to {route.destination}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold">
              Status
              <select
                className={fieldClass}
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as FerryRoute["status"])
                }>
                {(
                  [
                    "SCHEDULED",
                    "BOARDING",
                    "ON_TIME",
                    "DELAYED",
                    "CANCELLED_SEA",
                  ] as const
                ).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold">
              Operator advisory
              <textarea
                className={fieldClass}
                value={advisory}
                onChange={(event) => setAdvisory(event.target.value)}
                maxLength={3000}
              />
            </label>
            {status === "DELAYED" && (
              <label className="block text-xs font-bold">
                Reported delay
                <input
                  className={fieldClass}
                  value={delay}
                  onChange={(event) => setDelay(event.target.value)}
                  maxLength={100}
                />
              </label>
            )}
            <button
              type="submit"
              disabled={saving || !selected}
              className="w-full min-h-[40px] p-2 rounded-xl bg-teal-600 text-white text-xs font-bold disabled:opacity-50">
              {saving ? "Publishing…" : "Publish Schedule Update"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
