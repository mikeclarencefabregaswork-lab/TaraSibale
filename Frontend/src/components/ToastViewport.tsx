import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { dismissToast, getToasts, subscribeToasts, type ToastMessage } from '../toastStore';

function ToastCard({ item }: { item: ToastMessage }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => dismissToast(item.id), item.kind === 'error' ? 9000 : 5500);
    return () => window.clearTimeout(timer);
  }, [item.id, item.kind, paused]);
  const Icon = item.kind === 'error' ? AlertCircle : item.kind === 'success' ? CheckCircle2 : Info;
  return <div role={item.kind === 'error' ? 'alert' : 'status'} aria-atomic="true"
    onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    className={`toast-card pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl ${item.kind === 'error' ? 'bg-rose-50 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-100' : 'bg-white/95 text-slate-900 border-teal-200 dark:bg-slate-900/95 dark:text-slate-100 dark:border-teal-700'}`}>
    <Icon aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 ${item.kind === 'error' ? 'text-rose-600 dark:text-rose-300' : 'text-teal-700 dark:text-teal-300'}`} />
    <p className="flex-1 text-sm font-semibold leading-relaxed break-words">{item.message}</p>
    <button type="button" onClick={() => dismissToast(item.id)} aria-label="Dismiss notification" className="-m-1 rounded-lg p-2 hover:bg-slate-500/10"><X aria-hidden="true" className="h-4 w-4" /></button>
  </div>;
}
export function ToastViewport() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, getToasts);
  return <section aria-label="Notifications" className="pointer-events-none fixed z-[100] top-20 right-3 left-3 sm:left-auto sm:right-6 sm:w-96 max-h-[calc(100dvh-11rem)] overflow-y-auto space-y-3">
    {items.map(item => <ToastCard key={item.id} item={item} />)}
  </section>;
}
