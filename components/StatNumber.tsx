"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { NumberTicker } from "./ui/number-ticker";

/**
 * A number that counts up from 0 the first time it scrolls into view (Magic UI Number Ticker).
 * Screen readers get the real number straight away from a hidden copy, and the moving one is
 * hidden from them. With reduced motion the number just shows, no counting.
 */
export default function StatNumber({ value }: { value: number }) {
  const reduceMotion = usePrefersReducedMotion();
  const formatted = value.toLocaleString("en-US");

  return (
    <>
      <span className="sr-only">{formatted}</span>
      {reduceMotion ? (
        <span aria-hidden="true" className="tabular-nums">
          {formatted}
        </span>
      ) : (
        <NumberTicker aria-hidden="true" value={value} className="tracking-tight text-ink dark:text-ink" />
      )}
    </>
  );
}
