import React from "react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { LazyMotion, domAnimation, m, useIsPresent, useReducedMotion } from "motion/react";

export function ModalDialog({ children, onClose, label, labelledBy, maxWidth = "42rem", sheet = false, dismissible = true }: {
  children: ReactNode; onClose: () => void; label?: string; labelledBy?: string;
  maxWidth?: string; sheet?: boolean; dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOutside = useRef(false);
  const present = useIsPresent();
  const reduced = useReducedMotion();
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
  return <LazyMotion features={domAnimation} strict><m.dialog ref={ref} aria-label={label} aria-labelledby={labelledBy}
    inert={!present}
    initial={{ opacity: 0, y: reduced ? 0 : sheet ? "100%" : 32 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: reduced ? 0 : sheet ? "100%" : 32 }}
    transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
    closedby={dismissible ? "closerequest" : "none"}
    onCancel={event => { event.preventDefault(); if (dismissible && present) onClose(); }}
    onClose={event => {
    // StrictMode reopens after effect cleanup before the queued close event arrives.
    if (!event.currentTarget.open) onClose();
  }}
    onPointerDown={event => { pressedOutside.current = outside(event); }}
    onPointerUp={event => {
      if (dismissible && present && pressedOutside.current && outside(event)) onClose();
      pressedOutside.current = false;
    }}
    onPointerCancel={() => { pressedOutside.current = false; }}
    style={{ maxWidth, animation: "none" }}
    className={`native-modal ${sheet ? "native-modal--sheet" : ""} m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl border-0 bg-transparent p-0 text-inherit shadow-2xl backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm`}>
    {children}
  </m.dialog></LazyMotion>;
}
