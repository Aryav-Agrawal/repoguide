"use client";

import type { ExampleRepo } from "@/lib/example-repos";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useRepoAnalysis } from "./RepoAnalysisProvider";
import RepoChip from "./RepoChip";
import { Marquee } from "./ui/marquee";

export type ExampleRepoWithStars = ExampleRepo & { stars: number | null };

/**
 * The example repos as an endless scrolling strip (Magic UI Marquee). It pauses while the
 * mouse is over it or a chip has keyboard focus, and clicking a repo starts its tour up in the form.
 * With reduced motion it's a still, wrapped list instead.
 */
export default function RepoMarquee({ repos }: { repos: ExampleRepoWithStars[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const { startAnalysis } = useRepoAnalysis();
  const pick = (fullName: string) => startAnalysis(`https://github.com/${fullName}`);

  if (reduceMotion) {
    return (
      <ul className="flex flex-wrap gap-2">
        {repos.map((repo) => (
          <li key={repo.fullName}>
            <RepoChip {...repo} onPick={pick} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    // The list is long enough to fill the strip, so two copies make a seamless loop.
    <Marquee pauseOnHover repeat={2} className="marquee-fade p-0 py-1 [--duration:70s] [--gap:0.75rem]">
      {(isCopy) =>
        repos.map((repo) => (
          <RepoChip key={repo.fullName} {...repo} onPick={pick} tabIndex={isCopy ? -1 : undefined} />
        ))
      }
    </Marquee>
  );
}
