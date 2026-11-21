import React from "react";
import { X } from "lucide-react";

type CloseButtonProps = Omit<React.ComponentPropsWithoutRef<"button">, "children" | "aria-label" | "type"> & {
  label: string;
  tone?: "surface" | "inverse";
};

export function CloseButton({ label, tone = "surface", className = "", ...props }: CloseButtonProps) {
  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      title={props.title ?? label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        tone === "inverse"
          ? "border-white/20 bg-slate-950/70 text-white hover:bg-slate-800 focus-visible:outline-teal-300"
          : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-teal-500 dark:border-white/20 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      } ${className}`}>
      <X className="size-5" aria-hidden="true" />
    </button>
  );
}
