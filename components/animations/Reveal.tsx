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

// One shared observer per job for every Reveal on the page, instead of one
// per element: entering (adds `.in` once) and on-screen (toggles `.live` on
// photographs so their looping light sweep runs only while visible).
type Handler = (entry: IntersectionObserverEntry) => void;
const handlers = new WeakMap<Element, Handler>();
const liveHandlers = new WeakMap<Element, Handler>();
let enterIO: IntersectionObserver | null = null;
let liveIO: IntersectionObserver | null = null;
const dispatch = (map: WeakMap<Element, Handler>) => (entries: IntersectionObserverEntry[]) =>
  entries.forEach((e) => map.get(e.target)?.(e));

function observeEnter(el: Element, fn: Handler) {
  enterIO ??= new IntersectionObserver(dispatch(handlers), { rootMargin: "0px 0px -12% 0px" });
  handlers.set(el, fn);
  enterIO.observe(el);
  return () => {
    handlers.delete(el);
    enterIO?.unobserve(el);
  };
}
function observeLive(el: Element, fn: Handler) {
  liveIO ??= new IntersectionObserver(dispatch(liveHandlers));
  liveHandlers.set(el, fn);
  liveIO.observe(el);
  return () => {
    liveHandlers.delete(el);
    liveIO?.unobserve(el);
  };
}

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
    const stopEnter = observeEnter(el, (entry) => {
      if (!entry.isIntersecting) return;
      el.classList.add("in");
      stopEnter();
      timer = setTimeout(() => (el.style.transitionDelay = ""), delay + 1800);
    });
    const stopLive = el.classList.contains("sweep") ? observeLive(el, (entry) => el.classList.toggle("live", entry.isIntersecting)) : null;
    return () => {
      stopEnter();
      stopLive?.();
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
