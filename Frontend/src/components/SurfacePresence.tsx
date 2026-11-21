import React from "react";
import { AnimatePresence, LazyMotion, domAnimation, m, useIsPresent, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";

export function SurfacePresence({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation} strict><AnimatePresence>{children}</AnimatePresence></LazyMotion>;
}

export function AnimatedSurface({ variant = "surface", ...props }: HTMLMotionProps<"div"> & { variant?: "surface" | "toast" }) {
  const reduced = useReducedMotion();
  const present = useIsPresent();
  const offset = reduced ? 0 : variant === "toast" ? 18 : 24;
  return <m.div {...props}
    inert={!present}
    initial={{ opacity: 0, x: variant === "toast" ? offset : 0, y: variant === "surface" ? offset : 0 }}
    animate={{ opacity: 1, x: 0, y: 0 }}
    exit={{ opacity: 0, x: variant === "toast" ? offset : 0, y: variant === "surface" ? offset : 0 }}
    transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }}
    style={{ ...props.style, animation: "none" }} />;
}
