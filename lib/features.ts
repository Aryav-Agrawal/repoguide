// The words for the home page's "What you get" cards (components/Features.tsx).
// Each card describes one part of a real tour, in the order the tour shows them.

export const FEATURES_TITLE = "What you get";
export const FEATURES_INTRO = "Every tour has the same four parts, so you always know where to look.";

export type FeatureId = "summary" | "map" | "explanations" | "start-here";

export const FEATURES: readonly { id: FeatureId; title: string; text: string }[] = [
  {
    id: "summary",
    title: "Summary",
    text: "A few sentences on what the project does, who it's for, and what it's built with.",
  },
  {
    id: "map",
    title: "Interactive map",
    text: "The main modules as boxes, with lines showing how they connect. Click one to see what it does and which files belong to it.",
  },
  {
    id: "explanations",
    title: "Plain-English explanations",
    text: "Every module is described in everyday words, so you can follow along without knowing the codebase.",
  },
  {
    id: "start-here",
    title: "Start here",
    text: "A short reading order: the files to open first, and why each one matters.",
  },
];
