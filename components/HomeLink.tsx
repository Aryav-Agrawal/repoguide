import LogoMark from "./LogoMark";

// The logo at the top of a tour. It looks like the hero's logo line and takes you back home.
export default function HomeLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="RepoGuide, back to the home page"
      className="flex w-fit items-center gap-2 rounded font-mono text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <LogoMark size={20} />
      RepoGuide
    </button>
  );
}
