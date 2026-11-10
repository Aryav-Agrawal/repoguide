import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ModuleFlowNode } from "@/lib/map-layout";

// The nodes pop in one after another, but only a few steps apart so big maps don't take long.
const POP_START_MS = 150;
const POP_STAGGER_MS = 45;
const MAX_STAGGER_STEPS = 14;

// One box on the map. Its size must match NODE_WIDTH and NODE_HEIGHT in lib/map-layout.ts.
// map-node-enter (in globals.css) is a CSS animation that runs once when the node first
// appears. Panning, zooming and selecting re-render the node but never re-create it, so it
// never plays again, and nothing on the map moves while you pan or zoom.
function ModuleNode({ data, selected }: NodeProps<ModuleFlowNode>) {
  const { module, order } = data;
  const fileCount = module.keyFiles.length;

  return (
    <div
      style={{ animationDelay: `${POP_START_MS + Math.min(order, MAX_STAGGER_STEPS) * POP_STAGGER_MS}ms` }}
      className={`map-node-enter flex h-[72px] w-[220px] cursor-pointer flex-col justify-center rounded-lg border bg-surface px-3.5 transition-colors ${
        selected ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-accent/60"
      }`}
    >
      <Handle type="target" position={Position.Left} className="opacity-0!" isConnectable={false} />
      <p className="line-clamp-2 text-sm leading-snug font-medium text-ink">{module.name}</p>
      <p className="mt-0.5 font-mono text-xs text-muted">
        {fileCount} key {fileCount === 1 ? "file" : "files"}
      </p>
      <Handle type="source" position={Position.Right} className="opacity-0!" isConnectable={false} />
    </div>
  );
}

export default memo(ModuleNode);
