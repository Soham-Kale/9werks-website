"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Vehicle } from "./Vehicle";
import { hero } from "./store";
import type { Rig } from "./rig";

type Quality = { mobile: boolean; reduced: boolean };

const UP = new THREE.Vector3(0, 1, 0);

/** Applies the timeline's camera with frame-rate independent damping. */
function CameraRig({ mobile, reduced }: Quality) {
  const pos = useRef(new THREE.Vector3());
  const tgt = useRef(new THREE.Vector3());
  const first = useRef(true);
  const pointer = useRef({ x: 0, y: 0 });

  // Everything mutable comes from the frame state, not from render-time hooks.
  useFrame((state, dt) => {
    const { size, invalidate } = state;
    const c = hero.cam;
    const cam = state.camera as THREE.PerspectiveCamera;
    const target = new THREE.Vector3(c.tx, c.ty, c.tz);
    const desired = new THREE.Vector3(c.px, c.py, c.pz);
    // Portrait screens: pull the camera back so the subject fits.
    const aspect = size.width / size.height;
    if (aspect < 1.2) desired.sub(target).multiplyScalar(1 + (1.2 - aspect) * 1.55).add(target);

    // Scene 5 orbit, plus a slow idle drift once the car is finished.
    const idle = !reduced && hero.progress > 0.995 ? state.clock.elapsedTime * 0.05 : 0;
    const angle = hero.state.orbit * (mobile ? 0.35 : 0.75) + idle;
    if (angle) {
      const rel = desired.clone().sub(target);
      rel.applyAxisAngle(UP, angle);
      desired.copy(target).add(rel);
    }
    // A touch of pointer parallax on desktop.
    if (!mobile && !reduced) {
      pointer.current.x += (state.pointer.x - pointer.current.x) * 0.04;
      pointer.current.y += (state.pointer.y - pointer.current.y) * 0.04;
      desired.x += pointer.current.x * 0.12;
      desired.y += pointer.current.y * 0.06;
    }

    if (first.current || reduced) {
      pos.current.copy(desired);
      tgt.current.copy(target);
      first.current = false;
    } else {
      const k = 1 - Math.pow(1 - 0.12, Math.min(dt, 0.1) * 60);
      pos.current.lerp(desired, k);
      tgt.current.lerp(target, k);
    }
    cam.position.copy(pos.current);
    cam.lookAt(tgt.current);
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
      pos.current.distanceToSquared(desired) > 1e-7 ||
      tgt.current.distanceToSquared(target) > 1e-7 ||
      idle > 0 ||
      Math.abs(state.pointer.x - pointer.current.x) > 1e-3;
    if (moving) invalidate();
  });
  return null;
}

/** Fades the showroom in: brighter reflections, light strips, reflective floor. */
function Showroom({ mobile }: { mobile: boolean }) {
  const strips = useRef<THREE.Group>(null);
  const floorMat = useRef<THREE.MeshStandardMaterial & { mixStrength?: number }>(null);
  const shadows = useRef<THREE.Group>(null);

  useFrame((state) => {
    const s = hero.state;
    const show = s.showroom;
    state.scene.environmentIntensity = 0.55 + show * 0.55;
    if (strips.current) {
      strips.current.visible = show > 0.01;
      strips.current.children.forEach((c) => {
        const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = show;
      });
    }
    if (floorMat.current && "mixStrength" in floorMat.current) floorMat.current.mixStrength = 0.4 + show * 3.2;
    if (shadows.current) {
      const mesh = shadows.current.children[0] as THREE.Mesh | undefined;
      const mat = mesh?.material as THREE.Material | undefined;
      if (mat) mat.opacity = Math.min(1, s.chassis * 0.6 + s.body * 0.35);
    }
  });

  return (
    <>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002} receiveShadow={false}>
        <planeGeometry args={[60, 60]} />
        {mobile ? (
          <meshStandardMaterial color="#0a0b0b" roughness={0.6} metalness={0.4} />
        ) : (
          <MeshReflectorMaterial
            ref={floorMat as never}
            blur={[380, 90]}
            resolution={1024}
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
        )}
      </mesh>
      <ContactShadows ref={shadows} position={[0, 0.001, 0]} scale={11} blur={2.4} far={2.2} resolution={mobile ? 256 : 512} opacity={0} color="#000000" />
      {/* Overhead light strips, visible once the showroom is on */}
      <group ref={strips} position={[0, 6.2, 0]}>
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
      <spotLight ref={key} position={[-2.5, 8.5, -3.5]} angle={0.6} penumbra={0.9} intensity={60} color="#fffaf0" decay={1.6} />
      <spotLight position={[-6, 3, -6]} angle={0.5} penumbra={1} intensity={18} color="#dfe5ff" decay={1.6} />
    </>
  );
}

export function Scene({ mobile, reduced, onRig }: Quality & { onRig: (rig: Rig) => void }) {
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
      <Vehicle mobile={mobile} onRig={onRig} />
      <Showroom mobile={mobile} />
      <CameraRig mobile={mobile} reduced={reduced} />
      {!mobile && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={2.6} luminanceSmoothing={0.2} intensity={0.75} radius={0.7} />
          <Vignette offset={0.32} darkness={0.62} />
          <ToneMapping mode={ToneMappingMode.AGX} />
        </EffectComposer>
      )}
    </>
  );
}
