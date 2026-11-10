import { EXAMPLE_LANGUAGE_COUNT, EXAMPLE_REPOS } from "@/lib/example-repos";
import { MAX_TREE_FILES } from "@/lib/github";
import { MAX_FILES } from "@/lib/select-files";
import StatNumber from "./StatNumber";

// Only numbers that are true by construction: each one is read from the code that decides it,
// so it can't drift out of date. No usage numbers.
const STATS = [
  { value: EXAMPLE_REPOS.length, label: "example repos to try" },
  { value: EXAMPLE_LANGUAGE_COUNT, label: "languages among them" },
  { value: MAX_FILES, label: "key files the AI reads per tour, at most" },
  { value: MAX_TREE_FILES, label: "files a repo can have, at most" },
];

/** A row of plain facts about RepoGuide, whose numbers count up as they scroll into view. */
export default function Stats({ className }: { className?: string }) {
  return (
    <section aria-label="RepoGuide in numbers" className={className}>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
        {STATS.map((stat) => (
          <li key={stat.label}>
            <p className="text-3xl font-semibold text-ink sm:text-4xl">
              <StatNumber value={stat.value} />
            </p>
            <p className="mt-1 max-w-[12rem] text-sm text-pretty text-muted">{stat.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
