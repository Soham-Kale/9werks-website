"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const FINE_Q = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one clock. Loaded only for mouse and trackpad users who have not asked
 * for reduced motion: touch devices keep native momentum scrolling and never
 * download Lenis or GSAP for it.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const mq = matchMedia(FINE_Q);
    let stop: (() => void) | null = null;
    let cancelled = false;

    const start = async () => {
      if (stop || !mq.matches) return;
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }, { setLenis }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("@/lib/scroll"),
      ]);
      if (cancelled || stop || !mq.matches) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), wheelMultiplier: 0.9 });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
      stop = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
        stop = null;
      };
    };
    const onChange = () => (mq.matches ? start() : stop?.());

    start();
    mq.addEventListener("change", onChange);

    // Pause looping CSS on hidden tabs (body.paused rule in globals.css).
    const onVis = () => document.body.classList.toggle("paused", document.hidden);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      mq.removeEventListener("change", onChange);
      document.removeEventListener("visibilitychange", onVis);
      stop?.();
    };
  }, []);

  // New route: start at the top and ease the new page in. The very first load
  // is left still, so the largest paint is never held back by an animation.
  const first = useRef(true);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (first.current) {
      first.current = false;
      return;
    }
    const main = document.getElementById("main");
    if (!main || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    main.classList.remove("page-enter");
    void main.offsetWidth; // restart the animation
    main.classList.add("page-enter");
    const done = () => main.classList.remove("page-enter");
    main.addEventListener("animationend", done, { once: true });
    return () => main.removeEventListener("animationend", done);
  }, [pathname]);

  return null;
}
