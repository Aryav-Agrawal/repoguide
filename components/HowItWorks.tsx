"use client";

import dynamic from "next/dynamic";
import { useCanRunHeavyEffects } from "@/hooks/use-can-run-heavy-effects";
import { HOW_IT_WORKS_HEADING_ID } from "./HowItWorksHeading";
import HowItWorksStacked from "./HowItWorksStacked";

// The pinned version needs GSAP, so it's only downloaded on devices that will show it.
// While it downloads, the stacked version stays on screen, so there's never an empty gap.
const HowItWorksPinned = dynamic(() => import("./HowItWorksPinned"), {
  ssr: false,
  loading: () => <HowItWorksStacked />,
});

/**
 * The "How it works" section below the hero. On devices that can run heavy effects it's a
 * pinned scroll story; everywhere else it's a simple stacked list. Switching between the two
 * (for example when the window is resized) unmounts one and mounts the other, and the pinned
 * version cleans up all of its scroll animations when it unmounts.
 */
export default function HowItWorks({ className }: { className?: string }) {
  const canRunHeavy = useCanRunHeavyEffects();

  return (
    <section aria-labelledby={HOW_IT_WORKS_HEADING_ID} className={className}>
      {canRunHeavy ? <HowItWorksPinned /> : <HowItWorksStacked />}
    </section>
  );
}
