"use client";

import { useSyncExternalStore } from "react";

// Our colours live as CSS variables in app/globals.css. Some effects (like the
// WebGL aurora) can't read CSS variables, so this hook reads the real values
// and hands them over as plain strings like "#2c6a4c".

const DARK_QUERY = "(prefers-color-scheme: dark)";

// The colours change when the device switches between light and dark mode.
function subscribe(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// React compares snapshots to decide whether to re-render, so we return one
// plain string (same text = same value) instead of a new object every time.
function getSnapshot() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();
  const isDark = window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  return [read("--accent"), read("--accent-soft"), read("--background"), isDark].join("|");
}

// The server can't read styles. An empty string means "not known yet".
function getServerSnapshot() {
  return "";
}

export type ThemeColors = {
  accent: string;
  accentSoft: string;
  background: string;
  isDark: boolean;
};

/** Returns our theme colours as plain strings, or null before the browser has loaded. */
export function useThemeColors(): ThemeColors | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!snapshot) return null;
  const [accent, accentSoft, background, mode] = snapshot.split("|");
  return { accent, accentSoft, background, isDark: mode === "dark" };
}
