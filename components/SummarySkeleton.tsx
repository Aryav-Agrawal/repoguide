// Placeholders shaped like the two summary cards (RepoSummary and AnalysisSummary), shown
// while the analysis runs. Screen readers skip them; the checklist already says what's happening.
// The shimmer comes from the .skeleton class in app/globals.css (and stops with reduced motion).
export default function SummarySkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <div className="skeleton h-6 w-56 max-w-full" />
        <div className="skeleton mt-3 h-4 w-full max-w-lg" />
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-4">
          {[0, 1, 2, 3].map((cell) => (
            <div key={cell}>
              <div className="skeleton h-3 w-14" />
              <div className="skeleton mt-2 h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton mt-3 h-5 w-full" />
        <div className="skeleton mt-2 h-5 w-4/5" />
        <div className="skeleton mt-4 h-4 w-3/5" />
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
          {["w-16", "w-20", "w-14", "w-24"].map((width) => (
            <div key={width} className={`skeleton h-6 rounded-full ${width}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
