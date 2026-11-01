import * as THREE from "three";
import { gsap } from "gsap";
import type { Rig } from "./rig";
import { hero, type CamState } from "./store";

// The whole hero story as one paused GSAP timeline, 1 unit long, scrubbed by
// ScrollTrigger. Positions are in timeline progress (0 to 1) and match the
// table in DESIGN.md §7. Part tweens are linear: each part eases itself.

type Key = { at: number; p: THREE.Vector3; t: THREE.Vector3; fov?: number };

export function cameraKeys(rig: Rig): Key[] {
  const w = rig.hero;
  const inner = rig.root.children[0];
  rig.root.updateMatrixWorld(true);
  const pivotShow = new THREE.Matrix4().compose(w.showcasePos, w.showcaseQuat, new THREE.Vector3(1, 1, 1));
  const toWorld = (v: THREE.Vector3) => v.clone().applyMatrix4(pivotShow).applyMatrix4(inner.matrixWorld);
  const S = toWorld(new THREE.Vector3());
  const M = toWorld(w.medallionPos);
  const o = w.outward;
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const add = (a: THREE.Vector3, x: number, y: number, z: number) => a.clone().add(v(x, y, z));

  return [
    { at: 0, p: add(M, o * 3.0, 0.12, 1.0), t: M.clone(), fov: 28 },
    { at: 0.11, p: add(M, o * 2.9, 0.3, 1.2), t: M.clone().lerp(S, 0.35), fov: 28 },
    { at: 0.18, p: add(S, o * 3.1, 0.55, 1.45), t: S.clone(), fov: 30 },
    { at: 0.32, p: add(S, o * 2.6, 1.05, -1.35), t: S.clone(), fov: 30 },
    { at: 0.46, p: add(S, o * 3.0, 0.35, 0.95), t: S.clone(), fov: 30 },
    { at: 0.58, p: v(o * 6.9, 2.9, 6.5), t: v(0, 0.7, 0.3), fov: 30 },
    { at: 0.7, p: v(o * 5.9, 1.75, 6.6), t: v(0, 0.6, 0), fov: 30 },
    { at: 0.84, p: v(o * 4.7, 0.85, 5.6), t: v(0, 0.55, 0.35), fov: 28 },
    { at: 1, p: v(o * 5.1, 1.2, 5.1), t: v(0, 0.6, 0), fov: 28 },
  ];
}

const setCam = (c: CamState, k: Key) => {
  c.px = k.p.x; c.py = k.p.y; c.pz = k.p.z;
  c.tx = k.t.x; c.ty = k.t.y; c.tz = k.t.z;
  if (k.fov) c.fov = k.fov;
};

export function buildTimeline(rig: Rig) {
  const keys = cameraKeys(rig);
  const s = hero.state;
  setCam(hero.cam, keys[0]);

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  // Fixed length so positions read as progress.
  tl.set({}, {}, 1);

  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const prev = keys[i - 1];
    tl.to(
      hero.cam,
      { px: k.p.x, py: k.p.y, pz: k.p.z, tx: k.t.x, ty: k.t.y, tz: k.t.z, fov: k.fov ?? hero.cam.fov, duration: k.at - prev.at, ease: "power1.inOut" },
      prev.at,
    );
  }

  const span = (key: keyof typeof s, from: number, to: number) => tl.to(s, { [key]: 1, duration: to - from }, from);

  // Scene 1 -> 2: medallion becomes the centre cap, the wheel builds around it.
  span("medallion", 0.1, 0.17);
  span("hub", 0.17, 0.22);
  span("spokes", 0.21, 0.26);
  span("rim", 0.25, 0.3);
  span("disc", 0.29, 0.34);
  span("caliper", 0.33, 0.37);
  span("tyre", 0.36, 0.42);
  span("cap", 0.41, 0.46);
  // Scene 3: the car assembles around the finished wheel.
  span("wheelHome", 0.47, 0.57);
  span("chassis", 0.48, 0.55);
  span("otherWheels", 0.51, 0.58);
  span("interior", 0.53, 0.59);
  span("body", 0.56, 0.65);
  span("glass", 0.62, 0.67);
  span("lights", 0.64, 0.68);
  span("mirrors", 0.65, 0.69);
  span("trim", 0.66, 0.7);
  // Scene 5: lights on, showroom, orbit.
  span("showroom", 0.82, 0.94);
  span("headlights", 0.86, 0.9);
  span("orbit", 0.88, 1);

  return tl;
}

/** Final frame for reduced motion: every value at 1, camera at the last key. */
export function finalCamera(rig: Rig) {
  const keys = cameraKeys(rig);
  setCam(hero.cam, keys[keys.length - 1]);
}
