"use client";

import { useRef } from "react";
import { Map as MapIcon, Sparkles } from "lucide-react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { useThemeColors } from "@/hooks/use-theme-colors";
import GitHubIcon from "./GitHubIcon";

type PipelineBeamsProps = {
  /** Which step is on screen (0, 1 or 2). Its icon gets an accent ring. Leave out to highlight none. */
  activeStep?: number;
  /** When true, light pulses travel along the beams from GitHub to AI to the map. */
  pulsing: boolean;
};

const STOPS = [
  { label: "GitHub", Icon: GitHubIcon },
  { label: "AI", Icon: Sparkles },
  { label: "Map", Icon: MapIcon },
];

/**
 * Three icons in a row (GitHub, AI, Map) joined by Magic UI Animated Beams: the path a repo
 * takes through RepoGuide. Purely decorative; the step text beside it says the same thing.
 */
export default function PipelineBeams({ activeStep, pulsing }: PipelineBeamsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const githubRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const iconRefs = [githubRef, aiRef, mapRef];
  // The beams are SVG, which can't read our CSS colour variables, so we pass real values.
  const colors = useThemeColors();

  return (
    <div ref={containerRef} aria-hidden="true" className="relative flex items-start justify-between px-2">
      {STOPS.map(({ label, Icon }, index) => {
        const active = index === activeStep;
        return (
          <div key={label} className="relative z-10 flex w-16 flex-col items-center gap-2">
            <div
              ref={iconRefs[index]}
              className={`flex size-12 items-center justify-center rounded-full border bg-surface transition-[color,border-color,box-shadow] duration-300 ${
                active ? "border-accent text-accent ring-4 ring-accent/20" : "border-line text-muted"
              }`}
            >
              <Icon className="size-5" />
            </div>
            <span className={`text-xs transition-colors duration-300 ${active ? "text-ink" : "text-muted"}`}>
              {label}
            </span>
          </div>
        );
      })}

      {colors && (
        <>
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={githubRef}
            toRef={aiRef}
            animate={pulsing}
            duration={2.4}
            pathColor={colors.accent}
            pathOpacity={0.25}
            gradientStartColor={colors.accent}
            gradientStopColor={colors.accent}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={aiRef}
            toRef={mapRef}
            animate={pulsing}
            duration={2.4}
            // Starts a little later, so the pulse looks like it flows on through the AI step.
            delay={0.6}
            pathColor={colors.accent}
            pathOpacity={0.25}
            gradientStartColor={colors.accent}
            gradientStopColor={colors.accent}
          />
        </>
      )}
    </div>
  );
}
