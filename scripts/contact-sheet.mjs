#!/usr/bin/env node
// Tiles screenshots into one labelled image for quick review.
//   node scripts/contact-sheet.mjs <out.png> <cols> <tileWidth> <files...>
import sharp from "sharp";
const [out, cols, tw, ...files] = process.argv.slice(2);
const C = Number(cols), W = Number(tw);
const metas = await Promise.all(files.map((f) => sharp(f).metadata()));
const th = Math.round((W * metas[0].height) / metas[0].width);
const rows = Math.ceil(files.length / C);
const tiles = await Promise.all(files.map(async (f, i) => {
  const label = Buffer.from(`<svg width="${W}" height="22"><rect width="100%" height="100%" fill="#000"/><text x="6" y="16" fill="#ff0" font-size="14" font-family="monospace">${f.split(/[\/]/).pop()}</text></svg>`);
  const img = await sharp(f).resize(W, th, { fit: "cover", position: "top" }).composite([{ input: label, top: 0, left: 0 }]).png().toBuffer();
  return { input: img, left: (i % C) * W, top: Math.floor(i / C) * th };
}));
await sharp({ create: { width: C * W, height: rows * th, channels: 3, background: "#222" } }).composite(tiles).png().toFile(out);
console.log(out);
