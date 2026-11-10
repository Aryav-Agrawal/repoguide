"use client";

import dynamic from "next/dynamic";
import { useCanRunHeavyEffects } from "@/hooks/use-can-run-heavy-effects";

// Lenis and GSAP are only downloaded when they'll actually run.
const SmoothScrollEngine = dynamic(() => import("./SmoothScrollEngine"), { ssr: false });

/**
 * Smooth scrolling for the home page, using Lenis, kept in step with GSAP ScrollTrigger.
 * It only runs on devices that can run heavy effects. Everyone else scrolls normally
 * and never downloads the smooth-scroll code.
 */
export default function SmoothScroll() {
  const canRunHeavy = useCanRunHeavyEffects();
  return canRunHeavy ? <SmoothScrollEngine /> : null;
}
