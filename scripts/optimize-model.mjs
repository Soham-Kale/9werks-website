#!/usr/bin/env node
// Compresses a car model for the web: deduplicates data, resizes textures to
// at most 2048px, converts them to WebP and applies Meshopt geometry
// compression. The scene's loader decodes Meshopt (and Draco) automatically.
//
//   node scripts/optimize-model.mjs <source.glb> public/models/car.glb

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, weld, textureCompress, meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import { statSync } from "node:fs";

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error("Usage: node scripts/optimize-model.mjs <source.glb> <out.glb>");
  process.exit(1);
}

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });

const doc = await io.read(src);

await doc.transform(
  dedup(),
  // keepExtras keeps names; variant materials stay referenced by KHR_materials_variants
  prune({ keepAttributes: false, keepLeaves: false }),
  weld(),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [2048, 2048], quality: 82 }),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);

await io.write(out, doc);

const mb = (f) => (statSync(f).size / 1048576).toFixed(2) + " MB";
console.log(`${src} (${mb(src)}) -> ${out} (${mb(out)})`);
