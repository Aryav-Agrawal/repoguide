"use client";

import { useSyncExternalStore } from "react";

// Heavy effects (3D, WebGL, smooth scroll, parallax) only run when BOTH are true:
// - the screen is at least 768px wide (phones get the light version), and
// - the visitor hasn't asked their device to reduce motion.
// One media query checks both at once.
const HEAVY_EFFECTS_QUERY =
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

// Tells React to re-check whenever the answer changes, for example when the
// window is resized or the motion setting is switched.
function subscribe(onChange: () => void) {
  const query = window.matchMedia(HEAVY_EFFECTS_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(HEAVY_EFFECTS_QUERY).matches;
}

// The server can't see the screen, so it always says "no". That way the server
// HTML and the first render in the browser match (no hydration errors), and a
// heavy effect never flashes on a phone before we know it's a phone.
function getServerSnapshot() {
  return false;
}

/**
 * Returns true only when it's safe to run a heavy effect.
 * When it returns false, show a still image or a simple fade instead.
 */
export function useCanRunHeavyEffects() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
