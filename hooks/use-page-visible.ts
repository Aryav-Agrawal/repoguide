"use client";

import { useSyncExternalStore } from "react";

// Re-check whenever the visitor switches to another tab or back.
function subscribe(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function getSnapshot() {
  return !document.hidden;
}

// The server has no tabs, so it assumes the page is visible.
function getServerSnapshot() {
  return true;
}

/** Returns false while the browser tab is hidden, so animations can pause. */
export function usePageVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
