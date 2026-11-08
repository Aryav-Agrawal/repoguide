type RepoFormProps = {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export default function RepoForm({ url, onUrlChange, onSubmit, loading }: RepoFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-2"
    >
      <label htmlFor="repo-url" className="text-sm font-medium text-ink">
        GitHub repo URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="repo-url"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          required
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://github.com/vercel/swr"
          className="h-12 w-full min-w-0 rounded-lg sm:flex-1 border border-line bg-surface px-4 font-mono text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-lg bg-accent px-6 font-medium text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>
    </form>
  );
}
