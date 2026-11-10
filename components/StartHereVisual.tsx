// A tiny preview of a reading order, for the "Start here" feature card.
// Modelled on the real "Start here" list. Decorative: the card's own text says what it shows.
const FILES = ["lib/express.js", "lib/application.js", "lib/response.js"];

export default function StartHereVisual() {
  return (
    <ol aria-hidden="true" className="divide-y divide-line rounded-lg border border-line bg-background">
      {FILES.map((file, index) => (
        <li key={file} className="flex items-center gap-3 px-4 py-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-medium text-accent">
            {index + 1}
          </span>
          <span className="truncate font-mono text-xs text-ink">{file}</span>
        </li>
      ))}
    </ol>
  );
}
