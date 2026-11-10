"use client";

import { motion } from "motion/react";
import type { RepoMetadata, StartHereFile } from "@/lib/types";
import { EASE_OUT } from "@/lib/tour-motion";
import FileLink from "./FileLink";

type StartHereProps = {
  steps: StartHereFile[];
  metadata: RepoMetadata;
};

// The list waits until it scrolls into view, then shows its steps one after another (once).
const list = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08 } },
};
// Each step fades up a little. With reduced motion (app-wide MotionConfig) it only fades.
const item = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
};

// The reading order: which files to open first, and why.
export default function StartHere({ steps, metadata }: StartHereProps) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-medium text-ink">Start here</h2>
        <p className="mt-0.5 text-xs text-muted">Read these files in order to get your bearings.</p>
      </div>

      {steps.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">No reading order is available for this repo.</p>
      ) : (
        <motion.ol
          className="divide-y divide-line"
          variants={list}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            <motion.li key={step.path} variants={item} className="flex gap-4 px-5 py-4">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-sm font-medium text-accent"
              >
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <span className="sr-only">Step {index + 1}: </span>
                <FileLink metadata={metadata} path={step.path} />
                <p className="mt-1 text-sm text-pretty text-muted">{step.reason}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      )}
    </div>
  );
}
