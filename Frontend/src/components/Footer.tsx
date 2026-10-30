import { Heart } from 'lucide-react';
import React, { useState } from 'react';

interface FooterProps {
  isDarkMode: boolean;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <footer className="mt-16 border-t border-white/10 bg-ocean backdrop-blur-2xl text-slate-300">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white p-0.5 shadow-[0_0_12px_rgba(46,196,182,0.4)] ring-2 ring-teal-400/60 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/tarasibale-logo.png"
                  alt="TaraSibale Logo"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-black text-lg text-white">TaraSibale</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300/80">
              The official digital tourism portal and travel companion for Concepcion on Sibale Island (Maestro de Campo), Province of Romblon, Philippines.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-teal-300 uppercase tracking-wider mb-2">Explore Island</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setActiveTab('explore')} className="hover:text-teal-300 transition-colors cursor-pointer">
                  • White Sand Beaches
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('map')} className="hover:text-teal-300 transition-colors cursor-pointer">
                  • Interactive Island Map
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('stay')} className="hover:text-teal-300 transition-colors cursor-pointer">
                  • Local Homestay Booking
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('guide')} className="hover:text-teal-300 transition-colors cursor-pointer">
                  • Asi Dialect Phrasebook
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('auth')} className="hover:text-teal-300 transition-colors cursor-pointer font-bold text-teal-400">
                  • Login & Sign Up Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Travel Advisories */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-teal-300 uppercase tracking-wider mb-2">Visitor Info</h4>
            <ul className="space-y-1.5 text-slate-300/80">
              <li>• Main Access: Pinamalayan Port (Mindoro)</li>
              <li>• Island Boat Time: 1.5 Hours</li>
              <li>• Cell Signal: Best in Poblacion</li>
              <li>• Currency: Philippine Peso (Bring Cash)</li>
            </ul>
          </div>

          {/* Emergency Hotlines */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-teal-300 uppercase tracking-wider mb-2">Emergency Hotlines</h4>
            <p className="text-slate-300/80">• MDRRMO Disaster: +63 917 555 7422</p>
            <p className="text-slate-300/80">• Coast Guard Substation: +63 928 440 1982</p>
            <p className="text-slate-300/80">• Municipal Police: +63 998 776 5432</p>
            <p className="text-slate-300/80">• Rural Health Unit: +63 919 887 6543</p>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {year} Municipality of Concepcion, Romblon Tourism. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-300">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>for Sibale Island Visitors</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
