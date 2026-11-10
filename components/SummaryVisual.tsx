// A tiny preview of a tour's summary, for the "Summary" feature card.
// Decorative: the card's own text says what it shows.
export default function SummaryVisual() {
  return (
    <div aria-hidden="true" className="rounded-lg border border-line bg-background p-4">
      <p className="font-mono text-xs text-muted">expressjs/express</p>
      <p className="mt-2 text-sm text-pretty text-ink">
        A small web framework for Node.js that handles routing, requests and responses.
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {["Node.js", "HTTP", "Middleware"].map((tech) => (
          <li key={tech} className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[11px] text-accent">
            {tech}
          </li>
        ))}
      </ul>
    </div>
  );
}
