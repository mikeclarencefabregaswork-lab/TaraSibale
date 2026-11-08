import {
  Calendar,
  Compass,
  Map,
  Navigation,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import React from "react";
import { LiveWeather } from "./LiveWeather";

interface HeroProps {
  setActiveTab: (tab: string) => void;
  onOpenAiChat: () => void;
  isDarkMode: boolean;
}

export const Hero: React.FC<HeroProps> = ({ setActiveTab, onOpenAiChat }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-2xl bg-white/10 dark:bg-slate-900/60 text-white">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80"
        alt="Illustrative tropical beach"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#061e2c]/85 via-[#103c50]/60 to-[#073b4c]/25" />

      {/* Decorative Glowing Blur Blobs */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-20 lg:py-24 flex flex-col items-start justify-between min-h-[460px]">
        {/* Top Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40 backdrop-blur-md shadow-[0_0_10px_rgba(46,196,182,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            TaraSibale • Portfolio Prototype
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-200 border border-white/20 backdrop-blur-md">
            <Waves className="w-3.5 h-3.5 text-cyan-300" />
            Sibale Island (Maestro de Campo)
          </span>
        </div>

        <LiveWeather />

        {/* Headline & Description */}
        <div className="max-w-2xl mb-8 space-y-3">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md [text-wrap:balance]">
            Uncover Romblon's <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-sm">
              Hidden Island Paradise
            </span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-200/90 leading-relaxed font-normal drop-shadow-sm">
            Welcome to Concepcion on Sibale Island! Experience powdery white
            beaches like Bachawan, explore coastal formations and island
            heritage, savor authentic Asi delicacies, and stay in cozy local
            homestays.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("map")}
            className="min-h-[48px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-[0_0_20px_rgba(46,196,182,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            <Map className="w-4 h-4 shrink-0" />
            <span>Interactive Island Map</span>
          </button>

          <button
            onClick={() => setActiveTab("itinerary")}
            className="min-h-[48px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 backdrop-blur-md hover:scale-[1.02] transition-all cursor-pointer">
            <Calendar className="w-4 h-4 text-teal-300 shrink-0" />
            <span>Plan Itinerary</span>
          </button>

          <button
            onClick={() => setActiveTab("stay")}
            className="min-h-[48px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-slate-100 border border-white/20 backdrop-blur-md hover:scale-[1.02] transition-all cursor-pointer">
            <Compass className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>View Sample Stays</span>
          </button>

          <button
            onClick={onOpenAiChat}
            className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 backdrop-blur-md transition-all cursor-pointer">
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>Ask Island Travel Guide</span>
          </button>
        </div>

        {/* Quick Island Feature Metrics Bar */}
        <div className="w-full mt-10 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white">
                Island Beaches
              </p>
              <p className="text-slate-300/80 text-[11px]">
                Bachawan, Dampali, San Pedro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white">
                Island Landmarks
              </p>
              <p className="text-slate-300/80 text-[11px]">
                Nature & Cultural Sites
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white">
                Daily Passenger Boat
              </p>
              <p className="text-slate-300/80 text-[11px]">
                Pinamalayan (Mindoro) 1.5h
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white">
                Offline Accessibility
              </p>
              <p className="text-slate-300/80 text-[11px]">
                Saved trip notes & vouchers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
