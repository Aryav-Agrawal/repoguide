import { EXAMPLE_REPOS } from "@/lib/example-repos";
import { getExampleRepoStars } from "@/lib/github";
import RepoMarquee from "./RepoMarquee";

const HEADING_ID = "example-repos-title";

/**
 * The "Try a popular repo" strip. This part runs on the server: it gets the real star counts
 * from GitHub (cached for about an hour), then hands everything to the scrolling strip in the browser.
 */
export default async function ExampleRepoMarquee({ className }: { className?: string }) {
  const stars = await getExampleRepoStars(EXAMPLE_REPOS.map((repo) => repo.fullName));
  const repos = EXAMPLE_REPOS.map((repo) => ({ ...repo, stars: stars[repo.fullName] ?? null }));

  return (
    <section aria-labelledby={HEADING_ID} className={className}>
      <h2 id={HEADING_ID} className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Try a popular repo
      </h2>
      <p className="mt-3 max-w-md text-pretty text-muted">Pick one to start its tour right away.</p>
      <div className="mt-6">
        <RepoMarquee repos={repos} />
      </div>
    </section>
  );
}
