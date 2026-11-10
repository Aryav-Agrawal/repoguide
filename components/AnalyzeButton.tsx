"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { useCanRunHeavyEffects } from "@/hooks/use-can-run-heavy-effects";
import { useHasMouse } from "@/hooks/use-has-mouse";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ShimmerButton } from "./ui/shimmer-button";

// How far around the button (in px) the cursor starts pulling it, and the most it moves.
const MAGNET_RANGE = 80;
const MAGNET_MAX = 6;
// Springy but quick to settle, so the button never feels loose.
const MAGNET_SPRING = { stiffness: 220, damping: 18, mass: 0.6 };
const PRESS_SPRING = { type: "spring", stiffness: 400, damping: 22 } as const;
const LABEL_SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;

type Ripple = { id: number; x: number; y: number; size: number };

type AnalyzeButtonProps = {
  loading: boolean;
};

const clamp = (value: number) => Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, value));

/**
 * The form's submit button. It shimmers, scales a little on hover and press, leans toward the
 * cursor on desktop, ripples where it's clicked, and turns into a spinner while analyzing.
 * It's a normal submit button, so the form submits exactly as before.
 */
export default function AnalyzeButton({ loading }: AnalyzeButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canRunHeavy = useCanRunHeavyEffects();
  const hasMouse = useHasMouse();
  const reduceMotion = usePrefersReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextRippleId = useRef(0);

  // x and y are motion values, so moving the button never re-renders React.
  const x = useSpring(0, MAGNET_SPRING);
  const y = useSpring(0, MAGNET_SPRING);
  const magnetic = canRunHeavy && hasMouse && !loading;
  // Motion's app-wide reduced-motion setting doesn't cover hover and press gestures, so we
  // switch the scale off ourselves.
  const scaleOnPress = !loading && !reduceMotion;

  useEffect(() => {
    if (!magnetic) return;

    function handlePointerMove(event: PointerEvent) {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const box = wrapper.getBoundingClientRect();
      // Where the centre would be with no pull, so the button doesn't chase its own movement.
      const centerX = box.left + box.width / 2 - x.get();
      const centerY = box.top + box.height / 2 - y.get();
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const near = Math.abs(dx) < box.width / 2 + MAGNET_RANGE && Math.abs(dy) < box.height / 2 + MAGNET_RANGE;
      x.set(near ? clamp(dx * 0.12) : 0);
      y.set(near ? clamp(dy * 0.2) : 0);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      // Spring back to rest when the effect turns off (e.g. analysis starts).
      x.set(0);
      y.set(0);
    };
  }, [magnetic, x, y]);

  function addRipple(event: React.MouseEvent<HTMLButtonElement>) {
    // detail is 0 for clicks from the keyboard, which have no click point.
    if (reduceMotion || event.detail === 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    const size = Math.max(box.width, box.height) * 2;
    const id = nextRippleId.current++;
    setRipples((list) => [...list, { id, x: event.clientX - box.left, y: event.clientY - box.top, size }]);
  }

  return (
    <motion.div
      ref={wrapperRef}
      // Motion makes anything with whileTap reachable by Tab. The real button inside already
      // is, so this keeps the wrapper out of the Tab order (no empty extra stop).
      tabIndex={-1}
      className="sm:shrink-0"
      style={{ x, y }}
      whileHover={scaleOnPress ? { scale: 1.03 } : undefined}
      whileTap={scaleOnPress ? { scale: 0.97 } : undefined}
      transition={PRESS_SPRING}
    >
      <ShimmerButton
        type="submit"
        disabled={loading}
        onClick={addRipple}
        background="var(--accent)"
        borderRadius="0.5rem"
        shimmerColor="#ffffff"
        shimmerDuration="3.5s"
        className="h-12 w-full min-w-[9.5rem] px-6 py-0 font-medium text-accent-ink transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-70"
      >
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-accent-ink"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => setRipples((list) => list.filter((item) => item.id !== ripple.id))}
          />
        ))}

        {/* The label slides and fades between "Analyze" and the spinner. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            <motion.span
              key="loading"
              className="relative flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={LABEL_SPRING}
            >
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-accent-ink/30 border-t-accent-ink motion-reduce:animate-none"
              />
              Analyzing…
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={LABEL_SPRING}
            >
              Analyze
            </motion.span>
          )}
        </AnimatePresence>
      </ShimmerButton>
    </motion.div>
  );
}
