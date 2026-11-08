// Turns the AI's modules and relationships into React Flow nodes and edges,
// placed left to right by dagre so no two nodes overlap.

import dagre from "@dagrejs/dagre";
import { MarkerType, Position, type Edge, type Node } from "@xyflow/react";
import type { AnalysisModule, ModuleRelationship } from "./types";

// Every node is drawn at exactly this size (see ModuleNode), so dagre can plan around it.
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 72;

export type ModuleNodeData = { module: AnalysisModule };
export type ModuleFlowNode = Node<ModuleNodeData, "module">;

export function layoutModuleMap(
  modules: AnalysisModule[],
  relationships: ModuleRelationship[],
): { nodes: ModuleFlowNode[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph();
  // rankdir LR = left to right. The gaps leave room for the edge labels.
  graph.setGraph({ rankdir: "LR", nodesep: 48, ranksep: 200, marginx: 20, marginy: 20 });
  graph.setDefaultEdgeLabel(() => ({}));

  for (const item of modules) {
    graph.setNode(item.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const link of relationships) {
    graph.setEdge(link.from, link.to);
  }

  dagre.layout(graph);

  const nodes: ModuleFlowNode[] = modules.map((item) => {
    const { x, y } = graph.node(item.id);
    return {
      id: item.id,
      type: "module",
      // dagre gives the center of each node; React Flow wants the top-left corner.
      position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
      data: { module: item },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      ariaLabel: `${item.name} module`,
    };
  });

  // lib/analyze.ts already removed repeated links, so "from->to" is a unique id.
  const edges: Edge[] = relationships.map((link) => ({
    id: `${link.from}->${link.to}`,
    source: link.from,
    target: link.to,
    label: link.label,
    // "default" is a smooth curve. Its label sits halfway between the two modules, in the gap,
    // so labels of edges that meet at the same module don't pile on top of each other.
    type: "default",
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 4,
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

  return { nodes, edges };
}
