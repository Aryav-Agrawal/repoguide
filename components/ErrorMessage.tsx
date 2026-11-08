import type { ApiErrorBody, ApiErrorCode } from "@/lib/types";

// What the user can do about it:
// "retry"    -> the problem is probably temporary, so show a Try again button
// "examples" -> this link won't work, so point to the example buttons
// "none"     -> waiting is the only option
type NextAction = "retry" | "examples" | "none";

// The server's message says what happened. This table adds a title and what to do next.
const GUIDE: Record<ApiErrorCode, { title: string; nextStep: string; action: NextAction }> = {
  invalid_url: {
    title: "That doesn't look like a GitHub repo link",
    nextStep: "Copy the address from the repo's main page on GitHub. It looks like https://github.com/owner/repo.",
    action: "examples",
  },
  not_found: {
    title: "Repository not found",
    nextStep: "Check the owner and repo name for typos. RepoGuide can only read public repos.",
    action: "examples",
  },
  too_large: {
    title: "This repository is too large",
    nextStep: "Try a smaller repo. For a big project, a single library or package from it often works.",
    action: "examples",
  },
  empty_repo: {
    title: "Nothing to show yet",
    nextStep: "Come back once some code has been pushed, or pick another repo.",
    action: "examples",
  },
  rate_limited: {
    title: "GitHub needs a short break",
    nextStep: "Wait until the limit resets, then try again.",
    action: "retry",
  },
  github_error: {
    title: "Something went wrong",
    nextStep: "This is usually temporary. Wait a moment and try again.",
    action: "retry",
  },
  ai_busy: {
    title: "RepoGuide is busy",
    nextStep: "Wait a minute, then try again.",
    action: "retry",
  },
  ai_error: {
    title: "The AI step didn't work",
    nextStep: "Try again. It often works on a second attempt.",
    action: "retry",
  },
  visitor_limit: {
    title: "You've reached this hour's limit",
    nextStep: "RepoGuide runs on a free AI quota, so each visitor gets 5 tours an hour.",
    action: "none",
  },
};

type ErrorMessageProps = {
  error: ApiErrorBody["error"];
  onRetry: () => void;
};

export default function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const guide = GUIDE[error.code] ?? GUIDE.github_error;

  return (
    <div role="alert" className="max-w-3xl rounded-lg border border-danger/30 bg-danger-soft px-4 py-3">
      <p className="font-medium text-danger">{guide.title}</p>
      <p className="mt-1 text-sm text-ink">{error.message}</p>
      <p className="mt-2 text-sm text-ink">
        <span className="font-medium">What to do: </span>
        {guide.nextStep}
        {guide.action === "examples" && " Or try one of the examples above."}
      </p>
      {guide.action === "retry" && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 h-9 rounded-lg border border-danger/30 bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Try again
        </button>
      )}
    </div>
  );
}
