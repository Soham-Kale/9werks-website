#!/usr/bin/env node
// Derives the brand files the site uses from the client's logo PNG:
//   public/images/brand/mark.png       the "9" mark, square, full colour
//   public/images/brand/logo-mono.png  ivory version of the full logo
//   public/images/brand/mark-mono.png  ivory version of the mark
// Re-run after replacing public/images/brand/logo.png:
//   node scripts/brand-assets.mjs
import sharp from "sharp";

const dir = new URL("../public/images/brand/", import.meta.url);
const p = (f) => new URL(f, dir).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const src = p("logo.png");

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const colHas = (x) => { for (let y = 0; y < H; y++) if (data[(y * W + x) * 4 + 3] > 20) return true; return false; };
let x = 0;
while (!colHas(x)) x++;
const start = x;
while (colHas(x)) x++;
const w = x - start, side = Math.max(w, H) + 16;
const mark = await sharp(src).extract({ left: start, top: 0, width: w, height: H }).toBuffer();
await sharp({ create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: mark, left: Math.round((side - w) / 2), top: Math.round((side - H) / 2) }])
  .png().toFile(p("mark.png"));

// Ivory monochrome: lightest tones become ivory, tan details stay a shade darker.
async function mono(input, out) {
  const { data: d, info: i } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let k = 0; k < d.length; k += 4) {
    const l = (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2]) / 255;
    const t = 0.8 + 0.2 * Math.min(1, Math.max(0, (l - 0.45) / 0.4));
    d[k] = 245 * t; d[k + 1] = 243 * t; d[k + 2] = 238 * t;
  }
  await sharp(d, { raw: i }).png().toFile(out);
}
await mono(src, p("logo-mono.png"));
await mono(p("mark.png"), p("mark-mono.png"));
console.log("brand assets written");
