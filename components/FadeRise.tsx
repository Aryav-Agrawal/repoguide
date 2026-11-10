"use client";

import { motion } from "motion/react";
import { FADE_RISE_SECONDS } from "@/lib/hero-timing";

type FadeRiseProps = {
  /** Seconds to wait after the page loads before appearing. */
  delay: number;
  className?: string;
  children: React.ReactNode;
};

/**
 * Fades its content in while it rises a few pixels, once, when the page loads.
 * With reduced motion it only fades: the app-wide MotionConfig (components/MotionProvider.tsx)
 * drops the movement and keeps the fade.
 */
export default function FadeRise({ delay, className, children }: FadeRiseProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: FADE_RISE_SECONDS, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
