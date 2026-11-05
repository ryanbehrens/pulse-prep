import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, quantize, dedup, prune, getBounds } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

const [inp, out, ratio = '0.4', err = '0.0004'] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inp);
const root = doc.getRoot();

// Drop materials (viewer supplies its own) and give each mesh its node's name
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  node.setExtras({ id: node.getName() });
  if (mesh) { mesh.setName(node.getName()); mesh.setExtras({ id: node.getName() }); }
}
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) if (prim.getMode() !== 4) { mesh.removePrimitive(prim); prim.dispose(); }
for (const node of root.listNodes()) { const m = node.getMesh(); if (m && !m.listPrimitives().length) { node.setMesh(null); m.dispose(); } }
for (const prim of root.listMeshes().flatMap(m => m.listPrimitives())) {
  prim.setMaterial(null);
  for (const s of prim.listSemantics()) if (s.startsWith('TEXCOORD')) prim.setAttribute(s, null);
}
await MeshoptSimplifier.ready;
await doc.transform(
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: parseFloat(ratio), error: parseFloat(err), lockBorder: false }),
  prune(),
  quantize({ quantizePosition: 14, quantizeNormal: 10 }),
);
// note: normals recomputed in viewer if missing
let tris = 0;
for (const p of root.listMeshes().flatMap(m => m.listPrimitives())) tris += p.getIndices().getCount() / 3;
console.log('nodes', root.listNodes().length, 'tris', tris);
await io.write(out, doc);
