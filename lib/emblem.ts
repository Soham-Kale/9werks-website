// Fallback emblem for the 3D medallion and centre caps: a geometric "9" inside
// the Assembly Index ring. It is drawn first and replaced by the client mark
// (config/brand.ts capArtwork) as soon as that image loads, or kept if the
// artwork is unset or fails to load.

export const EMBLEM_VIEWBOX = 100;

export const emblemGeometry = {
  ring: { cx: 50, cy: 50, r: 46, width: 2 },
  innerRing: { cx: 50, cy: 50, r: 38.5, width: 0.75 },
  bowl: { cx: 50, cy: 43, r: 12.5, width: 6.5 },
  tail: "M62.5 43 V57 C62.5 69 55.5 74.5 45 74.5",
  tailWidth: 6.5,
  // Seven ticks, one per wheel component in the assembly.
  ticks: Array.from({ length: 7 }, (_, i) => {
    const a = (-90 + i * (360 / 7)) * (Math.PI / 180);
    const r1 = 40.5;
    const r2 = 44;
    return {
      x1: 50 + Math.cos(a) * r1,
      y1: 50 + Math.sin(a) * r1,
      x2: 50 + Math.cos(a) * r2,
      y2: 50 + Math.sin(a) * r2,
    };
  }),
};

