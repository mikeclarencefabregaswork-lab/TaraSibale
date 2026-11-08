import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Compass,
  FileText,
  Home,
  LogIn,
  LogOut,
  Map,
  Moon,
  MoreHorizontal,
  Palmtree,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sun,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AppNotification, UserProfile } from "../types";
import { NotificationCenter } from "./NotificationCenter";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadMessagesCount: number;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onLogout: () => void;
  notifications?: AppNotification[];
  setNotifications?: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  isOffline,
  setIsOffline,
  searchQuery,
  setSearchQuery,
  unreadMessagesCount,
  currentUser,
  onOpenAuth,
  onLogout,
  notifications,
  setNotifications,
}) => {
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  // Local fallback notifications if not supplied via props
  const [localNotifications, setLocalNotifications] = useState<
    AppNotification[]
  >([]);
  const activeNotifications = notifications || localNotifications;
  const handleSetNotifications = setNotifications || setLocalNotifications;

  const totalUnreadNotifications = activeNotifications.filter(
    (n) => !n.read,
  ).length;

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setMoreDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationCenter(false);
      }
    };
    if (userMenuOpen || moreDropdownOpen || showNotificationCenter) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen, moreDropdownOpen, showNotificationCenter]);

  // Primary top navigation shortcuts (concise, high-intent pill tabs)
  const desktopNavItems = [
    { id: "explore", label: "Explore", icon: Compass },
    { id: "itinerary", label: "Itinerary", icon: Calendar },
    { id: "map", label: "Map", icon: Map },
    { id: "stay", label: "Stays", icon: Home },
    { id: "guide", label: "Culture", icon: BookOpen },
    { id: "group", label: "Chat", icon: Users, badge: unreadMessagesCount },
  ];

  // Secondary tools housed inside the "More ▾" dropdown
  const desktopMoreItems = [
    {
      id: "travel",
      label: "Ferry & Travel Info",
      desc: "Boat timetables, ports & local routes",
      icon: ShieldAlert,
      color:
        "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    },
    {
      id: "documents",
      label: "Offline Vault & Sync",
      desc: "Travel passes & offline itinerary documents",
      icon: FileText,
      color:
        "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    },
    {
      id: "social",
      label: "Community Feed",
      desc: "Real photos, stories & traveler updates",
      icon: Palmtree,
      color:
        "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30",
    },
    {
      id: "reviews",
      label: "Reviews & Ratings",
      desc: "Traveler feedback on beaches & kubos",
      icon: Star,
      color:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    },
    {
      id: "admin",
      label: "Admin Portal & Registry",
      desc: "Curate landmarks, accommodations & hosts",
      icon: ShieldCheck,
      color:
        "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    },
  ];

  const isMoreActive = desktopMoreItems.some((item) => item.id === activeTab);

  return (
    <>
      {/* Top Header Bar */}
      <header
        className={`sticky top-0 z-40 transition-all border-b shadow-sm isolate ${
          isDarkMode
            ? "bg-[#061e2c] border-white/10 text-slate-100"
            : "bg-white border-slate-200 text-slate-800"
        }`}>
        {/* Top Banner Alert Bar if offline */}
        {isOffline && (
          <div className="bg-amber-600 text-white px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-between border-b border-amber-500">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 animate-pulse" />
              <span>
                <strong>Offline Mode Active:</strong> Reading cached maps,
                guides, & documents.
              </span>
            </div>
            <button
              onClick={() => setIsOffline(false)}
              className="underline hover:text-amber-100 font-bold cursor-pointer">
              Go Online
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-16 py-2 gap-1.5 sm:gap-4">
            {/* Logo Brand */}
            <div
              onClick={() => setActiveTab("explore")}
              className="flex min-w-0 items-center gap-1.5 sm:gap-2.5 cursor-pointer group">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-800 p-0.5 shadow-sm dark:shadow-[0_0_15px_rgba(46,196,182,0.4)] ring-2 ring-teal-500/40 group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/tarasibale-logo.jpg"
                  alt="TaraSibale Logo"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-extrabold text-sm sm:text-xl tracking-tight text-slate-900 dark:bg-gradient-to-r dark:from-teal-300 dark:via-cyan-300 dark:to-blue-300 dark:bg-clip-text dark:text-transparent">
                    TaraSibale
                  </span>
                  <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 font-bold uppercase tracking-wider">
                    Romblon
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400 font-medium tracking-wide">
                  Sibale Island Tourism
                </p>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-teal-400/80" />
              <input
                type="text"
                placeholder="Search beaches, watchtowers, homestays, ferries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-1.5 text-sm rounded-full border transition-all ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-400 focus:border-teal-400/80 focus:bg-white/10 focus:outline-none"
                    : "bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-teal-600 focus:bg-white focus:outline-none"
                }`}
              />
            </div>

            {/* Controls & User Credentials on the Right Side */}
            <div
              className="flex items-center gap-1 sm:gap-2.5 relative ml-auto shrink-0"
              ref={userDropdownRef}>
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                title="Search"
                className={`md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full border transition-all cursor-pointer ${
                  isDarkMode
                    ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/15"
                    : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}>
                <Search className="w-4 h-4" />
              </button>

              {/* Island Notifications Bell (General & Personal) */}
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() =>
                    setShowNotificationCenter((open) => !open)
                  }
                  title={`Island Notifications (${totalUnreadNotifications} unread)`}
                  aria-label="Island Notifications"
                  aria-expanded={showNotificationCenter}
                  className={`relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full border transition-all cursor-pointer ${
                    showNotificationCenter
                      ? "bg-teal-500/20 border-teal-500 text-teal-300 ring-2 ring-teal-400/50 shadow-[0_0_15px_rgba(46,196,182,0.3)]"
                      : isDarkMode
                        ? "border-white/15 bg-white/5 hover:bg-white/15 text-teal-300"
                        : "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}>
                  <Bell className="w-4 h-4 text-slate-700 dark:text-teal-400" />
                  {totalUnreadNotifications > 0 && (
                    <>
                      <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full animate-ping" />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full" />
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-teal-500 text-slate-950 shadow-sm leading-none border border-slate-900/10 dark:border-slate-950">
                        {totalUnreadNotifications}
                      </span>
                    </>
                  )}
                </button>

                {/* Anchored Dropdown Popover */}
                <NotificationCenter
                  isOpen={showNotificationCenter}
                  onClose={() => setShowNotificationCenter(false)}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  currentUser={currentUser}
                  isDarkMode={isDarkMode}
                  onOpenAuth={onOpenAuth}
                  notifications={activeNotifications}
                  setNotifications={handleSetNotifications}
                />
              </div>

              {/* User Profile or Log In Button */}
              {currentUser ? (
                /* User Credentials & Settings Dropdown Trigger Button */
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-2.5 pr-3.5 sm:pr-4 py-1.5 rounded-full border transition-all cursor-pointer shadow-sm no-underline hover:no-underline focus:outline-none select-none ${
                    userMenuOpen
                      ? isDarkMode
                        ? "bg-teal-500/20 border-teal-500/50 text-white shadow-[0_0_15px_rgba(46,196,182,0.25)]"
                        : "bg-teal-50 border-teal-500 text-teal-900 shadow-md ring-2 ring-teal-500/20"
                      : isDarkMode
                        ? "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 hover:border-white/25"
                        : "border-slate-300 bg-white hover:bg-slate-50 text-slate-800 hover:border-slate-400"
                  }`}
                  title="User Profile & Settings">
                  {/* User Avatar with Status Indicator Dot */}
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-sm">
                      {currentUser.initials}
                    </div>
                    {/* Active online/offline dot */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                        isDarkMode ? "border-[#061e2c]" : "border-white"
                      } ${!isOffline ? "bg-emerald-500 ring-1 ring-emerald-400/50" : "bg-amber-500 ring-1 ring-amber-400/50"}`}
                      title={!isOffline ? "Online" : "Offline"}
                    />
                  </div>

                  {/* Desktop User Label with wider spacing */}
                  <div className="hidden sm:flex flex-col text-left leading-tight min-w-[70px]">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      {currentUser.shortName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold flex items-center gap-1 ${
                        !isOffline
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-amber-700 dark:text-amber-400"
                      }`}>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${!isOffline ? "bg-emerald-500" : "bg-amber-500"}`}
                      />
                      {!isOffline ? "Online" : "Offline"}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 shrink-0 ${userMenuOpen ? "rotate-180 text-teal-600 dark:text-teal-400" : "text-slate-500"}`}
                  />
                </button>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label="Toggle dark mode"
                    aria-pressed={isDarkMode}
                    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
                    {isDarkMode ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onOpenAuth("login")}
                    aria-label="Sign In"
                    title="Sign In"
                    className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-extrabold text-xs transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95">
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>

                  <button
                    onClick={() => onOpenAuth("signup")}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md hover:shadow-teal-500/20 active:scale-95">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </button>
                </div>
              )}

              {/* User Credentials Dropdown Menu */}
              {userMenuOpen && currentUser && (
                <div
                  className={`absolute right-0 top-full mt-2 z-[100] w-72 sm:w-80 rounded-2xl border p-4 animate-fade-in shadow-[0_20px_50px_rgba(0,0,0,0.22)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${
                    isDarkMode
                      ? "bg-[#0b2d40] border-slate-700/80 text-slate-100"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}>
                  {/* User Profile Card Header */}
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        {currentUser.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {currentUser.name}
                          </h4>
                          {currentUser.isVerified && (
                            <ShieldCheck
                              className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0"
                              aria-label="Verified account"
                            />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                          {currentUser.email}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 font-bold border border-teal-500/30 truncate">
                            {currentUser.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System & Mode Controls (Online/Offline + Night Mode) */}
                  <div className="py-3 space-y-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                      System Preferences
                    </p>

                    {/* Online / Offline Toggle Option */}
                    <div
                      onClick={() => setIsOffline(!isOffline)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none no-underline hover:no-underline ${
                        !isOffline
                          ? isDarkMode
                            ? "bg-emerald-500/10 border-emerald-500/30 text-slate-100 hover:bg-emerald-500/15"
                            : "bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-50"
                          : isDarkMode
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/20"
                            : "bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100/80"
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${!isOffline ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                          {!isOffline ? (
                            <Wifi className="w-4 h-4" />
                          ) : (
                            <WifiOff className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>Connection Mode</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${!isOffline ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                              {!isOffline ? "Online" : "Offline"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {!isOffline
                              ? "Account data syncs with the server"
                              : "Device notes available; network features need internet"}
                          </p>
                        </div>
                      </div>

                      {/* Custom Switch pill */}
                      <div
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${!isOffline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}>
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${!isOffline ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </div>
                    </div>

                    {/* Night Mode (Dark Mode) Toggle Option */}
                    <div
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none no-underline hover:no-underline ${
                        isDarkMode
                          ? "bg-slate-800/80 border-slate-700 text-slate-100 hover:bg-slate-800"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${isDarkMode ? "bg-amber-400/20 text-amber-300" : "bg-slate-300 text-slate-700"}`}>
                          {isDarkMode ? (
                            <Moon className="w-4 h-4" />
                          ) : (
                            <Sun className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>Night Mode</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-teal-500/20 text-teal-800 dark:text-teal-300">
                              {isDarkMode ? "Dark" : "Light"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isDarkMode
                              ? "Eye-safe night mode active"
                              : "Clean daytime light palette"}
                          </p>
                        </div>
                      </div>

                      {/* Custom Switch pill */}
                      <div
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${isDarkMode ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700"}`}>
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick User Shortcuts */}
                  <div className="py-3 space-y-1 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-1">
                      Traveler Shortcuts
                    </p>

                    <button
                      onClick={() => {
                        setActiveTab("documents");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-colors no-underline hover:no-underline focus:outline-none">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>My Offline Passes & Vault</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("stay");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-colors no-underline hover:no-underline focus:outline-none">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>Homestay Bookings</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("group");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-colors no-underline hover:no-underline focus:outline-none">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Travel Group Chat</span>
                      </div>
                      {unreadMessagesCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                          {unreadMessagesCount} new
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("admin");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 transition-colors no-underline hover:no-underline focus:outline-none border border-teal-500/20">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>Island Admin Portal & Registry</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500 text-slate-950 font-black">
                        Admin
                      </span>
                    </button>
                  </div>

                  {/* LOGOUT BUTTON */}
                  <div className="pt-2.5">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-extrabold text-xs transition-colors cursor-pointer border border-rose-200 dark:border-rose-500/30">
                      <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Log Out of Sibale Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Expandable Input */}
          {showMobileSearch && (
            <div className="md:hidden pb-3 pt-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-teal-400/80" />
                <input
                  type="text"
                  placeholder="Search beaches, watchtowers, homestays, ferries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border ${
                    isDarkMode
                      ? "bg-white/10 border-white/15 text-white placeholder:text-slate-400"
                      : "bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation Tabs - Sleek Rounded Pills with Active Glow */}
          <nav className="hidden md:flex items-center justify-center py-2 border-t border-slate-200/80 dark:border-white/10 relative select-none">
            <div className="flex items-center justify-center gap-1.5 lg:gap-2 flex-wrap">
              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMoreDropdownOpen(false);
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs lg:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 border ${
                      isActive
                        ? "bg-teal-500 text-slate-950 border-teal-400 font-black shadow-[0_0_15px_rgba(46,196,182,0.4)] ring-1 ring-teal-400/50"
                        : isDarkMode
                          ? "border-transparent text-slate-300 hover:bg-white/10 hover:text-white"
                          : "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                          isActive
                            ? "bg-slate-950 text-teal-300"
                            : "bg-amber-500 text-white shadow-sm"
                        }`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {/* More Dropdown Pill */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs lg:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 border select-none ${
                    isMoreActive
                      ? "bg-teal-500 text-slate-950 border-teal-400 font-black shadow-[0_0_15px_rgba(46,196,182,0.4)] ring-1 ring-teal-400/50"
                      : moreDropdownOpen
                        ? isDarkMode
                          ? "bg-white/15 text-white border-white/20"
                          : "bg-slate-200 text-slate-950 border-slate-300"
                        : isDarkMode
                          ? "border-transparent text-slate-300 hover:bg-white/10 hover:text-white"
                          : "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  title="More features and island tools">
                  <MoreHorizontal className="w-4 h-4 shrink-0" />
                  <span>More</span>
                  {isMoreActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0" />
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {moreDropdownOpen && (
                  <div
                    className={`absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-contain rounded-2xl border p-2 animate-fade-in shadow-2xl backdrop-blur-2xl ${
                      isDarkMode
                        ? "bg-[#0b2d40]/98 border-slate-700/80 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                        : "bg-white/98 border-slate-200 text-slate-900 shadow-xl"
                    }`}>
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      More Island Tools
                    </div>
                    <div className="space-y-1">
                      {desktopMoreItems.map((item) => {
                        const Icon = item.icon;
                        const isItemSelected = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMoreDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                              isItemSelected
                                ? "bg-teal-500/20 border-teal-500/50 text-teal-950 dark:text-teal-200 font-bold shadow-sm"
                                : isDarkMode
                                  ? "border-transparent hover:bg-white/10 text-slate-200"
                                  : "border-transparent hover:bg-slate-100 text-slate-800"
                            }`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-2 rounded-lg border shrink-0 ${item.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {item.label}
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                            {isItemSelected && (
                              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};
