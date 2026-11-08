// Picks the files that best explain a repo, then fetches their contents.
// Server code only: it calls lib/github.ts, which reads GITHUB_TOKEN.

import { GitHubError, getFileText } from "./github";
import type { SelectedFileInfo, TreeEntry } from "./types";

// ---------- Limits ----------

// Total characters we send to the AI. Big enough for a real overview, small enough to stay fast and cheap.
export const BUDGET_CHARS = 60_000;
// Long files are trimmed to their first lines. The top of a file usually has the imports and main exports.
const MAX_LINES = 300;
// Also cap each file by characters, in case its 300 lines are extremely long.
const MAX_FILE_CHARS = 12_000;
// Source files bigger than this are almost always data or generated code.
const MAX_CANDIDATE_BYTES = 200_000;
// Each file is one GitHub request, so cap the count to protect our rate limit.
const MAX_FILES = 40;
// How many GitHub requests may run at the same time.
const FETCH_CONCURRENCY = 5;

// ---------- Always included (root level only) ----------
// These describe the whole project: what it is, its dependencies and its tooling.
// We only take them from the root, so a monorepo doesn't pull in dozens of nested package.json files.

const README_PATTERN = /^readme(\.[a-z]+)?$/i;

const MANIFEST_FILES = new Set([
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "setup.py",
  "setup.cfg",
  "pipfile",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "go.mod",
  "cargo.toml",
  "gemfile",
  "composer.json",
  "mix.exs",
  "pubspec.yaml",
  "deno.json",
  "cmakelists.txt",
]);

const CONFIG_FILES = new Set([
  "tsconfig.json",
  "angular.json",
  "dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "vercel.json",
  "netlify.toml",
  "makefile",
  ".env.example",
]);

// next.config.ts, vite.config.js, tailwind.config.mjs and so on.
const CONFIG_PATTERN = /^(next|vite|nuxt|svelte|astro|webpack|tailwind)\.config\.[a-z]+$/i;

function isManifest(name: string): boolean {
  return MANIFEST_FILES.has(name.toLowerCase()) || name.toLowerCase().endsWith(".csproj");
}

function isAlwaysIncluded(path: string): boolean {
  if (path.includes("/")) {
    return false; // not at the root
  }
  return (
    README_PATTERN.test(path) ||
    isManifest(path) ||
    CONFIG_FILES.has(path.toLowerCase()) ||
    CONFIG_PATTERN.test(path)
  );
}

// ---------- Skipped ----------

// Dependencies, build output, caches and editor settings: none of it is the project's own code.
const SKIP_FOLDERS = new Set([
  "node_modules",
  "vendor",
  "dist",
  "build",
  "out",
  ".next",
  "target",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
  ".git",
  ".github",
  ".vscode",
  ".idea",
]);

// Tests explain how code is checked, not what it does, and they use up the budget fast.
const TEST_FOLDERS = new Set([
  "test",
  "tests",
  "__tests__",
  "spec",
  "e2e",
  "cypress",
  "fixtures",
  "__mocks__",
  "testdata",
]);

// Lock files are huge machine-written lists of exact versions. The manifest already names the dependencies.
const LOCK_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "cargo.lock",
  "poetry.lock",
  "gemfile.lock",
  "composer.lock",
  "go.sum",
]);

// Minified, source-map and generated files: written by tools, not people.
const GENERATED_PATTERNS = [
  /\.min\.(js|css)$/i,
  /\.map$/i,
  /\.generated\./i,
  /\.pb\.go$/i,
  /_pb2(_grpc)?\.py$/i,
  /\.d\.ts$/i,
];

// Test files that live next to the code they test.
const TEST_FILE_PATTERNS = [/\.(test|spec)\.[a-z0-9]+$/i, /_test\.(go|py)$/i, /^test_.*\.py$/i];

function shouldSkip(path: string): boolean {
  const parts = path.split("/");
  const name = parts[parts.length - 1];
  const folders = parts.slice(0, -1).map((part) => part.toLowerCase());

  if (folders.some((folder) => SKIP_FOLDERS.has(folder) || TEST_FOLDERS.has(folder))) {
    return true;
  }
  if (LOCK_FILES.has(name.toLowerCase())) {
    return true;
  }
  return [...GENERATED_PATTERNS, ...TEST_FILE_PATTERNS].some((pattern) => pattern.test(name));
}

// We only score files with a known code extension. This one list also keeps out
// images, fonts, videos and binaries, so we don't have to name every one of them.
const SOURCE_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs",
  "py", "go", "rs", "java", "kt", "rb", "php", "cs",
  "c", "cpp", "h", "swift", "scala", "dart", "ex",
  "vue", "svelte", "astro",
  "prisma", "graphql", "sql",
]);

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

// ---------- Scoring ----------

// Names that usually mark where a program starts: index.ts, main.go, app.py, server.js, lib.rs...
const ENTRY_NAMES = new Set(["main", "index", "app", "server", "cli", "__main__", "manage", "program", "lib"]);
// Special files in web frameworks (Next.js pages and API routes, middleware).
const FRAMEWORK_NAMES = new Set(["page", "layout", "route", "middleware"]);
// Folders that hold the core logic of most web apps and APIs.
const KEY_FOLDERS = new Set(["routes", "router", "api", "controllers", "models", "services"]);
// Folders that are often important, but less reliably so.
const SECONDARY_FOLDERS = new Set(["lib", "core", "handlers", "db", "store", "schema"]);
// Folders that are about the project rather than the project itself.
const LOW_VALUE_FOLDERS = new Set([
  "examples",
  "example",
  "docs",
  "doc",
  "scripts",
  "migrations",
  "stories",
  "benches",
  "benchmarks",
  "fuzz",
]);

// How many folders deep a file is. A leading "src/" doesn't count, because it's just a wrapper.
function folderDepth(path: string): number {
  const folders = path.split("/").slice(0, -1);
  if (folders[0] === "src") {
    folders.shift();
  }
  return folders.length;
}

function scoreFile(entry: TreeEntry, repoName: string): number {
  const parts = entry.path.split("/");
  const name = parts[parts.length - 1];
  const folders = parts.slice(0, -1).map((part) => part.toLowerCase());
  const dot = name.lastIndexOf(".");
  const baseName = (dot === -1 ? name : name.slice(0, dot)).toLowerCase(); // "index.ts" -> "index"

  let score = 0;

  // Entry points show how everything is wired together.
  if (ENTRY_NAMES.has(baseName)) {
    score += 30;
  } else if (FRAMEWORK_NAMES.has(baseName)) {
    score += 15;
  }

  // A file named after the repo is usually its heart: express.js in express, cobra.go in cobra.
  if (baseName === repoName.toLowerCase()) {
    score += 20;
  }

  // Files near the root tend to be the big-picture ones. Deeper files are usually details.
  const depthBonus = [20, 15, 10, 5];
  score += depthBonus[folderDepth(entry.path)] ?? 0;

  // Folder names hint at what's inside. Count only the best match, not every one.
  if (folders.some((folder) => KEY_FOLDERS.has(folder))) {
    score += 20;
  } else if (folders.some((folder) => SECONDARY_FOLDERS.has(folder))) {
    score += 10;
  }

  // A manifest inside a subfolder describes one package of a monorepo.
  if (isManifest(name)) {
    score += 15;
  }

  // Examples, docs and benchmarks are about the project, not the project itself. The penalty is
  // big enough to cancel out an entry-point name, so examples/app/index.js doesn't beat real code.
  if (folders.some((folder) => LOW_VALUE_FOLDERS.has(folder))) {
    score -= 30;
  }

  // Tiny files are usually one-line re-exports with nothing to explain.
  // (No penalty for big files: they're often the core, and we trim them anyway.)
  if (entry.size !== undefined && entry.size < 200) {
    score -= 10;
  }

  return score;
}

// ---------- Choosing within the budget ----------

export type SelectedFile = {
  path: string;
  score: number;
  alwaysIncluded: boolean;
  // Most characters this file can take after trimming. A file never has more
  // characters than bytes, so the real size is always at or below this.
  estimatedChars: number;
};

function estimateChars(entry: TreeEntry): number {
  return Math.min(entry.size ?? MAX_FILE_CHARS, MAX_FILE_CHARS);
}

export function selectFiles(tree: TreeEntry[], repoName: string): SelectedFile[] {
  const always: SelectedFile[] = [];
  const scored: SelectedFile[] = [];

  for (const entry of tree) {
    if (entry.type !== "blob") {
      continue;
    }

    if (isAlwaysIncluded(entry.path)) {
      always.push({ path: entry.path, score: 0, alwaysIncluded: true, estimatedChars: estimateChars(entry) });
      continue;
    }

    if (shouldSkip(entry.path) || (entry.size ?? 0) > MAX_CANDIDATE_BYTES) {
      continue;
    }

    const name = entry.path.split("/").pop() ?? "";
    if (!SOURCE_EXTENSIONS.has(getExtension(name)) && !isManifest(name)) {
      continue;
    }

    const score = scoreFile(entry, repoName);
    if (score > 0) {
      scored.push({ path: entry.path, score, alwaysIncluded: false, estimatedChars: estimateChars(entry) });
    }
  }

  // README first, then the rest A to Z.
  always.sort((a, b) => {
    const aReadme = README_PATTERN.test(a.path) ? 0 : 1;
    const bReadme = README_PATTERN.test(b.path) ? 0 : 1;
    return aReadme - bReadme || a.path.localeCompare(b.path);
  });

  // Highest score first. Ties go to the shallower file, then A to Z.
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      folderDepth(a.path) - folderDepth(b.path) ||
      a.path.localeCompare(b.path),
  );

  // Fill the budget in order. If a file doesn't fit, skip it and try the next (maybe smaller) one.
  const selected: SelectedFile[] = [];
  let usedChars = 0;
  for (const file of [...always, ...scored]) {
    if (selected.length >= MAX_FILES) {
      break;
    }
    if (usedChars + file.estimatedChars > BUDGET_CHARS) {
      continue;
    }
    selected.push(file);
    usedChars += file.estimatedChars;
  }

  return selected;
}

// ---------- Fetching ----------

export type FetchedFile = SelectedFileInfo & { content: string };

// Keeps the first MAX_LINES lines, then the first MAX_FILE_CHARS characters.
function trimContent(text: string): { content: string; trimmed: boolean } {
  let content = text;
  let trimmed = false;

  const lines = content.split("\n");
  if (lines.length > MAX_LINES) {
    content = lines.slice(0, MAX_LINES).join("\n");
    trimmed = true;
  }
  if (content.length > MAX_FILE_CHARS) {
    content = content.slice(0, MAX_FILE_CHARS);
    trimmed = true;
  }

  return { content, trimmed };
}

// Runs fn on every item, with at most `limit` calls running at once.
// It starts `limit` workers; each one keeps taking the next unclaimed item until none are left.
async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await fn(items[index]);
    }
  }

  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

export async function fetchSelectedFiles(
  owner: string,
  repo: string,
  ref: string,
  files: SelectedFile[],
): Promise<FetchedFile[]> {
  const results = await mapWithLimit(files, FETCH_CONCURRENCY, async (file) => {
    try {
      const text = await getFileText(owner, repo, ref, file.path);

      // A null character means it's a binary file after all, so leave it out.
      if (text.includes("\0")) {
        return null;
      }

      const { content, trimmed } = trimContent(text);
      const fetched: FetchedFile = {
        path: file.path,
        score: file.score,
        alwaysIncluded: file.alwaysIncluded,
        chars: content.length,
        trimmed,
        content,
      };
      return fetched;
    } catch (error) {
      // Hitting the rate limit affects every file, so stop and report it.
      if (error instanceof GitHubError && error.code === "rate_limited") {
        throw error;
      }
      // Any other problem only affects this one file, so skip it.
      return null;
    }
  });

  return results.filter((file): file is FetchedFile => file !== null);
}
