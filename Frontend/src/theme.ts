import { useEffect, useState, useSyncExternalStore } from "react";

export type ThemePreference = "system" | "light" | "dark";
const themeKey = "tara_sibale_theme";

export function readPreference(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function readTheme(): ThemePreference {
  const value = readPreference(themeKey);
  return value === "light" || value === "dark" ? value : "system";
}

function subscribeSystem(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readTheme);
  const systemDark = useSyncExternalStore(subscribeSystem,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches, () => false);
  const isDarkMode = preference === "dark" || (preference === "system" && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.setAttribute(
      "content", preference === "system" ? "light dark" : preference);
  }, [preference, isDarkMode]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === themeKey || event.key === null) setPreference(readTheme());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const setThemePreference = (value: ThemePreference) => {
    setPreference(value);
    try {
      if (value === "system") localStorage.removeItem(themeKey);
      else localStorage.setItem(themeKey, value);
    } catch { /* The current choice still works without persistence. */ }
  };
  return { isDarkMode, themePreference: preference, setThemePreference };
}
