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
    const controller = new AbortController();
    const hide = async () => {
      const wasVisible = panel.dataset.surfaceVisible === "true";
      // Keep the native top layer (or fallback panel) alive through its slide out.
      const animations = panel.getAnimations();
      let timeout: ReturnType<typeof setTimeout> | undefined;
      if (animations.length) await Promise.race([
        Promise.allSettled(animations.map(animation => animation.finished)),
        new Promise(resolve => { timeout = setTimeout(resolve, 350); }),
      ]);
      clearTimeout(timeout);
      if (controller.signal.aborted) return;
      if (native && panel.matches(":popover-open")) panel.hidePopover();
      if (!native && panel instanceof HTMLDialogElement) panel.open = false;
      panel.dataset.surfaceVisible = "false";
      // Inert content can relinquish focus before native hidePopover restores it.
      // Leave focus alone when an outside control or a new page already owns it.
      if (wasVisible && document.activeElement === document.body) trigger?.focus();
    };
    const cleanup = () => {
      controller.abort();
      if (trigger) trigger.style.anchorName = previousAnchor ?? "";
    };
    panel.toggleAttribute("data-popover-fallback", !native);
    if (open) panel.dataset.surfaceVisible = "true";
    if (native) {
      if (open && !panel.matches(":popover-open")) panel.showPopover({ source: trigger ?? undefined });
      else if (!open) void hide();
      return cleanup;
    }
    // Only the old-browser fallback needs document-level dismissal listeners.
    if (!open) { void hide(); return cleanup; }
    if (panel instanceof HTMLDialogElement) panel.open = true;
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
      cleanup();
    };
  }, [open, id, triggerId, persistent, onOpenChange]);

  const Tag = role === "dialog" ? "dialog" : "div";
  return <Tag ref={ref} id={id} popover={persistent ? "manual" : "auto"}
    aria-label={label} data-motion-open={open} inert={!open}
    onToggle={event => {
      // React propagates toggle events from nested popovers to their ancestors.
      if (event.target === event.currentTarget && event.newState === "closed") onOpenChange(false);
    }}
    className={`native-popover ${triggerId ? "anchored-popover" : ""} ${className}`}>
    {children}
  </Tag>;
}
