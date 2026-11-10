import { FileText, ListOrdered, Map as MapIcon, MessageSquareText, type LucideIcon } from "lucide-react";
import { FEATURES, FEATURES_INTRO, FEATURES_TITLE, type FeatureId } from "@/lib/features";
import ExplanationVisual from "./ExplanationVisual";
import FeatureCard from "./FeatureCard";
import MapVisual from "./MapVisual";
import RevealOnScroll from "./RevealOnScroll";
import StartHereVisual from "./StartHereVisual";
import SummaryVisual from "./SummaryVisual";

const HEADING_ID = "features-title";

// What each card looks like, and how many of the 5 grid columns it takes on wide screens.
// The widths alternate (2 + 3, then 3 + 2) so the grid zig-zags instead of looking like a table.
const CARD_DETAILS: Record<FeatureId, { icon: LucideIcon; visual: React.ReactNode; span: string }> = {
  summary: { icon: FileText, visual: <SummaryVisual />, span: "lg:col-span-2" },
  map: { icon: MapIcon, visual: <MapVisual />, span: "lg:col-span-3" },
  explanations: { icon: MessageSquareText, visual: <ExplanationVisual />, span: "lg:col-span-3" },
  "start-here": { icon: ListOrdered, visual: <StartHereVisual />, span: "lg:col-span-2" },
};

/** The "What you get" section: the four parts of a tour, as a bento grid of cards. */
export default function Features({ className }: { className?: string }) {
  return (
    <section aria-labelledby={HEADING_ID} className={className}>
      <RevealOnScroll>
        <h2 id={HEADING_ID} className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {FEATURES_TITLE}
        </h2>
        <p className="mt-3 max-w-md text-pretty text-muted">{FEATURES_INTRO}</p>
      </RevealOnScroll>

      {/* The whole grid fades in once, rather than every card on its own. */}
      <RevealOnScroll className="mt-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((feature) => {
            const details = CARD_DETAILS[feature.id];
            return (
              <li key={feature.id} className={details.span}>
                <FeatureCard
                  icon={<details.icon aria-hidden="true" className="size-4" />}
                  title={feature.title}
                  text={feature.text}
                  visual={details.visual}
                />
              </li>
            );
          })}
        </ul>
      </RevealOnScroll>
    </section>
  );
}
