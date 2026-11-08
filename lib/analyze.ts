// All AI logic lives here. Server code only: it reads GEMINI_API_KEY.
// To switch AI providers, rewrite this file and keep analyzeRepo()'s inputs and outputs the same.

import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { FetchedFile } from "./select-files";
import type {
  ApiErrorCode,
  DroppedCounts,
  RepoAnalysis,
  RepoMetadata,
  TreeEntry,
} from "./types";

// A current Flash model: stable, fast, and available on the free tier.
export const GEMINI_MODEL = "gemini-3.6-flash";

// Most characters of file paths we send. Normal repos fit easily. This only kicks in for
// giant repos, so they can't blow past the free tier's token limit.
const MAX_PATH_LIST_CHARS = 150_000;

// A typed error so the API route can turn it into the right HTTP response.
export class AnalyzeError extends Error {
  code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "AnalyzeError";
    this.code = code;
  }
}

// ---------- The shape we want back ----------
// This one schema does two jobs: we turn it into a JSON Schema so Gemini knows the exact
// shape to produce, and we use it to check the answer when it comes back.
// The type annotation makes TypeScript complain if it ever drifts from RepoAnalysis in types.ts.

const analysisSchema: z.ZodType<RepoAnalysis> = z.object({
  summary: z.object({
    whatItDoes: z.string().describe("Two or three sentences on what the project does."),
    audience: z.string().describe("Who the project is for, in one sentence."),
    technologies: z
      .array(z.string())
      .describe("Main languages, frameworks and libraries, e.g. TypeScript, React, PostgreSQL."),
  }),
  modules: z
    .array(
      z.object({
        id: z.string().describe("Short unique kebab-case id, e.g. github-client."),
        name: z.string().describe("Human-friendly name, e.g. GitHub client."),
        description: z
          .string()
          .describe("Plain-English explanation of what this part does, for a newcomer."),
        folders: z
          .array(z.string())
          .describe("Folder paths that belong to this module, copied exactly from the file list."),
        keyFiles: z
          .array(z.string())
          .describe("The most important file paths in this module, copied exactly from the file list."),
      }),
    )
    .min(4)
    .max(10)
    .describe("The 4 to 10 main parts of the codebase."),
  relationships: z
    .array(
      z.object({
        from: z.string().describe("Module id that does the action."),
        to: z.string().describe("Module id it acts on."),
        label: z.string().describe('Short verb phrase, e.g. "calls", "reads from", "renders".'),
      }),
    )
    .describe("How the modules depend on each other."),
  startHere: z
    .array(
      z.object({
        path: z.string().describe("A file path copied exactly from the file list."),
        reason: z.string().describe("One sentence on why to read this file at this point."),
      }),
    )
    .min(5)
    .max(8)
    .describe("5 to 8 files in the order a newcomer should read them."),
});

// The JSON Schema version for Gemini. "$schema" is just a label saying which JSON Schema
// version this is; Gemini doesn't need it, so we leave it out.
function buildResponseSchema() {
  const schema = z.toJSONSchema(analysisSchema);
  delete schema.$schema;
  return schema;
}

// ---------- The prompt ----------

const SYSTEM_INSTRUCTION = `You are RepoGuide. You explain a GitHub repository to a developer who has never seen it before.
Write in plain, friendly English. Avoid jargon where a simple word works.
Only use file and folder paths that appear in the provided file list, copied exactly. Never invent paths.
Base your answer on the file contents you are given. If something is unclear, describe it carefully instead of guessing.`;

function buildPathList(tree: TreeEntry[]): string {
  const filePaths = tree.filter((entry) => entry.type === "blob").map((entry) => entry.path);

  const lines: string[] = [];
  let usedChars = 0;
  for (const path of filePaths) {
    if (usedChars + path.length + 1 > MAX_PATH_LIST_CHARS) {
      lines.push(`...and ${filePaths.length - lines.length} more files`);
      break;
    }
    lines.push(path);
    usedChars += path.length + 1;
  }
  return lines.join("\n");
}

function buildPrompt(metadata: RepoMetadata, tree: TreeEntry[], files: FetchedFile[]): string {
  const repoInfo = {
    name: metadata.fullName,
    description: metadata.description,
    mainLanguage: metadata.language,
    stars: metadata.stars,
    defaultBranch: metadata.defaultBranch,
  };

  const fileContents = files
    .map((file) => {
      const note = file.trimmed ? " (trimmed: only the start of the file)" : "";
      return `=== ${file.path}${note} ===\n${file.content}`;
    })
    .join("\n\n");

  return [
    "## Repository",
    JSON.stringify(repoInfo, null, 2),
    "## Every file in the repository",
    buildPathList(tree),
    "## Contents of the most important files",
    fileContents,
    "## Task",
    "Explain this repository: a summary, its main modules, how they relate, and which files to read first.",
  ].join("\n\n");
}

// ---------- Don't trust the AI blindly ----------

// "./src/lib/" -> "src/lib", so small formatting differences don't count as wrong paths.
function normalizePath(path: string): string {
  return path.trim().replace(/^\.?\/+/, "").replace(/\/+$/, "");
}

// Keeps only paths that really exist, without duplicates. Counts what it removed.
function keepRealPaths(paths: string[], real: Set<string>, dropped: DroppedCounts): string[] {
  const kept = new Set<string>();
  for (const path of paths) {
    const normalized = normalizePath(path);
    if (real.has(normalized)) {
      kept.add(normalized);
    } else {
      dropped.paths += 1;
    }
  }
  return [...kept];
}

function cleanAnalysis(
  raw: RepoAnalysis,
  tree: TreeEntry[],
): { analysis: RepoAnalysis; dropped: DroppedCounts } {
  const realFiles = new Set(tree.filter((e) => e.type === "blob").map((e) => e.path));
  const realFolders = new Set(tree.filter((e) => e.type === "tree").map((e) => e.path));
  const dropped: DroppedCounts = { paths: 0, relationships: 0 };

  // Modules: fix their paths, and keep only the first module for each id.
  const modules: RepoAnalysis["modules"] = [];
  const moduleIds = new Set<string>();
  for (const item of raw.modules) {
    if (moduleIds.has(item.id)) {
      continue;
    }
    moduleIds.add(item.id);
    modules.push({
      ...item,
      folders: keepRealPaths(item.folders, realFolders, dropped),
      keyFiles: keepRealPaths(item.keyFiles, realFiles, dropped),
    });
  }

  // Relationships: both ends must be real modules. Skip self-links and repeats.
  const relationships: RepoAnalysis["relationships"] = [];
  const seenLinks = new Set<string>();
  for (const link of raw.relationships) {
    const key = `${link.from}->${link.to}`;
    const valid = moduleIds.has(link.from) && moduleIds.has(link.to) && link.from !== link.to;
    if (!valid || seenLinks.has(key)) {
      dropped.relationships += 1;
      continue;
    }
    seenLinks.add(key);
    relationships.push(link);
  }

  // Start here: real files only, each one once, in the AI's order.
  const startHere: RepoAnalysis["startHere"] = [];
  const seenFiles = new Set<string>();
  for (const item of raw.startHere) {
    const path = normalizePath(item.path);
    if (!realFiles.has(path) || seenFiles.has(path)) {
      dropped.paths += 1;
      continue;
    }
    seenFiles.add(path);
    startHere.push({ path, reason: item.reason });
  }

  return {
    analysis: { summary: raw.summary, modules, relationships, startHere },
    dropped,
  };
}

// ---------- The one public function ----------

type AnalyzeInput = {
  metadata: RepoMetadata;
  tree: TreeEntry[];
  files: FetchedFile[];
};

export async function analyzeRepo({
  metadata,
  tree,
  files,
}: AnalyzeInput): Promise<{ analysis: RepoAnalysis; dropped: DroppedCounts }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    throw new AnalyzeError("ai_error", "RepoGuide isn't set up to analyze repos right now.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let text: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(metadata, tree, files),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Structured output: Gemini must reply with JSON that matches our schema.
        responseMimeType: "application/json",
        responseJsonSchema: buildResponseSchema(),
      },
    });
    text = response.text;
  } catch (error) {
    // 429 means we've used up Gemini's free-tier quota for the moment.
    if (error instanceof ApiError && error.status === 429) {
      throw new AnalyzeError("ai_busy", "RepoGuide is busy, try again in a minute.");
    }
    // Log only the message. Never the request, which carries the API key.
    console.error("Gemini request failed:", error instanceof Error ? error.message : error);
    throw new AnalyzeError("ai_error", "The AI couldn't analyze this repo. Try again in a moment.");
  }

  if (!text) {
    throw new AnalyzeError("ai_error", "The AI sent back an empty answer. Try again.");
  }

  // Structured output makes bad JSON rare, but we still check, both the JSON itself and its shape.
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new AnalyzeError("ai_error", "The AI's answer came back in an unexpected shape. Try again.");
  }

  const parsed = analysisSchema.safeParse(json);
  if (!parsed.success) {
    console.error("Gemini answer failed validation:", parsed.error.message);
    throw new AnalyzeError("ai_error", "The AI's answer came back in an unexpected shape. Try again.");
  }

  return cleanAnalysis(parsed.data, tree);
}
