"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { readNdjson } from "@/lib/ndjson";
import { scrollToTop } from "@/lib/smooth-scroll";
import type { AnalyzeEvent, AnalyzeResponse, ApiErrorBody } from "@/lib/types";
import { FORM_DELAY_SECONDS } from "@/lib/hero-timing";
import { EASE_OUT, TOUR_FADE_SECONDS, URL_BAR_MOVE_SECONDS } from "@/lib/tour-motion";
import FadeRise from "./FadeRise";
import RepoForm from "./RepoForm";
import ExampleRepos from "./ExampleRepos";
import HomeLink from "./HomeLink";
import LoadingTour from "./LoadingTour";
import { initialProgress, type ProgressState } from "./ProgressChecklist";
import ErrorMessage from "./ErrorMessage";
import RepoSummary from "./RepoSummary";
import AnalysisSummary from "./AnalysisSummary";
import StartHere from "./StartHere";
import FileTree from "./FileTree";
import { ANALYZE_SECTION_ID, useRepoAnalysis } from "./RepoAnalysisProvider";

// The map pulls in React Flow and dagre, which are fairly big. Loading it this way means
// the browser only downloads that code once someone starts an analysis.
const loadModuleMap = () => import("./ModuleMap");
const ModuleMap = dynamic(loadModuleMap, {
  ssr: false,
  loading: () => (
    <div className="h-[31rem] animate-pulse rounded-xl border border-line bg-surface sm:h-[37rem]" />
  ),
});

type Status = "idle" | "loading" | "success" | "error";
type ApiError = ApiErrorBody["error"];

// A plain fade, used for swapping between the loading state, an error and the results.
const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: TOUR_FADE_SECONDS, ease: "easeOut" },
} as const;

export default function RepoExplorer() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  // The link of the last analysis we started, so "Try again" repeats exactly that one.
  const [lastUrl, setLastUrl] = useState("");
  // Goes up by one for every new result. Used as a key so the map and file tree start fresh,
  // even when the same repo is analyzed twice.
  const [resultNumber, setResultNumber] = useState(0);
  // Lets us cancel the running analysis (when going back home, or starting another one).
  const abortRef = useRef<AbortController | null>(null);
  const { register, inTour, setInTour } = useRepoAnalysis();

  function fail(apiError: ApiError) {
    setError(apiError);
    setStatus("error");
  }

  async function runAnalysis(target: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setUrl(target);
    setLastUrl(target);
    setStatus("loading");
    setError(null);
    setProgress(initialProgress());
    setInTour(true);
    // Start downloading the map's code now, while the server works, so it's ready when the result lands.
    void loadModuleMap();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
        signal: controller.signal,
      });

      // Problems caught before the work starts (bad link, hourly limit) come back as plain JSON.
      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        if (controller.signal.aborted) return;
        fail(
          body?.error ?? {
            code: "github_error",
            message: `The server returned an unexpected error (status ${response.status}).`,
          },
        );
        return;
      }

      // Otherwise the server streams one event per line as it works.
      for await (const event of readNdjson<AnalyzeEvent>(response.body)) {
        if (event.type === "progress") {
          setProgress((previous) => ({
            ...previous,
            [event.step]: { status: event.status, detail: event.detail },
          }));
        } else if (event.type === "result") {
          setData(event.data);
          setResultNumber((count) => count + 1);
          setStatus("success");
          return;
        } else {
          fail(event.error);
          return;
        }
      }

      // The stream ended without a result or an error. On Vercel this happens when the
      // analysis runs past the time limit and the server is stopped.
      if (controller.signal.aborted) return;
      fail({ code: "ai_error", message: "The analysis stopped before it finished, probably because it took too long." });
    } catch {
      // We cancelled it ourselves, so there's nothing to report.
      if (controller.signal.aborted) return;
      fail({
        code: "github_error",
        message: "We lost the connection to RepoGuide's server. Your internet connection may have dropped.",
      });
    }
  }

  // The logo in the tour header: stop any running analysis and show the home page again.
  function goHome() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
    setError(null);
    setData(null);
    setInTour(false);
  }

  const loading = status === "loading";

  // When a tour opens, jump to the top of the page so it starts at its header. This matters
  // when the analysis was started from the example strip far down the page.
  useEffect(() => {
    if (inTour) scrollToTop({ instant: true });
  }, [inTour]);

  // Let the example repo strip further down the page start an analysis here.
  // It runs after every render so the strip always calls the latest version, and it
  // ignores clicks while an analysis is already running.
  useEffect(() => {
    register((target) => {
      if (!loading) void runAnalysis(target);
    });
    return () => register(null);
  });

  return (
    <div id={ANALYZE_SECTION_ID} className="flex scroll-mt-8 flex-col gap-6">
      {/* On the home page this is the form under the hero. During a tour it's the page header:
          the logo appears on top and the URL bar glides up into place (a Motion layout animation).
          It fades and rises in just after the subheadline on page load. Only the form is wrapped,
          not the results, so nothing below sits inside a moving element. */}
      <FadeRise delay={FORM_DELAY_SECONDS} className="relative flex max-w-3xl flex-col gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {inTour && (
            <motion.div key="home-link" {...fade}>
              <HomeLink onClick={goHome} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layoutId="repo-url-bar" transition={{ duration: URL_BAR_MOVE_SECONDS, ease: EASE_OUT }}>
          <RepoForm url={url} onUrlChange={setUrl} onSubmit={() => runAnalysis(url)} loading={loading} />
        </motion.div>

        {/* During a tour the example buttons only come back after an error, since the error
            message points to them. */}
        <AnimatePresence initial={false}>
          {(!inTour || status === "error") && (
            <motion.div key="examples" {...fade}>
              <ExampleRepos onPick={runAnalysis} disabled={loading} />
            </motion.div>
          )}
        </AnimatePresence>
      </FadeRise>

      {/* One of these at a time, cross-fading: the old one fades out before the new one fades in. */}
      <AnimatePresence mode="wait" initial={false}>
        {loading && (
          <motion.div key="loading" {...fade}>
            <LoadingTour progress={progress} />
          </motion.div>
        )}

        {status === "error" && error && (
          <motion.div key="error" {...fade}>
            <ErrorMessage error={error} onRetry={() => runAnalysis(lastUrl)} />
          </motion.div>
        )}

        {status === "success" && data && (
          <motion.section key={`result-${resultNumber}`} {...fade} aria-label="Repository tour" className="flex flex-col gap-4">
            <RepoSummary metadata={data.metadata} tree={data.tree} />
            <AnalysisSummary summary={data.analysis.summary} />
            <ModuleMap key={`map-${resultNumber}`} analysis={data.analysis} metadata={data.metadata} />
            <StartHere steps={data.analysis.startHere} metadata={data.metadata} />
            <FileTree key={`tree-${resultNumber}`} entries={data.tree} />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
