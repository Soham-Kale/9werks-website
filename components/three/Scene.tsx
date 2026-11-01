"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Vehicle } from "./Vehicle";
import { hero } from "./store";
import type { Rig } from "./rig";

/**
 * Quality step, set by the frame-rate monitor in HeroExperience.
 * 2: mirror floor, 4x MSAA. 1: matte floor, 2x MSAA. 0: matte floor, no MSAA.
 * Pixel ratio is chosen per step in HeroExperience.
 */
export type Tier = 0 | 1 | 2;

type Quality = { mobile: boolean; reduced: boolean };

const UP = new THREE.Vector3(0, 1, 0);

/** Applies the timeline's camera with frame-rate independent damping. */
function CameraRig({ mobile, reduced }: Quality) {
  // Scratch vectors, reused every frame so the camera never allocates.
  const v = useRef({
    pos: new THREE.Vector3(),
    tgt: new THREE.Vector3(),
    desired: new THREE.Vector3(),
    target: new THREE.Vector3(),
    rel: new THREE.Vector3(),
  });
  const first = useRef(true);
  const pointer = useRef({ x: 0, y: 0 });

  // Everything mutable comes from the frame state, not from render-time hooks.
  useFrame((state, dt) => {
    const { size, invalidate } = state;
    const { pos, tgt, desired, target, rel } = v.current;
    const c = hero.cam;
    const cam = state.camera as THREE.PerspectiveCamera;
    target.set(c.tx, c.ty, c.tz);
    desired.set(c.px, c.py, c.pz);
    // Portrait screens: pull the camera back so the subject fits.
    const aspect = size.width / size.height;
    if (aspect < 1.2) desired.sub(target).multiplyScalar(1 + (1.2 - aspect) * 1.55).add(target);

    // Scene 5 orbit, plus a slow idle drift once the car is finished.
    const idle = !reduced && hero.progress > 0.995 ? state.clock.elapsedTime * 0.05 : 0;
    const angle = hero.state.orbit * (mobile ? 0.35 : 0.75) + idle;
    if (angle) {
      rel.copy(desired).sub(target).applyAxisAngle(UP, angle);
      desired.copy(target).add(rel);
    }
    // A touch of pointer parallax on desktop.
    if (!mobile && !reduced) {
      pointer.current.x += (state.pointer.x - pointer.current.x) * 0.04;
      pointer.current.y += (state.pointer.y - pointer.current.y) * 0.04;
      desired.x += pointer.current.x * 0.12;
      desired.y += pointer.current.y * 0.06;
    }

    if (first.current || reduced || hero.snapCamera) {
      pos.copy(desired);
      tgt.copy(target);
      first.current = false;
      hero.snapCamera = false;
    } else {
      const k = 1 - Math.pow(1 - 0.14, Math.min(dt, 0.1) * 60);
      pos.lerp(desired, k);
      tgt.lerp(target, k);
    }
    cam.position.copy(pos);
    cam.lookAt(tgt);
    // Wide screens: shift the subject right of centre, leaving the left
    // third calm for the captions.
    const shift = !mobile && aspect > 1.2 ? -size.width * (0.11 + 0.05 * (1 - THREE.MathUtils.smoothstep(hero.progress, 0.08, 0.18))) * (1 - hero.state.showroom * 0.6) : 0;
    if (Math.abs((cam.view?.offsetX ?? 0) - shift) > 0.5 || (shift === 0 && cam.view)) {
      if (shift === 0) cam.clearViewOffset();
      else cam.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
    }
    if (Math.abs(cam.fov - c.fov) > 0.01) {
      cam.fov += (c.fov - cam.fov) * 0.1;
      cam.updateProjectionMatrix();
    }

    // Keep rendering while easing, while the idle orbit runs, or while the
    // pointer is settling; otherwise the loop rests.
    const moving =
      pos.distanceToSquared(desired) > 1e-7 ||
      tgt.distanceToSquared(target) > 1e-7 ||
      idle > 0 ||
      Math.abs(state.pointer.x - pointer.current.x) > 1e-3;
    if (moving) invalidate();
  });
  return null;
}

/**
 * Contact shadows recalculate only while parts are moving onto the car.
 * Before that there is nothing on the floor to shadow; after it the car is
 * still and the shadow is drawn once and kept, so the extra depth render
 * stops costing anything.
 */
function Shadows({ light }: { light: boolean }) {
  // On the light path the assembling phase is not live either: the shadow is
  // redrawn in ~7 steps as the car comes together (each step a key change).
  const [phase, setPhase] = useState<string>("0");
  const current = useRef("0");
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const s = hero.state;
    const pr = hero.progress;
    const p = hero.warm ? "1" : pr < 0.45 ? "0" : pr < 0.72 ? (light ? `1-${Math.floor(pr * 25)}` : "1") : "2";
    if (p !== current.current) {
      current.current = p;
      setPhase(p);
    }
    const mesh = group.current?.children[0] as THREE.Mesh | undefined;
    const mat = mesh?.material as THREE.Material | undefined;
    if (mat) mat.opacity = Math.min(1, s.chassis * 0.6 + s.body * 0.35);
  });

  return (
    <ContactShadows
      key={phase}
      ref={group}
      frames={phase === "1" ? Infinity : 1}
      position={[0, 0.001, 0]}
      scale={11}
      blur={2.4}
      far={2.2}
      resolution={light ? 256 : 384}
      opacity={0}
      color="#000000"
    />
  );
}

/** Fades the showroom in: brighter reflections, light strips, reflective floor. */
function Showroom({ mobile, tier, light }: { mobile: boolean; tier: Tier; light: boolean }) {
  const strips = useRef<THREE.Group>(null);
  const matte = useRef<THREE.Mesh>(null);
  const mirror = useRef<THREE.Mesh>(null);
  const mirrorMat = useRef<THREE.MeshStandardMaterial & { mixStrength?: number }>(null);

  useFrame((state) => {
    const s = hero.state;
    const show = s.showroom;
    state.scene.environmentIntensity = 0.55 + show * 0.55;
    if (strips.current) {
      strips.current.visible = hero.warm || show > 0.01;
      strips.current.children.forEach((c) => {
        const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = show;
      });
    }
    // The mirror floor re-renders the whole scene each frame, so it only
    // exists once the showroom is on, and only at the top quality step.
    // A hidden mesh skips that extra render entirely.
    const useMirror = !mobile && (hero.warm || (tier === 2 && show > 0.01));
    if (mirror.current) mirror.current.visible = useMirror;
    if (matte.current) matte.current.visible = !useMirror || hero.warm;
    if (mirrorMat.current && "mixStrength" in mirrorMat.current) mirrorMat.current.mixStrength = 0.4 + show * 3.2;
  });

  return (
    <>
      <mesh ref={matte} rotation-x={-Math.PI / 2} position-y={-0.002}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0a0b0b" roughness={0.6} metalness={0.4} />
      </mesh>
      {!mobile && (
        <mesh ref={mirror} rotation-x={-Math.PI / 2} position-y={-0.0015} visible={false}>
          <planeGeometry args={[60, 60]} />
          <MeshReflectorMaterial
            ref={mirrorMat as never}
            blur={[300, 80]}
            resolution={512}
            mixBlur={1}
            mixStrength={0.4}
            roughness={0.85}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#0b0c0c"
            metalness={0.55}
            mirror={0}
          />
        </mesh>
      )}
      <Shadows light={mobile || light} />
      {/* Overhead light strips, visible once the showroom is on */}
      <group ref={strips} position={[0, 6.2, 0]} visible={false}>
        {[-2.6, 0, 2.6].map((x) => (
          <mesh key={x} position={[x, 0, -0.5]} rotation-x={Math.PI / 2}>
            <planeGeometry args={[0.18, 9]} />
            <meshBasicMaterial color="#f5f3ee" transparent opacity={0} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Lights() {
  const key = useRef<THREE.SpotLight>(null);
  useFrame(() => {
    if (!key.current) return;
    const s = hero.state;
    key.current.intensity = 50 + s.body * 40 + s.showroom * 30;
  });
  return (
    <>
      <ambientLight intensity={0.06} />
      {/* One key light. Fill comes from the studio environment, which costs
          nothing per light; each extra spot is evaluated on every lit pixel. */}
      <spotLight ref={key} position={[-2.5, 8.5, -3.5]} angle={0.6} penumbra={0.9} intensity={60} color="#fffaf0" decay={1.6} />
    </>
  );
}

/**
 * startTier is the quality step chosen at load and never changes: anything
 * that alters the shader set (lights, bloom) is decided from it once, so
 * later step changes only touch resolution, MSAA and the mirror floor.
 */
export function Scene({ mobile, reduced, tier, startTier, onRig }: Quality & { tier: Tier; startTier: Tier; onRig: (rig: Rig) => void }) {
  const light = mobile || startTier === 0;
  return (
    <>
      <color attach="background" args={["#080909"]} />
      <fog attach="fog" args={["#080909", 13, 34]} />
      <Environment files="/textures/studio_small_09_1k.hdr" resolution={mobile ? 128 : 256} environmentIntensity={0.55}>
        {/* Long softboxes for the classic car-studio reflections */}
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[10, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, 5, 2.5]} rotation-x={Math.PI / 2} scale={[10, 0.6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#f2e8d5" position={[-6, 1.5, 0]} rotation-y={Math.PI / 2} scale={[12, 1.6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#e6ecff" position={[6, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[12, 1.6, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#b6aa91" position={[0, 2, 7]} scale={2.5} />
      </Environment>
      <Lights />
      <Vehicle mobile={mobile} beams={!light} onRig={onRig} />
      <Showroom mobile={mobile} tier={tier} light={light} />
      <CameraRig mobile={mobile} reduced={reduced} />
      {/* Always on for desktop, at every step: dropping it would change the
          output path of every material and force a full recompile. */}
      {!mobile && (
        <EffectComposer multisampling={tier === 2 ? 4 : tier === 1 ? 2 : 0}>
          {!light ? <Bloom mipmapBlur luminanceThreshold={2.6} luminanceSmoothing={0.2} intensity={0.75} radius={0.7} /> : <></>}
          <Vignette offset={0.32} darkness={0.62} />
          <ToneMapping mode={ToneMappingMode.AGX} />
        </EffectComposer>
      )}
    </>
  );
}
