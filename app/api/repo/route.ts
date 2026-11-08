import { GitHubError, getRepoMetadata, getRepoTree, parseRepoUrl } from "@/lib/github";
import { BUDGET_CHARS, fetchSelectedFiles, selectFiles } from "@/lib/select-files";
import type { ApiErrorBody, ApiErrorCode, FileSelection, RepoResponse } from "@/lib/types";

// Which HTTP status to send for each kind of error.
const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  invalid_url: 400,
  not_found: 404,
  too_large: 413,
  empty_repo: 422,
  rate_limited: 429,
  github_error: 502,
  // This route doesn't call the AI, but the type lists every error code.
  ai_busy: 429,
  ai_error: 502,
};

function errorResponse(code: ApiErrorCode, message: string) {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status: STATUS_BY_CODE[code] });
}

export async function POST(request: Request) {
  let url: unknown;
  try {
    const body = await request.json();
    url = body?.url;
  } catch {
    url = undefined;
  }

  if (typeof url !== "string" || url.trim() === "") {
    return errorResponse("invalid_url", "Paste a link like https://github.com/owner/repo.");
  }

  try {
    const { owner, repo } = parseRepoUrl(url);
    const metadata = await getRepoMetadata(owner, repo);
    const { tree, truncated } = await getRepoTree(owner, repo, metadata.defaultBranch);

    const chosen = selectFiles(tree, metadata.name);
    const files = await fetchSelectedFiles(owner, repo, metadata.defaultBranch, chosen);

    // File contents stay on the server (they're for the AI step). The browser
    // only gets the list, for the temporary debug panel.
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

    const result: RepoResponse = { metadata, tree, truncated, selection };
    return Response.json(result);
  } catch (error) {
    if (error instanceof GitHubError) {
      return errorResponse(error.code, error.message);
    }
    // Unknown error: log only the message, never request headers or the token.
    console.error("Unexpected error in /api/repo:", error instanceof Error ? error.message : error);
    return errorResponse("github_error", "Something went wrong. Try again in a moment.");
  }
}
