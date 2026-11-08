import type { ApiErrorBody, ApiErrorCode } from "@/lib/types";

const TITLES: Record<ApiErrorCode, string> = {
  invalid_url: "That doesn't look like a GitHub repo link",
  not_found: "Repository not found",
  rate_limited: "GitHub needs a short break",
  too_large: "This repository is too large",
  empty_repo: "Nothing to show yet",
  github_error: "Something went wrong",
  ai_busy: "RepoGuide is busy",
  ai_error: "The AI step didn't work",
};

export default function ErrorMessage({ error }: { error: ApiErrorBody["error"] }) {
  return (
    <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3">
      <p className="font-medium text-danger">{TITLES[error.code] ?? TITLES.github_error}</p>
      <p className="mt-1 text-sm text-ink">{error.message}</p>
    </div>
  );
}
