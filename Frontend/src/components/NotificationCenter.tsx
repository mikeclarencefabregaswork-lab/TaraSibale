import { AnimatedSurface, SurfacePresence } from "./SurfacePresence";
import {
  Bell,
  Check,
  CheckCheck,
  Compass,
  ExternalLink,
  FileText,
  Globe,
  Home,
  Info,
  LogIn,
  MessageSquare,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { AppNotification, NotificationCategory, UserProfile } from "../types";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile | null;
  isDarkMode: boolean;
  onOpenAuth: (mode?: "login" | "signup") => void;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  currentUser,
  isDarkMode,
  onOpenAuth,
  notifications,
  setNotifications,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<NotificationCategory>("general");
  // Header owns outside-click dismissal for both the panel and its trigger.

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);


  // Filter notifications by category
  const generalList = notifications.filter((n) => n.category === "general");
  const personalList = notifications.filter((n) => n.category === "personal");

  const generalUnreadCount = generalList.filter((n) => !n.read).length;
  const personalUnreadCount = personalList.filter((n) => !n.read).length;

  const currentList =
    selectedCategory === "general" ? generalList : personalList;
  const currentUnreadCount =
    selectedCategory === "general" ? generalUnreadCount : personalUnreadCount;

  // Handlers
  const handleMarkAllAsRead = (category: NotificationCategory) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.category === category ? { ...item, read: true } : item,
      ),
    );
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: !item.read } : item,
      ),
    );
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleNotificationClick = (item: AppNotification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
    );

    // Deep link navigation
    if (item.actionTab) {
      setActiveTab(item.actionTab);
      onClose();
    }
  };

  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "weather":
      case "advisory":
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case "ferry":
        return <Compass className="w-4 h-4 text-sky-500" />;
      case "booking":
        return <Home className="w-4 h-4 text-emerald-500" />;
      case "chat":
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case "vault":
        return <FileText className="w-4 h-4 text-teal-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIconContainerBg = (type: AppNotification["type"]) => {
    switch (type) {
      case "weather":
      case "advisory":
        return "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
      case "ferry":
        return "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400";
      case "booking":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
      case "chat":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400";
      case "vault":
        return "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <SurfacePresence>
    {isOpen && <AnimatedSurface
      className={`fixed left-3 right-3 top-20 mx-auto z-50 w-auto max-w-[440px] max-h-[calc(100dvh-7rem)] flex flex-col sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-[420px] sm:max-h-[calc(100dvh-9rem)] rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all duration-200 isolate select-none overflow-hidden ${
        isDarkMode
          ? "bg-[#0b2d40]/98 border-slate-700/80 text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
          : "bg-white/98 border-slate-200 text-slate-900 shadow-2xl"
      }`}
      role="dialog"
      aria-label="Notification Center">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              Island Notifications
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              General advisories & personal alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Close notifications">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented Category Filter Tabs (General vs Personal) */}
      <div className="p-3 pb-2 border-b border-slate-100 dark:border-white/5">
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
          <button
            type="button"
            onClick={() => setSelectedCategory("general")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "general"
                ? "bg-teal-500 text-slate-950 font-black shadow-sm ring-1 ring-teal-400/50"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}>
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>General</span>
            {generalUnreadCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                  selectedCategory === "general"
                    ? "bg-slate-950 text-teal-300"
                    : "bg-amber-500 text-white shadow-sm"
                }`}>
                {generalUnreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("personal")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "personal"
                ? "bg-teal-500 text-slate-950 font-black shadow-sm ring-1 ring-teal-400/50"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}>
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>Personal</span>
            {personalUnreadCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                  selectedCategory === "personal"
                    ? "bg-slate-950 text-teal-300"
                    : "bg-teal-600 text-white shadow-sm"
                }`}>
                {personalUnreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Sub-header row with Category summary & Mark all as read */}
        <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {selectedCategory === "general"
              ? "Island weather, ferries & notices"
              : "Your bookings, chat & passes"}
          </span>
          {currentUnreadCount > 0 && (
            <button
              onClick={() => handleMarkAllAsRead(selectedCategory)}
              className="flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Guest Mode Banner for Personal Tab */}
      {selectedCategory === "personal" && !currentUser && (
        <div className="mx-3 mt-2 p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs">
          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-teal-200">
                Viewing as Guest Traveler
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Log in to link your confirmed reservations and chat
                notifications with your account.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth("login");
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500 text-slate-950 text-[11px] font-black hover:bg-teal-400 transition-colors shadow-sm">
                <LogIn className="w-3 h-3" />
                <span>Log In / Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List (Scrollable) */}
      <div className="min-h-0 flex-1 max-h-[380px] sm:max-h-[420px] overflow-y-auto p-3 space-y-2">
        {currentList.length === 0 && (
          <div className="py-10 px-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 mb-2">
              <Bell className="w-5 h-5 opacity-40" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No notifications in this tab
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedCategory === "general"
                ? "No saved island advisories. Confirm conditions with the ferry operator."
                : "No pending booking updates or message alerts."}
            </p>
          </div>
        )}
        <SurfacePresence>
          {currentList.map((item) => {
            const isUnread = !item.read;
            return (
              <AnimatedSurface
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                  isUnread
                    ? isDarkMode
                      ? "bg-teal-500/10 border-teal-500/30 text-white shadow-sm hover:bg-teal-500/15"
                      : "bg-teal-50/70 border-teal-200 text-slate-900 shadow-sm hover:bg-teal-50"
                    : isDarkMode
                      ? "bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.07]"
                      : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
                }`}>
                <div className="flex items-start gap-2.5">
                  {/* Icon box */}
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getIconContainerBg(
                      item.type,
                    )}`}>
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Text content */}
                  <div className="min-w-0 flex-1 pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                        {item.title}
                      </span>
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>

                    {/* Metadata line with typographic separators (anti-slop clean unboxed text) */}
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                      <span>{item.timestamp}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">
                        {item.badgeText || item.type}
                      </span>
                      {item.actionTab && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-teal-600 dark:text-teal-400 font-bold group-hover:underline inline-flex items-center gap-0.5">
                            Open <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions (Mark read toggle & Dismiss) */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleToggleRead(item.id, e)}
                      title={isUnread ? "Mark as read" : "Mark as unread"}
                      className={`p-1 rounded-lg transition-colors ${
                        isUnread
                          ? "text-teal-600 dark:text-teal-400 hover:bg-teal-500/20"
                          : "text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                      }`}>
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDismiss(item.id, e)}
                      title="Dismiss notification"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </AnimatedSurface>
            );
          })}
        </SurfacePresence>
      </div>

      {/* Footer Hotlines & Timetable Shortcut */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            MDRRMO:
          </span>
          <span className="font-mono text-[10px]">Number unverified</span>
        </div>

        <button
          onClick={() => {
            setActiveTab("travel");
            onClose();
          }}
          className="text-teal-600 dark:text-teal-400 font-extrabold hover:underline whitespace-nowrap cursor-pointer">
          Ferry Timetables →
        </button>
      </div>
    </AnimatedSurface>}
    </SurfacePresence>
  );
};
