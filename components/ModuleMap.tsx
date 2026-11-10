"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useNodesState,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { layoutModuleMap } from "@/lib/map-layout";
import type { RepoAnalysis, RepoMetadata } from "@/lib/types";
import { MAP_FIT_MS } from "@/lib/tour-motion";
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

  // When the panel closes (Escape, the Close button, clicking the empty map), put keyboard focus
  // back on the module that was open. Without this, focus falls to the top of the page and a
  // keyboard user has to Tab all the way back. If focus already moved somewhere else on purpose
  // (outside the map), it's left alone.
  const mapRef = useRef<HTMLDivElement>(null);
  const lastOpenId = useRef<string | null>(null);
  useEffect(() => {
    if (selectedId) {
      lastOpenId.current = selectedId;
      return;
    }
    const closedId = lastOpenId.current;
    lastOpenId.current = null;
    const map = mapRef.current;
    if (!closedId || !map) return;

    // Wait one frame: when Escape is pressed on a module, React Flow blurs it a frame later,
    // which would undo our focus if we did it right away.
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      const focusWasLost = !active || active === document.body || map.contains(active);
      if (focusWasLost) {
        map
          .querySelector<HTMLElement>(`.react-flow__node[data-id="${CSS.escape(closedId)}"]`)
          ?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedId]);

  // On first load the map zooms smoothly to fit, once (instantly with reduced motion).
  // On phones, fitting every module on screen would make the text too small to read,
  // so we never start more zoomed out than 0.6. People can pan or zoom out from there.
  const reduceMotion = usePrefersReducedMotion();
  const fitViewOptions = useMemo(
    () => ({ padding: 0.15, minZoom: 0.6, duration: reduceMotion ? 0 : MAP_FIT_MS }),
    [reduceMotion],
  );

  return (
    // data-lenis-prevent: the home page's smooth scrolling never touches the map, so scrolling
    // over it always zooms the map instead of moving the page.
    <div ref={mapRef} data-lenis-prevent="" className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3">
        <h2 className="text-sm font-medium text-ink">How it fits together</h2>
        <p className="text-xs text-muted">Drag to pan, scroll to zoom, click a module for details.</p>
      </div>

      {/* On wide screens the panel sits on top of the map's right side (it's positioned
          against this box). Below 1024px wide (phones and tablets) it drops below the map so both stay readable. */}
      <div className="lg:relative">
        <div className="h-[28rem] sm:h-[34rem]">
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
            fitViewOptions={fitViewOptions}
            minZoom={0.3}
            maxZoom={1.75}
            aria-label="Map of the repository's main modules"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls showInteractive={false} position="bottom-left" />
          </ReactFlow>
        </div>

        {/* The panel slides in when a module is clicked and slides out when it closes. */}
        <AnimatePresence>
          {selectedModule && (
            <ModulePanel key="panel" module={selectedModule} metadata={metadata} onClose={closePanel} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
