"use client";

import { useSyncExternalStore } from "react";

// "fine" means a precise pointer like a mouse or trackpad (not a finger on a touch screen).
const FINE_POINTER_QUERY = "(pointer: fine)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

// The server can't see the device, so it says "no mouse" and mouse effects start off.
function getServerSnapshot() {
  return false;
}

/** Returns true when the device has a mouse or trackpad, for effects that follow the cursor. */
export function useHasMouse() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
