import ProgressChecklist, { type ProgressState } from "./ProgressChecklist";
import SummarySkeleton from "./SummarySkeleton";

// What a tour shows while the analysis runs: the live checklist (with the graph building
// beside it), and grey placeholders where the summary cards will appear.
export default function LoadingTour({ progress }: { progress: ProgressState }) {
  return (
    <div className="flex flex-col gap-4">
      <ProgressChecklist progress={progress} />
      <SummarySkeleton />
    </div>
  );
}
