import React from "react";
import { useLayoutEffect, useRef, type ReactNode } from "react";

export function ModalDialog({ children, onClose, label, labelledBy, maxWidth = "42rem", sheet = false, dismissible = true }: {
  children: ReactNode; onClose: () => void; label?: string; labelledBy?: string;
  maxWidth?: string; sheet?: boolean; dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOutside = useRef(false);
  useLayoutEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const outside = (event: React.PointerEvent<HTMLDialogElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  };
  return <dialog ref={ref} aria-label={label} aria-labelledby={labelledBy}
    closedby={dismissible ? "any" : "none"}
    onCancel={event => { if (!dismissible) event.preventDefault(); }}
    onClose={event => {
    // StrictMode reopens after effect cleanup before the queued close event arrives.
    if (!event.currentTarget.open) onClose();
  }}
    onPointerDown={event => { pressedOutside.current = outside(event); }}
    onPointerUp={event => {
      if (dismissible && !("closedBy" in HTMLDialogElement.prototype) && pressedOutside.current && outside(event)) event.currentTarget.close();
      pressedOutside.current = false;
    }}
    onPointerCancel={() => { pressedOutside.current = false; }}
    style={{ maxWidth }}
    className={`native-modal ${sheet ? "native-modal--sheet" : ""} m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl border-0 bg-transparent p-0 text-inherit shadow-2xl backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm`}>
    {children}
  </dialog>;
}
