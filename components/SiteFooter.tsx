import GitHubIcon from "./GitHubIcon";
import LinkedInIcon from "./LinkedInIcon";

const LINKS = [
  { label: "GitHub", href: "https://github.com/Aryav-Agrawal/repoguide", Icon: GitHubIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/aryav-agrawal", Icon: LinkedInIcon },
];

/** The page footer: a short line about RepoGuide, two links, and a large faded wordmark. */
export default function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pt-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-pretty text-muted">RepoGuide turns a public GitHub repo into a guided tour.</p>
        <ul className="-ml-3 flex gap-1 sm:ml-0 sm:-mr-3">
          {LINKS.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-muted transition-colors hover:bg-accent-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Icon className="size-4" />
                {label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Decorative: the name is already in the line above, so screen readers skip this.
          It's cut off a little at the bottom edge on purpose, as if it sinks into the page. */}
      <p
        aria-hidden="true"
        className="footer-wordmark mx-auto mt-6 -mb-[0.18em] max-w-5xl px-4 text-center text-[clamp(4rem,17vw,12rem)] leading-none font-semibold tracking-tighter select-none sm:px-6"
      >
        RepoGuide
      </p>
    </footer>
  );
}
