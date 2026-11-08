import type { RepoMetadata, StartHereFile } from "@/lib/types";
import FileLink from "./FileLink";

type StartHereProps = {
  steps: StartHereFile[];
  metadata: RepoMetadata;
};

// The reading order: which files to open first, and why.
export default function StartHere({ steps, metadata }: StartHereProps) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-medium text-ink">Start here</h2>
        <p className="mt-0.5 text-xs text-muted">Read these files in order to get your bearings.</p>
      </div>

      {steps.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">No reading order is available for this repo.</p>
      ) : (
        <ol className="divide-y divide-line">
          {steps.map((step, index) => (
            <li key={step.path} className="flex gap-4 px-5 py-4">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-sm font-medium text-accent"
              >
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <span className="sr-only">Step {index + 1}: </span>
                <FileLink metadata={metadata} path={step.path} />
                <p className="mt-1 text-sm text-pretty text-muted">{step.reason}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
