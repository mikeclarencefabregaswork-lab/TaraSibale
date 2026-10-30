import {
  BookOpen,
  Calendar,
  Compass,
  FileText,
  Home,
  Map,
  MoreHorizontal,
  Palmtree,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  unreadMessagesCount?: number;
  onVisibilityChange?: (visible: boolean) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  unreadMessagesCount = 0,
  onVisibilityChange
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isScrolledVisible, setIsScrolledVisible] = useState(true);
  const lastScrollY = useRef(0);

  // If user opens the More drawer, keep the navigation bar shown
  const isNavVisible = isScrolledVisible || showMoreMenu;

  useEffect(() => {
    onVisibilityChange?.(isNavVisible);
  }, [isNavVisible, onVisibilityChange]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show when near the very top of the page (within 40px)
      if (currentScrollY < 40) {
        setIsScrolledVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY.current;
      // 12px threshold to filter out tiny micro-scroll movements and touch bounces
      if (Math.abs(delta) < 12) {
        return;
      }

      if (delta > 0 && currentScrollY > 60) {
        // Scrolling down -> hide the bottom bar
        setIsScrolledVisible(false);
      } else if (delta < 0) {
        // Scrolling up -> show the bottom bar
        setIsScrolledVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryTabs = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'stay', label: 'Stay', icon: Home },
    { id: 'guide', label: 'Culture', icon: BookOpen },
    { id: 'more', label: 'More', icon: MoreHorizontal, badge: unreadMessagesCount > 0 }
  ];

  const secondaryTabs = [
    {
      id: 'itinerary',
      label: 'Travel Itinerary',
      desc: 'Day-by-day plan with drag & drop reorder',
      icon: Calendar,
      color: 'text-teal-500 bg-teal-500/10'
    },
    {
      id: 'travel',
      label: 'Ferry & Travel Info',
      desc: 'Boat timetables, port access & tricycles',
      icon: ShieldAlert,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'group',
      label: 'Group Chat',
      desc: 'Connect with active travelers & local guides',
      icon: Users,
      badge: unreadMessagesCount,
      color: 'text-teal-500 bg-teal-500/10'
    },
    {
      id: 'documents',
      label: 'Vault & Calendar Sync',
      desc: 'Offline travel passes & trip documents',
      icon: FileText,
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      id: 'social',
      label: 'Community Feed',
      desc: 'Island stories & photo moments',
      icon: Palmtree,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      id: 'reviews',
      label: 'Community Ratings',
      desc: 'Traveler feedback on beaches & kubos',
      icon: Star,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 'admin',
      label: 'Admin Portal',
      desc: 'Curate landmarks & registry verification',
      icon: ShieldCheck,
      color: 'text-rose-500 bg-rose-500/10'
    }
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'more') {
      setShowMoreMenu(prev => !prev);
    } else {
      setActiveTab(tabId);
      setShowMoreMenu(false);
    }
  };

  const handleSelectSecondaryTab = (tabId: string) => {
    setActiveTab(tabId);
    setShowMoreMenu(false);
  };

  const isMoreTabActive = ['itinerary', 'travel', 'group', 'documents', 'social', 'reviews', 'admin'].includes(activeTab);

  return (
    <>
      {/* Mobile "More" Slide-up Drawer */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setShowMoreMenu(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className={`relative z-10 w-full rounded-t-3xl border-t shadow-2xl p-5 pb-8 max-h-[80dvh] overflow-y-auto transition-transform ${isDarkMode
              ? 'bg-[#0b2d40] border-white/10 text-white'
              : 'bg-white border-slate-200 text-slate-900'
            }`}>
            {/* Header with Grab Handle & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-500 flex items-center justify-center font-bold">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">All Island Tools</h3>
                  <p className="text-xs text-slate-400">Essential services & traveler community</p>
                </div>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Close sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of Secondary Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
              {secondaryTabs.map((item) => {
                const IconComponent = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSecondaryTab(item.id)}
                    className={`min-h-[56px] w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all border ${isSelected
                        ? 'bg-teal-500/15 border-teal-500/40 text-teal-400 font-bold'
                        : isDarkMode
                          ? 'bg-slate-800/60 hover:bg-slate-800 border-white/5 text-slate-200'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-teal-500 text-slate-950">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Fixed Bottom Navigation Bar with Smooth Slide & Opacity Transition */}
      <nav
        aria-label="Mobile Navigation Bar"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transform transition-all duration-300 ease-in-out ${isNavVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
          } ${isDarkMode
            ? 'bg-[#061e2c]/95 border-white/10 text-slate-400'
            : 'bg-white/95 border-slate-200 text-slate-600'
          }`}
      >
        <div className="grid grid-cols-5 h-full max-w-md mx-auto items-center">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = tab.id === 'more' ? (showMoreMenu || isMoreTabActive) : activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative min-h-[48px] h-full flex flex-col items-center justify-center gap-1 transition-all group ${isTabActive
                    ? 'text-teal-600 dark:text-teal-400 font-extrabold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                aria-current={isTabActive ? 'page' : undefined}
              >
                {/* Active Indicator Top Pill */}
                {isTabActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-teal-500 shadow-sm" />
                )}

                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isTabActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-teal-500 rounded-full ring-2 ring-white dark:ring-[#061e2c]" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight truncate leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
