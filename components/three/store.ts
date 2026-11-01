import type { FinishId } from "@/config/vehicle";

// Values the scroll timeline writes and the 3D scene reads every frame.
// A plain mutable object, never React state, so scrolling causes no renders.
export type AssemblyState = {
  medallion: number; // 0 medallion pose -> 1 seated as the hero wheel's centre cap
  intro: number; // medallion presence (0 hidden, 1 lit) for the opening
  hub: number;
  spokes: number;
  rim: number;
  disc: number;
  caliper: number;
  tyre: number;
  cap: number;
  wheelHome: number; // hero wheel travels from showcase to its arch
  otherWheels: number;
  chassis: number;
  interior: number;
  body: number;
  glass: number;
  lights: number;
  mirrors: number;
  trim: number;
  headlights: number;
  showroom: number;
  orbit: number;
};

export const WHEEL_STEPS = ["hub", "spokes", "rim", "disc", "caliper", "tyre", "cap"] as const;
export type WheelStep = (typeof WHEEL_STEPS)[number];

export const WHEEL_LABELS: Record<WheelStep, string> = {
  hub: "Hub",
  spokes: "Spokes",
  rim: "Rim",
  disc: "Brake disc",
  caliper: "Caliper",
  tyre: "Tyre",
  cap: "Centre cap",
};

export const createState = (complete = false): AssemblyState => {
  const v = complete ? 1 : 0;
  return {
    medallion: v, intro: 1, hub: v, spokes: v, rim: v, disc: v, caliper: v, tyre: v, cap: v,
    wheelHome: v, otherWheels: v, chassis: v, interior: v, body: v, glass: v, lights: v,
    mirrors: v, trim: v, headlights: v, showroom: v, orbit: v,
  };
};

export const camState = () => ({ px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, fov: 30 });
export type CamState = ReturnType<typeof camState>;

/** Shared between the timeline, the R3F scene and the HTML overlay. */
export const hero = {
  state: createState(),
  cam: camState(),
  progress: 0,
  finish: "obsidian" as FinishId,
  /** set by the scene: projects a wheel part to screen space for callouts */
  project: null as null | ((step: WheelStep) => { x: number; y: number; visible: boolean }),
  invalidate: () => {},
  /** true while the scene is being pre-compiled behind the loader: every part, light and floor shown at once */
  warm: false,
  /** set once after warm-up: the camera jumps to its shot instead of easing in from nowhere */
  snapCamera: false,
  /** resolves when the centre-cap artwork textures exist, so warm-up can upload them too */
  artworkReady: null as Promise<void> | null,
};

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as unknown as { __hero: typeof hero }).__hero = hero;
}

const finishListeners = new Set<(id: FinishId) => void>();
export function setFinish(id: FinishId) {
  hero.finish = id;
  finishListeners.forEach((fn) => fn(id));
}
export function onFinish(fn: (id: FinishId) => void) {
  finishListeners.add(fn);
  return () => {
    finishListeners.delete(fn);
  };
}
