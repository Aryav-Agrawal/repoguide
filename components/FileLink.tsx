import { githubFileUrl } from "@/lib/github-links";
import type { RepoMetadata } from "@/lib/types";

type FileLinkProps = {
  metadata: RepoMetadata;
  path: string;
};

// Lets a long path wrap after a "/" instead of in the middle of a file name.
function PathWithBreaks({ path }: { path: string }) {
  const parts = path.split("/");
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 && (
        <>
          /<wbr />
        </>
      )}
    </span>
  ));
}

// A file path that opens the file on GitHub in a new tab.
export default function FileLink({ metadata, path }: FileLinkProps) {
  return (
    <a
      href={githubFileUrl(metadata, path)}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex max-w-full items-baseline gap-1.5 rounded font-mono text-sm break-words text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="min-w-0">
        <PathWithBreaks path={path} />
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="size-3 shrink-0 opacity-60 group-hover:opacity-100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7 9" />
      </svg>
      <span className="sr-only">(opens on GitHub)</span>
    </a>
  );
}
