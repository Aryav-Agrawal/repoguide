// A tiny, still picture of a module map for the "Interactive map" feature card:
// module boxes joined by lines, with one box selected like on the real map.
// Decorative: the card's own text says what it shows.

const NODE_WIDTH = 92;
const NODE_HEIGHT = 28;

const NODES = [
  { id: "entry", label: "Entry point", x: 62, y: 80 },
  { id: "app", label: "App setup", x: 190, y: 30 },
  { id: "requests", label: "Requests", x: 190, y: 80 },
  { id: "responses", label: "Responses", x: 190, y: 130, selected: true },
  { id: "views", label: "Views", x: 318, y: 30 },
];

const EDGES: [string, string][] = [
  ["entry", "app"],
  ["entry", "requests"],
  ["entry", "responses"],
  ["app", "views"],
];

const byId = Object.fromEntries(NODES.map((node) => [node.id, node]));

export default function MapVisual() {
  return (
    <div aria-hidden="true" className="rounded-lg border border-line bg-background p-3">
      <svg viewBox="0 0 380 160" className="h-auto w-full">
        {/* Lines go from the right edge of one box to the left edge of the next, like the real map. */}
        {EDGES.map(([from, to]) => {
          const a = byId[from];
          const b = byId[to];
          const x1 = a.x + NODE_WIDTH / 2;
          const x2 = b.x - NODE_WIDTH / 2;
          const middle = (x1 + x2) / 2;
          return (
            <path
              key={`${from}-${to}`}
              d={`M ${x1} ${a.y} C ${middle} ${a.y}, ${middle} ${b.y}, ${x2} ${b.y}`}
              fill="none"
              className="stroke-muted"
              strokeOpacity={0.5}
              strokeWidth={1.25}
            />
          );
        })}

        {NODES.map((node) => (
          <g key={node.id}>
            {node.selected && (
              <rect
                x={node.x - NODE_WIDTH / 2 - 3}
                y={node.y - NODE_HEIGHT / 2 - 3}
                width={NODE_WIDTH + 6}
                height={NODE_HEIGHT + 6}
                rx={9}
                className="fill-none stroke-accent"
                strokeOpacity={0.3}
                strokeWidth={3}
              />
            )}
            <rect
              x={node.x - NODE_WIDTH / 2}
              y={node.y - NODE_HEIGHT / 2}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx={6}
              className={node.selected ? "fill-surface stroke-accent" : "fill-surface stroke-line"}
              strokeWidth={1}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={node.selected ? "fill-ink text-[11px] font-medium" : "fill-muted text-[11px]"}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
