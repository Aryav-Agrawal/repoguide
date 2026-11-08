"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { readNdjson } from "@/lib/ndjson";
import type { AnalyzeEvent, AnalyzeResponse, ApiErrorBody } from "@/lib/types";
import RepoForm from "./RepoForm";
import ExampleRepos from "./ExampleRepos";
import ProgressChecklist, { initialProgress, type ProgressState } from "./ProgressChecklist";
import ErrorMessage from "./ErrorMessage";
import RepoSummary from "./RepoSummary";
import AnalysisSummary from "./AnalysisSummary";
import StartHere from "./StartHere";
import FileTree from "./FileTree";

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

  function fail(apiError: ApiError) {
    setError(apiError);
    setStatus("error");
  }

  async function runAnalysis(target: string) {
    setUrl(target);
    setLastUrl(target);
    setStatus("loading");
    setError(null);
    setProgress(initialProgress());
    // Start downloading the map's code now, while the server works, so it's ready when the result lands.
    void loadModuleMap();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });

      // Problems caught before the work starts (bad link, hourly limit) come back as plain JSON.
      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
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
      fail({ code: "ai_error", message: "The analysis stopped before it finished, probably because it took too long." });
    } catch {
      fail({
        code: "github_error",
        message: "We lost the connection to RepoGuide's server. Your internet connection may have dropped.",
      });
    }
  }

  const loading = status === "loading";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-3xl flex-col gap-4">
        <RepoForm url={url} onUrlChange={setUrl} onSubmit={() => runAnalysis(url)} loading={loading} />
        <ExampleRepos onPick={runAnalysis} disabled={loading} />
      </div>

      {loading && <ProgressChecklist progress={progress} />}

      {status === "error" && error && <ErrorMessage error={error} onRetry={() => runAnalysis(lastUrl)} />}

      {status === "success" && data && (
        <section aria-label="Repository tour" className="flex flex-col gap-4">
          <RepoSummary metadata={data.metadata} tree={data.tree} />
          <AnalysisSummary summary={data.analysis.summary} />
          <ModuleMap key={`map-${resultNumber}`} analysis={data.analysis} metadata={data.metadata} />
          <StartHere steps={data.analysis.startHere} metadata={data.metadata} />
          <FileTree key={`tree-${resultNumber}`} entries={data.tree} />
        </section>
      )}
    </div>
  );
}
