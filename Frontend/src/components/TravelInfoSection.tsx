import {
  Anchor,
  CheckSquare,
  ChevronRight,
  Clock,
  ShieldAlert,
  Square,
} from "lucide-react";
import React from "react";
import { FerryRoute } from "../types";
import { useSavedState } from "../userState";

interface TravelInfoSectionProps {
  ferryRoutes: FerryRoute[];
  isDarkMode: boolean;
  lastUpdated?: string;
}

export const TravelInfoSection: React.FC<TravelInfoSectionProps> = ({
  ferryRoutes,
  lastUpdated,
}) => {
  const [savedChecklists, setSavedChecklists] = useSavedState("checklists");
  const packingList = savedChecklists.packing || [
    {
      id: "p1",
      text: "Valid Government ID / Student ID for Ferry Registration",
      checked: true,
    },
    {
      id: "p2",
      text: "Waterproof Dry Bag (10L - 20L for boat transfers)",
      checked: true,
    },
    {
      id: "p3",
      text: "Cash in Philippine Pesos (Limited ATMs on Sibale Island)",
      checked: true,
    },
    { id: "p4", text: "Reef-Safe Sunscreen & Snorkel Mask", checked: false },
    { id: "p5", text: "Power Bank for Mobile Phones", checked: false },
    {
      id: "p6",
      text: "Personal Medications & Motion Sickness Pills",
      checked: false,
    },
  ];

  const toggleCheck = (id: string) => {
    setSavedChecklists((old) => ({
      ...old,
      packing: packingList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 backdrop-blur-md">
            <Anchor className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Ferry Schedules & Essential Travel Info
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
          Ferry timetable references, island transport information, and packing guides.
        </p>
      </div>

      {/* Ferry Timetables */}
      <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Daily Passenger Boat Schedules
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/40 font-extrabold backdrop-blur-md">
            {lastUpdated
              ? `Catalog refreshed ${lastUpdated}`
              : "Published schedules · confirm with operator"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ferryRoutes.map((route) => (
            <div
              key={route.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                <span className="text-xs font-black text-teal-800 dark:text-teal-300">
                  {route.boatName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-slate-950">
                  {route.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-normal block text-[10px]">
                    Origin
                  </span>
                  <span>{route.origin}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-300" />
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 font-normal block text-[10px]">
                    Destination
                  </span>
                  <span>{route.destination}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="block text-[10px] font-bold text-teal-800 dark:text-teal-300">
                    Departure
                  </span>
                  <span>{route.departureTime}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-teal-800 dark:text-teal-300">
                    Fare
                  </span>
                  <span>{route.fare}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-teal-800 dark:text-teal-300">
                    Frequency
                  </span>
                  <span>{route.frequency}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300/80 italic">
                Note: {route.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Hotlines & Packing Checklist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packing Checklist */}
        <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Island Travel Packing List
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Check off essentials before boarding your boat at Pinamalayan Port.
          </p>

          <div className="space-y-2">
            {packingList.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors backdrop-blur-md ${
                  item.checked
                    ? "bg-teal-500/15 border-teal-500/40 text-teal-950 dark:text-teal-200"
                    : "bg-slate-100/90 border-slate-200 text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-slate-300"
                }`}>
                {item.checked ? (
                  <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-300 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span
                  className={`text-xs ${item.checked ? "line-through opacity-80" : "font-semibold"}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Hotlines */}
        <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Emergency contacts
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Get current emergency contact numbers from local authorities before traveling.
          </p>
        </div>
      </div>
    </div>
  );
};
