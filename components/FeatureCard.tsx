"use client";

import { useCanRunHeavyEffects } from "@/hooks/use-can-run-heavy-effects";
import { useHasMouse } from "@/hooks/use-has-mouse";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";

type FeatureCardProps = {
  /** The rendered icon, e.g. <MapIcon />. (A server component can pass elements to a client component, but not components.) */
  icon: React.ReactNode;
  title: string;
  text: string;
  /** A small picture of this part of the tour. */
  visual: React.ReactNode;
};

/**
 * One card in the "What you get" grid. On a desktop with a mouse it tilts toward the cursor
 * (Aceternity 3D Card) with a soft glare following it. On phones, touch screens and with
 * reduced motion it stays flat: useCanRunHeavyEffects covers screen size and reduced motion,
 * useHasMouse covers touch.
 */
export default function FeatureCard({ icon, title, text, visual }: FeatureCardProps) {
  const canRunHeavy = useCanRunHeavyEffects();
  const hasMouse = useHasMouse();
  const tilt = canRunHeavy && hasMouse;

  return (
    <CardContainer
      disabled={!tilt}
      containerClassName="block h-full py-0"
      className="group/tilt block h-full w-full"
    >
      <CardBody className="relative flex h-full w-full flex-col rounded-xl border border-line bg-surface p-5 sm:p-6">
        {/* The glare: a soft spot of light under the cursor, faded in while the mouse is over the card. */}
        {tilt && (
          <div
            aria-hidden="true"
            className="feature-glare pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-data-[mouse-entered]/tilt:opacity-100"
          />
        )}

        <CardItem translateZ={20} className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            {icon}
          </span>
          <h3 className="font-semibold text-ink">{title}</h3>
        </CardItem>
        <CardItem as="p" translateZ={14} className="mt-3 max-w-md text-pretty text-muted">
          {text}
        </CardItem>
        <CardItem translateZ={36} className="mt-auto w-full pt-6">
          {visual}
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
