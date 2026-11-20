import React, { useId, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Popover } from "./Popover";
import type { ThemePreference } from "../theme";

const choices = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeControl({ value, onChange }: {
  value: ThemePreference; onChange: (value: ThemePreference) => void;
}): React.ReactElement {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const name = useId();
  const panelId = `${name}-appearance`;
  const triggerId = `${name}-appearance-trigger`;
  const selected = choices.find(choice => choice.value === value)!;
  const Icon = selected.icon;
  const close = () => {
    setOpen(false);
    ref.current?.focus();
  };

  return <>
    <button ref={ref} id={triggerId} type="button" aria-label="Appearance" title={`Appearance: ${selected.label}`}
      aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(previous => !previous)}
      className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 aria-expanded:border-teal-500/60 aria-expanded:bg-teal-500/10 dark:border-white/15 dark:bg-white/5 dark:text-teal-200 dark:hover:bg-white/10">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
    <Popover id={panelId} triggerId={triggerId} open={open} onOpenChange={setOpen}
      className="w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10 dark:border-white/15 dark:bg-[#103c50] dark:shadow-black/30">
    <fieldset>
      <legend className="sr-only">Color scheme</legend>
      <p className="px-2.5 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300">Appearance</p>
      {choices.map(choice => {
        const OptionIcon = choice.icon;
        return <label key={choice.value} className="relative flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 has-checked:bg-teal-500/10 has-checked:text-teal-700 has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-teal-500 dark:text-slate-200 dark:hover:bg-white/5 dark:has-checked:bg-teal-400/15 dark:has-checked:text-teal-200">
          <input type="radio" name={name} value={choice.value} checked={value === choice.value}
            onChange={() => onChange(choice.value)} onClick={() => close()} className="sr-only" />
          <OptionIcon className="h-4 w-4" aria-hidden="true" />
          <span className="flex-1">{choice.label}</span>
          {value === choice.value && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
        </label>;
      })}
    </fieldset>
    </Popover>
  </>;
}
