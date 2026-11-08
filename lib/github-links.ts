// Builds links to files on github.com. Safe for the browser: no token, no API calls.

import type { RepoMetadata } from "./types";

// "src/my file.ts" -> "https://github.com/owner/repo/blob/main/src/my%20file.ts"
export function githubFileUrl(metadata: RepoMetadata, path: string): string {
  // Encode each part on its own so the "/" between folders stays a real slash.
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${metadata.htmlUrl}/blob/${encodeURIComponent(metadata.defaultBranch)}/${encodedPath}`;
}
