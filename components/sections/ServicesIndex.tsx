"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { photos, type PhotoKey } from "@/lib/photos";
import { Reveal } from "@/components/animations/Reveal";

type Item = { slug: string; index: string; title: string; short: string; photo: PhotoKey };

/**
 * Ruled index of services. On desktop a photograph of the hovered service
 * follows the pointer; on touch it is a plain list of links.
 */
export function ServicesIndex({ items }: { items: Item[] }) {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !preview.current || !listRef.current) return;
    const r = listRef.current.getBoundingClientRect();
    preview.current.style.transform = `translate3d(${e.clientX - r.left + 32}px, ${e.clientY - r.top - 140}px, 0)`;
  };

  return (
    <div className="relative mt-16">
      <ul ref={listRef} className="border-t border-line" onPointerMove={move} onPointerLeave={() => setActive(null)}>
        {items.map((s, i) => (
          <Reveal as="li" key={s.slug} delay={i * 70} className="border-b border-line">
            <Link
              href={`/services#${s.slug}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onFocus={() => setActive(null)}
              className="group grid grid-cols-[3rem_1fr] items-baseline gap-x-4 gap-y-2 py-8 transition-colors duration-300 md:grid-cols-[6rem_1fr_1fr_auto] md:py-10"
            >
              <span className="t-label tabular text-muted">{s.index}</span>
              <span className="t-display-m transition-transform duration-500 ease-out group-hover:translate-x-3">{s.title}</span>
              <span className="t-body-s col-start-2 text-muted md:col-start-auto">{s.short}</span>
              <span aria-hidden="true" className="hidden h-px w-10 bg-ivory transition-all duration-500 group-hover:w-16 group-hover:bg-champagne md:block" />
            </Link>
          </Reveal>
        ))}
      </ul>
      <div
        ref={preview}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-10 hidden h-[280px] w-[220px] overflow-hidden transition-opacity duration-300 lg:block ${
          active === null ? "opacity-0" : "opacity-100"
        }`}
      >
        {items.map((s, i) => (
          <Image
            key={s.slug}
            src={photos[s.photo].src}
            alt=""
            fill
            sizes="220px"
            className={`object-cover transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
    </div>
  );
}
