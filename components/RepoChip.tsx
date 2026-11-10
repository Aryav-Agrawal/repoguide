import { Star } from "lucide-react";

type RepoChipProps = {
  fullName: string;
  language: string;
  /** From GitHub. null when GitHub couldn't be reached: then no count is shown. */
  stars: number | null;
  onPick: (fullName: string) => void;
  /** -1 for the repeated copies in the marquee, so Tab only visits each repo once. */
  tabIndex?: number;
};

// 69573 -> "69.6k", the way GitHub shows star counts.
const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** One example repo as a button: clicking it starts a tour of that repo. */
export default function RepoChip({ fullName, language, stars, onPick, tabIndex }: RepoChipProps) {
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      onClick={() => onPick(fullName)}
      className="inline-flex min-h-10 shrink-0 items-center gap-2.5 rounded-full border border-line bg-surface px-3.5 text-sm transition-colors hover:border-accent/50 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="sr-only">Start a tour of </span>
      <span className="font-mono text-ink">{fullName}</span>
      <span className="text-xs text-muted">{language}</span>
      {stars !== null && (
        <span className="inline-flex items-center gap-1 text-xs text-muted tabular-nums">
          <Star aria-hidden="true" className="size-3.5" />
          {compactNumber.format(stars).toLowerCase()}
          <span className="sr-only"> stars</span>
        </span>
      )}
    </button>
  );
}
