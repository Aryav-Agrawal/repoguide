"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { LayoutGroup } from "motion/react";

// The id on RepoExplorer's wrapper.
export const ANALYZE_SECTION_ID = "analyze";

type StartFn = (url: string) => void;

type RepoAnalysisContextValue = {
  /** RepoExplorer hands over its "start an analysis" function here. */
  register: (start: StartFn | null) => void;
  /** Anything lower on the page (like the example repo strip) calls this to start one. */
  startAnalysis: StartFn;
  /**
   * True from the moment an analysis starts until the visitor goes back home.
   * While it's true the page shows the tour (loading, results or an error) and hides
   * the home page sections.
   */
  inTour: boolean;
  setInTour: (value: boolean) => void;
};

const RepoAnalysisContext = createContext<RepoAnalysisContextValue | null>(null);

/**
 * Shares two things across the home page:
 * - the start function, so parts far below the form can start an analysis
 *   (a ref is enough for that: changing it doesn't need to re-render anything), and
 * - whether we're showing the home page or a tour, so the home-only sections can fade away.
 *
 * LayoutGroup lets Motion see layout changes across all of these components at once, so the
 * URL bar can glide to its new spot when the hero above it leaves the page.
 */
export default function RepoAnalysisProvider({ children }: { children: React.ReactNode }) {
  const startRef = useRef<StartFn | null>(null);
  const [inTour, setInTour] = useState(false);

  const register = useCallback((start: StartFn | null) => {
    startRef.current = start;
  }, []);

  // RepoExplorer scrolls back to the top itself when the tour opens.
  const startAnalysis = useCallback((url: string) => {
    startRef.current?.(url);
  }, []);

  const value = useMemo(
    () => ({ register, startAnalysis, inTour, setInTour }),
    [register, startAnalysis, inTour],
  );

  return (
    <RepoAnalysisContext.Provider value={value}>
      <LayoutGroup>{children}</LayoutGroup>
    </RepoAnalysisContext.Provider>
  );
}

/** Use inside RepoAnalysisProvider. */
export function useRepoAnalysis() {
  const context = useContext(RepoAnalysisContext);
  if (!context) {
    throw new Error("useRepoAnalysis must be used inside RepoAnalysisProvider");
  }
  return context;
}
