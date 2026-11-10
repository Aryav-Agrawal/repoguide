"use client";

import { useEffect, useState } from "react";
import { TYPING_START_MS } from "@/lib/hero-timing";
import { usePageVisible } from "./use-page-visible";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

// The start of every link stays put; only the repo part is typed and erased.
const PREFIX = "https://github.com/";
const EXAMPLES = ["vercel/next.js", "facebook/react", "tiangolo/fastapi"];

/** What the input shows before typing starts, and all the time with reduced motion. */
export const STATIC_PLACEHOLDER = "https://github.com/vercel/swr";

// Milliseconds per step.
const TYPE_DELAY = 70;
const ERASE_DELAY = 35;
const HOLD_DELAY = 1600; // how long a finished example stays before erasing
const NEXT_DELAY = 400; // pause on the empty prefix before the next example

type Options = {
  /** True once the visitor has clicked into the input. Typing stops for good. */
  stopped: boolean;
  /** True while typing should wait, e.g. while the input has text so the placeholder is hidden. */
  paused: boolean;
};

/**
 * Returns the input's placeholder: it types and erases example repos one after another.
 * Once stopped, it shows the current example in full. With reduced motion it never types.
 */
export function useTypingPlaceholder({ stopped, paused }: Options) {
  const reduceMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [erasing, setErasing] = useState(false);

  const enabled = !reduceMotion && !stopped;

  // Wait until the form has faded in before starting.
  useEffect(() => {
    if (!enabled || started) return;
    const timer = window.setTimeout(() => setStarted(true), TYPING_START_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, started]);

  // One step at a time: type a letter, hold, erase a letter, or move to the next example.
  const running = enabled && started && !paused && pageVisible;
  useEffect(() => {
    if (!running) return;
    const example = EXAMPLES[index];
    let wait: number;
    let step: () => void;

    if (!erasing && length < example.length) {
      wait = TYPE_DELAY;
      step = () => setLength((current) => current + 1);
    } else if (!erasing) {
      wait = HOLD_DELAY;
      step = () => setErasing(true);
    } else if (length > 0) {
      wait = ERASE_DELAY;
      step = () => setLength((current) => current - 1);
    } else {
      wait = NEXT_DELAY;
      step = () => {
        setErasing(false);
        setIndex((current) => (current + 1) % EXAMPLES.length);
      };
    }

    const timer = window.setTimeout(step, wait);
    return () => window.clearTimeout(timer);
  }, [running, index, length, erasing]);

  if (reduceMotion || !started) return STATIC_PLACEHOLDER;
  // Stopped: show a complete, real example rather than a half-typed one.
  if (stopped) return PREFIX + EXAMPLES[index];
  return PREFIX + EXAMPLES[index].slice(0, length);
}
