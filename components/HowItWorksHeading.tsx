import { HOW_IT_WORKS_INTRO, HOW_IT_WORKS_TITLE } from "@/lib/how-it-works";

// The id the <section> in components/HowItWorks.tsx points at with aria-labelledby.
export const HOW_IT_WORKS_HEADING_ID = "how-it-works-title";

// The "How it works" title and intro line, shared by both versions of the section.
export default function HowItWorksHeading() {
  return (
    <>
      <h2 id={HOW_IT_WORKS_HEADING_ID} className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {HOW_IT_WORKS_TITLE}
      </h2>
      <p className="mt-3 max-w-md text-pretty text-muted">{HOW_IT_WORKS_INTRO}</p>
    </>
  );
}
