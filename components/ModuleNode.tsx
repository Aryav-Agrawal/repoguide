import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ModuleFlowNode } from "@/lib/map-layout";

// One box on the map. Its size must match NODE_WIDTH and NODE_HEIGHT in lib/map-layout.ts.
function ModuleNode({ data, selected }: NodeProps<ModuleFlowNode>) {
  const { module } = data;
  const fileCount = module.keyFiles.length;

  return (
    <div
      className={`flex h-[72px] w-[220px] cursor-pointer flex-col justify-center rounded-lg border bg-surface px-3.5 transition-colors ${
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
