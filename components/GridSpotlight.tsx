"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

// How bright the spotlight gets (0 to 1). Kept low so it never competes with the text.
const SPOTLIGHT_STRENGTH = 0.7;

// A faint grid behind the hero, with a soft spotlight that follows the mouse.
// Mouse positions are stored in motion values, which update the styles directly
// without re-rendering React, so moving the mouse stays cheap.
export default function GridSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  // Where the mouse is (relative to this layer), smoothed with a spring so the
  // light glides after the cursor instead of snapping to it.
  const rawX = useMotionValue(-1000);
  const rawY = useMotionValue(-1000);
  const x = useSpring(rawX, { stiffness: 140, damping: 24, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 140, damping: 24, mass: 0.6 });
  // 0 when the mouse is outside the window, SPOTLIGHT_STRENGTH when it's over the page.
  const glow = useSpring(0, { stiffness: 80, damping: 20 });

  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${x}px ${y}px, black, transparent 70%)`;

  useEffect(() => {
    // The layer ignores the mouse (so it never blocks clicks), so we listen on the window.
    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      rawX.set(event.clientX - rect.left);
      rawY.set(event.clientY - rect.top);
      glow.set(SPOTLIGHT_STRENGTH);
    }
    function onLeave() {
      glow.set(0);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [rawX, rawY, glow]);

  return (
    <div ref={ref} className="absolute inset-0">
      {/* The always-on faint grid. */}
      <div className="hero-grid absolute inset-0" />
      {/* A brighter accent grid and a soft glow, only visible inside the spotlight. */}
      <motion.div
        className="hero-grid hero-grid-lit absolute inset-0"
        style={{ opacity: glow, maskImage: spotlight, WebkitMaskImage: spotlight }}
      />
    </div>
  );
}
