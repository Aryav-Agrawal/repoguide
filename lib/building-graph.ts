// The small graph that builds itself while an analysis runs (components/BuildingGraph.tsx).
// It's a tiny, hand-placed version of the real module map: columns of boxes, left to right.

import type { AnalyzeStepId } from "./types";

export const GRAPH_WIDTH = 220;
export const GRAPH_HEIGHT = 132;
export const BOX_WIDTH = 34;
export const BOX_HEIGHT = 16;

/** Each box: its top-left corner, and the step that adds it. Listed in the order they appear. */
export const GRAPH_NODES: { x: number; y: number; step: AnalyzeStepId }[] = [
  { x: 6, y: 58, step: "fetching" },
  { x: 66, y: 26, step: "choosing" },
  { x: 66, y: 90, step: "choosing" },
  { x: 126, y: 10, step: "analyzing" },
  { x: 126, y: 58, step: "analyzing" },
  { x: 126, y: 106, step: "analyzing" },
  { x: 180, y: 34, step: "analyzing" },
  { x: 180, y: 82, step: "mapping" },
  { x: 180, y: 112, step: "mapping" },
];

/** Links between boxes, as [from, to] positions in GRAPH_NODES. Each "to" comes after its "from". */
export const GRAPH_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 4],
  [2, 5],
  [3, 6],
  [4, 6],
  [4, 7],
  [5, 8],
];

/** How many boxes belong to each step. */
export function nodesForStep(step: AnalyzeStepId) {
  return GRAPH_NODES.filter((node) => node.step === step).length;
}
