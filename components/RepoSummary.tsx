import { countFiles } from "@/lib/file-tree";
import type { RepoMetadata, TreeEntry } from "@/lib/types";

const numberFormat = new Intl.NumberFormat("en-US");

type RepoSummaryProps = {
  metadata: RepoMetadata;
  tree: TreeEntry[];
};

export default function RepoSummary({ metadata, tree }: RepoSummaryProps) {
  const stats = [
    { label: "Stars", value: numberFormat.format(metadata.stars) },
    { label: "Language", value: metadata.language ?? "Unknown" },
    { label: "Branch", value: metadata.defaultBranch },
    { label: "Files", value: numberFormat.format(countFiles(tree)) },
  ];

  return (
    <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-mono text-lg font-semibold break-words text-ink">
        <a
          href={metadata.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          {metadata.fullName}
        </a>
      </h2>
      <p className="mt-2 text-pretty text-muted">
        {metadata.description || "No description provided."}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <dt className="text-xs font-medium tracking-wide text-muted uppercase">{stat.label}</dt>
            <dd className="mt-1 truncate font-mono text-sm text-ink" title={stat.value}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
