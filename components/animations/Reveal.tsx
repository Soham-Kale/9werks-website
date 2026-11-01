"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from "react";

type Props = {
  as?: ElementType;
  className?: string;
  /** "rv" fades and rises, "rv-img" wipes an image in, "" only toggles .in (for masked lines) */
  variant?: "rv" | "rv-img" | "";
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
  id?: string;
};

/**
 * Adds `.in` once the element enters the viewport. The motion itself is CSS
 * (globals.css), so it runs on the compositor and reduced motion is honoured
 * by the stylesheet. The stagger delay is removed after the entrance so later
 * hovers never lag.
 */
export function Reveal({ as: Tag = "div", className = "", variant = "rv", delay = 0, children, style, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("in");
        io.disconnect();
        timer = setTimeout(() => (el.style.transitionDelay = ""), delay + 1800);
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    // Looping light sweeps run only while their photograph is on screen.
    const live = el.classList.contains("sweep")
      ? new IntersectionObserver(([entry]) => el.classList.toggle("live", entry.isIntersecting))
      : null;
    live?.observe(el);
    return () => {
      io.disconnect();
      live?.disconnect();
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <Tag ref={ref} id={id} className={`${variant} ${className}`} style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}>
      {children}
    </Tag>
  );
}

/** A headline whose lines rise out of a mask, one after another. */
export function MaskedLines({
  lines,
  as: Tag = "h2",
  className = "",
  stagger = 90,
  id,
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  stagger?: number;
  id?: string;
}) {
  return (
    <Reveal as={Tag} variant="" className={className} id={id}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, i) => (
        <span key={i} className="mask" aria-hidden="true">
          <span style={{ transitionDelay: `${i * stagger}ms` }}>{line}</span>
        </span>
      ))}
    </Reveal>
  );
}
