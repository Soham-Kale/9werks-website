import * as THREE from "three";
import { emblemGeometry as g } from "@/lib/emblem";

// Canvas-drawn maps for the medallion and centre caps: a turned-metal face
// with the emblem raised and polished. Drawn synchronously, no image loads.

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")!] as const;
}

/** Draws the emblem strokes in 0..100 units scaled to the canvas. */
function strokeEmblem(ctx: CanvasRenderingContext2D, size: number, style: string, ticks: string | null, grow = 0) {
  const s = size / 100;
  ctx.save();
  ctx.scale(s, s);
  ctx.strokeStyle = style;
  ctx.lineCap = "butt";
  ctx.lineWidth = g.ring.width + grow;
  ctx.beginPath();
  ctx.arc(50, 50, g.ring.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = g.innerRing.width + grow;
  ctx.beginPath();
  ctx.arc(50, 50, g.innerRing.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = g.bowl.width + grow;
  ctx.beginPath();
  ctx.arc(g.bowl.cx, g.bowl.cy, g.bowl.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = g.tailWidth + grow;
  ctx.stroke(new Path2D(g.tail));
  if (ticks) {
    ctx.strokeStyle = ticks;
    ctx.lineWidth = 1.6 + grow;
    for (const t of g.ticks) {
      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.lineTo(t.x2, t.y2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export type FaceMaps = { map: THREE.Texture; roughnessMap: THREE.Texture; bumpMap: THREE.Texture };

export function createEmblemFaceMaps(size = 1024): FaceMaps {
  // Colour: dark gunmetal field, champagne-polished emblem.
  const [cc, c] = canvas(size);
  const grd = c.createRadialGradient(size * 0.42, size * 0.38, size * 0.05, size / 2, size / 2, size * 0.55);
  grd.addColorStop(0, "#3a3a3a");
  grd.addColorStop(1, "#1b1c1c");
  c.fillStyle = grd;
  c.fillRect(0, 0, size, size);
  // Turned-metal rings: faint concentric lines like a lathe finish.
  for (let r = 4; r < size / 2; r += 2.2) {
    c.strokeStyle = `rgba(255,255,255,${0.012 + ((r * 7919) % 13) / 1300})`;
    c.lineWidth = 1;
    c.beginPath();
    c.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    c.stroke();
  }
  strokeEmblem(c, size, "#e2d7bf", "#c9b98f");

  // Roughness (green channel): satin field, mirror-polished emblem.
  const [rc, r] = canvas(size);
  r.fillStyle = "rgb(0,120,0)";
  r.fillRect(0, 0, size, size);
  strokeEmblem(r, size, "rgb(0,22,0)", "rgb(0,30,0)");

  // Bump: emblem raised with a soft shoulder.
  const [bc, b] = canvas(size);
  b.fillStyle = "#000";
  b.fillRect(0, 0, size, size);
  b.filter = "blur(2px)";
  strokeEmblem(b, size, "#9a9a9a", "#777", 0.6);
  b.filter = "none";
  strokeEmblem(b, size, "#ffffff", "#c0c0c0");

  const tex = (el: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(el);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  };
  return { map: tex(cc, true), roughnessMap: tex(rc, false), bumpMap: tex(bc, false) };
}

/** Rear number plate texture with the brand name. */
export function createPlateTexture(text: string) {
  const [el, c] = canvas(512);
  el.height = 128;
  c.fillStyle = "#e9e6de";
  c.fillRect(0, 0, 512, 128);
  c.strokeStyle = "#111";
  c.lineWidth = 6;
  c.strokeRect(8, 8, 496, 112);
  c.fillStyle = "#111";
  c.font = "600 64px Arial, sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(el);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Builds face maps from licensed cap artwork (config/brand.ts): the artwork
 * sits on the same turned-metal field, polished and slightly raised.
 */
export function loadArtworkFaceMaps(url: string, size: number, onLoad: (maps: FaceMaps) => void) {
  const img = new Image();
  img.onload = () => {
    const s = size * 0.78;
    const o = (size - s) / 2;
    const [cc, c] = canvas(size);
    const grd = c.createRadialGradient(size * 0.42, size * 0.38, size * 0.05, size / 2, size / 2, size * 0.55);
    grd.addColorStop(0, "#2f3030");
    grd.addColorStop(1, "#151616");
    c.fillStyle = grd;
    c.fillRect(0, 0, size, size);
    for (let r = 4; r < size / 2; r += 2.2) {
      c.strokeStyle = `rgba(255,255,255,${0.012 + ((r * 7919) % 13) / 1300})`;
      c.beginPath();
      c.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      c.stroke();
    }
    c.drawImage(img, o, o, s, s);

    // Silhouette of the artwork, used for roughness and bump.
    const [sc, sx] = canvas(size);
    sx.drawImage(img, o, o, s, s);
    sx.globalCompositeOperation = "source-in";
    sx.fillStyle = "#fff";
    sx.fillRect(0, 0, size, size);

    const [rc, r] = canvas(size);
    r.fillStyle = "rgb(0,125,0)";
    r.fillRect(0, 0, size, size);
    r.globalCompositeOperation = "multiply";
    r.filter = "invert(1)";
    r.drawImage(sc, 0, 0);
    r.filter = "none";
    r.globalCompositeOperation = "source-over";
    r.globalAlpha = 0.25;
    r.fillStyle = "rgb(0,30,0)";
    r.fillRect(0, 0, size, size);

    const [bc, b] = canvas(size);
    b.fillStyle = "#000";
    b.fillRect(0, 0, size, size);
    b.filter = "blur(2px)";
    b.drawImage(sc, 0, 0);
    b.filter = "none";
    b.globalAlpha = 0.85;
    b.drawImage(sc, 0, 0);

    const tex = (el: HTMLCanvasElement, srgb: boolean) => {
      const t = new THREE.CanvasTexture(el);
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = 8;
      return t;
    };
    onLoad({ map: tex(cc, true), roughnessMap: tex(rc, false), bumpMap: tex(bc, false) });
  };
  img.src = url;
}
