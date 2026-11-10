"use client";

import { useRef, useState } from "react";
import { HOW_IT_WORKS_STEPS } from "@/lib/how-it-works";
import { gsap, useGSAP } from "@/lib/gsap";
import HowItWorksHeading from "./HowItWorksHeading";
import PipelineBeams from "./PipelineBeams";
import RevealOnScroll from "./RevealOnScroll";
import StoryGraph from "./StoryGraph";

// How long the section stays pinned, in screen heights of scrolling (about one per step).
const PINNED_SCREENS = 3;
const STEP_COUNT = HOW_IT_WORKS_STEPS.length;

/**
 * The desktop "How it works" scroll story. The section sticks to the screen for about three
 * screens of scrolling. As you scroll, the progress line fills, the active step's text
 * cross-fades in, and the little graph builds itself: boxes appear, then lines join them.
 *
 * Only used when heavy effects are allowed (see components/HowItWorks.tsx).
 */
export default function HowItWorksPinned() {
  // The outer div belongs to React. GSAP wraps the inner (pinned) div in a "pin spacer",
  // and keeping that inside a div React owns means React never trips over it.
  const scopeRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useGSAP(
    () => {
      const q = gsap.utils.selector(scopeRef);
      const panels = q("[data-step-panel]");
      const growingNodes = q("[data-story-node='']");
      const edges = q("[data-story-edge]");

      // Starting state: only step 1's text and the root box of the graph are visible.
      gsap.set(panels.slice(1), { autoAlpha: 0, y: 16 });
      gsap.set(growingNodes, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
      gsap.set(edges, { strokeDasharray: 1, strokeDashoffset: 1 });

      // Work out the step from how far through the pinned scroll we are (0 to 1),
      // and only update React when it actually changes.
      let lastStep = 0;
      const syncStep = (progress: number) => {
        const step = Math.min(STEP_COUNT - 1, Math.floor(progress * STEP_COUNT));
        if (step !== lastStep) {
          lastStep = step;
          setActiveStep(step);
        }
      };

      // One timeline, 3 units long (one unit per step), tied to the scroll position.
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          pin: true,
          start: "top top",
          end: () => `+=${window.innerHeight * PINNED_SCREENS}`,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => syncStep(self.progress),
          onRefresh: (self) => syncStep(self.progress),
        },
      });

      // The progress line fills from top to bottom over the whole story.
      timeline.fromTo("[data-progress-fill]", { scaleY: 0 }, { scaleY: 1, duration: STEP_COUNT }, 0);

      // Cross-fade the step texts at each step boundary (1 and 2): the old one lifts away,
      // then the new one rises into its place.
      for (let step = 1; step < STEP_COUNT; step++) {
        timeline
          .to(panels[step - 1], { autoAlpha: 0, y: -16, duration: 0.15, ease: "power1.in" }, step - 0.15)
          .to(panels[step], { autoAlpha: 1, y: 0, duration: 0.15, ease: "power1.out" }, step);
      }

      // Step 2 ("AI reads the code"): the other module boxes pop in, one after another.
      timeline.to(
        growingNodes,
        { autoAlpha: 1, scale: 1, duration: 0.25, ease: "back.out(2)", stagger: 0.15 },
        1.05,
      );

      // Step 3 ("Explore the map"): the lines draw themselves between the boxes.
      timeline.to(edges, { strokeDashoffset: 0, duration: 0.3, stagger: 0.1 }, 2.05);
    },
    // Runs once. When this component unmounts (resizing to a phone, or leaving the page),
    // useGSAP undoes everything: it kills the timeline and ScrollTrigger and removes the pin spacer.
    { scope: scopeRef },
  );

  return (
    <div ref={scopeRef}>
      <div ref={pinRef} className="flex min-h-svh items-center py-12">
        <div className="grid w-full items-center gap-12 md:grid-cols-2">
          <div>
            <RevealOnScroll>
              <HowItWorksHeading />
            </RevealOnScroll>

            <RevealOnScroll delay={0.1} className="mt-10 flex gap-5">
              {/* The progress line, with a numbered dot where each step starts. */}
              <div aria-hidden="true" className="relative w-6 shrink-0">
                <div className="absolute inset-y-3 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-line">
                  <div data-progress-fill="" className="h-full w-full origin-top scale-y-0 rounded-full bg-accent" />
                </div>
                {HOW_IT_WORKS_STEPS.map((step, index) => (
                  <span
                    key={step.title}
                    // The line runs from 12px below the top to 12px above the bottom (inset-y-3),
                    // so each dot's centre sits exactly where the fill is when its step starts.
                    style={{ top: `calc(${index / STEP_COUNT} * (100% - 1.5rem))` }}
                    className={`absolute left-0 flex size-6 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors duration-300 ${
                      index <= activeStep
                        ? "border-accent bg-accent text-accent-ink"
                        : "border-line bg-background text-muted"
                    }`}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>

              {/* All three steps stay in the page (screen readers read them in order). They sit
                  on top of each other in one grid cell, and only the active one is visible. */}
              <ol className="grid min-h-48 flex-1">
                {HOW_IT_WORKS_STEPS.map((step, index) => (
                  <li
                    key={step.title}
                    data-step-panel=""
                    aria-current={index === activeStep ? "step" : undefined}
                    className="col-start-1 row-start-1"
                  >
                    <p className="text-sm text-muted">
                      Step {index + 1} of {STEP_COUNT}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink">{step.title}</h3>
                    <p className="mt-2 max-w-sm text-pretty text-muted">{step.text}</p>
                  </li>
                ))}
              </ol>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.2} className="rounded-xl border border-line bg-surface p-6">
            <PipelineBeams activeStep={activeStep} pulsing={activeStep === 1} />
            <div className="mt-8">
              <StoryGraph />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
