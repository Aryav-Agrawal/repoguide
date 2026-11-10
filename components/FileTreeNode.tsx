"use client";

import { useState } from "react";
import type { TreeNode } from "@/lib/file-tree";

type FileTreeNodeProps = {
  node: TreeNode;
  depth: number;
};

export default function FileTreeNode({ node, depth }: FileTreeNodeProps) {
  const [open, setOpen] = useState(false);
  const isFolder = node.type === "tree";
  // Indent each level, plus room on the left for the chevron.
  const indent = { paddingLeft: `${depth * 1.125 + 1.25}rem` };

  if (!isFolder) {
    return (
      <li role="treeitem" aria-selected={false}>
        <div
          style={indent}
          className="flex items-center gap-2 py-1 pr-4 font-mono text-[13px] text-muted"
        >
          <span className="w-3.5 shrink-0" aria-hidden="true" />
          <FileIcon />
          <span className="truncate" title={node.path}>
            {node.name}
          </span>
        </div>
      </li>
    );
  }

  return (
    <li role="treeitem" aria-expanded={open} aria-selected={false}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={indent}
        className="flex w-full items-center gap-2 py-1 pr-4 text-left font-mono text-[13px] text-ink hover:bg-accent-soft focus-visible:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        <ChevronIcon open={open} />
        <FolderIcon />
        <span className="truncate" title={node.path}>
          {node.name}
        </span>
      </button>

      {/* Children only render when open, which keeps very large repos fast. */}
      {open && (
        <ul role="group">
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`size-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`}
    >
      <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0 text-accent">
      <path
        d="M1.75 4.25c0-.55.45-1 1-1h3.4l1.5 1.5h5.6c.55 0 1 .45 1 1v6.5c0 .55-.45 1-1 1H2.75c-.55 0-1-.45-1-1v-8z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0">
      <path
        d="M4 1.75h5l3.25 3.25v9.25H4z M9 1.75V5h3.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}
