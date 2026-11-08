// All GitHub API logic lives here. Server code only: it reads GITHUB_TOKEN.

import type { ApiErrorCode, RepoMetadata, TreeEntry } from "./types";

const GITHUB_API = "https://api.github.com";

// A typed error so the API route can turn it into the right HTTP response.
export class GitHubError extends Error {
  code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "GitHubError";
    this.code = code;
  }
}

// Matches https://github.com/owner/repo with an optional "www.", ".git" and trailing slash.
const REPO_URL_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/i;

export function parseRepoUrl(input: string): { owner: string; repo: string } {
  const match = input.trim().match(REPO_URL_PATTERN);

  if (!match) {
    throw new GitHubError(
      "invalid_url",
      "Paste a link like https://github.com/owner/repo.",
    );
  }

  return { owner: match[1], repo: match[2] };
}

// One place that talks to GitHub, so headers and error handling stay consistent.
// `accept` lets a caller ask for a different format, e.g. a file's raw text.
async function githubFetch(
  path: string,
  accept = "application/vnd.github+json",
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "RepoGuide",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${GITHUB_API}${path}`, { headers, cache: "no-store" });
  } catch {
    throw new GitHubError("github_error", "Couldn't reach GitHub. Try again in a moment.");
  }

  if (response.ok) {
    return response;
  }

  if (isRateLimited(response)) {
    throw new GitHubError("rate_limited", rateLimitMessage(response));
  }

  if (response.status === 404) {
    throw new GitHubError(
      "not_found",
      "We couldn't find that repository. Check the spelling, or it may be private.",
    );
  }

  // GitHub returns 409 when you ask for the tree of a repo with no commits.
  if (response.status === 409) {
    throw new GitHubError("empty_repo", "This repository is empty, so there are no files to show.");
  }

  throw new GitHubError(
    "github_error",
    `GitHub returned an unexpected error (status ${response.status}). Try again in a moment.`,
  );
}

function isRateLimited(response: Response): boolean {
  if (response.status !== 403 && response.status !== 429) {
    return false;
  }
  return (
    response.headers.get("x-ratelimit-remaining") === "0" ||
    response.headers.has("retry-after")
  );
}

function rateLimitMessage(response: Response): string {
  const reset = response.headers.get("x-ratelimit-reset"); // seconds since epoch
  const retryAfter = response.headers.get("retry-after"); // seconds from now

  let minutes: number | null = null;
  if (reset) {
    minutes = Math.ceil((Number(reset) * 1000 - Date.now()) / 60000);
  } else if (retryAfter) {
    minutes = Math.ceil(Number(retryAfter) / 60);
  }

  if (minutes !== null && Number.isFinite(minutes) && minutes > 0) {
    const unit = minutes === 1 ? "minute" : "minutes";
    return `We've hit GitHub's rate limit. Try again in about ${minutes} ${unit}.`;
  }
  return "We've hit GitHub's rate limit. Try again in a few minutes.";
}

// Only the fields we use from GitHub's "get a repository" response.
type GitHubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  language: string | null;
  html_url: string;
  owner: { login: string };
};

export async function getRepoMetadata(owner: string, repo: string): Promise<RepoMetadata> {
  const response = await githubFetch(`/repos/${owner}/${repo}`);
  const data = (await response.json()) as GitHubRepo;

  return {
    owner: data.owner.login,
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    defaultBranch: data.default_branch,
    stars: data.stargazers_count,
    language: data.language,
    htmlUrl: data.html_url,
  };
}

type GitHubTree = {
  truncated: boolean;
  tree: { path: string; type: string; size?: number }[];
};

export async function getRepoTree(
  owner: string,
  repo: string,
  branch: string,
): Promise<{ tree: TreeEntry[]; truncated: boolean }> {
  const response = await githubFetch(
    `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );
  const data = (await response.json()) as GitHubTree;

  // Keep files ("blob") and folders ("tree"). Skip submodules ("commit").
  const tree: TreeEntry[] = [];
  for (const entry of data.tree) {
    if (entry.type === "blob" || entry.type === "tree") {
      tree.push({ path: entry.path, type: entry.type, size: entry.size });
    }
  }

  return { tree, truncated: data.truncated };
}

// Reads one file's text. The "raw" media type makes GitHub send the plain file
// instead of JSON with base64-encoded content.
export async function getFileText(
  owner: string,
  repo: string,
  ref: string,
  path: string,
): Promise<string> {
  // Encode each folder name separately so the slashes between them stay as slashes.
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const response = await githubFetch(
    `/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`,
    "application/vnd.github.raw+json",
  );
  return response.text();
}
