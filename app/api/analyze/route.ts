import { analyzeRepo, cleanAnalysis } from "@/lib/analyze";
import { errorResponse, toApiError } from "@/lib/api-errors";
import { getRepoMetadata, getRepoTree, parseRepoUrl } from "@/lib/github";
import { VISITOR_LIMIT, checkVisitor, getVisitorIp, recordVisitor } from "@/lib/rate-limit";
import { BUDGET_CHARS, fetchSelectedFiles, selectFiles } from "@/lib/select-files";
import type { AnalyzeEvent, AnalyzeResponse, FileSelection } from "@/lib/types";

// The AI step can take 10 to 30 seconds, so give the whole route up to a minute.
export const maxDuration = 60;

// How it works: quick checks first, answered with a normal JSON error and status code.
// After that we stream newline-delimited JSON: a "progress" line as each step starts and
// finishes, then one final "result" or "error" line. The browser shows the steps as a checklist.
export async function POST(request: Request) {
  let url: unknown;
  try {
    const body = await request.json();
    url = body?.url;
  } catch {
    url = undefined;
  }

  if (typeof url !== "string" || url.trim() === "") {
    return errorResponse("invalid_url", "There was no link to analyze.");
  }

  let repoRef: { owner: string; repo: string };
  try {
    repoRef = parseRepoUrl(url);
  } catch (error) {
    const { code, message } = toApiError(error);
    return errorResponse(code, message);
  }

  const ip = getVisitorIp(request);
  const limit = checkVisitor(ip);
  if (!limit.allowed) {
    const unit = limit.retryAfterMinutes === 1 ? "minute" : "minutes";
    return errorResponse(
      "visitor_limit",
      `You've run ${VISITOR_LIMIT} tours in the last hour. You can start another in about ${limit.retryAfterMinutes} ${unit}.`,
      { "Retry-After": String(limit.retryAfterMinutes * 60) },
    );
  }

  const { owner, repo } = repoRef;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // If the visitor closes the tab, the stream is closed and enqueue throws. That's fine: ignore it.
      function send(event: AnalyzeEvent) {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // nobody is listening anymore
        }
      }

      try {
        // Step 1: find the repo and list its files (this is where too-large repos are rejected).
        send({ type: "progress", step: "fetching", status: "active" });
        const metadata = await getRepoMetadata(owner, repo);
        const tree = await getRepoTree(owner, repo, metadata.defaultBranch);
        const fileCount = tree.filter((entry) => entry.type === "blob").length;
        send({
          type: "progress",
          step: "fetching",
          status: "done",
          detail: `${fileCount.toLocaleString("en-US")} files on ${metadata.defaultBranch}`,
        });

        // Step 2: pick the most useful files and download them.
        send({ type: "progress", step: "choosing", status: "active" });
        const chosen = selectFiles(tree, metadata.name);
        const files = await fetchSelectedFiles(owner, repo, metadata.defaultBranch, chosen);
        send({
          type: "progress",
          step: "choosing",
          status: "done",
          detail: `Picked ${files.length} ${files.length === 1 ? "file" : "files"}`,
        });

        // Step 3: ask the AI. Only now does this count toward the visitor's hourly limit,
        // so a typo or a too-large repo doesn't use one up.
        recordVisitor(ip);
        send({ type: "progress", step: "analyzing", status: "active" });
        const rawAnalysis = await analyzeRepo({ metadata, tree, files });
        send({ type: "progress", step: "analyzing", status: "done" });

        // Step 4: check every module, path and link against the real repo.
        send({ type: "progress", step: "mapping", status: "active" });
        const { analysis, dropped } = cleanAnalysis(rawAnalysis, tree);
        const links = analysis.relationships.length;
        send({
          type: "progress",
          step: "mapping",
          status: "done",
          detail: `${analysis.modules.length} modules, ${links} ${links === 1 ? "link" : "links"}`,
        });

        // File contents stay on the server. The browser only gets the list of chosen files.
        const selection: FileSelection = {
          files: files.map((file) => ({
            path: file.path,
            score: file.score,
            chars: file.chars,
            trimmed: file.trimmed,
            alwaysIncluded: file.alwaysIncluded,
          })),
          totalChars: files.reduce((total, file) => total + file.chars, 0),
          budgetChars: BUDGET_CHARS,
        };

        const data: AnalyzeResponse = { metadata, tree, selection, analysis, dropped };
        send({ type: "result", data });
      } catch (error) {
        send({ type: "error", error: toApiError(error) });
      } finally {
        try {
          controller.close();
        } catch {
          // already closed because the visitor left
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
