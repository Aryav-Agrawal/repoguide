"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useNodesState,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { layoutModuleMap } from "@/lib/map-layout";
import type { RepoAnalysis, RepoMetadata } from "@/lib/types";
import ModuleNode from "./ModuleNode";
import ModulePanel from "./ModulePanel";

// Defined outside the component: if this object changed every render,
// React Flow would rebuild every node each time.
const nodeTypes = { module: ModuleNode };

type ModuleMapProps = {
  analysis: RepoAnalysis;
  metadata: RepoMetadata;
};

export default function ModuleMap({ analysis, metadata }: ModuleMapProps) {
  const { modules, relationships } = analysis;

  // Working out positions is the expensive part, so only redo it when the data changes.
  const layout = useMemo(() => layoutModuleMap(modules, relationships), [modules, relationships]);

  // React Flow keeps track of which node is selected (by click, or Tab + Enter).
  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedModule = modules.find((item) => item.id === selectedId) ?? null;

  const handleSelectionChange = useCallback(({ nodes: picked }: OnSelectionChangeParams) => {
    setSelectedId(picked[0]?.id ?? null);
  }, []);

  const closePanel = useCallback(() => {
    setNodes((current) => current.map((node) => ({ ...node, selected: false })));
  }, [setNodes]);

  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3">
        <h2 className="text-sm font-medium text-ink">How it fits together</h2>
        <p className="text-xs text-muted">Drag to pan, scroll to zoom, click a module for details.</p>
      </div>

      <div className="relative h-[28rem] overflow-hidden rounded-b-xl sm:h-[34rem]">
        <ReactFlow
          nodes={nodes}
          edges={layout.edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onSelectionChange={handleSelectionChange}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesFocusable={false}
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
          deleteKeyCode={null}
          colorMode="system"
          fitView
          // On phones, fitting every module on screen would make the text too small to read,
          // so we never start more zoomed out than 0.6. People can pan or zoom out from there.
          fitViewOptions={{ padding: 0.15, minZoom: 0.6 }}
          minZoom={0.3}
          maxZoom={1.75}
          aria-label="Map of the repository's main modules"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={false} position="bottom-left" />
        </ReactFlow>

        {selectedModule && (
          <ModulePanel module={selectedModule} metadata={metadata} onClose={closePanel} />
        )}
      </div>
    </div>
  );
}
