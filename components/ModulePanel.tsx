import { useEffect } from "react";
import type { AnalysisModule, RepoMetadata } from "@/lib/types";
import FileLink from "./FileLink";

type ModulePanelProps = {
  module: AnalysisModule;
  metadata: RepoMetadata;
  onClose: () => void;
};

// Details for the module clicked on the map. Sits on top of the map's right side.
export default function ModulePanel({ module, metadata, onClose }: ModulePanelProps) {
  // Escape closes the panel, like most popups.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <aside
      aria-label={`${module.name} details`}
      className="absolute inset-y-0 right-0 z-10 flex w-full flex-col border-l border-line bg-surface sm:w-80"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <h3 className="text-base font-semibold text-pretty text-ink">{module.name}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="-mt-1 -mr-2 rounded p-1.5 text-muted hover:bg-accent-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-sm leading-relaxed text-pretty text-ink">{module.description}</p>

        {module.folders.length > 0 && (
          <>
            <h4 className="mt-5 text-xs font-medium tracking-wide text-muted uppercase">Folders</h4>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {module.folders.map((folder) => (
                <li
                  key={folder}
                  className="rounded border border-line px-1.5 py-0.5 font-mono text-xs break-all text-muted"
                >
                  {folder}/
                </li>
              ))}
            </ul>
          </>
        )}

        <h4 className="mt-5 text-xs font-medium tracking-wide text-muted uppercase">Key files</h4>
        {module.keyFiles.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No key files listed.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {module.keyFiles.map((path) => (
              <li key={path}>
                <FileLink metadata={metadata} path={path} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
