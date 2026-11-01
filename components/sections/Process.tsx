"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";
import { Kicker } from "@/components/ui/Kicker";
import { MaskedLines } from "@/components/animations/Reveal";

/**
 * Book, Inspect, Service, Drive away. A champagne line draws across the four
 * steps as the section scrolls through, and each node lights as it is reached.
 * A plain scroll listener, only attached while the section is on screen, so
 * this page needs no animation library.
 */
export function Process({ index }: { index: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    const track = root?.querySelector<HTMLElement>("[data-track]");
    if (!root || !track) return;
    const line = root.querySelector<HTMLElement>("[data-line]");
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let last = -1;
    const draw = () => {
      raf = 0;
      // 0 when the track's top reaches 75% of the viewport, 1 when its bottom reaches 45%.
      const r = track.getBoundingClientRect();
      const start = innerHeight * 0.75;
      const end = innerHeight * 0.45;
      const p = reduce.matches ? 1 : Math.min(1, Math.max(0, (start - r.top) / (r.height + start - end)));
      const q = Math.round(p * 1000) / 1000;
      if (q === last) return;
      last = q;
      line?.style.setProperty("--p", String(q));
      steps.forEach((s, i) => s.classList.toggle("on", q >= i / steps.length + 0.02));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } else removeEventListener("scroll", onScroll);
    });
    draw();
    io.observe(root);
    reduce.addEventListener("change", draw);
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      reduce.removeEventListener("change", draw);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="section bg-charcoal" aria-labelledby="process-title">
      <div className="shell">
        <Kicker index={index}>How it works</Kicker>
        <MaskedLines as="h2" id="process-title" lines={["Booked in", "four easy steps."]} className="t-display-l mt-8" />
        <div data-track className="relative mt-20">
          {/* Rail: horizontal on desktop, vertical on mobile */}
          <div aria-hidden="true" className="absolute left-[7px] top-0 h-full w-px bg-line-strong/50 md:left-0 md:top-[7px] md:h-px md:w-full" />
          <div
            data-line
            aria-hidden="true"
            className="process-line absolute left-[7px] top-0 h-full w-px bg-champagne md:left-0 md:top-[7px] md:h-px md:w-full"
          />
          <ol className="relative grid gap-14 md:grid-cols-4 md:gap-8">
            {site.process.map((p, i) => (
              <li key={p.step} data-step className="process-step on pl-10 md:pl-0 md:pt-14">
                <span aria-hidden="true" className="process-node absolute left-0 h-[15px] w-[15px] rotate-45 border border-line-strong bg-charcoal md:top-0" />
                <span className="t-label tabular text-muted">0{i + 1}</span>
                <h3 className="t-display-m mt-4">{p.step}</h3>
                <p className="t-body-s mt-4 max-w-[30ch] text-muted">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
