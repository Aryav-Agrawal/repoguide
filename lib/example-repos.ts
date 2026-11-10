// Popular public repos shown in the scrolling strip on the home page.
// Every one was checked to be well under the 20,000-file limit (MAX_TREE_FILES in lib/github.ts),
// so clicking any of them starts a tour instead of a "repo too large" error.
// Star counts aren't written here: they're fetched from GitHub (getExampleRepoStars in lib/github.ts).

export type ExampleRepo = {
  fullName: string;
  language: string;
};

export const EXAMPLE_REPOS: readonly ExampleRepo[] = [
  { fullName: "expressjs/express", language: "JavaScript" },
  { fullName: "fastapi/fastapi", language: "Python" },
  { fullName: "spf13/cobra", language: "Go" },
  { fullName: "BurntSushi/ripgrep", language: "Rust" },
  { fullName: "pmndrs/zustand", language: "TypeScript" },
  { fullName: "redis/redis", language: "C" },
  { fullName: "sinatra/sinatra", language: "Ruby" },
  { fullName: "pallets/flask", language: "Python" },
  { fullName: "axios/axios", language: "JavaScript" },
  { fullName: "junegunn/fzf", language: "Go" },
  { fullName: "sharkdp/bat", language: "Rust" },
  { fullName: "vercel/swr", language: "TypeScript" },
];

/** How many different languages the list above covers. Worked out from the list, so it stays true. */
export const EXAMPLE_LANGUAGE_COUNT = new Set(EXAMPLE_REPOS.map((repo) => repo.language)).size;
