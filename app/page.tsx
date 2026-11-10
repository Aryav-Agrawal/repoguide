import ExampleRepoMarquee from "@/components/ExampleRepoMarquee";
import FadeRise from "@/components/FadeRise";
import Features from "@/components/Features";
import HeroGraphVisual from "@/components/HeroGraphVisual";
import HeroHeadline from "@/components/HeroHeadline";
import HomeBackground from "@/components/HomeBackground";
import HomeOnly from "@/components/HomeOnly";
import HowItWorks from "@/components/HowItWorks";
import LogoMark from "@/components/LogoMark";
import ParallaxLayer from "@/components/ParallaxLayer";
import RepoAnalysisProvider from "@/components/RepoAnalysisProvider";
import RepoExplorer from "@/components/RepoExplorer";
import SiteFooter from "@/components/SiteFooter";
import SmoothScroll from "@/components/SmoothScroll";
import Stats from "@/components/Stats";
import { SUBHEAD_DELAY_SECONDS } from "@/lib/hero-timing";

export default function Home() {
  return (
    <>
      {/* Smooth scrolling, on the home page only (and only on devices that can run heavy effects). */}
      <SmoothScroll />

      {/* Lets the example repo strip further down start an analysis in the form up top, and
          knows whether we're showing the home page or a tour. The parts wrapped in HomeOnly
          fade away while a tour is showing. */}
      <RepoAnalysisProvider>
        {/* Decorative moving background behind the hero. It sits under the page content,
            and drifts a little slower than the page as you scroll (light parallax). */}
        <HomeOnly className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100svh]">
          <ParallaxLayer speed={0.3} className="absolute inset-0">
            <HomeBackground />
          </ParallaxLayer>
        </HomeOnly>

        {/* Wider than the text needs, so the module map has room. The text keeps its own max widths. */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
          {/* When a tour starts, the hero fades out on top of this box while the URL bar
              (inside RepoExplorer) glides up into its place. */}
          <div className="relative">
            <HomeOnly overlay className="pb-10">
              {/* The hero text. The decorative 3D graph is positioned against this block. */}
              <div className="relative">
                <HeroGraphVisual />
                <p className="flex items-center gap-2 font-mono text-sm text-accent">
                  <LogoMark size={20} />
                  RepoGuide
                </p>
                <HeroHeadline />
                {/* Fades and rises in just after the headline finishes. */}
                <FadeRise delay={SUBHEAD_DELAY_SECONDS}>
                  <p className="mt-4 max-w-xl text-lg text-pretty text-muted">
                    Paste a public repo link and RepoGuide gives you a guided tour: what it does, how it&apos;s
                    organized, and which files to read first.
                  </p>
                </FadeRise>
              </div>
            </HomeOnly>

            <RepoExplorer />
          </div>

          <HomeOnly>
            <HowItWorks className="mt-24 sm:mt-32" />

            <Features className="mt-24 sm:mt-32" />

            <ExampleRepoMarquee className="mt-24 sm:mt-32" />

            <Stats className="mt-16 sm:mt-20" />
          </HomeOnly>
        </main>
      </RepoAnalysisProvider>

      <SiteFooter />
    </>
  );
}
