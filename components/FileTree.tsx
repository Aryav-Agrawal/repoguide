"use client";

import { useMemo } from "react";
import { buildFileTree } from "@/lib/file-tree";
import type { TreeEntry } from "@/lib/types";
import FileTreeNode from "./FileTreeNode";

export default function FileTree({ entries }: { entries: TreeEntry[] }) {
  // Building the nested tree can be slow for big repos, so only redo it when entries change.
  const nodes = useMemo(() => buildFileTree(entries), [entries]);

  return (
    <div className="rounded-xl border border-line bg-surface">
      <h2 className="border-b border-line px-5 py-3 text-sm font-medium text-ink">Files</h2>
      {nodes.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">No files found.</p>
      ) : (
        <ul role="tree" aria-label="Repository files" className="max-h-[32rem] overflow-auto py-2">
          {nodes.map((node) => (
            <FileTreeNode key={node.path} node={node} depth={0} />
          ))}
        </ul>
      )}
    </div>
  );
}
