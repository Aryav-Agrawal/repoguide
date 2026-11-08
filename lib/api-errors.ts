// Turns errors into the JSON shape every API route sends. Server code only.

import { AnalyzeError } from "./analyze";
import { GitHubError } from "./github";
import type { ApiErrorBody, ApiErrorCode } from "./types";

// Which HTTP status to send for each kind of error.
const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  invalid_url: 400,
  not_found: 404,
  too_large: 413,
  empty_repo: 422,
  rate_limited: 429,
  github_error: 502,
  ai_busy: 429,
  ai_error: 502,
  visitor_limit: 429,
};

export function errorResponse(code: ApiErrorCode, message: string, headers?: HeadersInit) {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status: STATUS_BY_CODE[code], headers });
}

// Our own errors already carry a code and a friendly message. Anything else is a bug,
// so we log it (only the message, never request headers or keys) and send a general error.
export function toApiError(error: unknown): ApiErrorBody["error"] {
  if (error instanceof GitHubError || error instanceof AnalyzeError) {
    return { code: error.code, message: error.message };
  }
  console.error("Unexpected API error:", error instanceof Error ? error.message : error);
  return { code: "github_error", message: "Something unexpected went wrong on our side." };
}
