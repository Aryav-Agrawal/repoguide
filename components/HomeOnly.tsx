"use client";

import { motion } from "motion/react";
import { refreshScrollAnimations } from "@/lib/smooth-scroll";
import { TOUR_FADE_SECONDS } from "@/lib/tour-motion";
import { useRepoAnalysis } from "./RepoAnalysisProvider";

type HomeOnlyProps = {
  /**
   * When true, the content lifts out of the page flow the moment a tour starts
   * (it's laid on top instead), so whatever sits below moves up while this fades out.
   */
  overlay?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wraps parts of the home page that only belong on the home page (the hero, the background,
 * How it works and so on). When a tour starts they fade out and are then hidden completely,
 * and they fade back in when the visitor returns home. They stay mounted the whole time, so
 * nothing replays its intro animation. While hidden, keyboard and screen reader users skip them.
 */
export default function HomeOnly({ overlay = false, className = "", children }: HomeOnlyProps) {
  const { inTour } = useRepoAnalysis();

  return (
    <motion.div
      className={`${className} ${inTour && overlay ? "pointer-events-none absolute inset-x-0 top-0" : ""}`}
      // Nothing animates on page load; this only reacts to entering or leaving a tour.
      initial={false}
      animate={
        inTour
          ? { opacity: 0, transitionEnd: { display: "none" } }
          : { opacity: 1, display: "block" }
      }
      transition={{ duration: TOUR_FADE_SECONDS, ease: "easeOut" }}
      // The page got shorter or taller, so scroll animations (the pinned How it works section,
      // the parallax) re-measure where they start and end.
      // (Does nothing on phones and with reduced motion, where there are no scroll animations.)
      onAnimationComplete={refreshScrollAnimations}
      aria-hidden={inTour || undefined}
      inert={inTour}
    >
      {children}
    </motion.div>
  );
}
