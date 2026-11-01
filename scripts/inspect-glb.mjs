#!/usr/bin/env node
// Lists the node hierarchy, mesh names, materials, local transforms and
// world-space bounds of a .glb file. Zero dependencies: it reads the GLB's
// JSON chunk and accessor min/max directly.
//
//   node scripts/inspect-glb.mjs public/models/car.glb
//   node scripts/inspect-glb.mjs public/models/car.glb --json > mesh-report.json

import { readFileSync } from "node:fs";

const file = process.argv[2];
const asJson = process.argv.includes("--json");
if (!file) {
  console.error("Usage: node scripts/inspect-glb.mjs <file.glb> [--json]");
  process.exit(1);
}

const buf = readFileSync(file);
if (buf.toString("ascii", 0, 4) !== "glTF") throw new Error("Not a GLB file");
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString("utf8", 20, 20 + jsonLen));

const nodes = gltf.nodes ?? [];
const meshes = gltf.meshes ?? [];
const materials = gltf.materials ?? [];
const accessors = gltf.accessors ?? [];

// --- minimal mat4 helpers (column-major, like glTF) ---
const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
function compose(t = [0, 0, 0], q = [0, 0, 0, 1], s = [1, 1, 1]) {
  const [x, y, z, w] = q;
  const [sx, sy, sz] = s;
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    t[0], t[1], t[2], 1,
  ];
}
const local = (n) => n.matrix ?? compose(n.translation, n.rotation, n.scale);
const apply = (m, [x, y, z]) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
];

function meshBounds(meshIdx, world) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const p of meshes[meshIdx].primitives) {
    const acc = accessors[p.attributes.POSITION];
    if (!acc?.min) continue;
    for (const cx of [acc.min[0], acc.max[0]])
      for (const cy of [acc.min[1], acc.max[1]])
        for (const cz of [acc.min[2], acc.max[2]]) {
          const v = apply(world, [cx, cy, cz]);
          for (let i = 0; i < 3; i++) {
            min[i] = Math.min(min[i], v[i]);
            max[i] = Math.max(max[i], v[i]);
          }
        }
  }
  return { min, max };
}

const parent = new Map();
nodes.forEach((n, i) => (n.children ?? []).forEach((c) => parent.set(c, i)));
const scene = gltf.scenes?.[gltf.scene ?? 0];
const roots = scene?.nodes ?? nodes.map((_, i) => i).filter((i) => !parent.has(i));

const report = [];
const r = (v) => v.map((x) => +x.toFixed(3));

function walk(i, depth, parentWorld, path) {
  const n = nodes[i];
  const world = mul(parentWorld, local(n));
  const name = n.name ?? `node_${i}`;
  const fullPath = [...path, name];
  const entry = {
    index: i,
    name,
    path: fullPath.join("/"),
    depth,
    translation: n.translation ?? null,
    rotation: n.rotation ?? null,
    scale: n.scale ?? null,
  };
  if (n.mesh !== undefined) {
    const m = meshes[n.mesh];
    entry.mesh = m.name ?? `mesh_${n.mesh}`;
    entry.materials = m.primitives.map((p) => materials[p.material]?.name ?? "(none)");
    entry.triangles = m.primitives.reduce(
      (s, p) => s + Math.round((accessors[p.indices]?.count ?? accessors[p.attributes.POSITION].count) / 3),
      0,
    );
    const b = meshBounds(n.mesh, world);
    entry.boundsMin = r(b.min);
    entry.boundsMax = r(b.max);
    entry.center = r(b.min.map((v, k) => (v + b.max[k]) / 2));
  }
  report.push(entry);
  (n.children ?? []).forEach((c) => walk(c, depth + 1, world, fullPath));
}
roots.forEach((i) => walk(i, 0, identity(), []));

if (asJson) {
  console.log(JSON.stringify({ extensionsUsed: gltf.extensionsUsed ?? [], materials: materials.map((m) => m.name), nodes: report }, null, 2));
} else {
  console.log(`File: ${file}  (${(buf.length / 1048576).toFixed(2)} MB)`);
  console.log(`Extensions: ${(gltf.extensionsUsed ?? []).join(", ") || "none"}`);
  console.log(`Nodes: ${nodes.length}  Meshes: ${meshes.length}  Materials: ${materials.length}\n`);
  for (const e of report) {
    const pad = "  ".repeat(e.depth);
    let line = `${pad}${e.name}`;
    if (e.mesh) line += `  [mesh ${e.triangles} tris | ${e.materials.join(", ")}] center ${e.center.join(",")}`;
    console.log(line);
  }
  console.log("\nMaterials:", materials.map((m) => m.name).join(" | "));
}
