// The words for the home page's "How it works" section. Both versions of the
// section (the pinned scroll story and the simple stacked list) read from here,
// so the copy only lives in one place.

export const HOW_IT_WORKS_TITLE = "How it works";
export const HOW_IT_WORKS_INTRO = "Three steps from a repo link to a map you can explore.";

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Paste a link",
    text: "Drop in any public GitHub repo URL. No sign-up, nothing to install.",
  },
  {
    title: "AI reads the code",
    text: "RepoGuide picks the files that matter most and has AI read them, so it can explain what each part does.",
  },
  {
    title: "Explore the map",
    text: "Click through the main modules, see how they connect, and follow the start-here reading order.",
  },
] as const;
