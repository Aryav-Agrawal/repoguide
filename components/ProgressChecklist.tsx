import type { AnalyzeStepId } from "@/lib/types";
import BuildingGraph from "./BuildingGraph";
import ElapsedSeconds from "./ElapsedSeconds";
import StepIcon from "./StepIcon";

export type StepState = { status: "waiting" | "active" | "done"; detail?: string };
export type ProgressState = Record<AnalyzeStepId, StepState>;

// The steps in the order the server runs them. `hint` shows while a slow step is running.
const STEPS: { id: AnalyzeStepId; label: string; hint?: string }[] = [
  { id: "fetching", label: "Fetching the repo" },
  { id: "choosing", label: "Choosing the important files" },
  { id: "analyzing", label: "Reading the code with AI", hint: "Usually 10 to 30 seconds" },
  { id: "mapping", label: "Building the map" },
];

export function initialProgress(): ProgressState {
  return {
    fetching: { status: "waiting" },
    choosing: { status: "waiting" },
    analyzing: { status: "waiting" },
    mapping: { status: "waiting" },
  };
}

export default function ProgressChecklist({ progress }: { progress: ProgressState }) {
  const current = STEPS.find((step) => progress[step.id].status === "active");

  return (
    <div className="grid max-w-3xl gap-5 rounded-xl border border-line bg-surface px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8">
      <div className="min-w-0">
        <h2 className="text-sm font-medium text-ink">Building your tour</h2>

        <ol className="mt-4 flex flex-col gap-3.5">
          {STEPS.map((step) => {
            const { status, detail } = progress[step.id];
            return (
              <li key={step.id} className="flex items-start gap-3" aria-current={status === "active" ? "step" : undefined}>
                <StepIcon status={status} />
                <div className="min-w-0">
                  <p className={`text-sm ${status === "waiting" ? "text-muted" : "text-ink"}`}>{step.label}</p>
                  {status === "done" && detail && (
                    <p className="mt-0.5 font-mono text-xs text-muted">{detail}</p>
                  )}
                  {status === "active" && step.hint && (
                    <p className="mt-0.5 text-xs text-muted">
                      {step.hint} · <ElapsedSeconds />
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* A small map that builds itself as the steps run. Under the list on phones, beside it from sm up. */}
      <div className="flex justify-center sm:w-56 sm:justify-end">
        <BuildingGraph progress={progress} />
      </div>

      {/* Screen readers hear each new step as it starts. */}
      <p className="sr-only" aria-live="polite">
        {current ? `${current.label}…` : ""}
      </p>
    </div>
  );
}
