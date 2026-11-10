import type Lenis from "lenis";

// While Lenis smooth scrolling is running (see components/SmoothScroll.tsx) it owns the page's
// scroll position, so a normal scrollIntoView() gets overridden on the next frame.
// SmoothScroll stores its Lenis here, and scrollToElement() goes through it when there is one.
let activeLenis: Lenis | null = null;

export function setActiveLenis(lenis: Lenis | null) {
  activeLenis = lenis;
}

// GSAP is only downloaded on devices that run scroll animations. SmoothScrollEngine stores
// ScrollTrigger's "measure again" here, so other parts of the page can call it without
// importing GSAP themselves.
let refreshScroll: (() => void) | null = null;

export function setScrollRefresher(refresh: (() => void) | null) {
  refreshScroll = refresh;
}

/** Ask the scroll animations (pinning, parallax) to re-measure. Does nothing when there are none. */
export function refreshScrollAnimations() {
  refreshScroll?.();
}

/** Scroll the page so `element` sits at the top (its CSS scroll-margin is respected either way). */
export function scrollToElement(element: HTMLElement, { instant = false } = {}) {
  if (activeLenis) {
    activeLenis.scrollTo(element, { immediate: instant });
  } else {
    element.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  }
}

/** Scroll the page back to the very top. */
export function scrollToTop({ instant = false } = {}) {
  if (activeLenis) {
    activeLenis.scrollTo(0, { immediate: instant });
  } else {
    window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
  }
}
