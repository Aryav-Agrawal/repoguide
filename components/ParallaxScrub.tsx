"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type ParallaxScrubProps = {
  /** The layer that drifts. */
  target: RefObject<HTMLDivElement | null>;
  /** How far it drifts, as a share of the screen height (see ParallaxLayer). */
  speed: number;
};

/**
 * The GSAP part of ParallaxLayer. ParallaxLayer loads this file only on devices that can
 * run heavy effects, so phones and reduced-motion visitors never download GSAP for it.
 * It draws nothing; it just moves the target layer as the page scrolls.
 */
export default function ParallaxScrub({ target, speed }: ParallaxScrubProps) {
  useGSAP(
    () => {
      // While the layer scrolls from "its top at the top of the screen" to "its bottom
      // at the top of the screen", push it down a little. The page moves up by a full
      // screen in that time but the layer only moves up by (1 - speed) of one.
      gsap.to(target.current, {
        y: () => window.innerHeight * speed,
        ease: "none",
        scrollTrigger: {
          trigger: target.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true, // re-read the screen height after a resize
        },
      });
    },
    // When the speed changes, undo the old animation before making a new one.
    // Unmounting (for example on a phone-sized window) undoes it too.
    { dependencies: [speed], revertOnUpdate: true },
  );

  return null;
}
