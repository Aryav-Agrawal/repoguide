"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { HEADLINE_STEP_SECONDS, HEADLINE_WORD_STAGGER_MS } from "@/lib/hero-timing";
import BlurText from "./BlurText";

const HEADLINE = "Find your way around any GitHub repo.";
// The word that gets the slow moving shine: it's the promise of the product.
const SHINE_WORD = "any";
const HEADLINE_CLASS =
  "mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl";

/**
 * The home page headline. The words blur in one by one when the page loads.
 * Screen readers get the whole sentence at once from a hidden copy inside BlurText.
 * With reduced motion it's the plain heading, fading in.
 */
export default function HeroHeadline() {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return (
      <motion.h1
        className={HEADLINE_CLASS}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {HEADLINE}
      </motion.h1>
    );
  }

  return (
    <BlurText
      as="h1"
      text={HEADLINE}
      trigger="load"
      animateBy="words"
      direction="top"
      distance={10}
      blur={10}
      delay={HEADLINE_WORD_STAGGER_MS}
      stepDuration={HEADLINE_STEP_SECONDS}
      className={HEADLINE_CLASS}
      segmentClassName={(word) => (word === SHINE_WORD ? "text-shine" : undefined)}
    />
  );
}
