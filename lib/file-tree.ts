// Turns GitHub's flat list of paths ("src/app/page.tsx") into a nested tree for the UI.

import type { TreeEntry } from "./types";

export type TreeNode = {
  name: string;
  path: string;
  type: "blob" | "tree";
  children: TreeNode[];
};

export function buildFileTree(entries: TreeEntry[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", type: "tree", children: [] };
  // Lets us find a folder by its path without searching the tree every time.
  const folders = new Map<string, TreeNode>([["", root]]);

  for (const entry of entries) {
    const parts = entry.path.split("/");
    let parent = root;

    // Walk down the folders in the path, creating any that are missing.
    for (let i = 0; i < parts.length; i++) {
      const path = parts.slice(0, i + 1).join("/");
      const isLast = i === parts.length - 1;
      const type = isLast ? entry.type : "tree";

      const existing = folders.get(path);
      if (existing) {
        parent = existing;
        continue;
      }

      const node: TreeNode = { name: parts[i], path, type, children: [] };
      parent.children.push(node);
      if (type === "tree") {
        folders.set(path, node);
        parent = node;
      }
    }
  }

  sortTree(root.children);
  return root.children;
}

// Folders first, then files, each group A to Z.
function sortTree(nodes: TreeNode[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "tree" ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
  for (const node of nodes) {
    sortTree(node.children);
  }
}

export function countFiles(entries: TreeEntry[]): number {
  return entries.filter((entry) => entry.type === "blob").length;
}
