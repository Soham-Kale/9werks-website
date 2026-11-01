"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";
import { Kicker } from "@/components/ui/Kicker";

const fmt = (n: number) => n.toLocaleString("en-IN");

/** The verified numbers, counting up once when they enter the viewport. */
export function Stats({ index }: { index: string }) {
  const ref = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    els.forEach((el) => (el.textContent = "0"));
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1800;
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / dur);
          const k = 1 - Math.pow(1 - t, 4);
          els.forEach((el) => {
            const target = Number(el.dataset.count);
            const next = fmt(Math.round(target * k));
            if (el.textContent !== next) el.textContent = next;
          });
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="section shell" aria-labelledby="stats-title">
      <Kicker index={index}>In numbers</Kicker>
      <h2 id="stats-title" className="sr-only">
        9WERKS in numbers
      </h2>
      <dl ref={ref} className="mt-14 grid grid-cols-2 border-t border-line lg:grid-cols-4">
        {site.stats.map((s, i) => (
          <div key={s.label} className={`flex flex-col-reverse gap-4 border-b border-line py-10 pr-6 ${i % 2 ? "pl-6" : ""} lg:border-b-0 lg:pl-0 ${i ? "lg:border-l lg:pl-8" : ""}`}>
            <dt className="t-label text-muted">{s.label}</dt>
            <dd className="font-display tabular text-[clamp(2.75rem,6vw,6rem)] font-light leading-none">
              <span data-count={s.value}>{fmt(s.value)}</span>
              {s.suffix && <span className="text-champagne">{s.suffix}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="t-body-s mt-10 text-muted">
        Rated <span className="text-ivory">{site.reviews.rating}</span> from {site.reviews.count} reviews on{" "}
        <a href={site.reviews.url} target="_blank" rel="noopener noreferrer" className="link link-u text-ivory">
          Google
        </a>
        .
      </p>
    </section>
  );
}
