import { ImageResponse } from "next/og";
import LogoMark from "@/components/LogoMark";

// The preview image shown when someone shares a RepoGuide link (Slack, X, LinkedIn, iMessage...).
// It's drawn once at build time. The right side is a small version of the module map RepoGuide
// draws for every repo, filled in with RepoGuide's own modules.

export const alt = "RepoGuide: find your way around any GitHub repo, with a map of its main modules.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Light theme colors from app/globals.css (image generation can't read CSS variables).
const color = {
  background: "#f7f6f2",
  surface: "#ffffff",
  ink: "#1d1c1a",
  muted: "#66635c",
  line: "#e3e0d8",
  accent: "#2c6a4c",
  accentSoft: "#e5efe9",
};

// Module boxes on the mini map, positioned inside a 480 x 420 card.
const NODE_WIDTH = 176;
const NODE_HEIGHT = 72;
const nodes = [
  { name: "Analyze API", path: "app/api/analyze", x: 28, y: 174, selected: false },
  { name: "GitHub client", path: "lib/github.ts", x: 276, y: 36, selected: false },
  { name: "AI analysis", path: "lib/analyze.ts", x: 276, y: 174, selected: true },
  { name: "File picker", path: "lib/select-files.ts", x: 276, y: 312, selected: false },
];

// Curved arrows from the right edge of "Analyze API" to the left edge of each other box.
const startX = 28 + NODE_WIDTH;
const startY = 174 + NODE_HEIGHT / 2;
const arrows = nodes.slice(1).map((node) => {
  const endX = node.x - 4;
  const endY = node.y + NODE_HEIGHT / 2;
  const midX = (startX + endX) / 2;
  return {
    line: `M${startX} ${startY} C${midX} ${startY} ${midX} ${endY} ${endX - 6} ${endY}`,
    head: `M${endX - 8} ${endY - 5} L${endX} ${endY} L${endX - 8} ${endY + 5} Z`,
  };
});

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 72px",
          background: color.background,
        }}
      >
        {/* Left: name and promise */}
        <div style={{ display: "flex", flexDirection: "column", width: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <LogoMark size={52} colors={{ background: color.accent, foreground: "#ffffff" }} />
            <span style={{ fontSize: 34, fontWeight: 600, color: color.accent }}>RepoGuide</span>
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: color.ink,
            }}
          >
            Find your way around any GitHub repo.
          </div>
          <div style={{ marginTop: 28, fontSize: 28, lineHeight: 1.35, color: color.muted }}>
            A summary, a map of the main modules, and which files to read first.
          </div>
        </div>

        {/* Right: a mini module map */}
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 480,
            height: 420,
            borderRadius: 24,
            border: `2px solid ${color.line}`,
            background: color.surface,
          }}
        >
          <svg width="480" height="420" viewBox="0 0 480 420" style={{ position: "absolute", top: 0, left: 0 }}>
            {arrows.map((arrow) => (
              <g key={arrow.line}>
                <path d={arrow.line} stroke={color.muted} strokeWidth="2" fill="none" />
                <path d={arrow.head} fill={color.muted} />
              </g>
            ))}
          </svg>

          {nodes.map((node) => (
            <div
              key={node.name}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "absolute",
                left: node.x,
                top: node.y,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                padding: "0 16px",
                borderRadius: 12,
                border: `2px solid ${node.selected ? color.accent : color.line}`,
                background: node.selected ? color.accentSoft : color.surface,
              }}
            >
              <span style={{ fontSize: 21, fontWeight: 600, color: color.ink }}>{node.name}</span>
              <span style={{ marginTop: 4, fontSize: 15, color: color.muted }}>{node.path}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
