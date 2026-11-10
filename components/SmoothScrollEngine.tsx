"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setActiveLenis, setScrollRefresher } from "@/lib/smooth-scroll";

/**
 * The actual smooth scrolling (Lenis, kept in step with GSAP ScrollTrigger).
 * SmoothScroll loads this file only on devices that can run heavy effects, so phones and
 * reduced-motion visitors never download Lenis or GSAP. It draws nothing.
 */
export default function SmoothScrollEngine() {
  useEffect(() => {
    // allowNestedScroll: boxes with their own scrollbar (the file tree, the module panel)
    // keep scrolling themselves instead of Lenis scrolling the page.
    const lenis = new Lenis({ autoRaf: false, allowNestedScroll: true });
    // So other parts of the page can scroll through Lenis instead of fighting it.
    setActiveLenis(lenis);
    // So parts of the page that don't load GSAP themselves (like HomeOnly) can still ask
    // the scroll animations to re-measure.
    setScrollRefresher(() => ScrollTrigger.refresh());

    // Every time Lenis moves the page, tell ScrollTrigger so pinned and scrubbed
    // animations follow along.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's clock, so both update in the same animation frame.
    // GSAP gives seconds; Lenis wants milliseconds.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Normally GSAP smooths over slow frames, which would make the scroll jump. Turn that off.
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger works out where each trigger starts once, so when the page gets taller
    // (for example when a repo tour appears above the "How it works" section) it has to
    // measure again. We watch the page height and refresh, at most once per frame.
    let lastHeight = document.body.scrollHeight;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = document.body.scrollHeight;
        if (height === lastHeight) return;
        lastHeight = height;
        ScrollTrigger.refresh();
      });
    });
    observer.observe(document.body);

    // Leaving the page (or switching to the light version) puts normal scrolling back.
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default
      setScrollRefresher(null);
      setActiveLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
