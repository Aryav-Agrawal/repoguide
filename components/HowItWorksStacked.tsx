import { HOW_IT_WORKS_STEPS } from "@/lib/how-it-works";
import HowItWorksHeading from "./HowItWorksHeading";
import PipelineBeams from "./PipelineBeams";
import RevealOnScroll from "./RevealOnScroll";
import StoryGraph from "./StoryGraph";

/**
 * The simple "How it works": the three steps as a normal list, each fading in as it
 * scrolls into view, with the finished graph beside them. No pinning and no scroll-driven
 * animation. Used on phones and when the visitor asked for reduced motion.
 */
export default function HowItWorksStacked() {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
      <div>
        <RevealOnScroll>
          <HowItWorksHeading />
        </RevealOnScroll>

        <ol className="mt-8 flex flex-col gap-6">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title}>
              <RevealOnScroll delay={index * 0.08} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-ink"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 max-w-sm text-pretty text-muted">{step.text}</p>
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ol>
      </div>

      <RevealOnScroll className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <PipelineBeams pulsing={false} />
        <div className="mt-8">
          <StoryGraph />
        </div>
      </RevealOnScroll>
    </div>
  );
}
