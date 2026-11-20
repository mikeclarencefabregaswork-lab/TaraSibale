import React, { useEffect, useRef, type ReactNode } from "react";

const fallbackStack: HTMLElement[] = [];

interface PopoverProps {
  id: string;
  triggerId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  label?: string;
  role?: "dialog";
  persistent?: boolean;
}

/** Controlled native popover; unsupported browsers retain a dismissible fixed panel. */
export function Popover({ id, triggerId, open, onOpenChange, children, className = "", label, role, persistent = false }: PopoverProps): React.ReactElement {
  const ref = useRef<HTMLDivElement & HTMLDialogElement>(null);
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    const trigger = triggerId ? document.getElementById(triggerId) : null;
    const anchor = `--overlay-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const previousAnchor = trigger?.style.anchorName;
    if (trigger) {
      trigger.style.anchorName = anchor;
      panel.style.positionAnchor = anchor;
    }
    const native = Object.hasOwn(HTMLElement.prototype, "popover");
    panel.toggleAttribute("data-popover-fallback", !native);
    if (native) {
      if (open && !panel.matches(":popover-open")) panel.showPopover({ source: trigger ?? undefined });
      else if (!open) panel.hidePopover();
      return () => { if (trigger) trigger.style.anchorName = previousAnchor ?? ""; };
    }
    // Only the old-browser fallback needs document-level dismissal listeners.
    if (panel instanceof HTMLDialogElement) panel.open = open;
    if (!open) return () => { if (trigger) trigger.style.anchorName = previousAnchor ?? ""; };
    fallbackStack.push(panel);
    panel.querySelector<HTMLElement>("[autofocus]")?.focus();
    const outside = (event: PointerEvent) => {
      if (!persistent && event.target instanceof Node && !panel.contains(event.target) && !trigger?.contains(event.target)) onOpenChange(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (!persistent && event.key === "Escape" && fallbackStack.at(-1) === panel) {
        event.preventDefault();
        onOpenChange(false);
        trigger?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      const index = fallbackStack.indexOf(panel);
      if (index !== -1) fallbackStack.splice(index, 1);
      if (trigger) trigger.style.anchorName = previousAnchor ?? "";
    };
  }, [open, id, triggerId, persistent, onOpenChange]);

  const Tag = role === "dialog" ? "dialog" : "div";
  return <Tag ref={ref} id={id} popover={persistent ? "manual" : "auto"}
    aria-label={label} data-fallback-open={open}
    onToggle={event => {
      // React propagates toggle events from nested popovers to their ancestors.
      if (event.target === event.currentTarget) onOpenChange(event.newState === "open");
    }}
    className={`native-popover ${triggerId ? "anchored-popover" : ""} ${className}`}>
    {children}
  </Tag>;
}
