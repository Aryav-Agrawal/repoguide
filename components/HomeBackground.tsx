"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";
import { useCanRunHeavyEffects } from "@/hooks/use-can-run-heavy-effects";
import { useHasMouse } from "@/hooks/use-has-mouse";
import { usePageVisible } from "@/hooks/use-page-visible";
import { useThemeColors } from "@/hooks/use-theme-colors";
import GridSpotlight from "./GridSpotlight";

// The aurora is WebGL, so it only loads in the browser, and only on devices that
// can run heavy effects. Phones never download it.
const Aurora = dynamic(() => import("./Aurora"), { ssr: false });

/**
 * The living background behind the home page hero, from bottom to top:
 * a still gradient (always there, and the whole effect on phones), the aurora,
 * a film grain, and a grid with a mouse spotlight.
 * It's purely decorative, so screen readers skip it and it never blocks clicks.
 */
export default function HomeBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const canRunHeavy = useCanRunHeavyEffects();
  // The spotlight follows a mouse, so it's only for devices with one (not touch tablets).
  const mouse = useHasMouse();
  const colors = useThemeColors();
  const pageVisible = usePageVisible();
  // True while any part of the hero area is on screen.
  const heroOnScreen = useInView(ref);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="hero-background pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100svh] overflow-hidden"
    >
      <div className="hero-still-gradient absolute inset-0" />

      {canRunHeavy && colors && (
        <Aurora
          colorStops={[colors.accentSoft, colors.accent, colors.accentSoft]}
          lightMode={!colors.isDark}
          // Low brightness and slow movement, so the text on top stays easy to read.
          brightness={0.55}
          opacity={colors.isDark ? 0.6 : 0.45}
          speed={0.35}
          amplitude={0.8}
          layers={2}
          height={0.4}
          mouseInteraction={false}
          // Stop drawing when the tab is hidden or the hero is scrolled away.
          paused={!pageVisible || !heroOnScreen}
          className="absolute inset-0"
        />
      )}

      <div className="film-grain absolute inset-0" />

      {canRunHeavy && mouse && <GridSpotlight />}
    </div>
  );
}
