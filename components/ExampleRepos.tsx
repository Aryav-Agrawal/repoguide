// Well-known public repos in different languages, all small enough to tour quickly.
const EXAMPLES = [
  { fullName: "expressjs/express", language: "JavaScript" },
  { fullName: "pallets/flask", language: "Python" },
  { fullName: "spf13/cobra", language: "Go" },
];

type ExampleReposProps = {
  onPick: (url: string) => void;
  disabled: boolean;
};

export default function ExampleRepos({ onPick, disabled }: ExampleReposProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">Try an example:</span>
      {EXAMPLES.map((example) => (
        <button
          key={example.fullName}
          type="button"
          disabled={disabled}
          onClick={() => onPick(`https://github.com/${example.fullName}`)}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm transition-colors hover:border-accent/50 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line disabled:hover:bg-surface"
        >
          <span className="font-mono text-ink">{example.fullName}</span>
          <span className="text-xs text-muted">{example.language}</span>
        </button>
      ))}
    </div>
  );
}
