"use client";

import { Component, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scene } from "./Scene";
import { buildTimeline, finalCamera } from "./timeline";
import { createOverlay } from "./overlay";
import { hero, createState } from "./store";
import type { Rig } from "./rig";

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

  const onRig = useCallback((r: Rig) => setRig(r), []);

  // Wire the scroll timeline once the rig exists.
  useEffect(() => {
    if (!rig) return;
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
        scrub: mobile ? 0.6 : 1.1,
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
  }, [rig, reduced, mobile, section, overlay]);

  // Rest the render loop entirely while the hero is off screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(section);
    return () => io.disconnect();
  }, [section]);

  // Reveal once the first frame with the full rig has rendered.
  useEffect(() => {
    if (!rig) return;
    const id = setTimeout(() => {
      setReady(true);
      onReady();
    }, 350);
    return () => clearTimeout(id);
  }, [rig, onReady]);

  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      >
        <CanvasBoundary onFail={onFail}>
          <Canvas
            frameloop={visible ? "demand" : "never"}
            dpr={mobile ? [1, 1.25] : [1, 1.75]}
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
              <Scene mobile={mobile} reduced={reduced} onRig={onRig} />
            </Suspense>
            <FrameSync overlay={overlay} />
          </Canvas>
        </CanvasBoundary>
      </div>
      <Loader done={ready} />
    </>
  );
}
