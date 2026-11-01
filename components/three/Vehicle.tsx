"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { gsap } from "gsap";
import { vehicleConfig, finishes } from "@/config/vehicle";
import { brandConfig } from "@/config/brand";
import { buildRig, updateRig, type Rig } from "./rig";
import { hero, onFinish, type WheelStep } from "./store";
import { loadArtworkFaceMaps, type FaceMaps } from "./textures";

useGLTF.setDecoderPath("/draco/");

type Props = { mobile: boolean; onRig: (rig: Rig) => void };

const _v = new THREE.Vector3();

// Where each callout's leader line attaches, as [angle, radius factor] on the wheel face.
const ANCHORS: Record<WheelStep, [number, number]> = {
  hub: [200, 0.22],
  spokes: [40, 0.55],
  rim: [75, 0.92],
  disc: [250, 0.62],
  caliper: [0, 0],
  tyre: [120, 1.12],
  cap: [0, 0],
};

export function Vehicle({ mobile, onRig }: Props) {
  const { scene } = useGLTF(vehicleConfig.modelUrl, true, true);
  const rig = useMemo(() => buildRig(scene, { mobile }), [scene, mobile]);
  const { camera, size, invalidate } = useThree();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") (window as unknown as { __rig: Rig }).__rig = rig;
    onRig(rig);
    return () => rig.dispose();
  }, [rig, onRig]);

  // Licensed centre-cap artwork, if configured, replaces the drawn emblem.
  useEffect(() => {
    if (!brandConfig.capArtwork) return;
    let maps: FaceMaps | null = null;
    loadArtworkFaceMaps(brandConfig.capArtwork, mobile ? 512 : 1024, (m) => {
      maps = m;
      rig.wheels.forEach((w) => {
        const face = w.cap.userData.materials[1] as THREE.MeshPhysicalMaterial;
        face.map = m.map;
        face.roughnessMap = m.roughnessMap;
        face.bumpMap = m.bumpMap;
        face.needsUpdate = true;
      });
      invalidate();
    });
    return () => {
      if (maps) Object.values(maps).forEach((t) => t.dispose());
    };
  }, [rig, invalidate, mobile]);

  // Finish selector: ease the paint to the chosen colour.
  useEffect(() => {
    const apply = (immediate: boolean) => {
      const f = finishes.find((x) => x.id === hero.finish) ?? finishes[0];
      const target = new THREE.Color(f.color);
      const d = immediate || matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1.2;
      for (const m of rig.paint) {
        gsap.to(m.color, { r: target.r, g: target.g, b: target.b, duration: d, ease: "power2.inOut", onUpdate: invalidate });
        gsap.to(m, { metalness: f.metalness, roughness: f.roughness, duration: d, ease: "power2.inOut" });
      }
      invalidate();
    };
    apply(true);
    return onFinish(() => apply(false));
  }, [rig, invalidate]);

  // Callout projection, read by the HTML overlay.
  useEffect(() => {
    const w = rig.hero;
    const local = new THREE.Vector3();
    hero.project = (step) => {
      const list = w.parts[step];
      if (!list.length) return { x: 0, y: 0, visible: false };
      if (step === "caliper" || step === "cap") {
        new THREE.Box3().setFromObject(list[0].obj).getCenter(_v);
      } else {
        const [deg, f] = ANCHORS[step];
        const a = (deg * Math.PI) / 180;
        local.set(w.outward * w.halfWidth * 0.6, Math.sin(a) * w.radius * f, Math.cos(a) * w.radius * f);
        _v.copy(local).applyMatrix4(w.pivot.matrixWorld);
      }
      _v.project(camera);
      return { x: (_v.x * 0.5 + 0.5) * size.width, y: (-_v.y * 0.5 + 0.5) * size.height, visible: _v.z < 1 };
    };
    return () => {
      hero.project = null;
    };
  }, [rig, camera, size]);

  useFrame(() => {
    updateRig(rig, hero.state, hero.progress);
  });

  return (
    <>
      <primitive object={rig.root} />
      <primitive object={rig.beams} />
    </>
  );
}

useGLTF.preload(vehicleConfig.modelUrl, true, true);
