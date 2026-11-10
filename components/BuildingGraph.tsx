"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  BOX_HEIGHT,
  BOX_WIDTH,
  GRAPH_EDGES,
  GRAPH_HEIGHT,
  GRAPH_NODES,
  GRAPH_WIDTH,
  nodesForStep,
} from "@/lib/building-graph";
import { POP_SPRING } from "@/lib/tour-motion";
import type { AnalyzeStepId } from "@/lib/types";
import type { ProgressState } from "./ProgressChecklist";

const STEP_ORDER: AnalyzeStepId[] = ["fetching", "choosing", "analyzing", "mapping"];

// How long to wait before adding the next box, in milliseconds. The AI step is the slow one,
// so boxes come more slowly then and the graph keeps growing for most of it.
const NEXT_BOX_MS = 450;
const NEXT_BOX_WHILE_ANALYZING_MS = 2200;

// How many boxes the graph should be showing: every box of the finished steps, plus the boxes
// of the step that's running now (they're added one at a time until we get there).
function targetCount(progress: ProgressState) {
  let count = 0;
  for (const step of STEP_ORDER) {
    if (progress[step].status !== "waiting") count += nodesForStep(step);
  }
  return count;
}

// A curve from the right side of one box to the left side of the next, like the real map's edges.
function edgePath(from: number, to: number) {
  const a = GRAPH_NODES[from];
  const b = GRAPH_NODES[to];
  const x1 = a.x + BOX_WIDTH;
  const y1 = a.y + BOX_HEIGHT / 2;
  const x2 = b.x;
  const y2 = b.y + BOX_HEIGHT / 2;
  const middle = (x1 + x2) / 2;
  return `M${x1} ${y1} C${middle} ${y1} ${middle} ${y2} ${x2} ${y2}`;
}

/**
 * A small map that builds itself box by box while the analysis runs, next to the checklist.
 * Purely decorative (the checklist says what's happening), so screen readers skip it.
 * Every box and line animates in once and then stays still.
 */
export default function BuildingGraph({ progress }: { progress: ProgressState }) {
  const reduceMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);
  const target = targetCount(progress);
  const analyzing = progress.analyzing.status === "active";

  // Add one box at a time until we reach the target.
  useEffect(() => {
    if (shown >= target) return;
    const timer = window.setTimeout(
      () => setShown((count) => count + 1),
      analyzing ? NEXT_BOX_WHILE_ANALYZING_MS : NEXT_BOX_MS,
    );
    return () => window.clearTimeout(timer);
  }, [shown, target, analyzing]);

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
      className="h-auto w-full max-w-[16rem]"
      fill="none"
    >
      {GRAPH_EDGES.map(([from, to]) =>
        to < shown ? (
          <motion.path
            key={`${from}-${to}`}
            d={edgePath(from, to)}
            stroke="var(--muted)"
            strokeOpacity={0.45}
            strokeWidth={1.25}
            // Drawing a line isn't a movement MotionConfig knows about, so with reduced motion
            // we skip it ourselves and only fade the line in.
            initial={reduceMotion ? { opacity: 0 } : { pathLength: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { pathLength: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        ) : null,
      )}

      {GRAPH_NODES.slice(0, shown).map((node, index) => {
        const newest = index === shown - 1 && shown < GRAPH_NODES.length;
        return (
          <motion.rect
            key={index}
            x={node.x}
            y={node.y}
            width={BOX_WIDTH}
            height={BOX_HEIGHT}
            rx={4}
            strokeWidth={1.25}
            // The newest box is highlighted until the next one arrives.
            className={`transition-colors duration-500 ${newest ? "fill-accent-soft stroke-accent" : "fill-surface stroke-line"}`}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            // With reduced motion the app-wide MotionConfig drops the scale, so this only fades.
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={POP_SPRING}
          />
        );
      })}
    </svg>
  );
}
