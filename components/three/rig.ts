import * as THREE from "three";
import { vehicleConfig as cfg, type VehicleGroup, type WheelPart } from "@/config/vehicle";
import { WHEEL_STEPS, type WheelStep, type AssemblyState } from "./store";
import { createEmblemFaceMaps, createPlateTexture, type FaceMaps } from "./textures";
import { brandConfig } from "@/config/brand";

// Turns a loaded car model into an assembly rig: every animatable part with a
// home transform and an exploded offset. All model-specific knowledge comes
// from config/vehicle.ts.

export type Part = {
  obj: THREE.Object3D;
  home: THREE.Vector3;
  homeRot: THREE.Euler;
  offset: THREE.Vector3; // in the parent's local space
  spin: THREE.Vector3; // extra rotation while exploded, radians
  delay: number; // stagger inside its group, 0..0.4
};

export type Wheel = {
  name: string;
  pivot: THREE.Group;
  home: THREE.Vector3;
  outward: 1 | -1;
  radius: number;
  halfWidth: number;
  parts: Record<WheelStep, Part[]>;
  cap: THREE.Group;
  isHero: boolean;
};

export type Rig = {
  root: THREE.Group;
  groups: Record<Exclude<VehicleGroup, "hidden">, Part[]>;
  wheels: Wheel[];
  hero: Wheel & {
    showcasePos: THREE.Vector3;
    showcaseQuat: THREE.Quaternion;
    homeQuat: THREE.Quaternion;
    medallionPos: THREE.Vector3; // cap position in pivot space at medallion pose
    medallionScale: number;
    hoverPos: THREE.Vector3;
    seatPos: THREE.Vector3;
  };
  paint: THREE.MeshPhysicalMaterial[];
  headlights: { mat: THREE.MeshStandardMaterial; base: number }[];
  taillights: { mat: THREE.MeshStandardMaterial; base: number }[];
  headlightAnchors: THREE.Vector3[]; // world space
  /** Headlight beams thrown onto the floor (desktop only), in world space. */
  beams: THREE.Group;
  size: THREE.Vector3;
  faceMaps: FaceMaps;
  dispose: () => void;
};

const test = (rule: { name?: RegExp; material?: RegExp }, names: string[], mats: string[]) =>
  (rule.name ? names.some((n) => rule.name!.test(n)) : true) &&
  (rule.material ? mats.some((m) => rule.material!.test(m)) : true) &&
  (rule.name || rule.material ? true : false);

function ancestry(o: THREE.Object3D, stop: THREE.Object3D) {
  const names: string[] = [];
  let p: THREE.Object3D | null = o;
  while (p && p !== stop) {
    if (p.name) names.push(p.name);
    p = p.parent;
  }
  return names;
}
const matNames = (o: THREE.Object3D) => {
  const m = (o as THREE.Mesh).material;
  if (!m) return [];
  return (Array.isArray(m) ? m : [m]).map((x) => x.name ?? "");
};

function makePart(obj: THREE.Object3D, offsetLocal: THREE.Vector3, spin = new THREE.Vector3(), delay = 0): Part {
  return { obj, home: obj.position.clone(), homeRot: obj.rotation.clone(), offset: offsetLocal, spin, delay };
}

/** Converts a world-space offset into the parent's local space for `obj`. */
function localOffset(obj: THREE.Object3D, worldOffset: THREE.Vector3) {
  const parent = obj.parent!;
  const wp = obj.getWorldPosition(new THREE.Vector3());
  const a = parent.worldToLocal(wp.clone());
  const b = parent.worldToLocal(wp.clone().add(worldOffset));
  return b.sub(a);
}

/**
 * Where the rim's hub face is, along the wheel axis (X, in wheel space): the
 * outermost point of the rim and spoke geometry within the cap's radius of
 * the axis. Spokes on most alloys are dished, so a fixed fraction of the
 * wheel width leaves the cap floating in front of them. Returns null if the
 * rim has no geometry near the centre (open centre bore).
 */
function hubFace(objs: THREE.Object3D[], capRadius: number, outward: 1 | -1): number | null {
  const v = new THREE.Vector3();
  let best: number | null = null;
  const r2 = (capRadius * 1.3) ** 2;
  for (const obj of objs) {
    obj.updateMatrix();
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      const pos = mesh.isMesh ? mesh.geometry.getAttribute("position") : null;
      if (!pos) return;
      // Matrix from this mesh into wheel (pivot) space.
      const m = new THREE.Matrix4();
      for (let p: THREE.Object3D | null = mesh; p && p !== obj.parent; p = p.parent) {
        p.updateMatrix();
        m.premultiply(p.matrix);
      }
      const step = Math.max(1, Math.floor(pos.count / 20000));
      for (let i = 0; i < pos.count; i += step) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m);
        if (v.y * v.y + v.z * v.z > r2) continue;
        const x = v.x * outward;
        if (best === null || x > best) best = x;
      }
    });
  }
  return best === null ? null : best * outward;
}

function buildCap(radius: number, outward: 1 | -1, faceMaps: FaceMaps) {
  const group = new THREE.Group();
  group.name = "9WERKS_CentreCap";
  const metal = new THREE.MeshPhysicalMaterial({
    color: "#46474a",
    metalness: 1,
    roughness: 0.24,
    clearcoat: 0.6,
    clearcoatRoughness: 0.08,
  });
  const face = new THREE.MeshPhysicalMaterial({
    map: faceMaps.map,
    roughnessMap: faceMaps.roughnessMap,
    bumpMap: faceMaps.bumpMap,
    bumpScale: 2.2,
    metalness: 1,
    roughness: 1,
    clearcoat: 0.4,
    clearcoatRoughness: 0.12,
  });
  const depth = radius * 0.16;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.02, depth, 96, 1), [metal, face, metal]);
  body.rotation.z = outward === 1 ? -Math.PI / 2 : Math.PI / 2; // +Y face -> outward along X
  // Rotate the face so the emblem stands upright when seen from outside.
  body.rotateY(outward === 1 ? Math.PI : 0);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.99, radius * 0.05, 24, 128), metal);
  bezel.rotation.y = Math.PI / 2;
  bezel.position.x = outward * depth * 0.5;
  group.add(body, bezel);
  group.userData.materials = [metal, face];
  return group;
}

function buildHub(radius: number, outward: 1 | -1) {
  const group = new THREE.Group();
  group.name = "9WERKS_Hub";
  const mat = new THREE.MeshStandardMaterial({ color: "#3c3d3f", metalness: 0.95, roughness: 0.35 });
  const studMat = new THREE.MeshStandardMaterial({ color: "#b9b6ae", metalness: 1, roughness: 0.18 });
  const hubR = radius * 0.3;
  const len = radius * 0.32;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(hubR, hubR * 1.15, len, 64), mat);
  body.rotation.z = Math.PI / 2;
  body.position.x = -outward * len * 0.35;
  group.add(body);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(hubR * 0.09, hubR * 0.09, len * 0.9, 16), studMat);
    stud.rotation.z = Math.PI / 2;
    stud.position.set(outward * len * 0.25, Math.cos(a) * hubR * 0.62, Math.sin(a) * hubR * 0.62);
    group.add(stud);
  }
  return group;
}

/**
 * opts.beams: add the two headlight spot beams. Every light is evaluated for
 * every lit pixel, even at zero intensity, so integrated GPUs go without.
 */
export function buildRig(source: THREE.Object3D, opts: { mobile: boolean; beams: boolean }): Rig {
  const model = source.clone(true);
  const inner = new THREE.Group();
  const root = new THREE.Group();
  inner.add(model);
  root.add(inner);
  root.name = "VehicleRoot";

  // Normalise: longest horizontal side = targetLength, centred, sitting on y=0.
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = cfg.targetLength / Math.max(size.x, size.z);
  inner.position.set(-center.x, -box.min.y, -center.z);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);

  const faceMaps = createEmblemFaceMaps(opts.mobile ? 512 : 1024);
  const disposables: { dispose: () => void }[] = [faceMaps.map, faceMaps.roughnessMap, faceMaps.bumpMap];

  // ---------- Materials ----------
  const paint: THREE.MeshPhysicalMaterial[] = [];
  const headlights: Rig["headlights"] = [];
  const taillights: Rig["taillights"] = [];
  const seen = new Set<THREE.Material>();
  model.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of list) {
      if (seen.has(m)) continue;
      seen.add(m);
      const std = m as THREE.MeshPhysicalMaterial;
      for (const ov of cfg.materialOverrides) {
        if (!ov.material.test(m.name)) continue;
        if (ov.color) std.color?.set(ov.color);
        if (ov.metalness !== undefined) std.metalness = ov.metalness;
        if (ov.roughness !== undefined) std.roughness = ov.roughness;
        if (ov.stripTextures) {
          std.map = null;
          std.normalMap = null;
          std.bumpMap = null;
          std.needsUpdate = true;
        }
      }
      if (cfg.paintMaterial.test(m.name) && std.isMeshStandardMaterial) {
        std.clearcoat = 1;
        std.clearcoatRoughness = 0.04;
        paint.push(std);
      }
      if (cfg.headlightMaterial.test(m.name)) {
        std.emissive.set("#fff6e8");
        headlights.push({ mat: std, base: std.emissiveIntensity });
      }
      if (cfg.taillightMaterial.test(m.name)) taillights.push({ mat: std, base: std.emissiveIntensity });
      // Glass: a tinted pane rather than true transmission. Transmission makes
      // three.js render every opaque object a second time, each frame, for
      // what is a dark window: too costly for a scroll animation.
      if (/glass/i.test(m.name) && std.isMeshPhysicalMaterial) {
        std.transmission = 0;
        std.transparent = true;
        std.opacity = 0.42;
        std.color.set("#0b0d0f");
        std.roughness = 0.05;
        std.metalness = 0.2;
      }
    }
  });

  // ---------- Wheels ----------
  const wheelContainers: THREE.Object3D[] = [];
  model.traverse((o) => {
    if (cfg.wheel.name?.test(o.name) && !(o as THREE.Mesh).isMesh) wheelContainers.push(o);
  });

  const wheels: Wheel[] = [];
  const inWheel = new Set<THREE.Object3D>();

  for (const container of wheelContainers) {
    const wb = new THREE.Box3().setFromObject(container);
    const wc = wb.getCenter(new THREE.Vector3());
    const ws = wb.getSize(new THREE.Vector3());
    const pivot = new THREE.Group();
    pivot.name = `${container.name}_Pivot`;
    inner.add(pivot);
    pivot.position.copy(inner.worldToLocal(wc.clone()));
    pivot.updateMatrixWorld(true);

    const meshes: THREE.Mesh[] = [];
    container.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
    });
    meshes.forEach((m) => {
      pivot.attach(m);
      inWheel.add(m);
    });
    container.removeFromParent();

    const localCenter = inner.worldToLocal(wc.clone());
    const outward: 1 | -1 = localCenter.x + inner.position.x >= 0 ? 1 : -1;
    // radius/width measured in pivot (model) units
    const radius = (ws.y / scale) * 0.5;
    const halfWidth = (ws.x / scale) * 0.5;

    const parts = Object.fromEntries(WHEEL_STEPS.map((s) => [s, [] as Part[]])) as Record<WheelStep, Part[]>;
    const ruleOrder: [WheelPart, { name?: RegExp; material?: RegExp }][] = Object.entries(cfg.wheelParts) as never;
    for (const m of meshes) {
      const names = ancestry(m, model).concat(m.name);
      const mats = matNames(m);
      const hit = ruleOrder.find(([, r]) => test(r, names, mats));
      const step = (hit?.[0] ?? "rim") as WheelStep;
      parts[step].push(makePart(m, new THREE.Vector3()));
    }

    const hub = buildHub(radius, outward);
    pivot.add(hub);
    parts.hub.push(makePart(hub, new THREE.Vector3()));

    const capRadius = radius * 0.19;
    const cap = buildCap(capRadius, outward, faceMaps);
    // The cap's back sits on the hub face, slightly recessed into it.
    const face = hubFace([...parts.rim, ...parts.spokes].map((p) => p.obj), capRadius, outward);
    const capDepth = capRadius * 0.16;
    cap.position.x = face !== null ? face + outward * capDepth * 0.3 : outward * halfWidth * 0.86;
    pivot.add(cap);
    parts.cap.push(makePart(cap, new THREE.Vector3()));
    cap.userData.materials.forEach((mm: THREE.Material) => disposables.push(mm));

    // Exploded offsets in pivot space: the wheel axis is X.
    const R = radius;
    const o = outward;
    const setOff = (step: WheelStep, v: THREE.Vector3, spin = new THREE.Vector3()) =>
      parts[step].forEach((p) => {
        p.offset.copy(v);
        p.spin.copy(spin);
      });
    setOff("hub", new THREE.Vector3(-o * R * 2.6, 0, 0), new THREE.Vector3(o * 1.2, 0, 0));
    setOff("spokes", new THREE.Vector3(o * R * 2.4, 0, 0), new THREE.Vector3(-o * 1.6, 0, 0));
    setOff("rim", new THREE.Vector3(o * R * 3.2, 0, 0), new THREE.Vector3(o * 0.6, 0, 0));
    setOff("disc", new THREE.Vector3(-o * R * 3.0, 0, 0), new THREE.Vector3(o * 2.2, 0, 0));
    setOff("caliper", new THREE.Vector3(0, R * 2.4, -R * 0.4));
    setOff("tyre", new THREE.Vector3(o * R * 4.2, 0, 0), new THREE.Vector3(-o * 1.0, 0, 0));
    setOff("cap", new THREE.Vector3(o * R * 1.6, 0, 0));

    wheels.push({ name: container.name, pivot, home: pivot.position.clone(), outward, radius, halfWidth, parts, cap, isHero: cfg.heroWheel.test(container.name) });
  }

  const heroBase = wheels.find((w) => w.isHero) ?? wheels[0];
  if (!heroBase) throw new Error("No wheels found: check vehicleConfig.wheel");
  heroBase.isHero = true;

  // Showcase pose for the hero wheel: out from its arch, raised, turned to camera.
  const o = heroBase.outward;
  const showcasePos = heroBase.home.clone().add(new THREE.Vector3(o * 1.7, heroBase.radius * 1.15, 0.15));
  const showcaseQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -o * 0.32, 0));
  const homeQuat = heroBase.pivot.quaternion.clone();
  const seatPos = heroBase.cap.position.clone();
  const hoverPos = seatPos.clone().add(new THREE.Vector3(o * heroBase.radius * 1.5, 0, 0));
  const medallionPos = seatPos.clone().add(new THREE.Vector3(o * heroBase.radius * 2.6, 0, 0));
  const hero = Object.assign(heroBase, { showcasePos, showcaseQuat, homeQuat, medallionPos, medallionScale: 5.2, hoverPos, seatPos });

  // ---------- Body groups ----------
  const groups: Rig["groups"] = { chassis: [], interior: [], body: [], glass: [], lights: [], mirrors: [], trim: [] };
  const groupOf = new Map<THREE.Object3D, VehicleGroup>();
  const meshList: THREE.Mesh[] = [];
  model.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && !inWheel.has(obj)) meshList.push(obj as THREE.Mesh);
  });
  for (const mesh of meshList) {
    const names = ancestry(mesh, model);
    const mats = matNames(mesh);
    const g = cfg.groups.find(([, r]) => test(r, names, mats))?.[0] ?? "trim";
    groupOf.set(mesh, g);
  }

  // Number plate: replace the model's plate with 9WERKS artwork.
  let plateMesh: THREE.Mesh | null = null;
  for (const mesh of meshList) {
    if (groupOf.get(mesh) !== "hidden") continue;
    if (/license|plate/i.test(ancestry(mesh, model).join(" ")) && !plateMesh) {
      const pb = new THREE.Box3().setFromObject(mesh);
      const pc = pb.getCenter(new THREE.Vector3());
      const ps = pb.getSize(new THREE.Vector3());
      const tex = createPlateTexture(brandConfig.plateText);
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.1 });
      disposables.push(tex, mat);
      plateMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      plateMesh.name = "9WERKS_Plate";
      const facesBack = pc.z < 0;
      inner.add(plateMesh);
      plateMesh.position.copy(inner.worldToLocal(pc.clone()));
      plateMesh.position.z += (facesBack ? -1 : 1) * 0.004;
      plateMesh.scale.set(Math.max(ps.x, 0.3) / scale, (Math.max(ps.y, 0.08) / scale) * 0.98, 1);
      if (facesBack) plateMesh.rotation.y = Math.PI;
      groupOf.set(plateMesh, "trim");
      meshList.push(plateMesh);
    }
    mesh.visible = false;
  }

  root.updateMatrixWorld(true);
  const carCenter = new THREE.Vector3(0, size.y * scale * 0.5, 0);
  const tmp = new THREE.Vector3();
  const anchors: THREE.Vector3[] = [];

  for (const mesh of meshList) {
    const g = groupOf.get(mesh)!;
    if (g === "hidden") continue;
    // Only move the top-most member of a group; children ride along.
    let p = mesh.parent;
    let nested = false;
    while (p && p !== model) {
      if (groupOf.get(p) === g) nested = true;
      p = p.parent;
    }
    if (nested) continue;

    const wc = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
    const radial = tmp.copy(wc).sub(carCenter).setY(0);
    if (radial.lengthSq() < 1e-6) radial.set(0, 0, 1);
    radial.normalize();
    const world = new THREE.Vector3();
    switch (g) {
      case "body": world.copy(radial).multiplyScalar(3.4).add(new THREE.Vector3(0, 1.1, 0)); break;
      case "glass": world.set(0, 2.6, 0).addScaledVector(radial, 0.6); break;
      case "lights": world.set(0, 0.3, Math.sign(wc.z || 1) * 3); break;
      case "mirrors": world.set(Math.sign(wc.x || 1) * 2.2, 0.6, 0); break;
      case "trim": world.copy(radial).multiplyScalar(1.4).add(new THREE.Vector3(0, 1.6, 0)); break;
      case "chassis": world.set(0, -2.4, 0); break;
      case "interior": world.set(0, -1.9, 0); break;
    }
    if (g === "lights" && cfg.headlightMaterial.test(matNames(mesh).join(" "))) anchors.push(wc.clone());
    groups[g].push(makePart(mesh, localOffset(mesh, world)));
  }

  // Stagger each group's parts front to back so they arrive in sequence.
  for (const list of Object.values(groups)) {
    const n = list.length;
    list
      .map((part) => ({ part, z: part.obj.getWorldPosition(tmp).z }))
      .sort((a, b) => b.z - a.z)
      .forEach(({ part }, i) => (part.delay = n > 1 ? (i / (n - 1)) * 0.38 : 0));
  }
  // Other wheels arrive from the outside, spinning.
  for (const w of wheels) {
    if (w.isHero) continue;
    w.pivot.userData.offset = new THREE.Vector3(w.outward * 2.6, 0, 0);
  }

  // Headlight anchors: fall back to the front corners if no material matched.
  if (!anchors.length) {
    anchors.push(new THREE.Vector3(0.6, 0.65, 2.1), new THREE.Vector3(-0.6, 0.65, 2.1));
  }

  const beams = new THREE.Group();
  beams.name = "HeadlightBeams";
  if (opts.beams) {
    for (const a of anchors.slice(0, 2)) {
      const light = new THREE.SpotLight("#fff3e0", 0, 14, 0.42, 0.65, 1.6);
      light.position.copy(a);
      light.target.position.copy(a).add(new THREE.Vector3(0, -0.6, 6));
      beams.add(light, light.target);
    }
  }

  return {
    root,
    beams,
    groups,
    wheels,
    hero,
    paint,
    headlights,
    taillights,
    headlightAnchors: anchors,
    size: size.clone().multiplyScalar(scale),
    faceMaps,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Places a part for group progress k (0 exploded, 1 home). */
export function applyPart(p: Part, k: number) {
  const kk = p.delay ? Math.min(1, Math.max(0, (k - p.delay) / (1 - p.delay))) : k;
  const e = easeOut(kk);
  const inv = 1 - e;
  p.obj.visible = kk > 0.001;
  p.obj.position.set(p.home.x + p.offset.x * inv, p.home.y + p.offset.y * inv, p.home.z + p.offset.z * inv);
  p.obj.rotation.set(p.homeRot.x + p.spin.x * inv, p.homeRot.y + p.spin.y * inv, p.homeRot.z + p.spin.z * inv);
}

const lerp = THREE.MathUtils.lerp;

/** Poses the whole rig for one frame of the timeline state. */
/**
 * cullInterior: once the tinted glass is fitted, stop drawing the interior.
 * Through dark glass it is barely visible, and its ~35 meshes are draw calls
 * the CPU of an integrated-graphics laptop cannot spare.
 */
export function updateRig(rig: Rig, s: AssemblyState, progress: number, cullInterior = false) {
  const w = rig.hero;

  // Hero wheel parts.
  for (const step of WHEEL_STEPS) {
    if (step === "cap") continue;
    for (const p of w.parts[step]) applyPart(p, s[step]);
  }
  // Medallion -> hovering cap -> seated cap.
  const cap = w.cap;
  cap.visible = s.intro > 0.001;
  if (s.cap > 0) {
    cap.position.lerpVectors(w.hoverPos, w.seatPos, THREE.MathUtils.smootherstep(s.cap, 0, 1));
    cap.scale.setScalar(1);
  } else {
    cap.position.lerpVectors(w.medallionPos, w.hoverPos, THREE.MathUtils.smootherstep(s.medallion, 0, 1));
    cap.scale.setScalar(lerp(w.medallionScale, 1, THREE.MathUtils.smootherstep(s.medallion, 0, 1)) * lerp(0.6, 1, s.intro));
  }
  // The medallion turns slowly while it is the subject, then locks.
  cap.rotation.x = w.outward * (1 - s.medallion) * -progress * 2.5;

  // Hero wheel from showcase to its arch.
  const kh = THREE.MathUtils.smootherstep(s.wheelHome, 0, 1);
  w.pivot.position.lerpVectors(w.showcasePos, w.home, kh);
  w.pivot.quaternion.slerpQuaternions(w.showcaseQuat, w.homeQuat, kh);
  // Roll forward into place.
  w.pivot.rotateX(-(1 - kh) * 1.4 * (s.wheelHome > 0 ? 1 : 0));

  // The other three wheels.
  for (const wheel of rig.wheels) {
    if (wheel.isHero) continue;
    const k = THREE.MathUtils.smootherstep(s.otherWheels, 0, 1);
    const off = wheel.pivot.userData.offset as THREE.Vector3;
    wheel.pivot.visible = s.otherWheels > 0.001;
    wheel.pivot.position.copy(wheel.home).addScaledVector(off, 1 - k);
    wheel.pivot.rotation.set(-(1 - k) * 5, 0, 0);
    for (const step of WHEEL_STEPS) for (const p of wheel.parts[step]) applyPart(p, 1);
  }

  // Car groups.
  const g = rig.groups;
  g.chassis.forEach((p) => applyPart(p, s.chassis));
  const hideInterior = cullInterior && s.glass >= 1;
  g.interior.forEach((p) => {
    applyPart(p, s.interior);
    if (hideInterior) p.obj.visible = false;
  });
  g.body.forEach((p) => applyPart(p, s.body));
  g.glass.forEach((p) => applyPart(p, s.glass));
  g.lights.forEach((p) => applyPart(p, s.lights));
  g.mirrors.forEach((p) => applyPart(p, s.mirrors));
  g.trim.forEach((p) => applyPart(p, s.trim));

  // Headlights and tail lights.
  const hl = s.headlights;
  for (const h of rig.headlights) {
    h.mat.emissiveIntensity = lerp(0.02, 14, hl);
  }
  for (const t of rig.taillights) t.mat.emissiveIntensity = lerp(0.1, 4, hl);
  // Beams stay in the scene at zero intensity: hiding a light changes the
  // light count, which makes three.js recompile every lit material at once.
  rig.beams.children.forEach((c) => {
    if ((c as THREE.SpotLight).isSpotLight) (c as THREE.SpotLight).intensity = hl * 30;
  });
}
