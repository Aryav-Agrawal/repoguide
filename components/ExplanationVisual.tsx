// A tiny preview of one module's explanation, for the "Plain-English explanations" card.
// Modelled on the real module panel. Decorative: the card's own text says what it shows.
export default function ExplanationVisual() {
  return (
    <div aria-hidden="true" className="rounded-lg border border-line bg-background p-4">
      <p className="text-sm font-semibold text-ink">Responses</p>
      <p className="mt-1.5 text-sm text-pretty text-muted">
        Adds helpers like <code className="font-mono text-xs text-ink">res.json()</code> and{" "}
        <code className="font-mono text-xs text-ink">res.redirect()</code> to every reply your app sends.
      </p>
      <p className="mt-3 inline-block rounded border border-line px-1.5 py-0.5 font-mono text-xs text-muted">
        lib/response.js
      </p>
    </div>
  );
}
