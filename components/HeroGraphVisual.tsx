"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getImageProps } from "next/image";
import { useInView } from "motion/react";
import { useCanRunHeavyEffects } from "@/hooks/use-can-run-heavy-effects";
import { usePageVisible } from "@/hooks/use-page-visible";
import { useThemeColors } from "@/hooks/use-theme-colors";

// The 3D graph needs three.js, which is big, so it only loads in the browser,
// and only once the hero is on screen on a device that can run heavy effects.
const HeroGraph = dynamic(() => import("./hero-graph"), { ssr: false });

// The still images are screenshots of the running graph, one per colour scheme.
// getImageProps lets next/image resize and compress them, while we pick the
// light or dark one with a plain <picture> element.
const stillImage = {
  alt: "",
  width: 1024,
  height: 704,
  sizes: "(min-width: 1280px) 32rem, (min-width: 1024px) 26rem, 100vw",
  // It's at the top of the page, so load it right away instead of lazily.
  loading: "eager" as const,
};
const darkStill = getImageProps({ ...stillImage, src: "/hero-graph-dark.png" }).props;
const lightStill = getImageProps({ ...stillImage, src: "/hero-graph.png" }).props;

/**
 * The decorative repo graph in the hero. On desktop it sits to the right of the
 * headline; on narrower screens it sits faintly behind it. Screen readers skip it
 * and it never blocks clicks.
 */
export default function HeroGraphVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const canRunHeavy = useCanRunHeavyEffects();
  const colors = useThemeColors();
  const pageVisible = usePageVisible();
  // Becomes true the first time the hero is on screen, and stays true. That's when we load the 3D.
  const seen = useInView(ref, { once: true });
  // True only while the hero is on screen. The 3D pauses the rest of the time.
  const onScreen = useInView(ref);
  // True once the 3D has drawn its first frames, so we can swap the still image for it.
  const [ready, setReady] = useState(false);
  const handleReadyChange = useCallback((value: boolean) => setReady(value), []);

  const show3d = canRunHeavy && seen && colors !== null;
  const live = show3d && ready;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-hero-graph=""
      className="hero-graph pointer-events-none absolute -top-16 inset-x-0 -z-10 h-[24rem] opacity-30 lg:inset-x-auto lg:-top-14 lg:right-0 lg:h-[20rem] lg:w-[26rem] lg:opacity-100 xl:-right-24 xl:h-[22rem] xl:w-[32rem]"
    >
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet={darkStill.srcSet} sizes={darkStill.sizes} />
        {/* getImageProps already gives this <img> next/image's resized, compressed versions. */}
        <img
          {...lightStill}
          alt=""
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}
        />
      </picture>

      {show3d && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${live ? "opacity-100" : "opacity-0"}`}>
          <HeroGraph colors={colors} running={onScreen && pageVisible} onReadyChange={handleReadyChange} />
        </div>
      )}
    </div>
  );
}
