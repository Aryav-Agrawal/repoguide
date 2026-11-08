import LogoMark from "@/components/LogoMark";
import RepoExplorer from "@/components/RepoExplorer";

export default function Home() {
  return (
    // Wider than the text needs, so the module map has room. The text keeps its own max widths.
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
      <p className="flex items-center gap-2 font-mono text-sm text-accent">
        <LogoMark size={20} />
        RepoGuide
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">
        Find your way around any GitHub repo.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-pretty text-muted">
        Paste a public repo link and RepoGuide gives you a guided tour: what it does, how it&apos;s
        organized, and which files to read first.
      </p>

      <div className="mt-10">
        <RepoExplorer />
      </div>
    </main>
  );
}
