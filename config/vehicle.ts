// How the 3D scene reads a car model. Nothing in components/three assumes mesh
// names: every assumption lives here. When the licensed car.glb arrives, run
//
//   node scripts/inspect-glb.mjs public/models/car.glb
//
// and adjust the patterns below to match its node and material names.
// Patterns are tested against a mesh's own name, every ancestor's name and
// its material name. The first group whose rule matches wins.

export type VehicleGroup = "chassis" | "interior" | "body" | "glass" | "lights" | "mirrors" | "trim" | "hidden";
export type WheelPart = "hub" | "spokes" | "rim" | "disc" | "caliper" | "tyre" | "cap";

type Rule = { name?: RegExp; material?: RegExp };

export const vehicleConfig = {
  modelUrl: "/models/car.glb",
  /** true while the placeholder from CREDITS.md is in use */
  placeholder: true,

  /** Direction the car's nose points in model space. */
  forward: [0, 0, 1] as [number, number, number],
  /** The car is scaled so its longest side matches this length, in metres. */
  targetLength: 4.5,

  /** Containers holding one wheel each (rim, tyre, brakes). */
  wheel: { name: /^Wheel(Front|Rear)(L|R)$/i } as Rule,
  /** The wheel assembled up close in scene 2 (front wheel on the camera side). */
  heroWheel: /^WheelFrontL$/i,

  /** How to split a wheel into its parts. Hub and centre cap are added by the scene. */
  wheelParts: {
    disc: { name: /disc|rotor/i },
    caliper: { name: /caliper|brakepad|brake_pad/i },
    tyre: { material: /tire|tyre|rubber/i },
    spokes: { material: /^Rim2$/i },
    rim: { material: /rim|wheel|alloy/i },
  } satisfies Partial<Record<WheelPart, Rule>>,

  /** Order matters: first match wins. Unmatched meshes fall into "trim". */
  groups: [
    ["hidden", { name: /license|plate|emblem|badge|logo/i }],
    ["glass", { material: /glass|window/i }],
    ["lights", { material: /headlight|brakelight|signallight|taillight|lamp/i }],
    ["lights", { name: /headlight|taillight|turnsignal/i }],
    ["mirrors", { name: /mirror/i }],
    ["chassis", { name: /underside|axle|engine|chassis|floor$/i }],
    ["interior", { name: /^interior/i }],
    ["body", { material: /paint/i }],
    ["trim", { name: /.*/ }],
  ] as [VehicleGroup, Rule][],

  /** Colour corrections for the placeholder model's red interior trim. */
  materialOverrides: [
    { material: /^Interior 3/i, color: "#3a322b", roughness: 0.55 },
    { material: /^Interior 2/i, color: "#1d1d1e" },
    { material: /^Rim1$/i, color: "#2b2c2d", metalness: 0.9, roughness: 0.28 },
    { material: /^Rim2$/i, color: "#8d8f91", metalness: 1, roughness: 0.22 },
  ] as { material: RegExp; color?: string; metalness?: number; roughness?: number }[],

  /** Materials repainted by the finish selector. */
  paintMaterial: /paint/i,
  /** Emissive headlight materials switched on in scene 5. */
  headlightMaterial: /headlight/i,
  taillightMaterial: /brakelight|taillight/i,
};

export const finishes = [
  { id: "obsidian", label: "Obsidian", color: "#0d0e0f", metalness: 0.75, roughness: 0.32, clearcoat: 1 },
  { id: "ivory", label: "Ivory", color: "#d9d5cc", metalness: 0.35, roughness: 0.3, clearcoat: 1 },
  { id: "champagne", label: "Champagne", color: "#8f8167", metalness: 0.85, roughness: 0.28, clearcoat: 1 },
] as const;

export type FinishId = (typeof finishes)[number]["id"];
