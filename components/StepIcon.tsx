"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { POP_SPRING } from "@/lib/tour-motion";

type StepIconProps = {
  status: "waiting" | "active" | "done";
};

// The circle next to each step: hollow while waiting, spinning while active, a tick when done.
// When a step finishes, the green circle pops in and the tick draws itself, once.
export default function StepIcon({ status }: StepIconProps) {
  const reduceMotion = usePrefersReducedMotion();

  if (status === "done") {
    return (
      <motion.span
        // With reduced motion the app-wide MotionConfig drops the scale, so this only fades.
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={POP_SPRING}
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          {/* Drawing a line isn't a movement MotionConfig knows about, so we skip it ourselves. */}
          <motion.path
            d="M3.5 8.5l3 3 6-7"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
          />
        </svg>
      </motion.span>
    );
  }

  if (status === "active") {
    return (
      <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-accent/25 border-t-accent motion-reduce:animate-none" />
    );
  }

  return <span className="size-5 shrink-0 rounded-full border-2 border-line" />;
}
