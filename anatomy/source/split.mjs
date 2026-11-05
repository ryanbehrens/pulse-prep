import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, quantize, dedup, prune } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import fs from 'fs';
import { patchLargestHole } from './patch.mjs';
// usage: node split.mjs in.glb sets.json sysid out.glb ratio error
const [inp, setsFile, sys, out, ratio, err] = process.argv.slice(2);
const keep = new Set(JSON.parse(fs.readFileSync(setsFile, 'utf8'))[sys]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inp);
const root = doc.getRoot();
for (const node of root.listNodes()) {
  const name = node.getName();
  const mesh = node.getMesh();
  if (!keep.has(name)) { if (mesh) node.setMesh(null); continue; }
  node.setExtras({ id: name });
  if (mesh) { mesh.setName(name); mesh.setExtras({ id: name }); }
}
for (const node of root.listNodes()) if (!keep.has(node.getName()) && !node.listChildren().length) node.dispose();
await doc.transform(prune());
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) if (prim.getMode() !== 4) { mesh.removePrimitive(prim); prim.dispose(); }
for (const node of root.listNodes()) { const m = node.getMesh(); if (m && !m.listPrimitives().length) { node.setMesh(null); m.dispose(); } }
for (const prim of root.listMeshes().flatMap(m => m.listPrimitives())) {
  prim.setMaterial(null);
  for (const s of prim.listSemantics()) if (s.startsWith('TEXCOORD')) prim.setAttribute(s, null);
}
for (const nm of (process.env.PATCH || '').split(',').filter(Boolean)) {
  const node = root.listNodes().find(n => n.getName() === nm);
  if (node) console.log('patched', nm, JSON.stringify(patchLargestHole(doc, node)));
}
await MeshoptSimplifier.ready;
await doc.transform(dedup(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: +ratio, error: +err }), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10 }));
let tris = 0;
for (const p of root.listMeshes().flatMap(m => m.listPrimitives())) tris += p.getIndices().getCount() / 3;
console.log(sys, 'meshes', root.listMeshes().length, 'tris', tris);
await io.write(out, doc);
