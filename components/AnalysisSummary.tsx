import type { RepoAnalysis } from "@/lib/types";

export default function AnalysisSummary({ summary }: { summary: RepoAnalysis["summary"] }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-xs font-medium tracking-wide text-muted uppercase">What it does</h2>
      <p className="mt-2 text-lg text-pretty text-ink">{summary.whatItDoes}</p>
      <p className="mt-3 text-pretty text-muted">{summary.audience}</p>

      {summary.technologies.length > 0 && (
        <ul aria-label="Technologies" className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
          {summary.technologies.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-xs text-accent"
            >
              {tech}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
