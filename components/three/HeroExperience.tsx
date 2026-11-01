"use client";

import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scene, type Tier } from "./Scene";
import { buildTimeline, finalCamera, startCamera } from "./timeline";
import { createOverlay } from "./overlay";
import { hero, createState } from "./store";
import { updateRig, type Rig } from "./rig";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  section: HTMLElement;
  mobile: boolean;
  reduced: boolean;
  onReady: () => void;
  onFail: () => void;
};

class CanvasBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[9WERKS] 3D scene unavailable, showing the still image instead.", error);
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Runs the overlay every rendered frame so callouts track the damped camera. */
function FrameSync({ overlay }: { overlay: ReturnType<typeof createOverlay> }) {
  const { invalidate } = useThree();
  useEffect(() => {
    hero.invalidate = invalidate;
    invalidate();
  }, [invalidate]);
  // Default priority: a positive one would take over rendering from R3F.
  useFrame(() => overlay.update());
  return null;
}

/**
 * Compiles every shader and uploads every texture before the hero is shown.
 * Without this, each part, light and floor compiles the first time it appears,
 * mid-scroll, which on Windows freezes the page for up to seconds at a time.
 * Everything is posed fully assembled with the lights and showroom on, compiled,
 * and rendered through the real pipeline for a few frames behind the loader.
 */
function Warmup({ rig, reduced, onDone }: { rig: Rig | null; reduced: boolean; onDone: () => void }) {
  const { gl, scene, camera, invalidate } = useThree();
  useEffect(() => {
    if (!rig) return;
    let cancelled = false;
    const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
    (async () => {
      hero.warm = true;
      Object.assign(hero.state, createState(true));
      // Park the camera on the shot the visitor will see first.
      if (reduced) finalCamera(rig);
      else startCamera(rig);
      // Artwork textures arrive asynchronously; include them if they come quickly.
      await Promise.race([hero.artworkReady ?? Promise.resolve(), new Promise((r) => setTimeout(r, 3000))]);
      updateRig(rig, hero.state, 1);
      scene.updateMatrixWorld(true);
      scene.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
          for (const value of Object.values(mat)) if ((value as THREE.Texture)?.isTexture) gl.initTexture(value as THREE.Texture);
        }
      });
      try {
        await gl.compileAsync(scene, camera);
      } catch {
        gl.compile(scene, camera);
      }
      // A few real frames: post-processing, mirror floor and shadows compile too.
      for (let i = 0; i < 4 && !cancelled; i++) {
        invalidate();
        await frame();
      }
      if (cancelled) return;
      hero.warm = false;
      Object.assign(hero.state, createState(false));
      hero.snapCamera = true;
      invalidate();
      onDone();
    })();
    return () => {
      cancelled = true;
      hero.warm = false;
    };
  }, [rig, reduced, gl, scene, camera, invalidate, onDone]);
  return null;
}

/**
 * Watches real frame times while the hero is animating and steps quality down
 * when a machine cannot keep up (or back up when it has headroom). Only
 * back-to-back frames count, so idle pauses in demand rendering are ignored.
 */
function AdaptiveQuality({ tier, setTier, max }: { tier: Tier; setTier: (t: Tier) => void; max: Tier }) {
  const samples = useRef<number[]>([]);
  const last = useRef(0);
  const changes = useRef(0);
  const goodWindows = useRef(0);
  useFrame(() => {
    const now = performance.now();
    const dt = now - last.current;
    last.current = now;
    if (dt <= 0 || dt > 120) return; // not a continuous run of frames
    const buf = samples.current;
    buf.push(dt);
    if (buf.length < 45) return;
    const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
    buf.length = 0;
    if (avg > 26 && tier > 0) {
      // Below ~38 fps: step down straight away.
      goodWindows.current = 0;
      changes.current++;
      setTier((tier - 1) as Tier);
    } else if (avg < 17.5 && tier < max && changes.current < 3) {
      // Comfortably at 60 fps for three windows in a row: try one step up.
      if (++goodWindows.current >= 3) {
        goodWindows.current = 0;
        changes.current++;
        setTier((tier + 1) as Tier);
      }
    } else {
      goodWindows.current = 0;
    }
  });
  return null;
}

/**
 * Starting quality step. Integrated and mobile-class GPUs start on the light
 * step instead of discovering it mid-scroll (changing step rebuilds the
 * post-processing chain, which is itself a small hitch). Faster machines can
 * still climb from there.
 */
function initialTier(mobile: boolean): Tier {
  if (mobile) return 1;
  try {
    const gl = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
    if (!gl) return 0;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/intel|uhd|hd graphics|iris|mali|adreno|powervr|apple gpu|swiftshader|llvmpipe|basic render/i.test(renderer)) return 0;
  } catch {
    return 0;
  }
  return 1;
}

/** Honest load progress for the model, HDRI and textures. */
function Loader({ done }: { done: boolean }) {
  const { progress } = useProgress();
  const pct = Math.round(progress);
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 grid place-items-center bg-obsidian transition-opacity duration-1000 ${
        done ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden={done}
    >
      <div className="flex flex-col items-center gap-6" role="status" aria-live="polite">
        <svg viewBox="0 0 48 48" className="h-16 w-16 -rotate-90" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="var(--line)" strokeWidth="1" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--champagne)"
            strokeWidth="1"
            strokeDasharray="126"
            strokeDashoffset={126 - (126 * pct) / 100}
            style={{ transition: "stroke-dashoffset 300ms var(--ease-out)" }}
          />
        </svg>
        <p className="t-label text-muted">
          Preparing the workshop <span className="tabular text-ivory">{String(pct).padStart(2, "0")}%</span>
        </p>
      </div>
    </div>
  );
}

export default function HeroExperience({ section, mobile, reduced, onReady, onFail }: Props) {
  const [rig, setRig] = useState<Rig | null>(null);
  const [ready, setReady] = useState(false);
  const [overlay] = useState(() => createOverlay(section));
  const [visible, setVisible] = useState(true);
  // Desktop starts at the middle step and earns the top one; phones run the
  // light path and may only step down further (pixel ratio).
  const [startTier] = useState<Tier>(() => initialTier(mobile));
  const [tier, setTier] = useState<Tier>(startTier);
  // Integrated GPUs stay on the light step: the opening scenes are cheap enough
  // to tempt a step up that the car scenes would then have to undo.
  const maxTier: Tier = mobile ? 1 : startTier === 0 ? 0 : 2;
  // Pixel ratio per step.
  const dpr = mobile ? (tier >= 1 ? 1.25 : 1) : tier === 2 ? 1.5 : tier === 1 ? 1.25 : 1;

  const onRig = useCallback((r: Rig) => setRig(r), []);
  const onWarm = useCallback(() => setReady(true), []);

  // Wire the scroll timeline once the rig exists.
  useEffect(() => {
    if (!rig || !ready) return;
    if (reduced) {
      Object.assign(hero.state, createState(true));
      hero.progress = 1;
      finalCamera(rig);
      overlay.update();
      hero.invalidate();
    } else {
      Object.assign(hero.state, createState(false));
      const tl = buildTimeline(rig);
      tl.eventCallback("onUpdate", () => {
        hero.progress = tl.progress();
        hero.invalidate();
      });
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        // Lenis already smooths the wheel on desktop, and the camera eases on
        // top; a long scrub on top of both reads as lag, not smoothness.
        scrub: mobile ? 0.4 : 0.5,
        animation: tl,
      });
      ScrollTrigger.refresh();
      tl.progress(st.progress);
      hero.progress = st.progress;
      overlay.update();
      hero.invalidate();
      return () => {
        st.kill();
        tl.kill();
      };
    }
  }, [rig, ready, reduced, mobile, section, overlay]);

  // Rest the render loop entirely while the hero is off screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(section);
    return () => io.disconnect();
  }, [section]);

  // Exposed for diagnostics (scripts/perf-hero.mjs reads it).
  useEffect(() => {
    section.setAttribute("data-tier", String(tier));
  }, [section, tier]);

  // Reveal once warm-up has compiled everything.
  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);

  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      >
        <CanvasBoundary onFail={onFail}>
          <Canvas
            frameloop={visible ? "demand" : "never"}
            dpr={Math.min(dpr, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1)}
            camera={{ fov: 28, near: 0.05, far: 80, position: [4, 1, 5] }}
            gl={{ antialias: mobile, powerPreference: "high-performance", alpha: false, stencil: false }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.AgXToneMapping;
              gl.toneMappingExposure = 1.05;
            }}
            aria-hidden="true"
            tabIndex={-1}
          >
            <Suspense fallback={null}>
              <Scene mobile={mobile} reduced={reduced} tier={tier} startTier={startTier} onRig={onRig} />
            </Suspense>
            <FrameSync overlay={overlay} />
            <Warmup rig={rig} reduced={reduced} onDone={onWarm} />
            {!reduced && <AdaptiveQuality tier={tier} setTier={setTier} max={maxTier} />}
          </Canvas>
        </CanvasBoundary>
      </div>
      <Loader done={ready} />
    </>
  );
}
