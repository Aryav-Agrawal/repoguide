// Shared types used by both the server (API route) and the client (UI).
// This file must not import anything server-only.

export type RepoMetadata = {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  stars: number;
  language: string | null;
  htmlUrl: string;
};

export type TreeEntry = {
  path: string;
  type: "blob" | "tree"; // blob = file, tree = folder
  size?: number;
};

// What the browser sees about each file chosen for the AI. The contents stay on the server.
export type SelectedFileInfo = {
  path: string;
  score: number;
  chars: number; // length after trimming
  trimmed: boolean; // true if we cut the file short
  alwaysIncluded: boolean; // README, manifests and stack config skip scoring
};

export type RepoResponse = {
  metadata: RepoMetadata;
  tree: TreeEntry[];
  truncated: boolean;
  selection: FileSelection;
};

export type FileSelection = {
  files: SelectedFileInfo[];
  totalChars: number;
  budgetChars: number;
};

// ---------- AI analysis (filled in by lib/analyze.ts) ----------

export type RepoAnalysis = {
  summary: {
    whatItDoes: string;
    audience: string;
    technologies: string[];
  };
  modules: AnalysisModule[];
  relationships: ModuleRelationship[];
  startHere: StartHereFile[];
};

export type AnalysisModule = {
  id: string; // short kebab-case id, used by relationships
  name: string;
  description: string;
  folders: string[];
  keyFiles: string[];
};

export type ModuleRelationship = {
  from: string; // module id
  to: string; // module id
  label: string; // e.g. "calls", "reads from"
};

export type StartHereFile = {
  path: string;
  reason: string;
};

// How many things we removed from the AI's answer because they didn't exist.
export type DroppedCounts = {
  paths: number;
  relationships: number;
};

export type AnalyzeResponse = RepoResponse & {
  analysis: RepoAnalysis;
  dropped: DroppedCounts;
};

// ---------- Errors ----------

export type ApiErrorCode =
  | "invalid_url"
  | "not_found"
  | "rate_limited"
  | "too_large"
  | "empty_repo"
  | "github_error"
  | "ai_busy"
  | "ai_error";

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
