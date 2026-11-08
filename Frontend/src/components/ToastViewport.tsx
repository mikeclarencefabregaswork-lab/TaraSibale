import React from "react";
import { NotificationTimer } from "../notificationTimer";
import { AnimatedSurface, SurfacePresence } from "./SurfacePresence";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  dismissToast,
  getToasts,
  subscribeToasts,
  type ToastMessage,
} from "../toastStore";

function ToastCard({ item }: { item: ToastMessage }): React.ReactElement {
  const duration = item.kind === "error" ? 9000 : 5500;
  const [timer] = useState(() => new NotificationTimer(duration));
  const [remaining, setRemaining] = useState(duration);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  useEffect(() => {
    if (paused) return;
    timer.resume(performance.now());
    const timeout = window.setTimeout(() => {
      setRemaining(0);
      dismissToast(item.id);
    }, timer.remaining(performance.now()));
    const progress = window.setInterval(() => setRemaining(timer.remaining(performance.now())), 50);
    return () => {
      timer.pause(performance.now());
      window.clearTimeout(timeout);
      window.clearInterval(progress);
    };
  }, [item.id, paused, timer]);
  const Icon =
    item.kind === "error"
      ? AlertCircle
      : item.kind === "success"
        ? CheckCircle2
        : Info;
  return (
    <AnimatedSurface
      variant="toast"
      role={item.kind === "error" ? "alert" : "status"}
      aria-atomic="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      className={`toast-card relative overflow-hidden pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl ${item.kind === "error" ? "bg-rose-50 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-100" : "bg-white/95 text-slate-900 border-teal-200 dark:bg-slate-900/95 dark:text-slate-100 dark:border-teal-700"}`}>
      <Icon
        aria-hidden="true"
        className={`mt-0.5 h-5 w-5 shrink-0 ${item.kind === "error" ? "text-rose-600 dark:text-rose-300" : "text-teal-700 dark:text-teal-300"}`}
      />
      <p className="flex-1 text-sm font-semibold leading-relaxed break-words">
        {item.message}
        <span aria-hidden="true" className="mt-1 block text-[10px] font-medium opacity-70">
          {paused ? "Paused" : `Closes in ${Math.ceil(remaining / 1000)}s`}
        </span>
      </p>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        aria-label="Dismiss notification"
        className="-m-1 rounded-lg p-2 hover:bg-slate-500/10">
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-500/15"
        role="progressbar" aria-label={paused ? "Notification dismissal paused" : "Time until notification closes"}
        aria-valuemin={0} aria-valuemax={Math.ceil(duration / 1000)} aria-valuenow={Math.ceil(remaining / 1000)}
        aria-valuetext={paused ? "Paused" : `${Math.ceil(remaining / 1000)} seconds remaining`}>
        <div className={`h-full origin-left transition-transform duration-75 ease-linear motion-reduce:transition-none ${item.kind === "error" ? "bg-rose-500" : "bg-teal-500"}`}
          style={{ transform: `scaleX(${remaining / duration})` }} />
      </div>
    </AnimatedSurface>
  );
}
export function ToastViewport() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, getToasts);
  return (
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed z-[100] top-20 right-3 left-3 sm:left-auto sm:right-6 sm:w-96 max-h-[calc(100dvh-11rem)] overflow-y-auto space-y-3">
      <SurfacePresence>
        {items.map((item) => <ToastCard key={item.id} item={item} />)}
      </SurfacePresence>
    </section>
  );
}
