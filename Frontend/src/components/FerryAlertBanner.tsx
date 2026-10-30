import { AlertTriangle, Calendar, RefreshCw, Ship, Waves, X } from 'lucide-react';
import React from 'react';
import { FerryRoute } from '../types';

export interface ActiveFerryAlert {
  impactedFerry: FerryRoute;
  affectedDayNumber: number;
  itineraryItemId: string;
  alternativeFerry?: FerryRoute;
}

interface FerryAlertBannerProps {
  alert: ActiveFerryAlert | null;
  onDismiss: () => void;
  onSwapFerry: (affectedDayNumber: number, itineraryItemId: string, newFerry: FerryRoute) => void;
  onViewItinerary: () => void;
  isDarkMode: boolean;
}

export const FerryAlertBanner: React.FC<FerryAlertBannerProps> = ({
  alert,
  onDismiss,
  onSwapFerry,
  onViewItinerary }) => {
  if (!alert) return null;

  const { impactedFerry, affectedDayNumber, itineraryItemId, alternativeFerry } = alert;
  const isCancelled = impactedFerry.status === 'CANCELLED_SEA';
  const isDelayed = impactedFerry.status === 'DELAYED';

  return (
    <aside
      aria-label="Maritime Advisory Alert"
      role="alert"
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none animate-slideDown"
    >
      <div
        className={`pointer-events-auto w-full max-w-2xl rounded-2xl border shadow-2xl backdrop-blur-xl transition-all overflow-hidden ${isCancelled
            ? 'bg-[#1e070c]/95 border-rose-500/40 text-rose-50 shadow-[0_12px_40px_rgba(225,29,72,0.35)]'
            : isDelayed
              ? 'bg-[#1c1204]/95 border-amber-500/40 text-amber-50 shadow-[0_12px_40px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/95 border-blue-500/40 text-blue-50 shadow-2xl'
          }`}
      >
        {/* Top Warning Strip */}
        <div className={`px-4 py-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider ${isCancelled
            ? 'bg-rose-500/20 text-rose-300 border-b border-rose-500/30'
            : 'bg-amber-500/20 text-amber-300 border-b border-amber-500/30'
          }`}>
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {isCancelled ? 'Coast Guard Gale Advisory · Trip Cancelled' : 'Maritime Notice · Schedule Delayed'}
            </span>
          </div>
          <span className="font-semibold text-slate-300 lowercase text-[10px]">
            affects Day {affectedDayNumber} itinerary
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isCancelled
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
              {isCancelled ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Ship className="w-6 h-6" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                  {impactedFerry.boatName}
                </h4>
                <span className="text-xs text-slate-300">
                  ({impactedFerry.origin.split(' ')[0]} ➔ {impactedFerry.destination.split(' ')[0]})
                </span>
              </div>

              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {impactedFerry.advisoryReason || (
                  isCancelled
                    ? 'Cancelled by Coast Guard sub-station due to high swell sea advisory in Tablas Strait.'
                    : `Delayed by ${impactedFerry.delayDuration || '1 hour 30 mins'} awaiting calmer tidal clearance.`
                )}
              </p>

              {alternativeFerry && (
                <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    <strong>Alternative Ready:</strong> {alternativeFerry.boatName} ({alternativeFerry.departureTime})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
            {alternativeFerry ? (
              <button
                onClick={() => onSwapFerry(affectedDayNumber, itineraryItemId, alternativeFerry)}
                className={`min-h-[44px] flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-lg transition-all ${isCancelled
                    ? 'bg-rose-500 hover:bg-rose-400 text-white active:scale-95'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                  }`}
                title="Swap affected boat in your itinerary"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Swap to Next Boat</span>
              </button>
            ) : (
              <button
                onClick={onViewItinerary}
                className="min-h-[44px] flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>View Itinerary</span>
              </button>
            )}

            <button
              onClick={onDismiss}
              aria-label="Dismiss maritime alert"
              className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
