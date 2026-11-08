import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWeather } from "./weather";
import type { WeatherReport } from "./weather";

export function useLiveWeather() {
  const [report, setReport] = useState<WeatherReport>();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(Date.now);
  const active = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const next = await fetchWeather(controller.signal);
      if (active.current === controller) { setReport(next); setFailed(false); }
    } catch {
      if (active.current === controller) setFailed(true);
    } finally {
      clearTimeout(timer);
      if (active.current === controller) { active.current = null; setLoading(false); setNow(Date.now()); }
    }
  }, []);
  useEffect(() => {
    // Only async network completion updates state; no derived state is synchronized here.
    // oxlint-disable-next-line react/set-state-in-effect
    void refresh();
    const poll = setInterval(() => { setLoading(true); void refresh(); }, 15 * 60_000);
    const clock = setInterval(() => setNow(Date.now()), 30_000);
    return () => { const controller = active.current; active.current = null; controller?.abort(); clearInterval(poll); clearInterval(clock); };
  }, [refresh]);
  return { report, loading, failed, now, onRetry: () => { setLoading(true); void refresh(); } };
}

