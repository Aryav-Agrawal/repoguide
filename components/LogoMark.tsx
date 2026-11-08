// RepoGuide's mark: a tiny module map (one module linked to two others) on a rounded square.
// The same shape is drawn in app/icon.svg; keep the two in sync.
//
// On the page, leave `colors` out and it follows the light/dark theme tokens.
// The image routes (share image, Apple icon) can't use CSS, so they pass plain hex colors.

type LogoMarkProps = {
  size?: number;
  colors?: { background: string; foreground: string };
  className?: string;
};

export default function LogoMark({ size = 20, colors, className }: LogoMarkProps) {
  const bg = colors ? { fill: colors.background } : { className: "fill-accent" };
  const fg = colors ? { fill: colors.foreground } : { className: "fill-accent-ink" };
  const line = colors ? { stroke: colors.foreground } : { className: "stroke-accent-ink" };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32" className={className}>
      <rect width="32" height="32" rx="7" {...bg} />
      <path d="M10 16L22.5 9.5M10 16L22.5 22.5" strokeWidth="2.25" strokeLinecap="round" opacity="0.7" fill="none" {...line} />
      <circle cx="9.5" cy="16" r="3.75" {...fg} />
      <circle cx="22.5" cy="9.5" r="3.25" {...fg} />
      <circle cx="22.5" cy="22.5" r="3.25" {...fg} />
    </svg>
  );
}
