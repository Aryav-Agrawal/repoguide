"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useCanRunHeavyEffects } from "@/hooks/use-can-run-heavy-effects";

// GSAP is only downloaded when the parallax will actually run.
const ParallaxScrub = dynamic(() => import("./ParallaxScrub"), { ssr: false });

type ParallaxLayerProps = {
  /**
   * How far the layer drifts down while it scrolls out of view, as a share of the
   * screen height. 0.3 means it moves 30% slower than the content around it.
   */
  speed: number;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wraps a background layer so it scrolls a little slower than the page (light parallax).
 * On phones and with reduced motion it's a plain wrapper that scrolls normally.
 * Decorative only, so screen readers skip it.
 */
export default function ParallaxLayer({ speed, className, children }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const canRunHeavy = useCanRunHeavyEffects();

  return (
    <div ref={ref} aria-hidden="true" className={className}>
      {children}
      {canRunHeavy && <ParallaxScrub target={ref} speed={speed} />}
    </div>
  );
}
