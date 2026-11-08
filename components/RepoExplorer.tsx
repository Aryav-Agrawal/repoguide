"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { AnalyzeResponse, ApiErrorBody } from "@/lib/types";
import RepoForm from "./RepoForm";
import ErrorMessage from "./ErrorMessage";
import RepoSummary from "./RepoSummary";
import AnalysisSummary from "./AnalysisSummary";
import StartHere from "./StartHere";
import TruncatedNotice from "./TruncatedNotice";
import FileTree from "./FileTree";

// The map pulls in React Flow and dagre, which are fairly big. Loading it this way means
// the browser only downloads that code once there's a result to show.
const ModuleMap = dynamic(() => import("./ModuleMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[31rem] animate-pulse rounded-xl border border-line bg-surface sm:h-[37rem]" />
  ),
});

type Status = "idle" | "loading" | "success" | "error";

export default function RepoExplorer() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<ApiErrorBody["error"] | null>(null);
  // Goes up by one for every new result. Used as a key so the map and file tree start fresh,
  // even when the same repo is analyzed twice.
  const [resultNumber, setResultNumber] = useState(0);

  async function handleSubmit() {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError((body as ApiErrorBody).error);
        setStatus("error");
        return;
      }

      setData(body as AnalyzeResponse);
      setResultNumber((count) => count + 1);
      setStatus("success");
    } catch {
      setError({
        code: "github_error",
        message: "We couldn't reach the server. Check your connection and try again.",
      });
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-3xl">
        <RepoForm
          url={url}
          onUrlChange={setUrl}
          onSubmit={handleSubmit}
          loading={status === "loading"}
        />
      </div>

      {status === "loading" && (
        <p className="text-sm text-muted" aria-live="polite">
          Reading the code and writing your tour. This can take up to 30 seconds.
        </p>
      )}

      {status === "error" && error && <ErrorMessage error={error} />}

      {status === "success" && data && (
        <section aria-label="Repository tour" className="flex flex-col gap-4">
          <RepoSummary metadata={data.metadata} tree={data.tree} />
          <AnalysisSummary summary={data.analysis.summary} />
          <ModuleMap key={`map-${resultNumber}`} analysis={data.analysis} metadata={data.metadata} />
          <StartHere steps={data.analysis.startHere} metadata={data.metadata} />
          {data.truncated && <TruncatedNotice />}
          <FileTree key={`tree-${resultNumber}`} entries={data.tree} />
        </section>
      )}
    </div>
  );
}
