"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";
import { finishes, type FinishId } from "@/config/vehicle";
import { setFinish } from "@/components/three/store";

const HeroExperience = dynamic(() => import("@/components/three/HeroExperience"), { ssr: false });

type Mode = "scrub" | "static";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const MOBILE_Q = "(max-width: 767px), (pointer: coarse)";
const REDUCED_Q = "(prefers-reduced-motion: reduce)";

function FinishSelector() {
  const [active, setActive] = useState<FinishId>("obsidian");
  return (
    <div className="hero-finish">
      <p className="t-label text-muted" id="finish-label">
        Choose a finish
      </p>
      <div role="radiogroup" aria-labelledby="finish-label" className="mt-4 flex flex-wrap gap-2 sm:gap-3">
        {finishes.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={active === f.id}
            onClick={() => {
              setActive(f.id);
              setFinish(f.id);
            }}
            className="group flex min-h-[44px] items-center gap-3 border border-line-strong px-3 py-2 transition-colors duration-300 hover:border-champagne aria-checked:border-champagne"
          >
            <span aria-hidden="true" className="h-4 w-4 rounded-full border border-line-strong" style={{ background: f.color }} />
            <span className="t-label">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Ctas() {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href="/booking" className="btn btn-primary">
        Book a service <span className="arrow" aria-hidden="true" />
      </Link>
      <a href={site.whatsapp} className="btn" target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [section, setSection] = useState<HTMLElement | null>(null);
  const [mode, setMode] = useState<Mode>("scrub");
  const [env, setEnv] = useState<{ mobile: boolean; reduced: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Decide after first paint: device class, motion preference, WebGL. The 3D
  // bundle loads when the browser is idle so it never competes with the LCP.
  useEffect(() => {
    const mq = matchMedia(MOBILE_Q);
    const rq = matchMedia(REDUCED_Q);
    const read = () => {
      setEnv({ mobile: mq.matches, reduced: rq.matches });
      setMode(rq.matches ? "static" : "scrub");
    };
    let idle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      if (!hasWebGL()) {
        setFailed(true);
        setMode("static");
        return;
      }
      setSection(ref.current);
      read();
    };
    const ric = typeof requestIdleCallback === "function";
    if (ric) idle = requestIdleCallback(start, { timeout: 1500 });
    else timer = setTimeout(start, 600);
    mq.addEventListener("change", read);
    rq.addEventListener("change", read);
    return () => {
      if (ric) cancelIdleCallback(idle);
      clearTimeout(timer);
      mq.removeEventListener("change", read);
      rq.removeEventListener("change", read);
    };
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => {
    setFailed(true);
    setMode("static");
  }, []);

  const show3D = !!section && !!env && !failed;

  return (
    <section
      ref={ref}
      className="hero-track relative"
      data-mode={failed ? "static" : mode}
      data-ready={ready || undefined}
      aria-label="9WERKS introduction"
    >
      <div className="hero-stage sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Poster: the LCP image, and the designed fallback if 3D is unavailable */}
        <div className="hero-poster absolute inset-0">
          <Image
            src={photos.m5.src}
            alt={photos.m5.alt}
            fill
            preload
            sizes="100vw"
            className="object-cover object-[70%_50%]"
          />
        </div>

        {show3D && (
          <HeroExperience
            key={`${env.mobile}-${env.reduced}`}
            section={section}
            mobile={env.mobile}
            reduced={env.reduced}
            onReady={onReady}
            onFail={onFail}
          />
        )}

        <div className="hero-scrim pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Part callout, positioned by the 3D scene */}
        <div data-callout className="hero-callout pointer-events-none absolute left-0 top-0 z-10 opacity-0" aria-hidden="true">
          <span className="callout-dot" />
          <span className="callout-line" />
          <span className="callout-label">
            <span data-callout-index className="t-label text-champagne">01</span>
            <span data-callout-name className="t-label">Hub</span>
          </span>
        </div>

        {/* Caption bands, faded by scroll progress */}
        <div className="hero-bands absolute inset-0 z-10">
          <div data-band data-from="0" data-to="0.125" className="hero-band band-first">
            <p className="t-label text-muted">
              9WERKS <span className="text-champagne">·</span> Aundh, Pune
            </p>
            <h1 className="t-display-xl hero-h1 mt-6">
              <span className="block">A crew for</span>
              <span className="block">your luxe ride.</span>
            </h1>
            <p className="t-body-l mt-6 max-w-[34ch] text-muted">
              Exotic, supercar and sports car specialists.
            </p>
            <div className="static-only">
              <Ctas />
            </div>
            <p className="scroll-cue t-label mt-12 flex items-center gap-4 text-muted" aria-hidden="true">
              <span className="cue-line" /> Scroll to assemble
            </p>
          </div>

          <div data-band data-from="0.14" data-to="0.465" className="hero-band">
            <p className="t-label text-champagne">Chapter 01 · The wheel</p>
            <h2 className="t-display-l mt-5 max-w-[12ch]">Every car starts at the centre.</h2>
            <p className="t-body-l mt-6 max-w-[38ch] text-muted">
              Hub, spokes, rim, brake disc, caliper, tyre and centre cap. Seven parts, fitted in order.
            </p>
          </div>

          <div data-band data-from="0.48" data-to="0.695" className="hero-band">
            <p className="t-label text-champagne">Chapter 02 · The car</p>
            <h2 className="t-display-l mt-5 max-w-[12ch]">Then the car around it.</h2>
            <p className="t-body-l mt-6 max-w-[38ch] text-muted">
              Chassis, panels, glass and light, each one back where it belongs.
            </p>
          </div>

          <div data-band data-from="0.71" data-to="0.845" className="hero-band">
            <p className="t-label text-champagne">Chapter 03 · The specialists</p>
            <h2 className="t-display-l mt-5 max-w-[14ch]">Built for the cars you love most.</h2>
            <p className="t-body-l mt-6 max-w-[40ch] text-muted">
              BMW, MINI, Porsche, Mercedes-Benz, Land Rover, Bentley, Rolls-Royce and Lamborghini, looked after in Aundh, Pune.
            </p>
          </div>

          <div data-band data-from="0.86" data-to="1" className="hero-band band-last">
            <p className="t-label text-champagne">Your car, our crew</p>
            <h2 className="t-display-l mt-5 max-w-[12ch]">Ready when your car is.</h2>
            <div className="mt-8">
              <FinishSelector />
            </div>
            <Ctas />
          </div>
        </div>

        {/* Assembly Index dial */}
        <div className="hero-dial absolute bottom-[clamp(28px,5vh,56px)] right-[var(--gutter)] z-10 hidden md:block" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" strokeWidth="1" />
            <circle data-dial-arc cx="50" cy="50" r="46" fill="none" stroke="var(--champagne)" strokeWidth="1" strokeDasharray="289" strokeDashoffset="289" />
            {Array.from({ length: 7 }, (_, i) => {
              const a = (i / 7) * Math.PI * 2;
              return (
                <line
                  key={i}
                  data-dial-tick
                  x1={50 + Math.cos(a) * 37}
                  y1={50 + Math.sin(a) * 37}
                  x2={50 + Math.cos(a) * 42}
                  y2={50 + Math.sin(a) * 42}
                  className="dial-tick"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
          <span data-dial-label className="t-label absolute inset-0 grid place-items-center text-ivory">
            00
          </span>
        </div>
      </div>
    </section>
  );
}
