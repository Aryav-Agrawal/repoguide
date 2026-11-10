// A small made-up module map for the "How it works" section. It looks like a mini
// version of the real map: rounded module boxes joined by lines.
//
// In the scroll story, GSAP finds the parts by their data attributes and builds the graph
// up: [data-story-node] boxes pop in, and [data-story-edge] lines draw themselves.
// Each line has pathLength="1", so "fully hidden" is a dash offset of 1 and "fully drawn" is 0.
// Without the scroll story (phones, reduced motion), the finished graph just shows as is.

const NODE_WIDTH = 76;
const NODE_HEIGHT = 30;

const NODES = [
  { id: "app", x: 160, y: 34, root: true },
  { id: "routes", x: 72, y: 108 },
  { id: "lib", x: 248, y: 108 },
  { id: "ui", x: 48, y: 186 },
  { id: "api", x: 160, y: 186 },
  { id: "db", x: 272, y: 186 },
];

const EDGES: [string, string][] = [
  ["app", "routes"],
  ["app", "lib"],
  ["routes", "ui"],
  ["routes", "api"],
  ["lib", "api"],
  ["lib", "db"],
];

const byId = Object.fromEntries(NODES.map((node) => [node.id, node]));

export default function StoryGraph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 320 220" className="h-auto w-full">
      {/* Lines first, so the boxes sit on top of their ends. */}
      {EDGES.map(([from, to]) => {
        const a = byId[from];
        const b = byId[to];
        return (
          <line
            key={`${from}-${to}`}
            data-story-edge=""
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            pathLength={1}
            className="stroke-muted"
            strokeOpacity={0.5}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        );
      })}

      {NODES.map((node) => (
        <g key={node.id} data-story-node={node.root ? "root" : ""}>
          <rect
            x={node.x - NODE_WIDTH / 2}
            y={node.y - NODE_HEIGHT / 2}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            rx={8}
            className={node.root ? "fill-accent-soft stroke-accent" : "fill-surface stroke-line"}
            strokeWidth={1.5}
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="central"
            className={`font-mono text-[11px] ${node.root ? "fill-accent" : "fill-muted"}`}
          >
            {node.id}
          </text>
        </g>
      ))}
    </svg>
  );
}
