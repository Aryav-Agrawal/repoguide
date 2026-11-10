"use client";

import { motion } from "motion/react";
import type { RepoAnalysis } from "@/lib/types";
import { EASE_OUT, POP_SPRING } from "@/lib/tour-motion";

// When the badges start popping in (after the card has mostly faded up), and the gap between them.
const BADGES_DELAY_SECONDS = 0.3;
const BADGE_STAGGER_SECONDS = 0.05;

// The "What it does" card. It fades up when the results arrive, then the technology badges
// pop in one after another. With reduced motion (app-wide MotionConfig) both only fade.
export default function AnalysisSummary({ summary }: { summary: RepoAnalysis["summary"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: EASE_OUT }}
      className="rounded-xl border border-line bg-surface p-5 sm:p-6"
    >
      <h2 className="text-xs font-medium tracking-wide text-muted uppercase">What it does</h2>
      <p className="mt-2 text-lg text-pretty text-ink">{summary.whatItDoes}</p>
      <p className="mt-3 text-pretty text-muted">{summary.audience}</p>

      {summary.technologies.length > 0 && (
        <ul aria-label="Technologies" className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
          {summary.technologies.map((tech, index) => (
            <motion.li
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...POP_SPRING, delay: BADGES_DELAY_SECONDS + index * BADGE_STAGGER_SECONDS }}
              className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-xs text-accent"
            >
              {tech}
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
