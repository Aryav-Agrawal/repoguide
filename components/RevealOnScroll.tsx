"use client";

import { motion } from "motion/react";

type RevealOnScrollProps = {
  className?: string;
  /** Seconds to wait after it comes into view, for small staggers. */
  delay?: number;
  children: React.ReactNode;
};

/**
 * Fades its content in and lifts it a little, once, the first time it scrolls into view.
 * With reduced motion it only fades: the app-wide MotionConfig (components/MotionProvider.tsx)
 * drops the movement and keeps the fade.
 *
 * Don't wrap anything that gets pinned by ScrollTrigger in this: a moving parent
 * breaks the "stay fixed on screen" trick that pinning relies on.
 */
export default function RevealOnScroll({ className, delay = 0, children }: RevealOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
