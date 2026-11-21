import React, { useLayoutEffect, useRef } from "react";

/** Measure layout coordinates so wrapping, scrolling, and pressed-button scaling stay aligned. */
export function SlidingFilterHighlight({ rowRef, selected, layoutKey }: {
  rowRef: React.RefObject<HTMLDivElement | null>; selected: string; layoutKey?: unknown;
}) {
  const highlightRef = useRef<HTMLSpanElement>(null);
  const positioned = useRef(false);

  useLayoutEffect(() => {
    const highlight = highlightRef.current;
    // The parent's ref may not be attached during this child's first layout effect.
    const row = rowRef.current ?? highlight?.parentElement;
    if (!row || !highlight) return;
    const position = () => {
      const button = row.querySelector<HTMLButtonElement>('[data-filter-active="true"]');
      if (!button || !button.offsetWidth) { highlight.style.opacity = "0"; return; }
      highlight.style.transition = positioned.current ? "" : "none";
      highlight.style.transform = `translate(${button.offsetLeft}px, ${button.offsetTop}px)`;
      highlight.style.width = `${button.offsetWidth}px`;
      highlight.style.height = `${button.offsetHeight}px`;
      highlight.style.opacity = "1";
      positioned.current = true;
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(row);
    row.querySelectorAll("button").forEach(button => observer.observe(button));
    return () => observer.disconnect();
  }, [rowRef, selected, layoutKey]);

  return <span ref={highlightRef} aria-hidden="true"
    className="sliding-filter-highlight pointer-events-none absolute left-0 top-0 rounded-full bg-teal-500 shadow-[0_0_15px_rgba(46,196,182,0.4)] opacity-0" />;
}
